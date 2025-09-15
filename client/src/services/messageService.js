// client/src/services/messageService.js
// =====================================
// PRIMEM WHATSAPP - SERVIÇO DE MENSAGENS
// Gerencia chats, mensagens e conversas
// =====================================

import apiService from './apiService';

class MessageService {
  constructor() {
    this.chats = [];
    this.messages = new Map(); // chatId -> array de mensagens
    this.currentChat = null;
    this.unreadCounts = new Map(); // chatId -> count
    this.searchCache = new Map();
    
    // Configurações
    this.maxMessagesPerChat = 1000;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  // ====================================
  // GESTÃO DE CHATS
  // ====================================

  /**
   * Carregar lista de chats
   * @param {boolean} forceRefresh - Forçar atualização
   * @returns {Promise<Array>}
   */
  async loadChats(forceRefresh = false) {
    try {
      console.log('💬 Carregando chats...');
      
      // Usar cache se disponível e não forçar refresh
      if (!forceRefresh && this.chats.length > 0) {
        console.log('📝 Usando chats do cache');
        return { success: true, chats: this.chats };
      }

      const response = await apiService.get('/api/whatsapp/chats');
      
      if (response.success && response.chats) {
        this.chats = response.chats.map(chat => this.normalizeChat(chat));
        console.log('✅ Chats carregados:', this.chats.length);
        
        // Atualizar contadores de não lidas
        this.updateUnreadCounts();
        
        return { success: true, chats: this.chats };
      }
      
      throw new Error(response.message || 'Erro ao carregar chats');
      
    } catch (error) {
      console.error('❌ Erro ao carregar chats:', error);
      return {
        success: false,
        error: error.message,
        chats: this.chats // Retornar cache em caso de erro
      };
    }
  }

  /**
   * Obter chat específico por ID
   * @param {string} chatId 
   * @returns {Object|null}
   */
  getChat(chatId) {
    return this.chats.find(chat => chat.id === chatId) || null;
  }

  /**
   * Atualizar informações de um chat
   * @param {string} chatId 
   * @param {Object} updates 
   */
  updateChat(chatId, updates) {
    const chatIndex = this.chats.findIndex(chat => chat.id === chatId);
    
    if (chatIndex !== -1) {
      this.chats[chatIndex] = { ...this.chats[chatIndex], ...updates };
      console.log('📝 Chat atualizado:', chatId);
    }
  }

  /**
   * Buscar chats
   * @param {string} query 
   * @returns {Array}
   */
  searchChats(query) {
    if (!query.trim()) return this.chats;
    
    const searchTerm = query.toLowerCase().trim();
    
    return this.chats.filter(chat => 
      chat.name.toLowerCase().includes(searchTerm) ||
      chat.pushname?.toLowerCase().includes(searchTerm) ||
      chat.formattedNumber?.includes(searchTerm)
    );
  }

  // ====================================
  // GESTÃO DE MENSAGENS
  // ====================================

  /**
   * Carregar mensagens de um chat
   * @param {string} chatId 
   * @param {number} limit 
   * @param {string} before - ID da mensagem anterior (paginação)
   * @returns {Promise<Array>}
   */
  async loadMessages(chatId, limit = 50, before = null) {
    try {
      console.log(`💬 Carregando mensagens do chat: ${chatId}`);

      // Verificar cache primeiro
      const cachedMessages = this.messages.get(chatId);
      if (cachedMessages && !before) {
        console.log('📝 Usando mensagens do cache');
        return { success: true, messages: cachedMessages };
      }

      // Montar parâmetros
      const params = { limit };
      if (before) params.before = before;

      const response = await apiService.get(`/api/whatsapp/messages/${chatId}`, params);
      
      if (response.success && response.messages) {
        const messages = response.messages.map(msg => this.normalizeMessage(msg));
        
        // Atualizar cache
        if (before) {
          // Adicionar mensagens mais antigas ao início
          const existing = this.messages.get(chatId) || [];
          this.messages.set(chatId, [...messages, ...existing]);
        } else {
          // Substituir mensagens
          this.messages.set(chatId, messages);
        }

        // Limitar tamanho do cache
        this.limitCacheSize(chatId);

        console.log('✅ Mensagens carregadas:', messages.length);
        return { success: true, messages: this.messages.get(chatId) };
      }
      
      throw new Error(response.message || 'Erro ao carregar mensagens');
      
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      return {
        success: false,
        error: error.message,
        messages: this.messages.get(chatId) || []
      };
    }
  }

  /**
   * Enviar mensagem de texto
   * @param {string} chatId 
   * @param {string} message 
   * @param {string} replyToId - ID da mensagem sendo respondida
   * @returns {Promise<Object>}
   */
  async sendMessage(chatId, message, replyToId = null) {
    try {
      console.log(`📤 Enviando mensagem para: ${chatId}`);

      if (!message.trim()) {
        throw new Error('Mensagem não pode estar vazia');
      }

      const messageData = {
        number: chatId,
        message: message.trim(),
        replyTo: replyToId
      };

      const response = await apiService.post('/api/whatsapp/send', messageData);
      
      if (response.success) {
        console.log('✅ Mensagem enviada');
        
        // Adicionar mensagem otimisticamente ao cache
        this.addOptimisticMessage(chatId, {
          id: `temp_${Date.now()}`,
          body: message,
          fromMe: true,
          timestamp: Date.now(),
          type: 'text',
          status: 'sending'
        });

        return { success: true, messageId: response.messageId };
      }
      
      throw new Error(response.message || 'Erro ao enviar mensagem');
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Adicionar nova mensagem recebida
   * @param {Object} messageData 
   */
  addReceivedMessage(messageData) {
    const message = this.normalizeMessage(messageData);
    const chatId = message.chatId;
    
    // Adicionar ao cache de mensagens
    const messages = this.messages.get(chatId) || [];
    messages.push(message);
    this.messages.set(chatId, messages);
    
    // Limitar tamanho do cache
    this.limitCacheSize(chatId);
    
    // Atualizar contador de não lidas se não é o chat atual
    if (this.currentChat !== chatId && !message.fromMe) {
      const currentCount = this.unreadCounts.get(chatId) || 0;
      this.unreadCounts.set(chatId, currentCount + 1);
    }
    
    // Atualizar informações do chat
    this.updateChatWithMessage(chatId, message);
    
    console.log('📩 Nova mensagem adicionada:', message.id);
  }

  /**
   * Adicionar mensagem enviada confirmada
   * @param {Object} messageData 
   */
  addSentMessage(messageData) {
    const message = this.normalizeMessage(messageData);
    const chatId = message.chatId;
    
    // Remover mensagem temporária se existe
    const messages = this.messages.get(chatId) || [];
    const tempIndex = messages.findIndex(msg => 
      msg.status === 'sending' && 
      Math.abs(msg.timestamp - message.timestamp) < 5000
    );
    
    if (tempIndex !== -1) {
      messages[tempIndex] = message;
    } else {
      messages.push(message);
    }
    
    this.messages.set(chatId, messages);
    this.limitCacheSize(chatId);
    
    // Atualizar chat
    this.updateChatWithMessage(chatId, message);
    
    console.log('📤 Mensagem enviada confirmada:', message.id);
  }

  // ====================================
  // GESTÃO DE ESTADO
  // ====================================

  /**
   * Definir chat atual
   * @param {string} chatId 
   */
  setCurrentChat(chatId) {
    this.currentChat = chatId;
    
    // Marcar mensagens como lidas
    if (chatId) {
      this.markChatAsRead(chatId);
    }
  }

  /**
   * Marcar chat como lido
   * @param {string} chatId 
   */
  markChatAsRead(chatId) {
    this.unreadCounts.set(chatId, 0);
    
    // Atualizar chat
    this.updateChat(chatId, { unreadCount: 0 });
  }

  /**
   * Obter contador de não lidas
   * @param {string} chatId 
   * @returns {number}
   */
  getUnreadCount(chatId) {
    return this.unreadCounts.get(chatId) || 0;
  }

  /**
   * Obter total de não lidas
   * @returns {number}
   */
  getTotalUnreadCount() {
    let total = 0;
    for (const count of this.unreadCounts.values()) {
      total += count;
    }
    return total;
  }

  // ====================================
  // UTILIDADES PRIVADAS
  // ====================================

  /**
   * Normalizar dados do chat
   * @param {Object} chat 
   * @returns {Object}
   */
  normalizeChat(chat) {
    return {
      id: chat.id._serialized || chat.id,
      name: chat.name || chat.pushname || 'Sem nome',
      pushname: chat.pushname,
      isGroup: chat.isGroup || false,
      profilePic: chat.profilePic || null,
      lastMessage: chat.lastMessage || null,
      timestamp: chat.timestamp || Date.now(),
      unreadCount: this.unreadCounts.get(chat.id) || 0,
      isOnline: chat.isOnline || false,
      formattedNumber: this.formatPhoneNumber(chat.id),
      ...chat
    };
  }

  /**
   * Normalizar dados da mensagem
   * @param {Object} message 
   * @returns {Object}
   */
  normalizeMessage(message) {
    return {
      id: message.id || `msg_${Date.now()}`,
      chatId: message.from || message.to || message.chatId,
      body: message.body || '',
      fromMe: message.fromMe || false,
      timestamp: message.timestamp || Date.now(),
      type: this.getMessageType(message),
      status: message.status || 'sent',
      author: message.author || null,
      quotedMsg: message.quotedMsg || null,
      media: message.media || null,
      location: message.location || null,
      contact: message.contact || null,
      ...message
    };
  }

  /**
   * Determinar tipo da mensagem
   * @param {Object} message 
   * @returns {string}
   */
  getMessageType(message) {
    if (message.type) return message.type;
    
    if (message.hasMedia || message.media) {
      const mimetype = message.media?.mimetype || '';
      
      if (mimetype.startsWith('image/')) return 'image';
      if (mimetype.startsWith('video/')) return 'video';
      if (mimetype.startsWith('audio/')) return 'audio';
      return 'document';
    }
    
    if (message.location) return 'location';
    if (message.contact) return 'contact';
    
    return 'text';
  }

  /**
   * Formatar número de telefone
   * @param {string} number 
   * @returns {string}
   */
  formatPhoneNumber(number) {
    if (!number) return '';
    
    // Remover sufixos do WhatsApp
    const cleaned = number.replace('@c.us', '').replace('@g.us', '');
    
    // Formatar para exibição (exemplo brasileiro)
    if (cleaned.startsWith('55')) {
      const withoutCountry = cleaned.substring(2);
      if (withoutCountry.length === 11) {
        return `+55 (${withoutCountry.substring(0, 2)}) ${withoutCountry.substring(2, 7)}-${withoutCountry.substring(7)}`;
      }
    }
    
    return `+${cleaned}`;
  }

  /**
   * Adicionar mensagem otimística (antes da confirmação)
   * @param {string} chatId 
   * @param {Object} message 
   */
  addOptimisticMessage(chatId, message) {
    const messages = this.messages.get(chatId) || [];
    messages.push(this.normalizeMessage(message));
    this.messages.set(chatId, messages);
  }

  /**
   * Atualizar chat com informações da última mensagem
   * @param {string} chatId 
   * @param {Object} message 
   */
  updateChatWithMessage(chatId, message) {
    this.updateChat(chatId, {
      lastMessage: {
        body: message.body,
        timestamp: message.timestamp,
        fromMe: message.fromMe
      },
      timestamp: message.timestamp
    });
  }

  /**
   * Limitar tamanho do cache de mensagens
   * @param {string} chatId 
   */
  limitCacheSize(chatId) {
    const messages = this.messages.get(chatId);
    if (messages && messages.length > this.maxMessagesPerChat) {
      // Manter apenas as mensagens mais recentes
      const trimmed = messages.slice(-this.maxMessagesPerChat);
      this.messages.set(chatId, trimmed);
    }
  }

  /**
   * Atualizar contadores de não lidas
   */
  updateUnreadCounts() {
    this.chats.forEach(chat => {
      if (chat.unreadCount > 0) {
        this.unreadCounts.set(chat.id, chat.unreadCount);
      }
    });
  }

  // ====================================
  // MÉTODOS DE LIMPEZA
  // ====================================

  /**
   * Limpar cache de mensagens antigas
   */
  clearOldCache() {
    const now = Date.now();
    
    // Limpar apenas chats que não foram acessados recentemente
    for (const [chatId, messages] of this.messages.entries()) {
      if (messages.length > 0) {
        const lastAccess = messages[messages.length - 1].timestamp;
        if (now - lastAccess > this.cacheTimeout) {
          this.messages.delete(chatId);
          console.log('🗑️ Cache limpo para chat:', chatId);
        }
      }
    }
  }

  /**
   * Limpar todos os dados
   */
  clearAllData() {
    this.chats = [];
    this.messages.clear();
    this.unreadCounts.clear();
    this.currentChat = null;
    this.searchCache.clear();
    
    console.log('🗑️ Todos os dados de mensagens limpos');
  }
}

// ====================================
// EXPORTAR INSTÂNCIA SINGLETON
// ====================================
const messageService = new MessageService();

export default messageService;