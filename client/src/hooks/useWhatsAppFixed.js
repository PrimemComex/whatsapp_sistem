// client/src/hooks/useWhatsAppFixed.js
// =====================================
// PRIMEM WHATSAPP - HOOK CORRIGIDO PARA ARQUIVOS
// Corrige a recepção de eventos Socket.IO para mensagens com mídia
// =====================================

import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

const useWhatsAppFixed = () => {
  // ====================================
  // ESTADOS PRINCIPAIS DO WHATSAPP
  // ====================================
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [whatsappInfo, setWhatsappInfo] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState('');

  // ====================================
  // REFS PARA CONTROLE
  // ====================================
  const socketRef = useRef(null);

  // ====================================
  // CONFIGURAÇÕES
  // ====================================
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

  // ====================================
  // CONFIGURAR SOCKET.IO
  // ====================================
  useEffect(() => {
    console.log('🔌 [HOOK] Configurando Socket.IO para WhatsApp...');
    
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    socketRef.current = socket;

    // ====================================
    // LISTENERS DO SOCKET - CORRIGIDOS
    // ====================================

    // Conexão estabelecida
    socket.on('connect', () => {
      console.log('✅ [HOOK] Socket WhatsApp conectado:', socket.id);
      setError('');
    });

    // Desconexão
    socket.on('disconnect', (reason) => {
      console.log('🔌 [HOOK] Socket WhatsApp desconectado:', reason);
      setError('Conexão perdida com o servidor');
    });

    // ====================================
    // EVENTOS WHATSAPP - CORRIGIDOS
    // ====================================

    // QR Code
    socket.on('whatsapp:qr', (data) => {
      console.log('📱 [HOOK] QR Code recebido');
      setQrCode(data.qrCode);
      setIsConnecting(true);
      setIsConnected(false);
    });

    // WhatsApp pronto
    socket.on('whatsapp:ready', (data) => {
      console.log('✅ [HOOK] WhatsApp pronto:', data.info);
      setIsConnected(true);
      setIsConnecting(false);
      setWhatsappInfo(data.info);
      setQrCode('');
      loadChatsFromServer();
    });

    // WhatsApp desconectado
    socket.on('whatsapp:disconnected', () => {
      console.log('❌ [HOOK] WhatsApp desconectado');
      setIsConnected(false);
      setIsConnecting(false);
      setWhatsappInfo(null);
      setQrCode('');
    });

    // ====================================
    // EVENTOS DE MENSAGENS - CORRIGIDOS PARA ARQUIVOS
    // ====================================

    // 🔧 CORREÇÃO 1: Escutar todos os eventos de mensagem
    const handleMessageReceived = (messageData) => {
      console.log('📩 [HOOK] MENSAGEM RECEBIDA:', messageData);
      console.log('📎 [HOOK] Tem mídia?', messageData.hasMedia);
      console.log('📦 [HOOK] Dados completos:', {
        id: messageData.id,
        hasMedia: messageData.hasMedia,
        mediaType: messageData.mediaType,
        filename: messageData.filename,
        to: messageData.to,
        from: messageData.from
      });

      // 🔧 CORREÇÃO 2: Construir objeto media se hasMedia for true
      let processedMessage = {
        ...messageData,
        timestamp: new Date(messageData.timestamp || Date.now()),
        type: 'received'
      };

      // Se tem mídia, construir o objeto media corretamente
      if (messageData.hasMedia && messageData.filename) {
        console.log('🔧 [HOOK] Construindo objeto media...');
        
        // Determinar a URL do arquivo
        let mediaUrl = '';
        if (messageData.mediaUrl) {
          mediaUrl = messageData.mediaUrl;
        } else if (messageData.filename) {
          mediaUrl = `/uploads/${messageData.filename}`;
        }

        // Construir objeto media completo
        processedMessage.media = {
          filename: messageData.filename,
          mimetype: messageData.mediaType || 'application/octet-stream',
          url: mediaUrl,
          type: messageData.mediaType?.split('/')[0] || 'file',
          size: messageData.fileSize || 0
        };

        console.log('📦 [HOOK] Objeto media construído:', processedMessage.media);
      }

      // Determinar o chat ID
      const chatId = messageData.from || messageData.chatId;
      if (!chatId) {
        console.error('❌ [HOOK] Chat ID não encontrado na mensagem');
        return;
      }

      console.log('💬 [HOOK] Adicionando mensagem ao chat:', chatId);

      // Adicionar mensagem ao estado
      setMessages(prev => {
        const currentMessages = prev[chatId] || [];
        const messageExists = currentMessages.some(msg => msg.id === processedMessage.id);
        
        if (messageExists) {
          console.log('⚠️ [HOOK] Mensagem já existe, ignorando duplicata');
          return prev;
        }

        return {
          ...prev,
          [chatId]: [...currentMessages, processedMessage]
        };
      });

      // Atualizar conversa
      updateConversationLastMessage(chatId, processedMessage);
    };

    // 🔧 CORREÇÃO 3: Escutar eventos de mensagem enviada
    const handleMessageSent = (messageData) => {
      console.log('📤 [HOOK] MENSAGEM ENVIADA:', messageData);
      console.log('📎 [HOOK] Tem mídia (enviada)?', messageData.hasMedia);

      let processedMessage = {
        ...messageData,
        timestamp: new Date(messageData.timestamp || Date.now()),
        type: 'sent',
        fromMe: true
      };

      // Se tem mídia, construir o objeto media
      if (messageData.hasMedia && messageData.filename) {
        console.log('🔧 [HOOK] Construindo objeto media para mensagem enviada...');
        
        let mediaUrl = '';
        if (messageData.mediaUrl) {
          mediaUrl = messageData.mediaUrl;
        } else if (messageData.filename) {
          mediaUrl = `/uploads/${messageData.filename}`;
        }

        processedMessage.media = {
          filename: messageData.filename,
          mimetype: messageData.mediaType || 'application/octet-stream',
          url: mediaUrl,
          type: messageData.mediaType?.split('/')[0] || 'file',
          size: messageData.fileSize || 0
        };

        console.log('📦 [HOOK] Objeto media para enviada:', processedMessage.media);
      }

      // Determinar o chat ID para mensagem enviada
      let chatId = messageData.to ? `${messageData.to}@c.us` : messageData.chatId;
      
      // CORREÇÃO ESPECIAL: Se chatId for "me" ou inválido, usar dados da mensagem
      if (chatId === 'me' || !chatId || chatId === '@c.us') {
        if (messageData.to) {
          chatId = `${messageData.to}@c.us`;
        } else if (messageData.number) {
          chatId = `${messageData.number}@c.us`;
        } else {
          console.error('❌ [HOOK] Não foi possível determinar chat ID da mensagem enviada');
          console.log('📋 [HOOK] Dados da mensagem enviada para debug:', messageData);
          return;
        }
      }
      
      // Garantir formato correto
      if (chatId && !chatId.includes('@')) {
        chatId = `${chatId}@c.us`;
      }
      
      if (!chatId) {
        console.error('❌ [HOOK] Chat ID não encontrado na mensagem enviada');
        return;
      }

      console.log('💬 [HOOK] Adicionando mensagem enviada ao chat:', chatId);
      console.log('🔍 [HOOK] Chat selecionado atual:', selectedChat?.id);
      console.log('🔍 [HOOK] IDs coincidem?', chatId === selectedChat?.id);

      // Adicionar mensagem ao estado
      setMessages(prev => {
        const currentMessages = prev[chatId] || [];
        
        // Remover mensagem local temporária se existir
        const filteredMessages = currentMessages.filter(msg => 
          !msg.id.startsWith('local-') || msg.id === processedMessage.id
        );
        
        const messageExists = filteredMessages.some(msg => msg.id === processedMessage.id);
        
        if (messageExists) {
          console.log('⚠️ [HOOK] Mensagem enviada já existe, ignorando duplicata');
          return prev;
        }

        return {
          ...prev,
          [chatId]: [...filteredMessages, processedMessage]
        };
      });

      // Atualizar conversa
      updateConversationLastMessage(chatId, processedMessage);
    };

    // 🔧 CORREÇÃO 4: Registrar todos os listeners de mensagem
    socket.on('whatsapp:message_received', handleMessageReceived);
    socket.on('whatsapp:message_sent', handleMessageSent);
    socket.on('message_received', handleMessageReceived); // Backup listener
    socket.on('message_sent', handleMessageSent); // Backup listener

    // ====================================
    // EVENTOS DE CHATS
    // ====================================
    socket.on('whatsapp:chats_loaded', (data) => {
      console.log('📋 [HOOK] Chats carregados:', data.chats?.length || 0);
      if (data.chats) {
        setConversations(data.chats);
      }
    });

    // ====================================
    // CLEANUP
    // ====================================
    return () => {
      console.log('🧹 [HOOK] Limpando Socket.IO listeners');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('whatsapp:qr');
      socket.off('whatsapp:ready');
      socket.off('whatsapp:disconnected');
      socket.off('whatsapp:message_received');
      socket.off('whatsapp:message_sent');
      socket.off('message_received');
      socket.off('message_sent');
      socket.off('whatsapp:chats_loaded');
      socket.disconnect();
    };
  }, []);

  // ====================================
  // FUNÇÃO AUXILIAR: ATUALIZAR ÚLTIMA MENSAGEM DA CONVERSA
  // ====================================
  const updateConversationLastMessage = useCallback((chatId, message) => {
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id === chatId) {
          return {
            ...conv,
            lastMessage: message.body || (message.media ? `📎 ${message.media.filename}` : '[Arquivo]'),
            timestamp: message.timestamp,
            unread: message.fromMe ? conv.unread : (conv.unread || 0) + 1
          };
        }
        return conv;
      });

      // Se conversa não existe, criar nova
      const conversationExists = prev.some(conv => conv.id === chatId);
      if (!conversationExists) {
        console.log('➕ [HOOK] Criando nova conversa:', chatId);
        
        // Extrair nome do chat ID
        const phoneNumber = chatId.replace('@c.us', '').replace('@g.us', '');
        const chatName = message.pushname || message.notifyName || phoneNumber;
        
        updated.push({
          id: chatId,
          name: chatName,
          lastMessage: message.body || (message.media ? `📎 ${message.media.filename}` : '[Arquivo]'),
          timestamp: message.timestamp,
          unread: message.fromMe ? 0 : 1,
          avatar: null
        });
      }

      return updated;
    });
  }, []);

  // ====================================
  // FUNÇÕES DE AÇÃO
  // ====================================
  const connectWhatsApp = async () => {
    try {
      setIsConnecting(true);
      setError('');
      
      const response = await fetch(`${API_URL}/api/whatsapp/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      console.log('📱 [HOOK] Conectando WhatsApp:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Erro ao conectar');
      }
    } catch (error) {
      console.error('❌ [HOOK] Erro ao conectar:', error);
      setError('Erro ao conectar WhatsApp: ' + error.message);
      setIsConnecting(false);
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      const response = await fetch(`${API_URL}/api/whatsapp/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      console.log('🔌 [HOOK] WhatsApp desconectado:', data);
      
      setIsConnected(false);
      setWhatsappInfo(null);
      setQrCode('');
    } catch (error) {
      console.error('❌ [HOOK] Erro ao desconectar:', error);
    }
  };

  const sendMessage = async (chatId, message) => {
    try {
      console.log('📤 [HOOK] Enviando mensagem:', { chatId, message: message.substring(0, 50) + '...' });
      
      const response = await fetch(`${API_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: chatId.replace('@c.us', ''),
          message: message
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ [HOOK] Mensagem enviada com sucesso');
        return { success: true };
      } else {
        throw new Error(data.message || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('❌ [HOOK] Erro ao enviar mensagem:', error);
      return { success: false, error: error.message };
    }
  };

  const loadChatsFromServer = async () => {
    try {
      console.log('📋 [HOOK] Carregando chats do servidor...');
      
      const response = await fetch(`${API_URL}/api/whatsapp/chats`);
      const data = await response.json();
      
      if (data.success && data.chats) {
        console.log('✅ [HOOK] Chats carregados:', data.chats.length);
        setConversations(data.chats);
      }
    } catch (error) {
      console.error('❌ [HOOK] Erro ao carregar chats:', error);
    }
  };

  const loadChats = useCallback(() => {
    loadChatsFromServer();
  }, []);

  // ====================================
  // RETORNO DO HOOK
  // ====================================
  return {
    // Estados do WhatsApp
    isConnected,
    isConnecting,
    qrCode,
    whatsappInfo,
    conversations,
    messages,
    selectedChat,
    error,
    
    // Ações do WhatsApp
    connectWhatsApp,
    disconnectWhatsApp,
    sendMessage,
    loadChats,
    
    // Setters
    setSelectedChat,
    setConversations,
    setMessages
  };
};

export default useWhatsAppFixed;