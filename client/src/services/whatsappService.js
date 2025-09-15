// client/src/services/whatsappService.js
// =====================================
// PRIMEM WHATSAPP - SERVIÇO DO WHATSAPP
// Gerencia conexão, status e operações do WhatsApp
// =====================================

import apiService from './apiService';
import io from 'socket.io-client';

class WhatsAppService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionState = 'disconnected';
    this.userInfo = null;
    this.qrCode = null;
    this.lastError = null;
    
    // Callbacks para eventos
    this.eventCallbacks = {
      qr: [],
      ready: [],
      disconnected: [],
      error: [],
      message_received: [],
      message_sent: [],
      state_change: []
    };

    // Configurações
    this.socketURL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
  }

  // ====================================
  // INICIALIZAÇÃO E CONEXÃO
  // ====================================

  /**
   * Inicializar Socket.IO
   */
  initSocket() {
    if (this.socket) {
      console.log('📱 Socket já inicializado');
      return;
    }

    console.log('📱 Inicializando Socket WhatsApp...');

    this.socket = io(this.socketURL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000
    });

    this.setupSocketListeners();
  }

  /**
   * Configurar listeners do Socket.IO
   */
  setupSocketListeners() {
    if (!this.socket) return;

    // Conexão estabelecida
    this.socket.on('connect', () => {
      console.log('✅ Socket WhatsApp conectado:', this.socket.id);
      this.reconnectAttempts = 0;
      this.updateConnectionState('socket_connected');
    });

    // Desconexão
    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket WhatsApp desconectado:', reason);
      this.updateConnectionState('socket_disconnected');
      
      if (reason !== 'io client disconnect') {
        this.handleReconnection();
      }
    });

    // QR Code recebido
    this.socket.on('whatsapp:qr', (data) => {
      console.log('📱 QR Code recebido');
      this.qrCode = data.qrCode;
      this.updateConnectionState('waiting_qr');
      this.emit('qr', data);
    });

    // WhatsApp autenticado
    this.socket.on('whatsapp:authenticated', () => {
      console.log('🔐 WhatsApp autenticado');
      this.updateConnectionState('authenticated');
    });

    // WhatsApp pronto
    this.socket.on('whatsapp:ready', (data) => {
      console.log('✅ WhatsApp conectado e pronto:', data.info);
      this.isConnected = true;
      this.userInfo = data.info;
      this.qrCode = null;
      this.updateConnectionState('connected');
      this.emit('ready', data);
    });

    // WhatsApp desconectado
    this.socket.on('whatsapp:disconnected', (data) => {
      console.log('❌ WhatsApp desconectado');
      this.isConnected = false;
      this.userInfo = null;
      this.qrCode = null;
      this.updateConnectionState('disconnected');
      this.emit('disconnected', data);
    });

    // Erro de autenticação
    this.socket.on('whatsapp:auth_failure', (data) => {
      console.error('❌ Falha na autenticação WhatsApp:', data.message);
      this.lastError = data.message;
      this.updateConnectionState('auth_failed');
      this.emit('error', data);
    });

    // Erro geral
    this.socket.on('whatsapp:error', (data) => {
      console.error('❌ Erro WhatsApp:', data.error);
      this.lastError = data.error;
      this.updateConnectionState('error');
      this.emit('error', data);
    });

    // Mensagem recebida
    this.socket.on('whatsapp:message_received', (data) => {
      console.log('📩 Mensagem recebida:', data.from);
      this.emit('message_received', data);
    });

    // Mensagem enviada
    this.socket.on('whatsapp:message_sent', (data) => {
      console.log('📤 Mensagem enviada:', data.to);
      this.emit('message_sent', data);
    });

    // Erro de conexão
    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão Socket:', error);
      this.lastError = 'Erro de conexão com o servidor';
      this.updateConnectionState('connection_error');
    });
  }

  /**
   * Conectar WhatsApp
   */
  async connect() {
    try {
      console.log('📱 Solicitando conexão WhatsApp...');
      this.updateConnectionState('connecting');

      // Inicializar socket se necessário
      if (!this.socket) {
        this.initSocket();
      }

      const response = await apiService.post('/api/whatsapp/connect');
      
      if (response.success) {
        console.log('✅ Comando de conexão enviado');
        return { success: true, message: 'Conexão iniciada' };
      } else {
        throw new Error(response.message || 'Erro ao conectar WhatsApp');
      }

    } catch (error) {
      console.error('❌ Erro ao conectar WhatsApp:', error);
      this.lastError = error.message;
      this.updateConnectionState('error');
      
      return {
        success: false,
        error: error.message,
        message: 'Erro ao conectar WhatsApp'
      };
    }
  }

  /**
   * Desconectar WhatsApp
   */
  async disconnect() {
    try {
      console.log('📱 Desconectando WhatsApp...');
      this.updateConnectionState('disconnecting');

      const response = await apiService.post('/api/whatsapp/disconnect');
      
      if (response.success) {
        this.isConnected = false;
        this.userInfo = null;
        this.qrCode = null;
        this.updateConnectionState('disconnected');
        
        console.log('✅ WhatsApp desconectado');
        return { success: true, message: 'WhatsApp desconectado' };
      } else {
        throw new Error(response.message || 'Erro ao desconectar WhatsApp');
      }

    } catch (error) {
      console.error('❌ Erro ao desconectar WhatsApp:', error);
      this.lastError = error.message;
      
      return {
        success: false,
        error: error.message,
        message: 'Erro ao desconectar WhatsApp'
      };
    }
  }

  /**
   * Verificar status da conexão
   */
  async getStatus() {
    try {
      const response = await apiService.get('/api/whatsapp/status');
      
      if (response.success) {
        this.isConnected = response.connected;
        this.userInfo = response.userInfo;
        this.connectionState = response.state;
        
        return response;
      }
      
      throw new Error(response.message || 'Erro ao obter status');
      
    } catch (error) {
      console.error('❌ Erro ao obter status WhatsApp:', error);
      return {
        success: false,
        error: error.message,
        connected: false,
        state: 'error'
      };
    }
  }

  // ====================================
  // EVENTOS E CALLBACKS
  // ====================================

  /**
   * Registrar callback para evento
   * @param {string} event 
   * @param {function} callback 
   */
  on(event, callback) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event].push(callback);
    } else {
      console.warn(`⚠️ Evento não suportado: ${event}`);
    }
  }

  /**
   * Remover callback de evento
   * @param {string} event 
   * @param {function} callback 
   */
  off(event, callback) {
    if (this.eventCallbacks[event]) {
      const index = this.eventCallbacks[event].indexOf(callback);
      if (index > -1) {
        this.eventCallbacks[event].splice(index, 1);
      }
    }
  }

  /**
   * Emitir evento
   * @param {string} event 
   * @param {*} data 
   */
  emit(event, data) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Erro no callback do evento ${event}:`, error);
        }
      });
    }
  }

  // ====================================
  // GERENCIAMENTO DE ESTADO
  // ====================================

  /**
   * Atualizar estado da conexão
   * @param {string} newState 
   */
  updateConnectionState(newState) {
    const oldState = this.connectionState;
    this.connectionState = newState;
    
    console.log(`📱 Estado WhatsApp: ${oldState} → ${newState}`);
    
    this.emit('state_change', {
      oldState,
      newState,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Lidar com reconexão
   */
  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de tentativas de reconexão atingido');
      this.updateConnectionState('connection_failed');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    this.updateConnectionState('reconnecting');

    setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // ====================================
  // MÉTODOS DE UTILIDADE
  // ====================================

  /**
   * Obter estado atual
   * @returns {Object}
   */
  getState() {
    return {
      isConnected: this.isConnected,
      connectionState: this.connectionState,
      userInfo: this.userInfo,
      qrCode: this.qrCode,
      lastError: this.lastError,
      socketConnected: this.socket ? this.socket.connected : false
    };
  }

  /**
   * Limpar dados
   */
  clearData() {
    this.isConnected = false;
    this.userInfo = null;
    this.qrCode = null;
    this.lastError = null;
    this.connectionState = 'disconnected';
  }

  /**
   * Destruir conexão
   */
  destroy() {
    console.log('🗑️ Destruindo serviço WhatsApp...');
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.clearData();
    
    // Limpar callbacks
    Object.keys(this.eventCallbacks).forEach(event => {
      this.eventCallbacks[event] = [];
    });
  }

  // ====================================
  // MÉTODOS PARA INFORMAÇÕES
  // ====================================

  /**
   * Verificar se está conectado
   * @returns {boolean}
   */
  isWhatsAppConnected() {
    return this.isConnected && this.connectionState === 'connected';
  }

  /**
   * Obter informações do usuário
   * @returns {Object|null}
   */
  getUserInfo() {
    return this.userInfo;
  }

  /**
   * Obter QR Code atual
   * @returns {string|null}
   */
  getQRCode() {
    return this.qrCode;
  }

  /**
   * Obter último erro
   * @returns {string|null}
   */
  getLastError() {
    return this.lastError;
  }

  /**
   * Limpar último erro
   */
  clearError() {
    this.lastError = null;
  }
}

// ====================================
// EXPORTAR INSTÂNCIA SINGLETON
// ====================================
const whatsappService = new WhatsAppService();

export default whatsappService;