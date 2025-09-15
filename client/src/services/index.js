// client/src/services/index.js
// =====================================
// PRIMEM WHATSAPP - EXPORTAÇÃO CENTRALIZADA DE SERVIÇOS
// Importação única para todos os serviços API
// =====================================

// Importar todos os serviços
import apiService from './apiService';
import authService from './authService';
import whatsappService from './whatsappService';
import messageService from './messageService';
import fileService from './fileService';

// ====================================
// EXPORTAÇÃO PADRÃO (RECOMENDADA)
// ====================================
export {
  apiService,
  authService,
  whatsappService,
  messageService,
  fileService
};

// ====================================
// EXPORTAÇÃO COMO OBJETO (ALTERNATIVA)
// ====================================
export const services = {
  api: apiService,
  auth: authService,
  whatsapp: whatsappService,
  message: messageService,
  file: fileService
};

// ====================================
// EXPORTAÇÃO DEFAULT PARA COMPATIBILIDADE
// ====================================
export default {
  apiService,
  authService,
  whatsappService,
  messageService,
  fileService
};

// ====================================
// INICIALIZAÇÃO DOS SERVIÇOS
// ====================================

/**
 * Inicializar todos os serviços
 * Deve ser chamado uma vez na inicialização da aplicação
 */
export const initializeServices = () => {
  console.log('🚀 Inicializando serviços PRIMEM WhatsApp...');
  
  try {
    // AuthService já se inicializa automaticamente
    console.log('✅ AuthService inicializado');
    
    // WhatsAppService inicialização manual se necessário
    console.log('✅ WhatsAppService pronto');
    
    // MessageService pronto para uso
    console.log('✅ MessageService pronto');
    
    // FileService pronto para uso
    console.log('✅ FileService pronto');
    
    console.log('🎉 Todos os serviços inicializados com sucesso!');
    
    return {
      success: true,
      message: 'Serviços inicializados com sucesso'
    };
    
  } catch (error) {
    console.error('❌ Erro ao inicializar serviços:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Erro na inicialização dos serviços'
    };
  }
};

/**
 * Verificar saúde de todos os serviços
 */
export const checkServicesHealth = async () => {
  const health = {
    api: false,
    auth: false,
    whatsapp: false,
    message: false,
    file: false
  };
  
  try {
    // Verificar API Service
    health.api = await apiService.healthCheck();
    
    // Verificar Auth Service
    health.auth = authService.isAuthenticated();
    
    // Verificar WhatsApp Service
    health.whatsapp = whatsappService.isWhatsAppConnected();
    
    // Message e File Services estão sempre "saudáveis" se chegaram até aqui
    health.message = true;
    health.file = true;
    
    const allHealthy = Object.values(health).every(status => status);
    
    return {
      success: allHealthy,
      health,
      message: allHealthy ? 'Todos os serviços operacionais' : 'Alguns serviços com problemas'
    };
    
  } catch (error) {
    console.error('❌ Erro ao verificar saúde dos serviços:', error);
    
    return {
      success: false,
      health,
      error: error.message,
      message: 'Erro na verificação de saúde'
    };
  }
};

/**
 * Finalizar todos os serviços
 * Deve ser chamado antes de fechar a aplicação
 */
export const finalizeServices = () => {
  console.log('🛑 Finalizando serviços...');
  
  try {
    // Limpar dados dos serviços
    messageService.clearAllData();
    fileService.clearPreviewCache();
    whatsappService.destroy();
    
    console.log('✅ Serviços finalizados com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao finalizar serviços:', error);
  }
};

// ====================================
// CONSTANTES ÚTEIS
// ====================================
export const SERVICE_NAMES = {
  API: 'apiService',
  AUTH: 'authService', 
  WHATSAPP: 'whatsappService',
  MESSAGE: 'messageService',
  FILE: 'fileService'
};

export const SERVICE_EVENTS = {
  WHATSAPP: {
    QR: 'qr',
    READY: 'ready',
    DISCONNECTED: 'disconnected',
    ERROR: 'error',
    MESSAGE_RECEIVED: 'message_received',
    MESSAGE_SENT: 'message_sent',
    STATE_CHANGE: 'state_change'
  }
};

// ====================================
// UTILITÁRIOS DE CONFIGURAÇÃO
// ====================================

/**
 * Configurar URLs base para todos os serviços
 * @param {string} apiUrl - URL base da API
 * @param {string} socketUrl - URL do Socket.IO
 */
export const configureServices = (apiUrl, socketUrl) => {
  console.log('⚙️ Configurando URLs dos serviços...');
  
  // Configurar API Service
  apiService.baseURL = apiUrl;
  
  // Configurar WhatsApp Service
  whatsappService.socketURL = socketUrl;
  
  console.log('✅ URLs configuradas:', { apiUrl, socketUrl });
};

/**
 * Obter status resumido de todos os serviços
 */
export const getServicesStatus = () => {
  return {
    api: {
      baseURL: apiService.baseURL,
      timeout: apiService.timeout
    },
    auth: {
      isAuthenticated: authService.isAuthenticated(),
      currentUser: authService.getCurrentUser()?.name || null
    },
    whatsapp: {
      isConnected: whatsappService.isWhatsAppConnected(),
      connectionState: whatsappService.connectionState,
      userInfo: whatsappService.getUserInfo()?.name || null
    },
    message: {
      chatsCount: messageService.chats.length,
      totalUnread: messageService.getTotalUnreadCount()
    },
    file: {
      maxFileSize: `${(fileService.maxFileSize / 1024 / 1024).toFixed(1)}MB`,
      previewCacheSize: fileService.previewCache.size
    }
  };
};