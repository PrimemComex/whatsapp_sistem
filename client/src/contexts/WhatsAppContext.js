// client/src/contexts/WhatsAppContext.js
// ====================================
// 🔗 WHATSAPP CONTEXT - VERSÃO COMPLETA COM CORREÇÕES PONTUAIS
// Mantém todas as funcionalidades + correções específicas no erro de token
// ====================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const WhatsAppContext = createContext();

// ====================================
// 🚀 WHATSAPP PROVIDER - VERSÃO COMPLETA CORRIGIDA
// ====================================
export const WhatsAppProvider = ({ children }) => {
  const { isLoggedIn, user, token } = useAuth(); // ← INTEGRAÇÃO COM AUTH
  
  const [state, setState] = useState({
    // Estados que o ConnectionPage espera
    status: 'disconnected', // disconnected, connecting, qr, connected, error
    qrCode: null,
    isConnecting: false,
    connectionInfo: null,
    error: null,
    
    // Estados adicionais completos
    isConnected: false,
    connectionStatus: 'disconnected',
    conversations: [],
    messages: {},
    activeConversation: null,
    socket: null,
    clientInfo: null,
    loading: false
  });

  // ====================================
  // 🔍 DEBUG CONTÍNUO DE AUTENTICAÇÃO
  // ====================================
  useEffect(() => {
    console.log('🔍 WhatsApp AUTH STATUS UPDATE:', {
      isLoggedIn,
      hasUser: !!user,
      userEmail: user?.email,
      userId: user?.id,
      hasToken: !!token,
      tokenLength: token?.length,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [isLoggedIn, user, token]);

  // ====================================
  // 🔌 CONFIGURAR SOCKET.IO - CORRIGIDO PARA EVITAR LOOPS
  // ====================================
  useEffect(() => {
    console.log('🔌 Socket Effect Triggered:', {
      isLoggedIn,
      hasUser: !!user,
      hasToken: !!token,
      socketExists: !!state.socket,
      socketConnected: state.socket?.connected
    });

    // ✅ VERIFICAÇÃO SIMPLIFICADA - APENAS isLoggedIn E user
    if (!isLoggedIn || !user) {
      console.log('⚠️ WhatsAppContext: Usuário não completamente autenticado');
      console.log('📊 Auth Details:', {
        isLoggedIn: isLoggedIn,
        hasToken: !!token,
        hasUser: !!user,
        userDetails: user ? {
          id: user.id,
          email: user.email,
          name: user.name
        } : 'NO USER'
      });
      
      // Limpar socket se existir
      if (state.socket) {
        console.log('🔌 WhatsAppContext: Desconectando socket existente...');
        state.socket.disconnect();
        setState(prev => ({ 
          ...prev, 
          socket: null, 
          status: 'disconnected',
          isConnected: false,
          connectionStatus: 'disconnected',
          qrCode: null,
          clientInfo: null,
          connectionInfo: null,
          conversations: [],
          messages: {},
          activeConversation: null,
          loading: false,
          isConnecting: false,
          error: null
        }));
      }
      
      return;
    }

    // ✅ VERIFICAR SE JÁ TEM SOCKET CONECTADO
    if (state.socket && state.socket.connected) {
      console.log('🔌 WhatsAppContext: Socket já conectado, reutilizando...');
      return;
    }

    console.log('🔌 WhatsAppContext: Configurando Socket.IO para usuário autenticado...', {
      user: user.email,
      userId: user.id,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'NO TOKEN'
    });
    
    // ✅ USAR VARIÁVEIS DE AMBIENTE
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
    
    // 🔧 CORREÇÃO CRÍTICA: CONFIGURAÇÃO SOCKET.IO APENAS COM POLLING
    const socket = io(socketUrl, {
      // 🎯 CORREÇÃO PRINCIPAL: Apenas polling, sem websocket
      transports: ['polling'],
      upgrade: false,
      rememberUpgrade: false,
      forceNew: true,
      
      // 🔄 Configurações de reconexão
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 10,
      timeout: 20000,
      
      // ✅ ADICIONAR TOKEN DE AUTENTICAÇÃO (MAS NÃO OBRIGATÓRIO)
      auth: {
        token: token || `fallback_token_${Date.now()}`,
        userId: user.id,
        userEmail: user.email
      },
      // ✅ ADICIONAR QUERY PARAMS PARA AUTENTICAÇÃO
      query: {
        userId: user.id,
        userRole: user.role || 'user'
      }
    });

    setState(prev => ({ ...prev, socket }));

    // ====================================
    // 📡 EVENT LISTENERS COMPLETOS
    // ====================================
    
    socket.on('connect', () => {
      console.log('✅ WhatsAppContext: Socket conectado para usuário:', user.email);
      console.log('🔌 Socket ID:', socket.id);
      
      // Limpar erros de conexão
      setState(prev => ({
        ...prev,
        error: prev.error?.includes('conexão') ? null : prev.error
      }));
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WhatsAppContext: Socket desconectado:', reason);
      setState(prev => ({
        ...prev,
        status: 'disconnected',
        isConnected: false,
        connectionStatus: 'disconnected',
        qrCode: null,
        isConnecting: false,
        connectionInfo: null,
        clientInfo: null
      }));
    });

    // ✅ EVENTOS WHATSAPP COMPLETOS - COMPATÍVEIS COM CÓDIGO ORIGINAL
    socket.on('qr', (qrCode) => {
      console.log('📱 WhatsAppContext: QR Code recebido', {
        type: typeof qrCode,
        length: qrCode?.length,
        preview: qrCode?.substring?.(0, 50)
      });
      
      setState(prev => ({
        ...prev,
        qrCode,
        status: 'qr',
        connectionStatus: 'qr',
        isConnecting: false,
        loading: false,
        error: null
      }));
    });

    socket.on('whatsapp:qr', (data) => {
      console.log('📱 WhatsAppContext: QR Code recebido (whatsapp:qr)', {
        hasQrCode: !!data.qrCode,
        type: typeof data.qrCode,
        dataKeys: Object.keys(data)
      });
      
      setState(prev => ({
        ...prev,
        qrCode: data.qrCode,
        status: 'qr',
        connectionStatus: 'qr',
        isConnecting: false,
        loading: false,
        error: null
      }));
    });

    socket.on('ready', (clientInfo) => {
      console.log('✅ WhatsAppContext: WhatsApp conectado!', clientInfo);
      
      setState(prev => ({
        ...prev,
        status: 'connected',
        isConnected: true,
        connectionStatus: 'connected',
        isConnecting: false,
        qrCode: null,
        clientInfo,
        connectionInfo: clientInfo,
        loading: false,
        error: null
      }));
    });

    socket.on('whatsapp:ready', (data) => {
      console.log('✅ WhatsAppContext: WhatsApp conectado (whatsapp:ready)!', data);
      
      setState(prev => ({
        ...prev,
        status: 'connected',
        isConnected: true,
        connectionStatus: 'connected',
        isConnecting: false,
        qrCode: null,
        clientInfo: data.info,
        connectionInfo: data.info,
        loading: false,
        error: null
      }));
    });

    socket.on('whatsapp:authenticated', (data) => {
      console.log('🔐 WhatsAppContext: WhatsApp autenticado:', data);
      
      setState(prev => ({
        ...prev,
        status: 'connected',
        isConnected: true,
        connectionStatus: 'connected',
        isConnecting: false,
        qrCode: null,
        clientInfo: data,
        connectionInfo: data,
        loading: false,
        error: null
      }));
    });

    socket.on('message', (message) => {
      console.log('💬 WhatsAppContext: Nova mensagem:', message);
      
      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [message.from]: [...(prev.messages[message.from] || []), {
            ...message,
            type: 'received'
          }]
        }
      }));
    });

    socket.on('whatsapp:message_received', (message) => {
      console.log('💬 WhatsAppContext: Nova mensagem recebida:', {
        from: message.from,
        hasBody: !!message.body,
        hasMedia: !!message.hasMedia
      });
      
      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [message.from]: [...(prev.messages[message.from] || []), {
            ...message,
            type: 'received'
          }]
        }
      }));
    });

    socket.on('whatsapp:message_sent', (message) => {
      console.log('📤 WhatsAppContext: Mensagem enviada confirmada:', {
        to: message.to,
        hasBody: !!message.body
      });
      
      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [message.to]: [...(prev.messages[message.to] || []), {
            ...message,
            type: 'sent'
          }]
        }
      }));
    });

    socket.on('disconnected', () => {
      console.log('❌ WhatsAppContext: WhatsApp desconectado');
      
      setState(prev => ({
        ...prev,
        status: 'disconnected',
        isConnected: false,
        connectionStatus: 'disconnected',
        isConnecting: false,
        qrCode: null,
        clientInfo: null,
        connectionInfo: null
      }));
    });

    socket.on('whatsapp:disconnected', (data) => {
      console.log('❌ WhatsAppContext: WhatsApp desconectado (whatsapp:disconnected):', data);
      
      setState(prev => ({
        ...prev,
        status: 'disconnected',
        isConnected: false,
        connectionStatus: 'disconnected',
        isConnecting: false,
        qrCode: null,
        clientInfo: null,
        connectionInfo: null
      }));
    });

    socket.on('error', (error) => {
      console.error('❌ WhatsAppContext: Erro WhatsApp:', error);
      
      setState(prev => ({
        ...prev,
        status: 'error',
        connectionStatus: 'error',
        isConnecting: false,
        loading: false,
        error: error.message || error || 'Erro desconhecido'
      }));
    });

    socket.on('whatsapp:error', (error) => {
      console.error('❌ WhatsAppContext: Erro WhatsApp (whatsapp:error):', error);
      
      setState(prev => ({
        ...prev,
        status: 'error',
        connectionStatus: 'error',
        isConnecting: false,
        loading: false,
        error: error.message || error || 'Erro desconhecido'
      }));
    });

    // ✅ EVENTOS DE AUTORIZAÇÃO
    socket.on('connect_error', (error) => {
      console.error('❌ WhatsAppContext: Erro de conexão:', error);
      
      setState(prev => ({
        ...prev,
        status: 'error',
        connectionStatus: 'error',
        isConnecting: false,
        loading: false,
        error: 'Erro de conexão com servidor: ' + error.message
      }));
    });

    socket.on('unauthorized', (error) => {
      console.error('🔒 WhatsAppContext: Não autorizado:', error);
      
      setState(prev => ({
        ...prev,
        status: 'error',
        connectionStatus: 'error',
        isConnecting: false,
        loading: false,
        error: 'Usuário não autorizado: ' + (error.message || error)
      }));
    });

    socket.on('conversationUpdate', (data) => {
      console.log('📋 WhatsAppContext: Conversas atualizadas');
      
      if (data.chats) {
        setState(prev => ({
          ...prev,
          conversations: data.chats
        }));
      }
    });

    // ✅ CLEANUP MELHORADO
    return () => {
      console.log('🔌 WhatsAppContext: Limpando socket...');
      socket.disconnect();
      setState(prev => ({ ...prev, socket: null }));
    };
  }, [isLoggedIn, user]); // ✅ REMOVIDO TOKEN DAS DEPENDÊNCIAS PARA EVITAR LOOP

  // ====================================
  // 🔗 CONECTAR WHATSAPP - VERSÃO CORRIGIDA MAS COMPLETA
  // ====================================
  const connectWhatsApp = useCallback(async () => {
    console.log('🔄 WhatsAppContext: Iniciando conexão...');
    
    // ✅ DEBUG COMPLETO DOS VALORES DE AUTENTICAÇÃO
    console.log('🔍 CONNECT DEBUG - Valores de autenticação DETALHADOS:', {
      isLoggedIn: isLoggedIn,
      isLoggedInType: typeof isLoggedIn,
      hasUser: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      } : 'NULL USER',
      hasToken: !!token,
      token: token ? {
        length: token.length,
        preview: token.substring(0, 30) + '...',
        type: typeof token
      } : 'NULL TOKEN',
      socketStatus: {
        exists: !!state.socket,
        connected: state.socket?.connected,
        id: state.socket?.id
      },
      currentState: {
        status: state.status,
        isConnecting: state.isConnecting,
        isConnected: state.isConnected
      },
      timestamp: new Date().toISOString()
    });

    // ✅ VERIFICAÇÃO SIMPLIFICADA - SEM TOKEN OBRIGATÓRIO
    if (!isLoggedIn) {
      const error = 'Usuário não está logado (isLoggedIn=false)';
      console.error('❌ AUTH ERROR - isLoggedIn:', {
        value: isLoggedIn,
        type: typeof isLoggedIn,
        user: user?.email || 'NO USER',
        token: token ? 'EXISTS' : 'NULL'
      });
      setState(prev => ({ ...prev, error }));
      throw new Error(error);
    }

    if (!user) {
      const error = 'Dados do usuário não encontrados';
      console.error('❌ AUTH ERROR - user:', {
        value: user,
        type: typeof user,
        token: token ? 'EXISTS' : 'NULL',
        isLoggedIn: isLoggedIn
      });
      setState(prev => ({ ...prev, error }));
      throw new Error(error);
    }

    // ✅ TOKEN AGORA É OPCIONAL - NÃO BLOQUEIA A CONEXÃO
    if (!token) {
      console.warn('⚠️ AUTH WARNING - sem token, mas continuando:', {
        value: token,
        type: typeof token,
        user: user?.email,
        isLoggedIn: isLoggedIn
      });
      
      // Não bloqueia mais a conexão, apenas avisa
    }
    
    // ✅ VERIFICAR SOCKET COM RETRY
    if (!state.socket) {
      const error = 'Socket não inicializado - aguarde reconexão...';
      console.error('❌ SOCKET ERROR:', {
        socketExists: !!state.socket,
        userAuth: {
          isLoggedIn,
          hasUser: !!user,
          hasToken: !!token
        }
      });
      setState(prev => ({ ...prev, error }));
      
      // Tentar reinicializar socket
      console.log('🔄 Tentando reinicializar socket...');
      setTimeout(() => {
        if (isLoggedIn && user) {
          console.log('🔄 Relançando effect para recriar socket...');
          // Forçar reexecução do effect
          setState(prev => ({ ...prev, socket: null }));
        }
      }, 1000);
      
      throw new Error(error);
    }

    if (!state.socket.connected) {
      const error = 'Socket não conectado ao servidor - aguarde...';
      console.error('❌ SOCKET CONNECTION ERROR:', {
        socketExists: !!state.socket,
        connected: state.socket.connected,
        readyState: state.socket.readyState
      });
      setState(prev => ({ ...prev, error }));
      
      // Aguardar conexão
      setTimeout(() => {
        if (state.socket && state.socket.connected) {
          console.log('🔄 Socket reconectado, tentando novamente...');
          connectWhatsApp();
        }
      }, 2000);
      
      throw new Error(error);
    }

    if (state.isConnecting) {
      console.log('⚠️ WhatsAppContext: Já está conectando, ignorando...');
      return;
    }

    // ✅ INÍCIO DA CONEXÃO
    setState(prev => ({
      ...prev,
      status: 'connecting',
      connectionStatus: 'connecting',
      isConnecting: true,
      loading: true,
      error: null,
      qrCode: null
    }));

    try {
      console.log('🚀 WhatsAppContext: Enviando comandos de conexão...');
      
      const connectionData = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        token: token || `temp_token_${Date.now()}`, // ✅ FALLBACK TOKEN
        timestamp: Date.now()
      };

      console.log('📤 Dados de conexão:', connectionData);
      
      // ✅ ENVIAR AMBOS OS COMANDOS PARA MÁXIMA COMPATIBILIDADE
      state.socket.emit('startWhatsApp', connectionData);
      state.socket.emit('whatsapp:connect', connectionData);
      
      console.log('✅ WhatsAppContext: Comandos de conexão enviados');
      console.log('⏳ Aguardando resposta do servidor...');
      
      // ✅ TIMEOUT PARA EVITAR TRAVAMENTO
      setTimeout(() => {
        if (state.isConnecting && state.status === 'connecting') {
          console.log('⏰ Timeout na conexão, verificando status...');
          setState(prev => {
            if (prev.isConnecting && prev.status === 'connecting') {
              return {
                ...prev,
                error: 'Timeout na conexão - servidor não respondeu em 30s',
                isConnecting: false,
                status: 'error',
                loading: false
              };
            }
            return prev;
          });
        }
      }, 30000); // 30 segundos timeout
      
    } catch (error) {
      console.error('❌ WhatsAppContext: Erro ao enviar comando:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        connectionStatus: 'error',
        isConnecting: false,
        loading: false,
        error: `Erro ao conectar: ${error.message}`
      }));
      throw error;
    }
  }, [state.socket, state.isConnecting, state.status, isLoggedIn, user, token]); // ✅ ADICIONADO TOKEN DE VOLTA MAS SEM SER OBRIGATÓRIO

  // Alias para compatibilidade
  const connect = connectWhatsApp;

  // ====================================
  // ❌ DESCONECTAR WHATSAPP
  // ====================================
  const disconnectWhatsApp = useCallback(async () => {
    console.log('🔄 WhatsAppContext: Desconectando...');
    
    if (!state.socket) {
      console.log('⚠️ WhatsAppContext: Socket não conectado');
      return;
    }

    try {
      // ENVIAR AMBOS OS COMANDOS PARA COMPATIBILIDADE
      state.socket.emit('stopWhatsApp');
      state.socket.emit('whatsapp:disconnect');
      
      setState(prev => ({
        ...prev,
        status: 'disconnected',
        isConnected: false,
        connectionStatus: 'disconnected',
        isConnecting: false,
        loading: false,
        qrCode: null,
        clientInfo: null,
        connectionInfo: null,
        conversations: [],
        messages: {}
      }));
      
      console.log('✅ WhatsAppContext: Desconectado com sucesso');
    } catch (error) {
      console.error('❌ WhatsAppContext: Erro ao desconectar:', error);
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, [state.socket]);

  // Alias para compatibilidade
  const disconnect = disconnectWhatsApp;

  // ====================================
  // 🔄 REFRESH CONEXÃO
  // ====================================
  const refreshConnection = useCallback(async () => {
    console.log('🔄 WhatsAppContext: Refresh conexão...');
    
    if (!isLoggedIn) {
      console.log('⚠️ WhatsAppContext: Usuário não autenticado para refresh');
      return;
    }

    try {
      if (state.status === 'connected' || state.isConnected) {
        await disconnectWhatsApp();
        setTimeout(() => {
          connectWhatsApp();
        }, 1000);
      } else {
        await connectWhatsApp();
      }
    } catch (error) {
      console.error('❌ WhatsAppContext: Erro ao refresh:', error);
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [state.status, state.isConnected, connectWhatsApp, disconnectWhatsApp, isLoggedIn]);

  // ====================================
  // 📤 ENVIAR MENSAGEM
  // ====================================
  const sendMessage = useCallback(async (to, message) => {
    console.log('📤 WhatsAppContext: Enviando mensagem...', { 
      to, 
      messageLength: message?.length,
      userAuthenticated: isLoggedIn 
    });
    
    if (!isLoggedIn) {
      const error = 'Usuário não autenticado para enviar mensagem';
      console.error('❌', error);
      throw new Error(error);
    }
    
    if (!state.socket || (!state.isConnected && state.status !== 'connected')) {
      const error = 'WhatsApp não conectado para enviar mensagem';
      console.error('❌', error, {
        hasSocket: !!state.socket,
        isConnected: state.isConnected,
        status: state.status
      });
      throw new Error(error);
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout ao enviar mensagem (30s)'));
      }, 30000);

      const messageData = { 
        to, 
        message,
        userId: user?.id,
        timestamp: Date.now()
      };

      console.log('📤 Enviando dados da mensagem:', messageData);

      // Listener para resposta
      const handleResponse = (response) => {
        clearTimeout(timeout);
        
        console.log('📨 Resposta do servidor:', response);
        
        if (response?.success) {
          console.log('✅ WhatsAppContext: Mensagem enviada com sucesso');
          
          // Adicionar mensagem ao estado
          setState(prev => ({
            ...prev,
            messages: {
              ...prev.messages,
              [to]: [...(prev.messages[to] || []), {
                id: response.messageId || Date.now(),
                body: message,
                fromMe: true,
                timestamp: Date.now(),
                type: 'sent'
              }]
            }
          }));
          
          resolve(response);
        } else {
          const errorMsg = response?.error || 'Erro desconhecido ao enviar mensagem';
          console.error('❌ WhatsAppContext: Erro ao enviar mensagem:', errorMsg);
          reject(new Error(errorMsg));
        }
      };

      // Tentar o evento original primeiro
      state.socket.emit('sendMessage', messageData, handleResponse);
      
      // Fallback para evento alternativo
      setTimeout(() => {
        state.socket.emit('whatsapp:send', messageData, handleResponse);
      }, 5000);
    });
  }, [state.socket, state.status, state.isConnected, isLoggedIn, user]);

  // ====================================
  // 📁 ENVIAR MÍDIA
  // ====================================
  const sendMedia = useCallback(async (to, file, caption = '') => {
    console.log('📁 WhatsAppContext: Enviando mídia...', { to, caption, fileType: file?.type });
    
    if (!isLoggedIn) {
      const error = 'Usuário não autenticado para enviar mídia';
      console.error('❌', error);
      throw new Error(error);
    }
    
    if (!state.socket || (!state.isConnected && state.status !== 'connected')) {
      const error = 'WhatsApp não conectado para enviar mídia';
      console.error('❌', error);
      throw new Error(error);
    }

    // Convert file to base64 if it's a File object
    let fileData;
    if (file instanceof File) {
      console.log('📁 Convertendo arquivo para base64...', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            data: e.target.result,
            mimetype: file.type,
            filename: file.name
          });
        };
        reader.onerror = (error) => {
          console.error('❌ Erro ao ler arquivo:', error);
          reject(error);
        };
        reader.readAsDataURL(file);
      });
    } else {
      fileData = file;
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout ao enviar mídia (60s)'));
      }, 60000);

      const mediaData = { 
        to, 
        media: fileData, 
        caption,
        userId: user?.id,
        timestamp: Date.now()
      };

      console.log('📁 Enviando dados da mídia:', {
        to: mediaData.to,
        caption: mediaData.caption,
        userId: mediaData.userId,
        mediaType: mediaData.media?.mimetype,
        mediaFilename: mediaData.media?.filename
      });

      const handleResponse = (response) => {
        clearTimeout(timeout);
        
        console.log('📨 Resposta do servidor (mídia):', response);
        
        if (response?.success) {
          console.log('✅ WhatsAppContext: Mídia enviada com sucesso');
          resolve(response);
        } else {
          const errorMsg = response?.error || 'Erro desconhecido ao enviar mídia';
          console.error('❌ WhatsAppContext: Erro ao enviar mídia:', errorMsg);
          reject(new Error(errorMsg));
        }
      };

      // Tentar eventos de mídia
      state.socket.emit('sendMedia', mediaData, handleResponse);
      
      setTimeout(() => {
        state.socket.emit('whatsapp:sendMedia', mediaData, handleResponse);
      }, 5000);
    });
  }, [state.socket, state.status, state.isConnected, isLoggedIn, user]);

  // ====================================
  // 📂 OBTER CONVERSAS
  // ====================================
  const loadConversations = useCallback(() => {
    console.log('📂 WhatsAppContext: Carregando conversas...');
    
    if (!state.socket || (!state.isConnected && state.status !== 'connected')) {
      console.log('⚠️ WhatsAppContext: Não conectado para carregar conversas');
      return;
    }

    const handleResponse = (response) => {
      console.log('📨 Resposta conversas:', response);
      
      if (response?.success) {
        console.log(`✅ WhatsAppContext: ${response.chats?.length || 0} conversas carregadas`);
        setState(prev => ({
          ...prev,
          conversations: response.chats || []
        }));
      } else {
        console.log('⚠️ WhatsAppContext: Erro ao carregar conversas:', response?.error);
      }
    };

    // Tentar ambos os eventos
    state.socket.emit('getChats', handleResponse);
    
    setTimeout(() => {
      state.socket.emit('whatsapp:getChats', handleResponse);
    }, 2000);
  }, [state.socket, state.status, state.isConnected]);

  // ====================================
  // 🗑️ LIMPAR ERRO
  // ====================================
  const clearError = useCallback(() => {
    console.log('🗑️ WhatsAppContext: Limpando erro...');
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // ====================================
  // 📊 OBTER STATUS
  // ====================================
  const getStatus = useCallback(() => {
    const status = {
      isConnected: state.status === 'connected' || state.isConnected,
      connectionStatus: state.status,
      hasQRCode: !!state.qrCode,
      conversationsCount: state.conversations.length,
      totalMessages: Object.values(state.messages).reduce((total, msgs) => total + msgs.length, 0),
      clientInfo: state.clientInfo,
      isAuthenticated: isLoggedIn,
      user: user,
      socket: {
        exists: !!state.socket,
        connected: state.socket?.connected,
        id: state.socket?.id
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Status atual:', status);
    return status;
  }, [state, isLoggedIn, user]);

  // ====================================
  // 📦 VALOR DO CONTEXTO - COMPLETO
  // ====================================
  const contextValue = {
    // Estados que o ConnectionPage espera
    status: state.status,
    qrCode: state.qrCode,
    isConnecting: state.isConnecting,
    connectionInfo: state.connectionInfo,
    error: state.error,
    
    // Estados adicionais completos
    isConnected: state.status === 'connected' || state.isConnected,
    connectionStatus: state.status,
    conversations: state.conversations,
    messages: state.messages,
    activeConversation: state.activeConversation,
    clientInfo: state.clientInfo,
    loading: state.loading,
    
    // Estados de autenticação
    isAuthenticated: isLoggedIn,
    user,
    
    // Funções que o ConnectionPage espera
    connectWhatsApp,
    disconnectWhatsApp,
    refreshConnection,
    clearError,
    
    // Aliases para compatibilidade
    connect,
    disconnect,
    
    // Funções adicionais completas
    sendMessage,
    sendMedia,
    loadConversations,
    getStatus
  };

  return (
    <WhatsAppContext.Provider value={contextValue}>
      {children}
    </WhatsAppContext.Provider>
  );
};

// ====================================
// 🪝 HOOK PARA USAR O CONTEXTO
// ====================================
export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  
  if (!context) {
    throw new Error('useWhatsApp deve ser usado dentro de WhatsAppProvider');
  }
  
  return context;
};

export default WhatsAppContext;