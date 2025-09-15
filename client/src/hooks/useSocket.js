// client/src/hooks/useSocket.js
// =====================================
// PRIMEM WHATSAPP - HOOK DE SOCKET.IO
// Base fundamental para comunicação em tempo real
// =====================================

import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

const useSocket = (url = null, options = {}) => {
  // ====================================
  // ESTADOS DO SOCKET
  // ====================================
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [lastPong, setLastPong] = useState(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  // ====================================
  // REFS
  // ====================================
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());
  const pingIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // ====================================
  // CONFIGURAÇÕES PADRÃO
  // ====================================
  const defaultOptions = {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 20000,
    forceNew: false,
    autoConnect: true,
    ...options
  };

  const socketUrl = url || process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

  // ====================================
  // INICIALIZAR SOCKET
  // ====================================
  useEffect(() => {
    if (!defaultOptions.autoConnect) return;

    connect();

    return () => {
      disconnect();
    };
  }, [socketUrl]);

  // ====================================
  // CONECTAR SOCKET
  // ====================================
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('🔌 Socket já está conectado');
      return;
    }

    console.log('🔌 Conectando socket:', socketUrl);
    setIsConnecting(true);
    setError(null);

    try {
      const socket = io(socketUrl, defaultOptions);
      socketRef.current = socket;

      // ====================================
      // EVENTOS BÁSICOS DO SOCKET
      // ====================================

      // Conectado
      socket.on('connect', () => {
        console.log('✅ Socket conectado:', socket.id);
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        setReconnectAttempt(0);
        
        // Iniciar ping/pong
        startPingPong();
      });

      // Desconectado
      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket desconectado:', reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Parar ping/pong
        stopPingPong();
        
        if (reason === 'io client disconnect') {
          // Desconexão manual
          setError(null);
        } else {
          // Desconexão automática
          setError(`Conexão perdida: ${reason}`);
        }
      });

      // Erro de conexão
      socket.on('connect_error', (err) => {
        console.error('❌ Erro de conexão:', err);
        setIsConnecting(false);
        setError(`Erro de conexão: ${err.message}`);
      });

      // Tentativa de reconexão
      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Tentativa de reconexão:', attemptNumber);
        setReconnectAttempt(attemptNumber);
        setIsConnecting(true);
      });

      // Reconectado
      socket.on('reconnect', (attemptNumber) => {
        console.log('✅ Reconectado após', attemptNumber, 'tentativas');
        setReconnectAttempt(0);
        setError(null);
      });

      // Falha na reconexão
      socket.on('reconnect_failed', () => {
        console.error('❌ Falha na reconexão após múltiplas tentativas');
        setError('Não foi possível reconectar. Verifique sua conexão.');
        setIsConnecting(false);
      });

      // Pong recebido
      socket.on('pong', (ms) => {
        setLastPong(Date.now());
        console.log('🏓 Pong recebido, latência:', ms, 'ms');
      });

      // Re-registrar listeners personalizados
      reregisterListeners();

    } catch (err) {
      console.error('❌ Erro ao criar socket:', err);
      setError(`Erro ao inicializar: ${err.message}`);
      setIsConnecting(false);
    }
  }, [socketUrl]);

  // ====================================
  // DESCONECTAR SOCKET
  // ====================================
  const disconnect = useCallback(() => {
    console.log('🔌 Desconectando socket...');
    
    stopPingPong();
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    setReconnectAttempt(0);
  }, []);

  // ====================================
  // INICIAR PING/PONG
  // ====================================
  const startPingPong = useCallback(() => {
    if (pingIntervalRef.current) return;

    pingIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        const start = Date.now();
        socketRef.current.emit('ping', start);
      }
    }, 30000); // Ping a cada 30 segundos
  }, []);

  // ====================================
  // PARAR PING/PONG
  // ====================================
  const stopPingPong = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  // ====================================
  // ADICIONAR LISTENER
  // ====================================
  const on = useCallback((event, callback) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    
    listenersRef.current.get(event).add(callback);

    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }

    // Retornar função de cleanup
    return () => {
      off(event, callback);
    };
  }, []);

  // ====================================
  // REMOVER LISTENER
  // ====================================
  const off = useCallback((event, callback) => {
    if (listenersRef.current.has(event)) {
      listenersRef.current.get(event).delete(callback);
      
      if (listenersRef.current.get(event).size === 0) {
        listenersRef.current.delete(event);
      }
    }

    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  // ====================================
  // EMITIR EVENTO
  // ====================================
  const emit = useCallback((event, data, callback) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Tentativa de emit sem conexão:', event);
      if (callback) {
        callback({ error: 'Socket não conectado' });
      }
      return false;
    }

    console.log('📤 Emitindo evento:', event, data);
    
    if (callback) {
      socketRef.current.emit(event, data, callback);
    } else {
      socketRef.current.emit(event, data);
    }
    
    return true;
  }, []);

  // ====================================
  // EMITIR COM TIMEOUT
  // ====================================
  const emitWithTimeout = useCallback((event, data, timeout = 10000) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Socket não conectado'));
        return;
      }

      const timer = setTimeout(() => {
        reject(new Error(`Timeout ao aguardar resposta do evento: ${event}`));
      }, timeout);

      socketRef.current.emit(event, data, (response) => {
        clearTimeout(timer);
        
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }, []);

  // ====================================
  // RE-REGISTRAR LISTENERS
  // ====================================
  const reregisterListeners = useCallback(() => {
    if (!socketRef.current) return;

    listenersRef.current.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        socketRef.current.on(event, callback);
      });
    });
  }, []);

  // ====================================
  // OBTER STATUS DE CONEXÃO
  // ====================================
  const getConnectionStatus = useCallback(() => {
    if (isConnecting) return 'connecting';
    if (isConnected) return 'connected';
    if (error) return 'error';
    return 'disconnected';
  }, [isConnected, isConnecting, error]);

  // ====================================
  // OBTER INFORMAÇÕES DE LATÊNCIA
  // ====================================
  const getLatency = useCallback(() => {
    if (!lastPong) return null;
    
    const now = Date.now();
    const timeSinceLastPong = now - lastPong;
    
    return {
      lastPong,
      timeSinceLastPong,
      isStale: timeSinceLastPong > 60000 // Mais de 1 minuto
    };
  }, [lastPong]);

  // ====================================
  // FORÇAR RECONEXÃO
  // ====================================
  const forceReconnect = useCallback(() => {
    console.log('🔄 Forçando reconexão...');
    disconnect();
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, 1000);
  }, [disconnect, connect]);

  // ====================================
  // VERIFICAR SAÚDE DA CONEXÃO
  // ====================================
  const checkHealth = useCallback(() => {
    const latency = getLatency();
    const status = getConnectionStatus();
    
    return {
      status,
      isHealthy: status === 'connected' && (!latency || !latency.isStale),
      socketId: socketRef.current?.id,
      reconnectAttempts: reconnectAttempt,
      latency,
      error
    };
  }, [getLatency, getConnectionStatus, reconnectAttempt, error]);

  // ====================================
  // LIMPAR ERRO
  // ====================================
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ====================================
  // HOOKS ESPECIALIZADOS
  // ====================================

  // Hook para listener único (auto-cleanup)
  const useSocketListener = useCallback((event, callback, deps = []) => {
    useEffect(() => {
      const cleanup = on(event, callback);
      return cleanup;
    }, deps);
  }, [on]);

  // Hook para emitir quando conectado
  const useSocketEmitOnConnect = useCallback((event, data) => {
    useEffect(() => {
      if (isConnected) {
        emit(event, data);
      }
    }, [isConnected, event, data]);
  }, [isConnected, emit]);

  // ====================================
  // RETORNO DO HOOK
  // ====================================
  return {
    // Estados
    isConnected,
    isConnecting,
    error,
    reconnectAttempt,
    
    // Informações
    socketId: socketRef.current?.id,
    connectionStatus: getConnectionStatus(),
    health: checkHealth(),
    latency: getLatency(),
    
    // Funções principais
    connect,
    disconnect,
    forceReconnect,
    
    // Funções de comunicação
    emit,
    emitWithTimeout,
    on,
    off,
    
    // Hooks especializados
    useSocketListener,
    useSocketEmitOnConnect,
    
    // Utilitários
    clearError,
    checkHealth,
    
    // Referência direta (use com cuidado)
    socket: socketRef.current
  };
};

// ====================================
// HOOK PARA MÚLTIPLOS SOCKETS
// ====================================
export const useMultipleSockets = (configs) => {
  const sockets = {};
  
  configs.forEach(config => {
    const { name, url, options } = config;
    sockets[name] = useSocket(url, options);
  });
  
  return sockets;
};

// ====================================
// HOOK PARA SOCKET COM AUTO-RETRY
// ====================================
export const useSocketWithRetry = (url, options = {}) => {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = options.maxRetries || 10;
  
  const socket = useSocket(url, {
    ...options,
    reconnectionAttempts: maxRetries
  });
  
  useEffect(() => {
    if (socket.error && retryCount < maxRetries) {
      const timeout = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        socket.forceReconnect();
      }, Math.min(1000 * Math.pow(2, retryCount), 30000)); // Exponential backoff
      
      return () => clearTimeout(timeout);
    }
  }, [socket.error, retryCount, maxRetries, socket.forceReconnect]);
  
  return {
    ...socket,
    retryCount,
    maxRetries,
    canRetry: retryCount < maxRetries
  };
};

// ====================================
// CONTEXTO PARA SOCKET GLOBAL
// ====================================
import { createContext, useContext } from 'react';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children, url, options }) => {
  const socket = useSocket(url, options);
  
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useGlobalSocket = () => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useGlobalSocket deve ser usado dentro de um SocketProvider');
  }
  
  return context;
};

// ====================================
// EXPORTAÇÃO PADRÃO
// ====================================
export default useSocket;