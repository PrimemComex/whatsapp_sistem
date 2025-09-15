// server/services/whatsapp.service.js
// =====================================
// PRIMEM WHATSAPP SERVICE - VERSÃO CORRIGIDA v8.4
// Corrige erro "Cannot read properties of undefined (reading 'getChats')"
// =====================================

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const qrTerminal = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

class WhatsAppService {
  constructor(io) {
    this.client = null;
    this.io = io;
    this.qrCode = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.isInitialized = false;
    this.chats = new Map(); // Cache local dos chats
    this.messages = new Map(); // Cache local das mensagens
    this.userInfo = null;
    
    // Configurações de retry
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 segundos
    
    console.log('🗳️ WhatsAppService inicializado');
  }

  // ====================================
  // INICIALIZAR CLIENTE
  // ====================================
  async initialize() {
    if (this.isInitialized || this.isConnecting) {
      console.log('⚠️ Cliente já inicializado ou conectando...');
      
      // Se já está conectado, retornar sucesso
      if (this.isConnected) {
        return { success: true, message: 'Cliente já conectado' };
      }
      
      return { success: false, message: 'Cliente já inicializado' };
    }

    this.isConnecting = true;
    
    try {
      console.log('🚀 Iniciando WhatsApp Web.js...');
      
      // Limpar sessões antigas se existirem
      const sessionPath = './sessions';
      if (fs.existsSync(sessionPath)) {
        console.log('🧹 Limpando sessões antigas...');
        fs.rmSync(sessionPath, { recursive: true, force: true });
        await this.delay(1000); // Aguardar limpeza
      }

      // Criar cliente
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'primem-whatsapp',
          dataPath: './sessions'
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ],
          timeout: 120000 // 2 minutos
        },
        webVersionCache: {
          type: 'remote',
          remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        }
      });

      // Configurar eventos
      this.setupEvents();
      
      // Inicializar
      console.log('⏳ Inicializando cliente WhatsApp...');
      await this.client.initialize();
      
      this.isInitialized = true;
      console.log('✅ WhatsApp Service inicializado com sucesso!');
      
      return { success: true, message: 'Cliente inicializado' };

    } catch (error) {
      console.error('❌ Erro ao inicializar WhatsApp:', error.message);
      this.isConnecting = false;
      this.isInitialized = false;
      
      if (this.io) {
        this.io.emit('whatsapp:error', {
          error: error.message,
          type: 'initialization_error'
        });
      }
      
      return { success: false, message: error.message };
    }
  }

  // ====================================
  // CONFIGURAR EVENTOS
  // ====================================
  setupEvents() {
    if (!this.client) return;

    // QR Code
    this.client.on('qr', async (qr) => {
      console.log('📱 QR Code recebido!');
      
      try {
        // Terminal QR
        qrTerminal.generate(qr, { small: true });
        
        // Base64 para frontend
        const qrCodeBase64 = await qrcode.toDataURL(qr, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          width: 256
        });

        this.qrCode = qrCodeBase64;
        
        if (this.io) {
          this.io.emit('whatsapp:qr', {
            qrCode: qrCodeBase64,
            qrString: qr,
            timestamp: Date.now()
          });
        }
        
        console.log('✅ QR Code enviado para frontend');
        
      } catch (error) {
        console.error('❌ Erro ao processar QR Code:', error);
      }
    });

    // Cliente pronto
    this.client.on('ready', async () => {
      console.log('🎉 WhatsApp pronto!');
      
      this.isConnected = true;
      this.isConnecting = false;
      this.qrCode = null;

      try {
        // Obter informações do usuário
        this.userInfo = {
          pushname: this.client.info?.pushname || 'N/A',
          wid: this.client.info?.wid || null,
          connected: true,
          timestamp: Date.now()
        };

        if (this.io) {
          this.io.emit('whatsapp:ready', {
            info: this.userInfo,
            connected: true,
            message: 'WhatsApp conectado e pronto!'
          });
        }

        console.log('✅ Informações do usuário:', this.userInfo);

        // Tentar carregar chats com delay e retry
        setTimeout(() => {
          this.loadChatsWithRetry();
        }, 3000); // Aguardar 3 segundos antes de carregar chats

      } catch (error) {
        console.error('❌ Erro ao processar evento ready:', error);
      }
    });

    // Autenticado
    this.client.on('authenticated', (session) => {
      console.log('🔐 WhatsApp autenticado!');
      
      if (this.io) {
        this.io.emit('whatsapp:authenticated', {
          message: 'Autenticação realizada com sucesso'
        });
      }
    });

    // Falha na autenticação
    this.client.on('auth_failure', (msg) => {
      console.error('❌ Falha na autenticação:', msg);
      
      this.isConnected = false;
      this.isConnecting = false;
      
      if (this.io) {
        this.io.emit('whatsapp:auth_failure', {
          error: msg,
          message: 'Falha na autenticação'
        });
      }
    });

    // Cliente desconectado
    this.client.on('disconnected', (reason) => {
      console.log('🔌 WhatsApp desconectado:', reason);
      
      this.isConnected = false;
      this.isConnecting = false;
      this.isInitialized = false; // CORREÇÃO: Resetar isInitialized
      this.qrCode = null;
      this.chats.clear();
      this.messages.clear();
      
      if (this.io) {
        this.io.emit('whatsapp:disconnected', {
          reason: reason,
          message: 'WhatsApp desconectado'
        });
      }
    });

    // Mensagem recebida
    this.client.on('message', async (message) => {
      try {
        console.log(`💬 [WhatsApp] 📩 Mensagem de ${message.from}: ${message.body}`);
        
        const messageData = await this.formatMessage(message);
        
        // Adicionar ao cache local
        if (!this.messages.has(message.from)) {
          this.messages.set(message.from, []);
        }
        this.messages.get(message.from).push(messageData);
        
        // Atualizar cache de chats
        await this.updateChatCache(message);
        
        // Emitir para frontend
        if (this.io) {
          this.io.emit('whatsapp:message_received', messageData);
        }
        
        console.log('✅ Mensagem processada e enviada para frontend');

      } catch (error) {
        console.error('❌ Erro ao processar mensagem recebida:', error);
      }
    });

    // Mensagem enviada
    this.client.on('message_create', async (message) => {
      if (message.fromMe) {
        try {
          console.log(`📤 [WhatsApp] Mensagem enviada para ${message.to}: ${message.body}`);
          
          const messageData = await this.formatMessage(message);
          
          // Adicionar ao cache local
          if (!this.messages.has(message.to)) {
            this.messages.set(message.to, []);
          }
          this.messages.get(message.to).push(messageData);
          
          // Emitir para frontend
          if (this.io) {
            this.io.emit('whatsapp:message_sent', messageData);
          }

        } catch (error) {
          console.error('❌ Erro ao processar mensagem enviada:', error);
        }
      }
    });

    // Erros
    this.client.on('error', (error) => {
      console.error('❌ Erro do cliente WhatsApp:', error);
      
      if (this.io) {
        this.io.emit('whatsapp:error', {
          error: error.message,
          type: 'client_error'
        });
      }
    });

    console.log('✅ Eventos configurados');
  }

  // ====================================
  // CARREGAR CHATS COM RETRY
  // ====================================
  async loadChatsWithRetry(attempt = 1) {
    console.log(`🔄 Tentativa ${attempt}/${this.maxRetries} - Carregando chats...`);
    
    try {
      // Aguardar um pouco mais se não for a primeira tentativa
      if (attempt > 1) {
        await this.delay(this.retryDelay);
      }
      
      // Verificar se cliente está pronto
      if (!this.client || !this.isConnected) {
        throw new Error('Cliente não está conectado');
      }
      
      // CORREÇÃO: Verificação melhorada
      const isReady = await this.client.pupPage?.evaluate(() => {
        return typeof window !== 'undefined' && 
               window.WWebJS && 
               typeof window.WWebJS.getChats === 'function';
      }).catch(() => false);
      
      if (!isReady) {
        throw new Error('WhatsApp Web não está totalmente carregado');
      }
      
      // Tentar obter chats
      console.log('📋 Obtendo chats do WhatsApp...');
      const chats = await this.client.getChats();
      
      console.log(`✅ ${chats.length} chats carregados com sucesso!`);
      
      // Processar chats
      this.chats.clear();
      for (const chat of chats.slice(0, 20)) { // Limitar a 20 chats mais recentes
        const chatData = {
          id: chat.id._serialized,
          name: chat.name || chat.id.user,
          isGroup: chat.isGroup,
          unreadCount: chat.unreadCount || 0,
          lastMessage: chat.lastMessage ? {
            id: chat.lastMessage.id._serialized,
            body: chat.lastMessage.body || '',
            timestamp: chat.lastMessage.timestamp * 1000,
            fromMe: chat.lastMessage.fromMe
          } : null,
          timestamp: chat.timestamp * 1000
        };
        
        this.chats.set(chat.id._serialized, chatData);
      }
      
      // Emitir para frontend
      if (this.io) {
        this.io.emit('whatsapp:chats_loaded', {
          chats: Array.from(this.chats.values()),
          count: this.chats.size
        });
      }
      
      console.log('✅ Chats processados e enviados para frontend');
      return Array.from(this.chats.values());

    } catch (error) {
      console.error(`❌ Erro ao carregar chats (tentativa ${attempt}):`, error.message);
      
      if (attempt < this.maxRetries) {
        console.log(`⏳ Tentando novamente em ${this.retryDelay / 1000} segundos...`);
        return this.loadChatsWithRetry(attempt + 1);
      } else {
        console.error('❌ Falhou em todas as tentativas de carregar chats');
        
        // Retornar chats do cache se houver
        if (this.chats.size > 0) {
          console.log('📋 Usando chats do cache local');
          return Array.from(this.chats.values());
        }
        
        return [];
      }
    }
  }

  // ====================================
  // ATUALIZAR CACHE DE CHAT
  // ====================================
  async updateChatCache(message) {
    try {
      const chatId = message.from;
      
      if (!this.chats.has(chatId)) {
        // Criar novo chat no cache
        const contact = await message.getContact();
        const chat = await message.getChat();
        
        const chatData = {
          id: chatId,
          name: contact.pushname || contact.name || chatId.split('@')[0],
          isGroup: chat.isGroup || false,
          unreadCount: 1,
          lastMessage: {
            id: message.id._serialized,
            body: message.body || '',
            timestamp: message.timestamp * 1000,
            fromMe: message.fromMe
          },
          timestamp: message.timestamp * 1000
        };
        
        this.chats.set(chatId, chatData);
      } else {
        // Atualizar chat existente
        const chatData = this.chats.get(chatId);
        chatData.lastMessage = {
          id: message.id._serialized,
          body: message.body || '',
          timestamp: message.timestamp * 1000,
          fromMe: message.fromMe
        };
        chatData.timestamp = message.timestamp * 1000;
        if (!message.fromMe) {
          chatData.unreadCount = (chatData.unreadCount || 0) + 1;
        }
      }
      
      // Emitir atualização para frontend
      if (this.io) {
        this.io.emit('whatsapp:chats_updated', {
          chats: Array.from(this.chats.values())
        });
      }

    } catch (error) {
      console.error('❌ Erro ao atualizar cache de chat:', error);
    }
  }

  // ====================================
  // FORMATAR MENSAGEM
  // ====================================
  async formatMessage(message) {
    try {
      let mediaData = null;
      
      // Processar mídia se houver
      if (message.hasMedia) {
        try {
          const media = await message.downloadMedia();
          
          if (media) {
            // CORREÇÃO: Garantir que o diretório existe
            const uploadDir = './uploads';
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const fileExt = this.getFileExtension(media.mimetype);
            const fullFileName = `${fileName}.${fileExt}`;
            const filePath = path.join(uploadDir, fullFileName);
            
            // Salvar arquivo
            fs.writeFileSync(filePath, media.data, 'base64');
            
            mediaData = {
              filename: fullFileName,
              originalName: `media.${fileExt}`,
              mimetype: media.mimetype,
              size: Buffer.byteLength(media.data, 'base64'),
              url: `/uploads/${fullFileName}`,
              type: this.getMediaType(media.mimetype)
            };
            
            console.log('💾 Mídia salva:', fullFileName);
          }
        } catch (mediaError) {
          console.error('❌ Erro ao processar mídia:', mediaError);
        }
      }

      const messageData = {
        id: message.id._serialized,
        body: message.body || '',
        from: message.from,
        to: message.to,
        fromMe: message.fromMe,
        timestamp: message.timestamp * 1000,
        type: message.type,
        hasMedia: message.hasMedia,
        media: mediaData,
        ack: message.ack
      };

      return messageData;

    } catch (error) {
      console.error('❌ Erro ao formatar mensagem:', error);
      throw error;
    }
  }

  // ====================================
  // OBTER CHATS (API PÚBLICA)
  // ====================================
  async getChats() {
    try {
      if (!this.isConnected) {
        console.log('⚠️ WhatsApp não conectado, tentando conectar...');
        
        // Tentar inicializar se não estiver conectado
        const initResult = await this.initialize();
        if (!initResult.success) {
          return { success: false, message: 'WhatsApp não conectado' };
        }
        
        // Aguardar um pouco para o cliente ficar pronto
        await this.delay(3000);
      }

      // Se há chats no cache, retornar
      if (this.chats.size > 0) {
        return {
          success: true,
          chats: Array.from(this.chats.values())
        };
      }

      // Tentar carregar chats
      const chats = await this.loadChatsWithRetry();
      
      return {
        success: true,
        chats: chats
      };

    } catch (error) {
      console.error('❌ Erro ao obter chats:', error);
      
      // Retornar chats do cache se houver
      if (this.chats.size > 0) {
        return {
          success: true,
          chats: Array.from(this.chats.values())
        };
      }
      
      return { success: false, message: error.message };
    }
  }

  // ====================================
  // OBTER MENSAGENS - NOVO MÉTODO
  // ====================================
  async getMessages(chatId) {
    try {
      if (!this.isConnected) {
        return { success: false, message: 'WhatsApp não conectado' };
      }

      // Verificar cache primeiro
      if (this.messages.has(chatId)) {
        return {
          success: true,
          messages: this.messages.get(chatId)
        };
      }

      // Buscar mensagens do WhatsApp
      const chat = await this.client.getChatById(chatId);
      if (!chat) {
        return { success: false, message: 'Chat não encontrado' };
      }
      
      const messages = await chat.fetchMessages({ limit: 50 });
      
      const formattedMessages = [];
      for (const msg of messages) {
        formattedMessages.push(await this.formatMessage(msg));
      }

      // Adicionar ao cache
      this.messages.set(chatId, formattedMessages);

      return {
        success: true,
        messages: formattedMessages
      };

    } catch (error) {
      console.error('❌ Erro ao obter mensagens:', error);
      return { success: false, message: error.message };
    }
  }

  // ====================================
  // ENVIAR MENSAGEM
  // ====================================
  async sendMessage(number, message, mediaPath = null) {
    try {
      // CORREÇÃO: Verificação completa de conexão
      if (!this.isConnected || !this.client) {
        console.error('❌ WhatsApp não está conectado');
        
        // Tentar reconectar
        console.log('🔄 Tentando reconectar...');
        const initResult = await this.initialize();
        
        if (!initResult.success) {
          throw new Error('WhatsApp não está conectado e falhou ao reconectar');
        }
        
        // Aguardar cliente ficar pronto
        await this.delay(2000);
        
        // Verificar novamente
        if (!this.isConnected) {
          throw new Error('WhatsApp ainda não está pronto');
        }
      }

      let chatId = number;
      if (!chatId.includes('@')) {
        chatId = chatId.includes('-') ? `${chatId}@g.us` : `${chatId}@c.us`;
      }

      console.log(`📤 Enviando mensagem para ${chatId}: ${message}`);

      if (mediaPath) {
        // Enviar mídia
        const media = MessageMedia.fromFilePath(mediaPath);
        const sentMessage = await this.client.sendMessage(chatId, media, { caption: message });
        
        console.log(`✅ Mídia enviada para ${chatId}`);
        return { success: true, message: sentMessage };
      } else {
        // Enviar texto
        const sentMessage = await this.client.sendMessage(chatId, message);
        
        console.log(`✅ Mensagem enviada para ${chatId}: ${message}`);
        return { success: true, message: sentMessage };
      }

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // DESCONECTAR
  // ====================================
  async disconnect() {
    try {
      if (this.client) {
        await this.client.destroy();
        this.client = null;
      }
      
      this.isConnected = false;
      this.isConnecting = false;
      this.isInitialized = false;
      this.qrCode = null;
      this.chats.clear();
      this.messages.clear();
      
      console.log('✅ WhatsApp desconectado');
      
      return { success: true, message: 'WhatsApp desconectado' };

    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // UTILITÁRIOS
  // ====================================
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getFileExtension(mimetype) {
    const extensions = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'audio/ogg': 'ogg',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
    };
    
    return extensions[mimetype] || 'bin';
  }

  getMediaType(mimetype) {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    return 'document';
  }

  // ====================================
  // STATUS
  // ====================================
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      isInitialized: this.isInitialized,
      hasQrCode: !!this.qrCode,
      chatsCount: this.chats.size,
      messagesCount: Array.from(this.messages.values()).reduce((total, msgs) => total + msgs.length, 0),
      userInfo: this.userInfo
    };
  }
}

// ====================================
// EXPORTAR
// ====================================
module.exports = WhatsAppService;