// server/controllers/messageController.js
// =====================================
// CONTROLLER DE MENSAGENS
// =====================================

const logger = require('../utils/logger');

class MessageController {
    constructor() {
        this.messages = []; // Em produção, usar banco de dados
    }

    // ====================================
    // LISTAR MENSAGENS
    // ====================================
    async list(req, res) {
        try {
            const { page = 1, limit = 50, chatId, fromMe, type } = req.query;

            let filteredMessages = [...this.messages];

            // Filtrar por chat
            if (chatId) {
                filteredMessages = filteredMessages.filter(msg => msg.chatId === chatId);
            }

            // Filtrar por origem
            if (fromMe !== undefined) {
                filteredMessages = filteredMessages.filter(msg => msg.fromMe === (fromMe === 'true'));
            }

            // Filtrar por tipo
            if (type) {
                filteredMessages = filteredMessages.filter(msg => msg.type === type);
            }

            // Ordenar por timestamp (mais recente primeiro)
            filteredMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Paginação
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedMessages = filteredMessages.slice(startIndex, endIndex);

            res.json({
                success: true,
                messages: paginatedMessages,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: filteredMessages.length,
                    totalPages: Math.ceil(filteredMessages.length / limit)
                }
            });

        } catch (error) {
            logger.error('Erro ao listar mensagens:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // BUSCAR MENSAGENS
    // ====================================
    async search(req, res) {
        try {
            const { query, chatId, dateFrom, dateTo } = req.body;

            if (!query || query.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Consulta deve ter pelo menos 2 caracteres'
                });
            }

            let results = this.messages.filter(msg => {
                // Buscar no texto da mensagem
                const matchText = msg.body && msg.body.toLowerCase().includes(query.toLowerCase());
                
                // Filtrar por chat se especificado
                const matchChat = !chatId || msg.chatId === chatId;
                
                // Filtrar por data se especificado
                let matchDate = true;
                if (dateFrom || dateTo) {
                    const msgDate = new Date(msg.timestamp);
                    if (dateFrom) matchDate = matchDate && msgDate >= new Date(dateFrom);
                    if (dateTo) matchDate = matchDate && msgDate <= new Date(dateTo);
                }

                return matchText && matchChat && matchDate;
            });

            // Ordenar por relevância (por enquanto, só por data)
            results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            res.json({
                success: true,
                results,
                query,
                total: results.length
            });

        } catch (error) {
            logger.error('Erro na busca de mensagens:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // MARCAR COMO LIDA
    // ====================================
    async markAsRead(req, res) {
        try {
            const { messageIds, chatId } = req.body;

            if (!messageIds && !chatId) {
                return res.status(400).json({
                    success: false,
                    message: 'IDs das mensagens ou ID do chat são obrigatórios'
                });
            }

            let updatedCount = 0;

            if (messageIds && Array.isArray(messageIds)) {
                // Marcar mensagens específicas
                messageIds.forEach(id => {
                    const message = this.messages.find(msg => msg.id === id);
                    if (message && !message.fromMe) {
                        message.isRead = true;
                        message.readAt = new Date().toISOString();
                        updatedCount++;
                    }
                });
            } else if (chatId) {
                // Marcar todas as mensagens não lidas do chat
                this.messages.forEach(msg => {
                    if (msg.chatId === chatId && !msg.fromMe && !msg.isRead) {
                        msg.isRead = true;
                        msg.readAt = new Date().toISOString();
                        updatedCount++;
                    }
                });
            }

            logger.info('Mensagens marcadas como lidas:', {
                count: updatedCount,
                userId: req.user.id
            });

            res.json({
                success: true,
                message: `${updatedCount} mensagens marcadas como lidas`,
                updatedCount
            });

        } catch (error) {
            logger.error('Erro ao marcar mensagens como lidas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // ADICIONAR MENSAGEM (INTERNO)
    // ====================================
    addMessage(messageData) {
        try {
            const message = {
                id: messageData.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                chatId: messageData.chatId || messageData.from,
                from: messageData.from,
                to: messageData.to,
                body: messageData.body || '',
                type: messageData.type || 'text',
                timestamp: messageData.timestamp || new Date().toISOString(),
                fromMe: messageData.fromMe || false,
                isRead: messageData.fromMe || false, // Mensagens enviadas por nós são automaticamente "lidas"
                hasMedia: messageData.hasMedia || false,
                media: messageData.media || null,
                createdAt: new Date().toISOString()
            };

            this.messages.push(message);

            // Manter apenas as últimas 1000 mensagens em memória
            if (this.messages.length > 1000) {
                this.messages = this.messages.slice(-1000);
            }

            logger.info('Mensagem adicionada:', {
                id: message.id,
                type: message.type,
                fromMe: message.fromMe,
                hasMedia: message.hasMedia
            });

            return message;

        } catch (error) {
            logger.error('Erro ao adicionar mensagem:', error);
            return null;
        }
    }

    // ====================================
    // OBTER ESTATÍSTICAS
    // ====================================
    async getStats(req, res) {
        try {
            const { period = 'today' } = req.query;

            let dateFilter = new Date();
            
            switch (period) {
                case 'today':
                    dateFilter.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    dateFilter.setDate(dateFilter.getDate() - 7);
                    break;
                case 'month':
                    dateFilter.setDate(dateFilter.getDate() - 30);
                    break;
                default:
                    dateFilter.setHours(0, 0, 0, 0);
            }

            const filteredMessages = this.messages.filter(msg => 
                new Date(msg.timestamp) >= dateFilter
            );

            const stats = {
                total: filteredMessages.length,
                sent: filteredMessages.filter(msg => msg.fromMe).length,
                received: filteredMessages.filter(msg => !msg.fromMe).length,
                unread: filteredMessages.filter(msg => !msg.fromMe && !msg.isRead).length,
                withMedia: filteredMessages.filter(msg => msg.hasMedia).length,
                byType: {
                    text: filteredMessages.filter(msg => msg.type === 'text').length,
                    image: filteredMessages.filter(msg => msg.type === 'image').length,
                    audio: filteredMessages.filter(msg => msg.type === 'audio').length,
                    video: filteredMessages.filter(msg => msg.type === 'video').length,
                    document: filteredMessages.filter(msg => msg.type === 'document').length
                },
                period,
                dateFrom: dateFilter.toISOString()
            };

            res.json({
                success: true,
                stats
            });

        } catch (error) {
            logger.error('Erro ao obter estatísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}