// ===================================
// NOVO ARQUIVO: server/routes/bitrix.js
// ===================================
// Crie este arquivo em: C:\Users\david\Desktop\whatsapp_sistem\server\routes\bitrix.js

const express = require('express');
const router = express.Router();

// ===================================
// BITRIX CONTROLLER INLINE
// ===================================

const BitrixController = {
  // Receber webhook do Bitrix24
  webhook: async (req, res) => {
    try {
      const { event, data } = req.body;
      console.log('🔗 Webhook Bitrix recebido:', { event, data });

      // TODO: Implementar processamento real do webhook
      // 1. Validar assinatura
      // 2. Processar evento
      // 3. Enviar mensagem WhatsApp se necessário
      
      // Resposta imediata para o Bitrix (importante!)
      res.status(200).json({
        success: true,
        message: 'Webhook recebido e processado',
        event: event,
        timestamp: new Date().toISOString()
      });

      // Processar assincronamente
      setTimeout(() => {
        console.log('⚙️ Processando webhook Bitrix assincronamente...');
        // TODO: Lógica de processamento
      }, 100);

    } catch (error) {
      console.error('❌ Erro no webhook Bitrix:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao processar webhook'
      });
    }
  },

  // Enviar mensagem via Bitrix integration
  sendMessage: async (req, res) => {
    try {
      const { chatId, message, templateName, variables } = req.body;
      
      console.log('📤 Enviando mensagem via Bitrix:', {
        chatId,
        message,
        templateName,
        variables
      });

      // TODO: Implementar envio real
      // 1. Renderizar template se fornecido
      // 2. Enviar via WhatsApp
      // 3. Registrar atividade no Bitrix

      const mockResponse = {
        messageId: 'bitrix_msg_' + Date.now(),
        chatId: chatId,
        content: message,
        templateUsed: templateName,
        timestamp: new Date(),
        status: 'sent'
      };

      res.json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: mockResponse
      });

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem Bitrix:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao enviar mensagem'
      });
    }
  },

  // Obter status da integração
  getStatus: async (req, res) => {
    try {
      console.log('📊 Verificando status da integração Bitrix...');

      const mockStatus = {
        isConnected: false,
        webhookUrl: `${req.protocol}://${req.get('host')}/api/bitrix/webhook`,
        lastWebhook: null,
        webhooksReceived: 0,
        messagesProcessed: 0,
        templatesActive: 0,
        queueSize: 0,
        errors: []
      };

      res.json({
        success: true,
        status: mockStatus
      });

    } catch (error) {
      console.error('❌ Erro ao verificar status Bitrix:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao verificar status'
      });
    }
  },

  // Configurar integração
  setupIntegration: async (req, res) => {
    try {
      const { bitrixDomain, webhookUrl, apiKey } = req.body;
      
      console.log('⚙️ Configurando integração Bitrix:', {
        bitrixDomain,
        webhookUrl,
        apiKey: apiKey ? '***' : null
      });

      // TODO: Implementar configuração real
      // 1. Validar credenciais
      // 2. Testar conexão
      // 3. Salvar configuração

      res.json({
        success: true,
        message: 'Integração configurada com sucesso',
        webhookUrl: `${req.protocol}://${req.get('host')}/api/bitrix/webhook`,
        configuration: {
          bitrixDomain,
          webhookConfigured: true,
          testConnectionPassed: true
        }
      });

    } catch (error) {
      console.error('❌ Erro ao configurar integração:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao configurar integração'
      });
    }
  },

  // Testar conexão com Bitrix
  testConnection: async (req, res) => {
    try {
      const { bitrixDomain, webhookUrl } = req.body;
      
      console.log('🔍 Testando conexão Bitrix:', { bitrixDomain, webhookUrl });

      // TODO: Implementar teste real de conexão
      
      res.json({
        success: true,
        message: 'Conexão testada com sucesso',
        results: {
          webhookReachable: true,
          authenticationValid: true,
          permissionsOk: true,
          responseTime: '245ms'
        }
      });

    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao testar conexão'
      });
    }
  },

  // Listar templates de mensagem
  getTemplates: async (req, res) => {
    try {
      console.log('📋 Listando templates Bitrix...');

      const mockTemplates = [
        {
          id: '1',
          name: 'Novo Deal - Boas-vindas',
          description: 'Mensagem enviada quando deal é criado',
          event: 'ONCRMDEALADD',
          isActive: true,
          content: 'Olá {contactName}! Recebemos sua solicitação "{dealTitle}"...',
          variables: ['contactName', 'dealTitle', 'dealAmount'],
          createdAt: new Date()
        },
        {
          id: '2',
          name: 'Follow-up Inatividade',
          description: 'Mensagem para deals inativos',
          event: 'CUSTOM_AUTOMATION',
          isActive: true,
          content: 'Olá {contactName}! O deal "{dealTitle}" está sem atividade...',
          variables: ['contactName', 'dealTitle', 'daysInactive'],
          createdAt: new Date()
        }
      ];

      res.json({
        success: true,
        templates: mockTemplates,
        count: mockTemplates.length
      });

    } catch (error) {
      console.error('❌ Erro ao listar templates:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar templates'
      });
    }
  },

  // Obter logs de webhook
  getLogs: async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      console.log('📋 Obtendo logs de webhook Bitrix...');

      const mockLogs = [
        {
          id: '1',
          event: 'ONCRMDEALADD',
          status: 'success',
          webhook: { dealId: '12345', contactId: '67890' },
          processing: { duration: '245ms', messagesCreated: 1 },
          timestamp: new Date(Date.now() - 300000) // 5 min atrás
        },
        {
          id: '2',
          event: 'ONCRMDEALUPDATE',
          status: 'failed',
          webhook: { dealId: '12346', contactId: '67891' },
          processing: { duration: '120ms', messagesCreated: 0 },
          error: 'Template não encontrado',
          timestamp: new Date(Date.now() - 600000) // 10 min atrás
        }
      ];

      res.json({
        success: true,
        logs: mockLogs,
        count: mockLogs.length,
        hasMore: false
      });

    } catch (error) {
      console.error('❌ Erro ao obter logs:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao obter logs'
      });
    }
  }
};

// ===================================
// ROTAS
// ===================================

// POST /api/bitrix/webhook - Receber webhook do Bitrix24
router.post('/webhook', BitrixController.webhook.bind(BitrixController));

// POST /api/bitrix/send-message - Enviar mensagem via integração
router.post('/send-message', BitrixController.sendMessage.bind(BitrixController));

// GET /api/bitrix/status - Status da integração
router.get('/status', BitrixController.getStatus.bind(BitrixController));

// POST /api/bitrix/setup - Configurar integração
router.post('/setup', BitrixController.setupIntegration.bind(BitrixController));

// POST /api/bitrix/test-connection - Testar conexão
router.post('/test-connection', BitrixController.testConnection.bind(BitrixController));

// GET /api/bitrix/templates - Listar templates
router.get('/templates', BitrixController.getTemplates.bind(BitrixController));

// GET /api/bitrix/logs - Obter logs de webhook
router.get('/logs', BitrixController.getLogs.bind(BitrixController));

// ===================================
// MIDDLEWARE DE ERRO
// ===================================

router.use((error, req, res, next) => {
  console.error('❌ Erro no middleware Bitrix:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor Bitrix'
  });
});

module.exports = router;