// ===================================
// CORREÇÃO PARA server/routes/messages.js
// ===================================
// Substitua TODO o conteúdo do arquivo por este código:

const express = require('express');
const router = express.Router();

// ===================================
// CONTROLLER INLINE (TEMPORÁRIO)
// ===================================
// Como o MessageController não existe, vamos criar um controller inline

const MessageController = {
  // Listar mensagens
  list: async (req, res) => {
    try {
      console.log('📋 Listando mensagens...');
      
      // TODO: Implementar busca real no banco de dados
      const messages = [
        {
          id: '1',
          chatId: 'test_chat',
          content: 'Mensagem de exemplo',
          timestamp: new Date(),
          fromMe: false,
          type: 'text'
        }
      ];

      res.json({
        success: true,
        messages: messages,
        count: messages.length
      });

    } catch (error) {
      console.error('❌ Erro ao listar mensagens:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar mensagens'
      });
    }
  },

  // Obter histórico de chat específico
  getHistory: async (req, res) => {
    try {
      const { chatId } = req.params;
      console.log('📜 Obtendo histórico do chat:', chatId);

      // TODO: Implementar busca real no banco
      const messages = [
        {
          id: '1',
          chatId: chatId,
          content: 'Primeira mensagem',
          timestamp: new Date(Date.now() - 60000),
          fromMe: true,
          type: 'text'
        },
        {
          id: '2',
          chatId: chatId,
          content: 'Segunda mensagem',
          timestamp: new Date(),
          fromMe: false,
          type: 'text'
        }
      ];

      res.json({
        success: true,
        chatId: chatId,
        messages: messages,
        count: messages.length
      });

    } catch (error) {
      console.error('❌ Erro ao obter histórico:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao obter histórico do chat'
      });
    }
  },

  // Marcar mensagens como lidas
  markRead: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { messageIds } = req.body;

      console.log('✅ Marcando como lidas:', { chatId, messageIds });

      // TODO: Implementar no banco de dados
      
      res.json({
        success: true,
        message: 'Mensagens marcadas como lidas',
        chatId: chatId,
        markedCount: messageIds ? messageIds.length : 0
      });

    } catch (error) {
      console.error('❌ Erro ao marcar como lidas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao marcar mensagens como lidas'
      });
    }
  },

  // Buscar mensagens
  search: async (req, res) => {
    try {
      const { query, chatId } = req.query;
      console.log('🔍 Buscando mensagens:', { query, chatId });

      // TODO: Implementar busca real
      const results = [];

      res.json({
        success: true,
        query: query,
        chatId: chatId,
        results: results,
        count: results.length
      });

    } catch (error) {
      console.error('❌ Erro na busca:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar mensagens'
      });
    }
  },

  // Deletar mensagem
  delete: async (req, res) => {
    try {
      const { messageId } = req.params;
      console.log('🗑️ Deletando mensagem:', messageId);

      // TODO: Implementar deleção no banco
      
      res.json({
        success: true,
        message: 'Mensagem deletada com sucesso',
        messageId: messageId
      });

    } catch (error) {
      console.error('❌ Erro ao deletar mensagem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar mensagem'
      });
    }
  }
};

// ===================================
// ROTAS
// ===================================

// GET /api/messages - Listar todas as mensagens
router.get('/', MessageController.list.bind(MessageController));

// GET /api/messages/history/:chatId - Histórico do chat
router.get('/history/:chatId', MessageController.getHistory.bind(MessageController));

// PUT /api/messages/mark-read/:chatId - Marcar como lidas
router.put('/mark-read/:chatId', MessageController.markRead.bind(MessageController));

// GET /api/messages/search - Buscar mensagens
router.get('/search', MessageController.search.bind(MessageController));

// DELETE /api/messages/:messageId - Deletar mensagem
router.delete('/:messageId', MessageController.delete.bind(MessageController));

// ===================================
// MIDDLEWARE DE ERRO
// ===================================

router.use((error, req, res, next) => {
  console.error('❌ Erro no middleware de mensagens:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

module.exports = router;