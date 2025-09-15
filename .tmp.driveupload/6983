// ===================================
// CORREÇÃO PARA server/routes/whatsapp.js
// ===================================
// Substitua TODO o conteúdo do arquivo por este código:

const express = require('express');
const router = express.Router();

// ===================================
// WHATSAPP CONTROLLER INLINE
// ===================================

const WhatsAppController = {
  // Conectar WhatsApp
  connect: async (req, res) => {
    try {
      console.log('📱 Iniciando conexão WhatsApp...');
      
      // TODO: Implementar conexão real com whatsapp-web.js
      // Por enquanto, simular QR code
      
      res.json({
        success: true,
        message: 'Conectando ao WhatsApp...',
        status: 'connecting',
        qrCode: null // Será gerado pelo serviço real
      });

    } catch (error) {
      console.error('❌ Erro ao conectar WhatsApp:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao conectar WhatsApp'
      });
    }
  },

  // Desconectar WhatsApp
  disconnect: async (req, res) => {
    try {
      console.log('📱 Desconectando WhatsApp...');
      
      // TODO: Implementar desconexão real
      
      res.json({
        success: true,
        message: 'WhatsApp desconectado com sucesso',
        status: 'disconnected'
      });

    } catch (error) {
      console.error('❌ Erro ao desconectar WhatsApp:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao desconectar WhatsApp'
      });
    }
  },

  // Status da conexão
  status: async (req, res) => {
    try {
      console.log('📊 Verificando status do WhatsApp...');
      
      // TODO: Verificar status real da conexão
      const mockStatus = {
        isConnected: false,
        status: 'disconnected', // connecting, connected, disconnected
        qrCode: null,
        deviceInfo: null,
        lastConnection: null,
        uptime: 0
      };

      res.json({
        success: true,
        ...mockStatus
      });

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao verificar status'
      });
    }
  },

  // Obter QR Code
  getQR: async (req, res) => {
    try {
      console.log('📱 Solicitando QR Code...');
      
      // TODO: Obter QR real do whatsapp-web.js
      
      res.json({
        success: true,
        qrCode: null, // Base64 do QR será retornado aqui
        message: 'QR Code será gerado automaticamente'
      });

    } catch (error) {
      console.error('❌ Erro ao obter QR:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao obter QR Code'
      });
    }
  },

  // Listar chats/conversas
  getChats: async (req, res) => {
    try {
      console.log('💬 Listando chats...');
      
      // TODO: Obter chats reais do WhatsApp
      const mockChats = [
        {
          id: { _serialized: '5511999999999@c.us' },
          name: 'Cliente Teste 1',
          isGroup: false,
          unreadCount: 2,
          lastMessage: {
            body: 'Olá, preciso de ajuda!',
            timestamp: Date.now() - 300000, // 5 min atrás
            fromMe: false
          },
          profilePicUrl: null
        },
        {
          id: { _serialized: '5511888888888@c.us' },
          name: 'Cliente Teste 2', 
          isGroup: false,
          unreadCount: 0,
          lastMessage: {
            body: 'Obrigado pela atenção!',
            timestamp: Date.now() - 3600000, // 1 hora atrás
            fromMe: true
          },
          profilePicUrl: null
        },
        {
          id: { _serialized: '120363043968357732@g.us' },
          name: 'Grupo PRIMEM',
          isGroup: true,
          unreadCount: 5,
          lastMessage: {
            body: 'Reunião hoje às 15h',
            timestamp: Date.now() - 1800000, // 30 min atrás
            fromMe: false
          },
          profilePicUrl: null
        }
      ];

      res.json({
        success: true,
        chats: mockChats,
        count: mockChats.length
      });

    } catch (error) {
      console.error('❌ Erro ao listar chats:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar chats'
      });
    }
  },

  // Enviar mensagem de texto
  sendMessage: async (req, res) => {
    try {
      const { chatId, message } = req.body;
      
      if (!chatId || !message) {
        return res.status(400).json({
          success: false,
          error: 'chatId e message são obrigatórios'
        });
      }

      console.log('📤 Enviando mensagem:', { chatId, message });
      
      // TODO: Enviar mensagem real via whatsapp-web.js
      
      const mockResponse = {
        id: 'msg_' + Date.now(),
        chatId: chatId,
        body: message,
        timestamp: Date.now(),
        fromMe: true,
        ack: 1 // 1=enviado, 2=entregue, 3=lido
      };

      res.json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        messageData: mockResponse
      });

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao enviar mensagem'
      });
    }
  },

  // Enviar mídia (arquivo)
  sendMedia: async (req, res) => {
    try {
      const { chatId, caption } = req.body;
      const file = req.file;

      if (!chatId) {
        return res.status(400).json({
          success: false,
          error: 'chatId é obrigatório'
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Arquivo é obrigatório'
        });
      }

      console.log('📎 Enviando mídia:', {
        chatId,
        filename: file.filename,
        mimetype: file.mimetype,
        caption
      });

      // TODO: Enviar mídia real via whatsapp-web.js
      
      const mockResponse = {
        id: 'media_msg_' + Date.now(),
        chatId: chatId,
        caption: caption || '',
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        timestamp: Date.now(),
        fromMe: true,
        ack: 1
      };

      res.json({
        success: true,
        message: 'Mídia enviada com sucesso',
        messageData: mockResponse,
        fileData: {
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: `/uploads/${file.filename}`
        }
      });

    } catch (error) {
      console.error('❌ Erro ao enviar mídia:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao enviar mídia'
      });
    }
  },

  // Marcar como lida
  markAsRead: async (req, res) => {
    try {
      const { chatId } = req.params;
      
      console.log('✅ Marcando como lida:', chatId);
      
      // TODO: Implementar markAsRead real
      
      res.json({
        success: true,
        message: 'Chat marcado como lido',
        chatId: chatId
      });

    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao marcar como lida'
      });
    }
  },

  // Obter mensagens de um chat
  getChatMessages: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      console.log('📜 Obtendo mensagens do chat:', chatId);

      // TODO: Obter mensagens reais do banco/WhatsApp
      const mockMessages = [
        {
          id: 'msg_1',
          chatId: chatId,
          body: 'Olá! Como posso ajudar?',
          timestamp: Date.now() - 600000, // 10 min atrás
          fromMe: false,
          type: 'text',
          ack: 3
        },
        {
          id: 'msg_2', 
          chatId: chatId,
          body: 'Preciso de informações sobre importação',
          timestamp: Date.now() - 300000, // 5 min atrás
          fromMe: true,
          type: 'text',
          ack: 3
        }
      ];

      res.json({
        success: true,
        chatId: chatId,
        messages: mockMessages,
        count: mockMessages.length,
        hasMore: false
      });

    } catch (error) {
      console.error('❌ Erro ao obter mensagens:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao obter mensagens do chat'
      });
    }
  }
};

// ===================================
// ROTAS
// ===================================

// POST /api/whatsapp/connect - Conectar WhatsApp
router.post('/connect', WhatsAppController.connect.bind(WhatsAppController));

// POST /api/whatsapp/disconnect - Desconectar WhatsApp
router.post('/disconnect', WhatsAppController.disconnect.bind(WhatsAppController));

// GET /api/whatsapp/status - Status da conexão
router.get('/status', WhatsAppController.status.bind(WhatsAppController));

// GET /api/whatsapp/qr - Obter QR Code
router.get('/qr', WhatsAppController.getQR.bind(WhatsAppController));

// GET /api/whatsapp/chats - Listar chats
router.get('/chats', WhatsAppController.getChats.bind(WhatsAppController));

// POST /api/whatsapp/send - Enviar mensagem de texto
router.post('/send', WhatsAppController.sendMessage.bind(WhatsAppController));

// POST /api/whatsapp/send-media - Enviar mídia (precisa do middleware de upload)
// Nota: O middleware de upload será adicionado no servidor principal se necessário
router.post('/send-media', WhatsAppController.sendMedia.bind(WhatsAppController));

// PUT /api/whatsapp/mark-read/:chatId - Marcar como lida
router.put('/mark-read/:chatId', WhatsAppController.markAsRead.bind(WhatsAppController));

// GET /api/whatsapp/messages/:chatId - Obter mensagens do chat
router.get('/messages/:chatId', WhatsAppController.getChatMessages.bind(WhatsAppController));

// ===================================
// MIDDLEWARE DE ERRO
// ===================================

router.use((error, req, res, next) => {
  console.error('❌ Erro no middleware WhatsApp:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor WhatsApp'
  });
});

module.exports = router;