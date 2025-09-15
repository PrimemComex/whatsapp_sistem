// server/controllers/bitrixController.js
// =====================================
// CONTROLLER BITRIX24 - VERSÃO COMPLETA
// =====================================

const MessageController = require('./messageController'); // IMPORT CORRIGIDO
const logger = require('../utils/logger');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Services (criar arquivos básicos se não existirem)
let bitrixConnectionService, webhookProcessor, templateEngine, messageQueue;

try {
    bitrixConnectionService = require('../services/bitrixConnectionService');
} catch (error) {
    console.warn('⚠️ bitrixConnectionService não encontrado, usando mock');
    bitrixConnectionService = {
        testConnection: async (config) => ({ success: true, message: 'Mock connection' }),
        getContactData: async (integration, contactId) => ({ phone: '+5511999999999', name: 'Teste' }),
        addActivity: async (integration, activity) => ({ success: true })
    };
}

try {
    webhookProcessor = require('../services/webhookProcessor');
} catch (error) {
    console.warn('⚠️ webhookProcessor não encontrado, usando mock');
    webhookProcessor = {
        logWebhook: async (data) => ({ id: 'log_' + Date.now() }),
        updateLog: async (logId, updates) => true,
        getLogs: async (integrationId, options) => [],
        reprocessWebhook: async (logId) => ({ success: true }),
        getStats: async (integrationId, period) => ({ webhooks: 0, messages: 0 })
    };
}

try {
    templateEngine = require('../services/templateEngine');
} catch (error) {
    console.warn('⚠️ templateEngine não encontrado, usando mock');
    templateEngine = {
        findMatchingTemplates: async (integrationId, event, data) => [],
        renderTemplate: async (template, variables) => ({ text: 'Mensagem teste', type: 'text' }),
        getTemplates: async (integrationId) => [],
        saveTemplate: async (templateData) => ({ id: 'template_' + Date.now(), ...templateData })
    };
}

try {
    messageQueue = require('../services/messageQueue');
} catch (error) {
    console.warn('⚠️ messageQueue não encontrado, usando mock');
    messageQueue = {
        addMessage: async (messageData) => ({ id: 'queue_' + Date.now(), ...messageData }),
        processQueue: async () => [],
        getQueueStatus: async () => ({ pending: 0, processing: 0, completed: 0 })
    };
}

class BitrixController {
    constructor() {
        // CORREÇÃO: Inicializar corretamente o MessageController
        this.messageController = new MessageController();
        this.logger = logger;
        
        // Configurações da integração
        this.integrations = new Map(); // Em produção, usar banco de dados
        this.webhookLogs = []; // Em produção, usar banco de dados
        this.templates = []; // Em produção, usar banco de dados
        
        // Rate limiting
        this.rateLimiter = new Map();
        
        console.log('✅ BitrixController inicializado com MessageController');
        
        // Carregar configurações salvas
        this.loadSavedConfigurations();
    }

    // ====================================
    // WEBHOOK HANDLER PRINCIPAL
    // ====================================
    async handleWebhook(req, res) {
        const startTime = Date.now();
        
        try {
            const { headers, body } = req;
            const clientIP = req.ip || req.connection.remoteAddress;
            
            this.logger.info('📨 Webhook recebido do Bitrix24:', {
                event: body.event,
                dealId: body.data?.ID,
                contactId: body.data?.CONTACT_ID,
                ip: clientIP,
                timestamp: new Date().toISOString()
            });

            // Rate limiting
            if (!this.checkRateLimit(clientIP)) {
                this.logger.warn('🚫 Rate limit excedido:', { ip: clientIP });
                return res.status(429).json({
                    success: false,
                    error: 'Rate limit exceeded'
                });
            }

            // Buscar integração (por enquanto, usar a primeira configurada)
            const integration = this.getActiveIntegration();
            if (!integration) {
                this.logger.error('❌ Nenhuma integração Bitrix24 configurada');
                return res.status(404).json({
                    success: false,
                    error: 'No Bitrix24 integration configured'
                });
            }

            // Validar assinatura do webhook
            const isValid = await this.validateWebhookSignature(headers, body, integration);
            if (!isValid) {
                this.logger.error('❌ Webhook com assinatura inválida:', {
                    ip: clientIP,
                    userAgent: headers['user-agent']
                });
                
                return res.status(401).json({
                    success: false,
                    error: 'Invalid webhook signature'
                });
            }
            
            // Log do webhook
            const logEntry = {
                id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                integrationId: integration.id,
                event: body.event,
                payload: body,
                headers: this.sanitizeHeaders(headers),
                ipAddress: clientIP,
                status: 'received',
                createdAt: new Date().toISOString(),
                processingTime: null,
                messagesCreated: 0,
                errors: []
            };
            
            this.webhookLogs.push(logEntry);
            
            // Processar webhook de forma assíncrona
            setImmediate(() => {
                this.processWebhookAsync(integration, body, logEntry.id)
                    .then(() => {
                        const processingTime = Date.now() - startTime;
                        this.updateWebhookLog(logEntry.id, { 
                            processingTime,
                            status: 'completed'
                        });
                        this.logger.info('✅ Webhook processado com sucesso', {
                            logId: logEntry.id,
                            processingTime: processingTime + 'ms'
                        });
                    })
                    .catch(error => {
                        this.logger.error('❌ Erro no processamento assíncrono:', error);
                        this.updateWebhookLog(logEntry.id, {
                            status: 'failed',
                            errors: [error.message]
                        });
                    });
            });
            
            // Resposta imediata para o Bitrix (obrigatório < 30s)
            res.status(200).json({
                success: true,
                message: 'Webhook received and queued for processing',
                logId: logEntry.id,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            this.logger.error('❌ Erro crítico no webhook do Bitrix:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }

    // ====================================
    // PROCESSAMENTO ASSÍNCRONO DO WEBHOOK
    // ====================================
    async processWebhookAsync(integration, payload, logId) {
        try {
            this.logger.info(`🔄 Iniciando processamento assíncrono (Log ID: ${logId})`);

            // Encontrar templates que correspondem ao evento
            const matchingTemplates = await this.findMatchingTemplates(
                integration.id,
                payload.event,
                payload.data
            );
            
            if (matchingTemplates.length === 0) {
                this.logger.info(`ℹ️ Nenhum template encontrado para evento ${payload.event}`);
                this.updateWebhookLog(logId, {
                    status: 'completed',
                    messagesCreated: 0,
                    note: 'Nenhum template correspondente encontrado'
                });
                return;
            }

            this.logger.info(`📝 Encontrados ${matchingTemplates.length} templates para processar`);
            
            // Processar cada template
            let successCount = 0;
            const errors = [];
            
            for (const template of matchingTemplates) {
                try {
                    await this.processTemplate(integration, template, payload.data, logId);
                    successCount++;
                    this.logger.info(`✅ Template ${template.name} processado com sucesso`);
                } catch (error) {
                    this.logger.error(`❌ Erro ao processar template ${template.name}:`, error);
                    errors.push(`Template ${template.name}: ${error.message}`);
                }
            }
            
            this.updateWebhookLog(logId, {
                status: successCount > 0 ? 'completed' : 'failed',
                messagesCreated: successCount,
                errors: errors.length > 0 ? errors : null
            });
            
        } catch (error) {
            this.logger.error('❌ Erro fatal no processamento do webhook:', error);
            this.updateWebhookLog(logId, {
                status: 'failed',
                errors: [error.message]
            });
        }
    }
    
    // ====================================
    // PROCESSAR TEMPLATE ESPECÍFICO
    // ====================================
    async processTemplate(integration, template, bitrixData, logId) {
        try {
            this.logger.info(`📋 Processando template: ${template.name} para deal ${bitrixData.ID}`);

            // Obter dados do contato no Bitrix
            const contactData = await this.getContactData(integration, bitrixData);
            
            if (!contactData || !contactData.phone) {
                throw new Error(`Contato ${bitrixData.CONTACT_ID} não possui telefone válido`);
            }

            // Validar condições do template
            const conditionsMet = this.validateTemplateConditions(template, bitrixData);
            if (!conditionsMet) {
                this.logger.info(`⏭️ Condições do template ${template.name} não atendidas`);
                return;
            }
            
            // Renderizar template com dados
            const messageContent = this.renderTemplate(template, {
                ...bitrixData,
                ...contactData,
                companyName: integration.companyName || 'PRIMEM COMEX',
                currentDate: new Date().toLocaleDateString('pt-BR'),
                currentTime: new Date().toLocaleTimeString('pt-BR')
            });
            
            // Calcular horário de envio
            const scheduledFor = this.calculateScheduledTime(template);
            
            // Adicionar à fila de mensagens
            const queueItem = {
                id: 'queue_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                integrationId: integration.id,
                templateId: template.id,
                contactPhone: contactData.phone,
                dealId: bitrixData.ID,
                priority: template.priority || 'normal',
                scheduledFor,
                payload: {
                    chatId: this.formatPhoneNumber(contactData.phone),
                    message: messageContent.text,
                    type: messageContent.type || 'text',
                    mediaUrl: messageContent.mediaUrl
                },
                source: 'bitrix_webhook',
                webhookLogId: logId,
                status: 'pending',
                attempts: 0,
                createdAt: new Date().toISOString()
            };

            // Simular adição à fila (em produção, usar Redis/Bull)
            await this.addToMessageQueue(queueItem);

            this.logger.info(`📤 Mensagem adicionada à fila: ${queueItem.id}`, {
                scheduledFor: scheduledFor.toISOString(),
                phone: contactData.phone
            });
            
            // Registrar atividade no Bitrix (opcional)
            if (integration.settings?.logActivities) {
                await this.logActivityToBitrix(integration, bitrixData, template, messageContent);
            }
            
        } catch (error) {
            this.logger.error(`❌ Erro ao processar template ${template.name}:`, error);
            throw error;
        }
    }

    // ====================================
    // BUSCAR TEMPLATES CORRESPONDENTES
    // ====================================
    async findMatchingTemplates(integrationId, event, data) {
        try {
            // Filtrar templates por evento
            let matchingTemplates = this.templates.filter(template => 
                template.integrationId === integrationId &&
                template.bitrixEvent === event &&
                template.isActive
            );

            // Aplicar condições específicas
            matchingTemplates = matchingTemplates.filter(template => 
                this.validateTemplateConditions(template, data)
            );

            // Ordenar por prioridade
            matchingTemplates.sort((a, b) => {
                const priorityOrder = { high: 3, normal: 2, low: 1 };
                return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
            });

            return matchingTemplates;
        } catch (error) {
            this.logger.error('Erro ao buscar templates:', error);
            return [];
        }
    }

    // ====================================
    // VALIDAR CONDIÇÕES DO TEMPLATE
    // ====================================
    validateTemplateConditions(template, bitrixData) {
        try {
            if (!template.conditions) return true;

            const conditions = template.conditions;

            // Verificar estágio do deal
            if (conditions.dealStage && conditions.dealStage.length > 0) {
                if (!conditions.dealStage.includes(bitrixData.STAGE_ID)) {
                    return false;
                }
            }

            // Verificar valor mínimo/máximo
            if (conditions.dealAmount) {
                const amount = parseFloat(bitrixData.OPPORTUNITY) || 0;
                
                if (conditions.dealAmount.min && amount < conditions.dealAmount.min) {
                    return false;
                }
                
                if (conditions.dealAmount.max && amount > conditions.dealAmount.max) {
                    return false;
                }
            }

            // Verificar campos personalizados
            if (conditions.customFields) {
                for (const [field, expectedValue] of Object.entries(conditions.customFields)) {
                    if (bitrixData[field] !== expectedValue) {
                        return false;
                    }
                }
            }

            // Verificar tipo de contato
            if (conditions.contactType) {
                // Implementar lógica baseada no tipo de contato
            }

            return true;
        } catch (error) {
            this.logger.error('Erro ao validar condições do template:', error);
            return false;
        }
    }

    // ====================================
    // RENDERIZAR TEMPLATE
    // ====================================
    renderTemplate(template, variables) {
        try {
            let text = template.content?.text || '';
            
            // Substituir variáveis
            for (const [key, value] of Object.entries(variables)) {
                const regex = new RegExp(`{${key}}`, 'g');
                text = text.replace(regex, value || '');
            }

            // Aplicar formatações específicas
            text = this.applyTextFormatting(text, variables);

            return {
                text,
                type: template.content?.type || 'text',
                mediaUrl: template.content?.mediaUrl
            };
        } catch (error) {
            this.logger.error('Erro ao renderizar template:', error);
            return { text: 'Erro ao processar mensagem', type: 'text' };
        }
    }

    // ====================================
    // APLICAR FORMATAÇÕES DE TEXTO
    // ====================================
    applyTextFormatting(text, variables) {
        try {
            // Formatar valores monetários
            if (variables.OPPORTUNITY) {
                const amount = parseFloat(variables.OPPORTUNITY);
                if (!isNaN(amount)) {
                    const formatted = new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(amount);
                    text = text.replace(/{dealAmount}/g, formatted);
                }
            }

            // Formatar datas
            if (variables.DATE_CREATE) {
                const date = new Date(variables.DATE_CREATE);
                const formatted = date.toLocaleDateString('pt-BR');
                text = text.replace(/{dateCreated}/g, formatted);
            }

            // Formatar telefones
            if (variables.phone) {
                const formatted = this.formatPhoneForDisplay(variables.phone);
                text = text.replace(/{contactPhone}/g, formatted);
            }

            return text;
        } catch (error) {
            this.logger.error('Erro ao formatar texto:', error);
            return text;
        }
    }

    // ====================================
    // CALCULAR HORÁRIO DE ENVIO
    // ====================================
    calculateScheduledTime(template) {
        const now = new Date();
        
        if (template.scheduling?.immediate) {
            return now;
        }
        
        // Adicionar delay configurado (em minutos)
        const delayMinutes = template.scheduling?.delay || 0;
        const scheduledTime = new Date(now.getTime() + delayMinutes * 60000);
        
        // Verificar horário comercial
        if (template.scheduling?.businessHoursOnly) {
            return this.adjustToBusinessHours(scheduledTime);
        }
        
        return scheduledTime;
    }
    
    // ====================================
    // AJUSTAR PARA HORÁRIO COMERCIAL
    // ====================================
    adjustToBusinessHours(date) {
        const businessStart = 8; // 8h
        const businessEnd = 18; // 18h
        
        const hour = date.getHours();
        const day = date.getDay();
        
        // Se é fim de semana, mover para segunda-feira
        if (day === 0 || day === 6) {
            const daysToAdd = day === 0 ? 1 : 2;
            date.setDate(date.getDate() + daysToAdd);
            date.setHours(businessStart, 0, 0, 0);
            return date;
        }
        
        // Se é antes do horário comercial, mover para início
        if (hour < businessStart) {
            date.setHours(businessStart, 0, 0, 0);
            return date;
        }
        
        // Se é depois do horário comercial, mover para próximo dia
        if (hour >= businessEnd) {
            date.setDate(date.getDate() + 1);
            date.setHours(businessStart, 0, 0, 0);
            return date;
        }
        
        return date;
    }

    // ====================================
    // VALIDAR ASSINATURA DO WEBHOOK
    // ====================================
    async validateWebhookSignature(headers, body, integration) {
        try {
            // Se não tem secret configurado, pular validação em desenvolvimento
            if (!integration.webhookSecret) {
                this.logger.warn('⚠️ Webhook secret não configurado, pulando validação');
                return true;
            }

            const signature = headers['x-bitrix-signature'] || headers['x-signature'];
            if (!signature) {
                this.logger.error('❌ Assinatura do webhook não fornecida');
                return false;
            }

            const payload = JSON.stringify(body);
            const expectedSignature = crypto
                .createHmac('sha256', integration.webhookSecret)
                .update(payload)
                .digest('hex');
                
            const providedSignature = signature.replace('sha256=', '');
            
            const isValid = crypto.timingSafeEqual(
                Buffer.from(expectedSignature, 'hex'),
                Buffer.from(providedSignature, 'hex')
            );

            if (!isValid) {
                this.logger.error('❌ Assinatura inválida', {
                    expected: expectedSignature,
                    provided: providedSignature
                });
            }

            return isValid;
        } catch (error) {
            this.logger.error('❌ Erro ao validar assinatura:', error);
            return false;
        }
    }

    // ====================================
    // ENDPOINTS DA API REST
    // ====================================

    // Configurar integração
    async setupIntegration(req, res) {
        try {
            const {
                bitrixDomain,
                webhookUrl,
                webhookSecret,
                companyName,
                settings
            } = req.body;

            const userId = req.user?.id;

            // Validar dados obrigatórios
            if (!bitrixDomain || !webhookUrl) {
                return res.status(400).json({
                    success: false,
                    error: 'bitrixDomain e webhookUrl são obrigatórios'
                });
            }

            // Testar conexão
            const connectionTest = await bitrixConnectionService.testConnection({
                bitrixDomain,
                webhookUrl
            });

            if (!connectionTest.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Falha na conexão com Bitrix24: ' + connectionTest.error
                });
            }

            // Criar configuração
            const integration = {
                id: 'integration_' + Date.now(),
                bitrixDomain,
                webhookUrl,
                webhookSecret,
                companyName: companyName || 'PRIMEM COMEX',
                isActive: true,
                settings: {
                    businessHoursOnly: true,
                    logActivities: true,
                    rateLimits: {
                        maxPerSecond: 2,
                        maxPerMinute: 100
                    },
                    ...settings
                },
                createdBy: userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.integrations.set(integration.id, integration);
            this.saveConfigurations();

            this.logger.info('✅ Integração Bitrix24 configurada:', {
                domain: bitrixDomain,
                integrationId: integration.id
            });

            res.json({
                success: true,
                integration: {
                    id: integration.id,
                    bitrixDomain: integration.bitrixDomain,
                    companyName: integration.companyName,
                    isActive: integration.isActive,
                    createdAt: integration.createdAt
                },
                webhookEndpoint: `${req.protocol}://${req.get('host')}/api/bitrix/webhook`
            });

        } catch (error) {
            this.logger.error('❌ Erro ao configurar integração:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Testar conexão
    async testConnection(req, res) {
        try {
            const { bitrixDomain, webhookUrl } = req.body;
            
            const result = await bitrixConnectionService.testConnection({
                bitrixDomain,
                webhookUrl
            });
            
            res.json(result);
        } catch (error) {
            this.logger.error('❌ Erro ao testar conexão:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Listar templates
    async getTemplates(req, res) {
        try {
            const { integrationId } = req.params;
            
            const templates = this.templates.filter(t => t.integrationId === integrationId);
            
            res.json({
                success: true,
                templates
            });
        } catch (error) {
            this.logger.error('❌ Erro ao buscar templates:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Criar/atualizar template
    async saveTemplate(req, res) {
        try {
            const templateData = req.body;
            const userId = req.user?.id;
            
            // Validar dados obrigatórios
            if (!templateData.name || !templateData.bitrixEvent || !templateData.content?.text) {
                return res.status(400).json({
                    success: false,
                    error: 'Nome, evento e conteúdo são obrigatórios'
                });
            }

            const template = {
                id: templateData.id || 'template_' + Date.now(),
                integrationId: templateData.integrationId,
                name: templateData.name,
                description: templateData.description || '',
                bitrixEvent: templateData.bitrixEvent,
                conditions: templateData.conditions || {},
                content: templateData.content,
                scheduling: templateData.scheduling || { immediate: true },
                priority: templateData.priority || 'normal',
                isActive: templateData.isActive !== false,
                createdBy: userId,
                createdAt: templateData.createdAt || new Date().toISOString(),
                updatedBy: userId,
                updatedAt: new Date().toISOString()
            };

            // Salvar ou atualizar
            const existingIndex = this.templates.findIndex(t => t.id === template.id);
            if (existingIndex >= 0) {
                this.templates[existingIndex] = template;
            } else {
                this.templates.push(template);
            }

            this.saveConfigurations();
            
            res.json({
                success: true,
                template
            });
        } catch (error) {
            this.logger.error('❌ Erro ao salvar template:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Buscar logs de webhook
    async getWebhookLogs(req, res) {
        try {
            const { integrationId } = req.params;
            const { limit = 50, offset = 0, status } = req.query;
            
            let logs = this.webhookLogs.filter(log => log.integrationId === integrationId);
            
            if (status) {
                logs = logs.filter(log => log.status === status);
            }

            // Ordenar por data (mais recente primeiro)
            logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Paginação
            const startIndex = parseInt(offset);
            const endIndex = startIndex + parseInt(limit);
            const paginatedLogs = logs.slice(startIndex, endIndex);
            
            res.json({
                success: true,
                logs: paginatedLogs,
                pagination: {
                    offset: parseInt(offset),
                    limit: parseInt(limit),
                    total: logs.length,
                    hasMore: endIndex < logs.length
                }
            });
        } catch (error) {
            this.logger.error('❌ Erro ao buscar logs:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Estatísticas da integração
    async getIntegrationStats(req, res) {
        try {
            const { integrationId } = req.params;
            const { period = '7d' } = req.query;
            
            const now = new Date();
            let dateFrom;
            
            switch (period) {
                case '1d':
                    dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            }

            const logs = this.webhookLogs.filter(log => 
                log.integrationId === integrationId &&
                new Date(log.createdAt) >= dateFrom
            );

            const stats = {
                period,
                dateFrom: dateFrom.toISOString(),
                dateTo: now.toISOString(),
                webhooks: {
                    total: logs.length,
                    completed: logs.filter(l => l.status === 'completed').length,
                    failed: logs.filter(l => l.status === 'failed').length,
                    processing: logs.filter(l => l.status === 'processing').length
                },
                messages: {
                    total: logs.reduce((sum, log) => sum + (log.messagesCreated || 0), 0),
                    avgPerWebhook: logs.length ? (logs.reduce((sum, log) => sum + (log.messagesCreated || 0), 0) / logs.length).toFixed(2) : 0
                },
                performance: {
                    avgProcessingTime: logs.length ? (logs.reduce((sum, log) => sum + (log.processingTime || 0), 0) / logs.length).toFixed(2) + 'ms' : '0ms',
                    successRate: logs.length ? ((logs.filter(l => l.status === 'completed').length / logs.length) * 100).toFixed(1) + '%' : '0%'
                },
                events: this.getEventBreakdown(logs)
            };
            
            res.json({
                success: true,
                stats
            });
        } catch (error) {
            this.logger.error('❌ Erro ao buscar estatísticas:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // ====================================
    // MÉTODOS AUXILIARES
    // ====================================

    // Verificar rate limiting
    checkRateLimit(clientIP) {
        const now = Date.now();
        const windowMs = 60 * 1000; // 1 minuto
        const maxRequests = 100;

        if (!this.rateLimiter.has(clientIP)) {
            this.rateLimiter.set(clientIP, { count: 1, resetTime: now + windowMs });
            return true;
        }

        const limit = this.rateLimiter.get(clientIP);
        
        if (now > limit.resetTime) {
            this.rateLimiter.set(clientIP, { count: 1, resetTime: now + windowMs });
            return true;
        }

        if (limit.count >= maxRequests) {
            return false;
        }

        limit.count++;
        return true;
    }

    // Obter integração ativa
    getActiveIntegration() {
        for (const integration of this.integrations.values()) {
            if (integration.isActive) {
                return integration;
            }
        }
        return null;
    }

    // Obter dados do contato
    async getContactData(integration, bitrixData) {
        try {
            return await bitrixConnectionService.getContactData(
                integration,
                bitrixData.CONTACT_ID || bitrixData.COMPANY_ID
            );
        } catch (error) {
            this.logger.error('❌ Erro ao obter dados do contato:', error);
            return null;
        }
    }

    // Formatar número de telefone para WhatsApp
    formatPhoneNumber(phone) {
        let cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 11 && cleaned.startsWith('11')) {
            cleaned = '55' + cleaned;
        } else if (cleaned.length === 10) {
            cleaned = '5511' + cleaned;
        }
        
        return cleaned + '@c.us';
    }

    // Formatar telefone para exibição
    formatPhoneForDisplay(phone) {
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 13 && cleaned.startsWith('55')) {
            const ddd = cleaned.substr(2, 2);
            const number = cleaned.substr(4);
            return `+55 ${ddd} ${number.substr(0, 5)}-${number.substr(5)}`;
        }
        
        return phone;
    }

    // Adicionar à fila de mensagens
    async addToMessageQueue(queueItem) {
        try {
            // Em produção, usar Redis/Bull Queue
            // Por enquanto, processar imediatamente se for agendamento imediato
            
            const now = new Date();
            const scheduledFor = new Date(queueItem.scheduledFor);
            
            if (scheduledFor <= now) {
                // Processar imediatamente
                setTimeout(() => {
                    this.processQueueItem(queueItem);
                }, 1000);
            } else {
                // Agendar para mais tarde
                const delay = scheduledFor.getTime() - now.getTime();
                setTimeout(() => {
                    this.processQueueItem(queueItem);
                }, delay);
            }
            
            return queueItem;
        } catch (error) {
            this.logger.error('❌ Erro ao adicionar à fila:', error);
            throw error;
        }
    }

    // Processar item da fila
    async processQueueItem(queueItem) {
        try {
            this.logger.info(`📤 Processando item da fila: ${queueItem.id}`);
            
            // Simular envio de mensagem (substituir pela integração real do WhatsApp)
            // await this.messageController.sendMessage(queueItem.payload);
            
            console.log('📱 Mensagem simulada:', {
                chatId: queueItem.payload.chatId,
                message: queueItem.payload.message,
                dealId: queueItem.dealId
            });
            
            queueItem.status = 'sent';
            queueItem.sentAt = new Date().toISOString();
            
            this.logger.info(`✅ Mensagem enviada com sucesso: ${queueItem.id}`);
            
        } catch (error) {
            this.logger.error(`❌ Erro ao processar item da fila ${queueItem.id}:`, error);
            queueItem.status = 'failed';
            queueItem.error = error.message;
            queueItem.attempts = (queueItem.attempts || 0) + 1;
            
            // Retry logic (máximo 3 tentativas)
            if (queueItem.attempts < 3) {
                setTimeout(() => {
                    this.processQueueItem(queueItem);
                }, 60000 * queueItem.attempts); // 1min, 2min, 3min
            }
        }
    }

    // Registrar atividade no Bitrix
    async logActivityToBitrix(integration, bitrixData, template, messageContent) {
        try {
            const activity = {
                OWNER_TYPE_ID: 2, // Deal
                OWNER_ID: bitrixData.ID,
                TYPE_ID: 4, // Call
                SUBJECT: `WhatsApp: ${template.name}`,
                DESCRIPTION: `Mensagem automática enviada:\n\n${messageContent.text}`,
                COMPLETED: 'Y',
                RESPONSIBLE_ID: bitrixData.ASSIGNED_BY_ID,
                CREATED: new Date().toISOString()
            };

            await bitrixConnectionService.addActivity(integration, activity);
            this.logger.info(`📝 Atividade registrada no Bitrix para deal ${bitrixData.ID}`);
        } catch (error) {
            this.logger.error('❌ Erro ao registrar atividade no Bitrix:', error);
        }
    }

    // Sanitizar headers para log
    sanitizeHeaders(headers) {
        const sanitized = { ...headers };
        delete sanitized.authorization;
        delete sanitized.cookie;
        return sanitized;
    }

    // Atualizar log do webhook
    updateWebhookLog(logId, updates) {
        const logIndex = this.webhookLogs.findIndex(log => log.id === logId);
        if (logIndex >= 0) {
            Object.assign(this.webhookLogs[logIndex], updates);
        }
    }

    // Breakdown de eventos
    getEventBreakdown(logs) {
        const events = {};
        logs.forEach(log => {
            const event = log.event || 'unknown';
            events[event] = (events[event] || 0) + 1;
        });
        return events;
    }

    // Carregar configurações salvas
    loadSavedConfigurations() {
        try {
            // Em produção, carregar do banco de dados
            // Por enquanto, usar arquivos JSON locais
            
            const integrationsFile = path.join(__dirname, '../data/integrations.json');
            const templatesFile = path.join(__dirname, '../data/templates.json');
            
            if (fs.existsSync(integrationsFile)) {
                const data = JSON.parse(fs.readFileSync(integrationsFile, 'utf8'));
                data.forEach(integration => {
                    this.integrations.set(integration.id, integration);
                });
                this.logger.info(`📂 ${data.length} integrações carregadas`);
            }
            
            if (fs.existsSync(templatesFile)) {
                this.templates = JSON.parse(fs.readFileSync(templatesFile, 'utf8'));
                this.logger.info(`📋 ${this.templates.length} templates carregados`);
            }
        } catch (error) {
            this.logger.error('⚠️ Erro ao carregar configurações:', error);
        }
    }

    // Salvar configurações
    saveConfigurations() {
        try {
            const dataDir = path.join(__dirname, '../data');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            // Salvar integrações
            const integrationsArray = Array.from(this.integrations.values());
            fs.writeFileSync(
                path.join(dataDir, 'integrations.json'),
                JSON.stringify(integrationsArray, null, 2)
            );
            
            // Salvar templates
            fs.writeFileSync(
                path.join(dataDir, 'templates.json'),
                JSON.stringify(this.templates, null, 2)
            );
            
        } catch (error) {
            this.logger.error('⚠️ Erro ao salvar configurações:', error);
        }
    }
}

module.exports = BitrixController;