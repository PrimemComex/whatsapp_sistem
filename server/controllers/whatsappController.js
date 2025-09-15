// server/controllers/whatsappController.js
// =====================================
// CONTROLLER DO WHATSAPP
// =====================================

const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

class WhatsAppController {
    constructor() {
        this.whatsappService = null;
    }

    // ====================================
    // INICIALIZAR WHATSAPP SERVICE
    // ====================================
    initializeService(whatsappService) {
        this.whatsappService = whatsappService;
    }

    // ====================================
    // CONECTAR WHATSAPP
    // ====================================
    async connect(req, res) {
        try {
            logger.info('Solicitação de conexão WhatsApp', {
                userId: req.user.id,
                email: req.user.email
            });

            if (this.whatsappService && this.whatsappService.isReady) {
                return res.json({
                    success: true,
                    message: 'WhatsApp já está conectado',
                    status: this.whatsappService.getStatus(),
                    version: '6.0-modularized'
                });
            }

            if (!this.whatsappService) {
                try {
                    const WhatsAppService = require('../services/whatsapp.service');
                    this.whatsappService = new WhatsAppService(req.app.get('io'), logger);
                } catch (error) {
                    return res.status(500).json({
                        success: false,
                        message: 'WhatsApp Service não encontrado'
                    });
                }
            }

            // Inicializar de forma assíncrona
            this.whatsappService.initialize().then(() => {
                logger.success('WhatsApp conectado com sucesso');
            }).catch(error => {
                logger.error('Erro na conexão WhatsApp:', error);
            });

            res.json({
                success: true,
                message: 'Iniciando conexão. Aguarde o QR Code.',
                version: '6.0-modularized'
            });

        } catch (error) {
            logger.error('Erro ao conectar WhatsApp:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // ====================================
    // DESCONECTAR WHATSAPP
    // ====================================
    async disconnect(req, res) {
        try {
            logger.info('Solicitação de desconexão WhatsApp', {
                userId: req.user.id,
                email: req.user.email
            });

            if (this.whatsappService) {
                await this.whatsappService.disconnect();
                this.whatsappService = null;
            }

            res.json({
                success: true,
                message: 'WhatsApp desconectado'
            });

        } catch (error) {
            logger.error('Erro ao desconectar WhatsApp:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // ====================================
    // OBTER STATUS
    // ====================================
    async getStatus(req, res) {
        try {
            const status = {
                hasService: !!this.whatsappService,
                isReady: this.whatsappService?.isReady || false,
                isConnected: this.whatsappService?.isConnected || false,
                timestamp: new Date().toISOString(),
                version: '6.0-modularized'
            };

            if (this.whatsappService && this.whatsappService.getStatus) {
                Object.assign(status, this.whatsappService.getStatus());
            }

            res.json({
                success: true,
                status
            });

        } catch (error) {
            logger.error('Erro ao obter status:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // ====================================
    // OBTER QR CODE
    // ====================================
    async getQRCode(req, res) {
        try {
            if (!this.whatsappService) {
                return res.status(503).json({
                    success: false,
                    message: 'Serviço WhatsApp não inicializado'
                });
            }

            const status = this.whatsappService.getStatus();

            if (status.isReady) {
                return res.json({
                    success: true,
                    connected: true,
                    message: 'WhatsApp já conectado',
                    status: status
                });
            }

            res.json({
                success: true,
                qrCode: status.hasQRCode ? 'available' : null,
                connectionState: status.connectionState,
                isConnecting: status.isConnecting,
                isReady: status.isReady,
                lastQRCodeTime: status.lastQRCodeTime
            });

        } catch (error) {
            logger.error('Erro ao obter QR Code:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // ====================================
    // REFRESH QR CODE
    // ====================================
    async refreshQRCode(req, res) {
        try {
            if (!this.whatsappService) {
                return res.status(503).json({
                    success: false,
                    message: 'Serviço WhatsApp não inicializado'
                });
            }

            if (this.whatsappService.isReady) {
                return res.json({
                    success: true,
                    message: 'WhatsApp já conectado',
                    connected: true
                });
            }

            await this.whatsappService.refreshQRCode();

            res.json({
                success: true,
                message: 'QR Code sendo atualizado',
                timestamp: Date.now()
            });

        } catch (error) {
            logger.error('Erro ao refresh QR Code:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // ====================================
    // LISTAR CHATS
    // ====================================
    async getChats(req, res) {
        try {
            if (!this.whatsappService || !this.whatsappService.isReady) {
                return res.json({
                    success: false,
                    message: 'WhatsApp não está conectado',
                    chats: []
                });
            }

            const chats = await this.whatsappService.getChats();

            res.json({
                success: true,
                chats: chats,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            logger.error('Erro ao obter chats:', error);
            res.status(500).json({
                success: false,
                message: error.message,
                chats: []
            });
        }
    }

    // ====================================
    // ENVIAR MENSAGEM
    // ====================================
    async sendMessage(req, res) {
        try {
            const { to, message, number } = req.body;
            const targetNumber = to || number;

            // Validações
            if (!targetNumber || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Número e mensagem são obrigatórios'
                });
            }

            if (!this.whatsappService || !this.whatsappService.isReady) {
                return res.status(400).json({
                    success: false,
                    message: 'WhatsApp não está conectado'
                });
            }

            logger.info(`Enviando mensagem para ${targetNumber}`, {
                userId: req.user.id,
                email: req.user.email
            });

            const result = await this.whatsappService.sendMessage(targetNumber, message);

            res.json({
                success: true,
                message: 'Mensagem enviada',
                messageId: result.messageId,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            logger.error('Erro ao enviar mensagem:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // ====================================
    // ENVIAR MÍDIA
    // ====================================
    async sendMedia(req, res) {
        try {
            const { number, caption, to, chatId } = req.body;
            const targetNumber = number || to || chatId;
            const file = req.file;

            // Validações
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'Nenhum arquivo foi enviado'
                });
            }

            if (!targetNumber || targetNumber === 'undefined' || targetNumber === 'null' || targetNumber.trim() === '') {
                // Remover arquivo se número inválido
                if (file && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }

                return res.status(400).json({
                    success: false,
                    message: 'Número é obrigatório e não pode estar vazio'
                });
            }

            if (!this.whatsappService || !this.whatsappService.isReady) {
                // Remover arquivo se WhatsApp não conectado
                if (file && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }

                return res.status(503).json({
                    success: false,
                    message: 'WhatsApp não está conectado'
                });
            }

            const ext = path.extname(file.filename).toLowerCase();
            const isAudio = ['.mp3', '.ogg', '.opus', '.wav', '.m4a', '.aac', '.webm'].includes(ext);

            logger.info(`Enviando ${isAudio ? 'áudio' : 'arquivo'} para ${targetNumber}`, {
                fileName: file.originalname,
                size: file.size,
                userId: req.user.id
            });

            let result;
            if (isAudio && this.whatsappService.sendAudio) {
                result = await this.whatsappService.sendAudio(targetNumber, file.path, caption || '');
            } else if (this.whatsappService.sendMedia) {
                result = await this.whatsappService.sendMedia(targetNumber, file.path, caption || '');
            } else {
                throw new Error('Método de envio de mídia não disponível');
            }

            res.json({
                success: true,
                message: isAudio ? 'Áudio enviado com sucesso' : 'Arquivo enviado com sucesso',
                messageId: result.messageId || 'temp_' + Date.now(),
                file: {
                    name: file.originalname,
                    filename: file.filename,
                    size: file.size,
                    mimetype: file.mimetype,
                    url: `/uploads/${path.basename(file.path)}`,
                    isAudio: isAudio
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            logger.error('Erro ao enviar mídia:', error);

            // Remover arquivo em caso de erro
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: `Erro no servidor: ${error.message}`
            });
        }
    }

    // ====================================
    // OBTER MENSAGENS DE UM CHAT
    // ====================================
    async getChatMessages(req, res) {
        try {
            const { chatId } = req.params;

            if (!chatId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do chat é obrigatório'
                });
            }

            if (!this.whatsappService || !this.whatsappService.isReady) {
                return res.json({
                    success: false,
                    message: 'WhatsApp não está conectado',
                    messages: []
                });
            }

            const messages = await this.whatsappService.getChatMessages(chatId);

            res.json({
                success: true,
                messages: messages,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            logger.error('Erro ao obter mensagens:', error);
            res.status(500).json({
                success: false,
                message: error.message,
                messages: []
            });
        }
    }

    // ====================================
    // ENVIO EM MASSA
    // ====================================
    async bulkSend(req, res) {
        try {
            const { numbers, message, delay = 1000 } = req.body;

            // Validações
            if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Lista de números é obrigatória'
                });
            }

            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: 'Mensagem é obrigatória'
                });
            }

            if (!this.whatsappService || !this.whatsappService.isReady) {
                return res.status(400).json({
                    success: false,
                    message: 'WhatsApp não está conectado'
                });
            }

            logger.info(`Enviando mensagem em massa para ${numbers.length} números`, {
                userId: req.user.id,
                email: req.user.email
            });

            const results = [];

            for (let i = 0; i < numbers.length; i++) {
                const number = numbers[i];
                try {
                    const result = await this.whatsappService.sendMessage(number, message);
                    results.push({
                        number,
                        success: true,
                        messageId: result.messageId
                    });

                    // Delay entre envios
                    if (i < numbers.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                } catch (error) {
                    results.push({
                        number,
                        success: false,
                        error: error.message
                    });
                }
            }

            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;

            res.json({
                success: true,
                message: `Envio em massa concluído. ${successCount} sucessos, ${failCount} falhas.`,
                results,
                summary: {
                    total: numbers.length,
                    success: successCount,
                    failed: failCount
                }
            });

        } catch (error) {
            logger.error('Erro no envio em massa:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new WhatsAppController();