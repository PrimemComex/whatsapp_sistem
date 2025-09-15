// =====================================
// 🔧 VERSÃO DE DEBUG - useWhatsApp.js  
// Para descobrir por que não está conectando
// =====================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const useWhatsApp = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  
  const socketRef = useRef(null);

  useEffect(() => {
    console.log('🔌 useWhatsApp: INICIANDO CONEXÃO COM SOCKET.IO...');
    
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    // ====================================
    // 🐛 DEBUG EVENTOS DE CONEXÃO
    // ====================================
    socket.on('connect', () => {
      console.log('✅ SOCKET.IO CONECTADO!', socket.id);
      console.log('🔗 Socket ID:', socket.id);
      console.log('🌐 Socket URL: http://localhost:3001');
    });

    socket.on('disconnect', () => {
      console.log('❌ SOCKET.IO DESCONECTADO!');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ ERRO DE CONEXÃO SOCKET.IO:', error);
    });

    // ====================================
    // 🐛 DEBUG EVENTOS WHATSAPP
    // ====================================
    socket.on('whatsapp:ready', (data) => {
      console.log('🎉 WHATSAPP READY RECEBIDO!', data);
      setIsConnected(true);
      setStatus('connected');
      setQrCode(null);
      setError(null);
      setClientInfo(data.info || data);
    });

    socket.on('whatsapp:chats', (chatsData) => {
      console.log('📋 CHATS RECEBIDOS:', chatsData?.length || 0, 'conversas');
      console.log('📋 PRIMEIRO CHAT:', chatsData?.[0]);
      setChats(chatsData || []);
    });

    socket.on('conversationUpdate', (data) => {
      console.log('🔄 CONVERSATION UPDATE:', data);
      if (data.chats) {
        console.log('📋 ATUALIZANDO CHATS:', data.chats?.length);
        setChats(data.chats);
      }
    });

    socket.on('whatsapp:message_received', (messageData) => {
      console.log('📨 MENSAGEM RECEBIDA NO FRONTEND:', messageData);
      setMessages(prev => [...prev, messageData]);
    });

    socket.on('whatsapp:qr', (data) => {
      console.log('📱 QR CODE RECEBIDO');
      setQrCode(data.qrCode);
      setStatus('connecting');
    });

    socket.on('whatsapp:error', (errorData) => {
      console.error('❌ ERRO WHATSAPP:', errorData);
      setError(errorData.message || 'Erro desconhecido');
      setStatus('error');
    });

    // ====================================
    // 🐛 TESTAR CONEXÃO IMEDIATAMENTE
    // ====================================
    setTimeout(() => {
      console.log('🔍 TESTANDO CONEXÃO...');
      console.log('Socket conectado?', socket.connected);
      console.log('Socket ID:', socket.id);
      
      if (socket.connected) {
        console.log('📡 SOLICITANDO STATUS DO WHATSAPP...');
        socket.emit('getStatus');
        socket.emit('getChats');
      }
    }, 2000);

    return () => {
      console.log('🔌 DESCONECTANDO SOCKET...');
      socket.disconnect();
    };
  }, []);

  const connect = useCallback(() => {
    console.log('🚀 CONECTANDO WHATSAPP VIA SOCKET...');
    if (socketRef.current?.connected) {
      socketRef.current.emit('startWhatsApp');
    } else {
      console.error('❌ Socket não conectado!');
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log('🔌 DESCONECTANDO WHATSAPP VIA SOCKET...');
    if (socketRef.current?.connected) {
      socketRef.current.emit('stopWhatsApp');
    }
  }, []);

  const sendMessage = useCallback(async (chatId, message) => {
    console.log('📤 ENVIANDO MENSAGEM:', { chatId, message });
    
    if (!socketRef.current?.connected) {
      throw new Error('Socket não conectado');
    }

    socketRef.current.emit('sendMessage', {
      to: chatId,
      message: message
    });
  }, []);

  const selectChat = useCallback((chat) => {
    console.log('💬 CHAT SELECIONADO:', chat);
    setSelectedChat(chat);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ====================================
  // 🐛 DEBUG NO CONSOLE
  // ====================================
  useEffect(() => {
    console.log('📊 ESTADO ATUAL useWhatsApp:', {
      isConnected,
      status,
      chatsCount: chats?.length || 0,
      messagesCount: messages?.length || 0,
      hasQrCode: !!qrCode,
      hasError: !!error,
      socketConnected: socketRef.current?.connected
    });
  }, [isConnected, status, chats, messages, qrCode, error]);

  return {
    isConnected,
    status,
    qrCode,
    chats,
    messages,
    selectedChat,
    error,
    loading,
    clientInfo,
    connect,
    disconnect,
    sendMessage,
    selectChat,
    clearError
  };
};

export default useWhatsApp;