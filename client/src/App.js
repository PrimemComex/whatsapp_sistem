// client/src/App.js
// =====================================
// APP.JS COMPLETO v4.0 - FUNCIONALIDADES AVANÇADAS + CORREÇÕES
// Baseado na versão original + funcionalidades avançadas + correções dos documentos:
// ⭐ Favoritar, 📩 Marcar não lida, ✏️ Editar nome, 🎙️ Áudio, 😀 Emojis, 🏢 Bitrix ID, 📎 Anexos
// + Correções baseadas nos documentos: 02, 03, 04, 05
// =====================================

import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

// === CONTEXTOS - IMPORTS CORRETOS ===
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { WhatsAppProvider } from './contexts/WhatsAppContext';

// === COMPONENTES MODULARES AVANÇADOS ===
import EditNameModal from './components/modals/EditNameModal';
import EmojiPicker from './components/ui/EmojiPicker';
import AudioRecorder from './components/media/AudioRecorder';

// === PÁGINAS - IMPORTS CORRETOS ===
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ConnectionPage from './pages/ConnectionPage';

// === ESTILOS ===
import './App.css';
import './index.css';

// === CONFIGURAÇÕES ===
const API_URL = 'http://localhost:3001';
const SOCKET_URL = 'http://localhost:3001';

// ====================================
// SISTEMA DE MENSAGENS GLOBAL CORRIGIDO
// ====================================
const MessageSystem = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState({});
  const [conversations, setConversations] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // === ESTADOS PARA FUNCIONALIDADES AVANÇADAS ===
  const [favoriteChats, setFavoriteChats] = useState(new Set());
  const [unreadChats, setUnreadChats] = useState(new Set());
  const [chatNames, setChatNames] = useState({});
  const [bitrixIds, setBitrixIds] = useState({});
  
  const socketRef = useRef(null);

  // === INICIALIZAÇÃO SOCKET.IO CORRIGIDA (baseada nos documentos) ===
  useEffect(() => {
    console.log('🔌 Inicializando Socket.IO com protocolos dos documentos...');
    
    const newSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    if (typeof window !== 'undefined') {
      window.socket = newSocket;
    }

    // Event Listeners básicos
    newSocket.on('connect', () => {
      console.log('✅ Socket conectado:', newSocket.id);
      setConnectionStatus('connected');
      setSocket(newSocket);
      socketRef.current = newSocket;
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket desconectado');
      setConnectionStatus('disconnected');
    });

    newSocket.on('reconnect', () => {
      console.log('🔄 Socket reconectado');
      setConnectionStatus('connected');
    });

    // === EVENTOS WHATSAPP CORRIGIDOS (baseados nos documentos) ===
    
    // QR Code - DOCUMENTO 01
    newSocket.on('whatsapp:qr', (data) => {
      console.log('📱 QR Code recebido (protocolo doc 01)');
      setConnectionStatus('qr_received');
      if (data.qrCode) {
        console.log('QR Code disponível para exibição');
      }
    });

    // WhatsApp Pronto - DOCUMENTO 02
    newSocket.on('whatsapp:ready', (data) => {
      console.log('✅ WhatsApp conectado (protocolo doc 02)!', data);
      setConnectionStatus('ready');
    });

    // Mensagem Recebida - DOCUMENTO 02 (CORRIGIDO)
    newSocket.on('whatsapp:message_received', (messageData) => {
      console.log('📨 Mensagem recebida (protocolo doc 02):', messageData);
      
      const conversationId = messageData.from;
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), {
          id: messageData.id || Date.now(),
          body: messageData.body || '',
          from: messageData.from,
          fromMe: false,
          timestamp: messageData.timestamp || Date.now(),
          type: 'received',
          media: messageData.media, // IMPORTANTE: incluir mídia
          hasMedia: messageData.hasMedia
        }]
      }));

      // Marcar como não lida automaticamente quando receber mensagem
      setUnreadChats(prev => new Set([...prev, conversationId]));

      setConversations(prev => {
        const existing = prev.find(conv => conv.id === conversationId);
        if (existing) {
          return prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, lastMessage: messageData.body, timestamp: messageData.timestamp }
              : conv
          );
        } else {
          return [...prev, {
            id: conversationId,
            name: messageData.notifyName || conversationId.split('@')[0],
            lastMessage: messageData.body,
            timestamp: messageData.timestamp,
            unreadCount: 1
          }];
        }
      });

      if (Notification.permission === 'granted') {
        new Notification('Nova mensagem WhatsApp', {
          body: messageData.body,
          icon: '/favicon.ico'
        });
      }
    });

    // Mensagem Enviada - DOCUMENTO 02 (CORRIGIDO)
    newSocket.on('whatsapp:message_sent', (messageData) => {
      console.log('📤 Mensagem enviada (protocolo doc 02):', messageData);
      
      const conversationId = messageData.to;
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), {
          id: messageData.id || Date.now(),
          body: messageData.message || messageData.body || '',
          to: messageData.to,
          fromMe: true,
          timestamp: messageData.timestamp || Date.now(),
          type: 'sent',
          status: 'sent'
        }]
      }));
    });

    // === NOVOS EVENT LISTENERS DOS DOCUMENTOS ===
    
    // Resposta de envio via Socket
    newSocket.on('message:sent', (response) => {
      console.log('✅ Confirmação envio Socket:', response);
      if (response.success) {
        console.log('Mensagem confirmada pelo servidor');
      }
    });

    // Erro de envio via Socket
    newSocket.on('message:error', (error) => {
      console.error('❌ Erro envio Socket:', error);
      alert('Erro ao enviar mensagem: ' + error.message);
    });

    // Arquivo enviado - DOCUMENTO 03/04
    newSocket.on('fileSent', (response) => {
      console.log('📎 Arquivo enviado (protocolo doc 03/04):', response);
      if (response.success) {
        console.log('Arquivo confirmado pelo servidor');
      } else {
        alert('Erro ao enviar arquivo: ' + response.error);
      }
    });

    // Lista de chats - DOCUMENTO 02
    newSocket.on('whatsapp:chats', (chats) => {
      console.log('💬 Lista de chats recebida (protocolo doc 02):', chats);
      if (Array.isArray(chats)) {
        setConversations(chats.map(chat => ({
          id: chat.id._serialized,
          name: chat.name,
          lastMessage: chat.lastMessage?.body || '',
          timestamp: chat.timestamp,
          unreadCount: chat.unreadCount || 0,
          isGroup: chat.isGroup
        })));
      }
    });

    return () => {
      console.log('🧹 Limpando Socket.IO...');
      newSocket.disconnect();
    };
  }, []);

  // Solicitar permissão de notificação
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // === FUNÇÕES AVANÇADAS ===
  
  // Favoritar/desfavoritar conversa
  const toggleFavorite = (conversationId) => {
    setFavoriteChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
        console.log('💔 Removido dos favoritos:', conversationId);
      } else {
        newSet.add(conversationId);
        console.log('⭐ Adicionado aos favoritos:', conversationId);
      }
      return newSet;
    });
  };

  // Marcar/desmarcar como não lida
  const toggleUnread = (conversationId) => {
    setUnreadChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
        console.log('✅ Marcado como lido:', conversationId);
      } else {
        newSet.add(conversationId);
        console.log('📩 Marcado como não lido:', conversationId);
      }
      return newSet;
    });
  };

  // Editar nome da conversa
  const updateChatName = (conversationId, newName) => {
    setChatNames(prev => ({
      ...prev,
      [conversationId]: newName
    }));
    
    // Atualizar também na lista de conversas
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, name: newName }
          : conv
      )
    );
    
    console.log('✏️ Nome alterado:', conversationId, '->', newName);
  };

  // Salvar ID do Bitrix
  const setBitrixId = (conversationId, bitrixId) => {
    setBitrixIds(prev => ({
      ...prev,
      [conversationId]: bitrixId
    }));
    console.log('🏢 ID Bitrix salvo:', conversationId, '->', bitrixId);
  };

  // === FUNÇÕES CORRIGIDAS BASEADAS NOS DOCUMENTOS ===

  // Função para enviar mensagem (CORRIGIDA)
  const sendMessage = async (to, message) => {
    if (!socketRef.current || !to || !message.trim()) {
      throw new Error('Socket não conectado ou dados inválidos');
    }

    console.log('📤 Enviando mensagem usando protocolo dos documentos');

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout ao enviar mensagem (30s)'));
      }, 30000);

      const messageData = {
        to: to.replace(/\D/g, ''), // Número limpo
        message: message.trim(),
        timestamp: Date.now(),
        bitrixId: bitrixIds[to] || null
      };

      console.log('📤 Dados da mensagem (protocolo doc 02):', messageData);

      const handleResponse = (response) => {
        clearTimeout(timeout);
        if (response?.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Erro ao enviar mensagem'));
        }
      };

      const handleError = (error) => {
        clearTimeout(timeout);
        reject(new Error(error.message || 'Erro ao enviar mensagem'));
      };

      // Listeners para resposta
      socketRef.current.once('message:sent', handleResponse);
      socketRef.current.once('message:error', handleError);

      // EMITIR usando EXATAMENTE o protocolo dos documentos
      socketRef.current.emit('sendMessage', messageData);
    });
  };

  // Função para enviar arquivo (NOVA - baseada nos documentos)
  const sendFile = async (to, file, caption = '') => {
    if (!socketRef.current || !to || !file) {
      throw new Error('Socket não conectado ou dados inválidos');
    }

    console.log('📎 Enviando arquivo usando protocolo dos documentos');

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout ao enviar arquivo (60s)'));
      }, 60000);

      // Validar tamanho (16MB como especificado nos documentos)
      if (file.size > 16 * 1024 * 1024) {
        reject(new Error('Arquivo muito grande. Máximo 16MB.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const fileData = {
          chatId: to,
          file: reader.result, // Base64
          caption: caption || '',
          mimeType: file.type,
          filename: file.name
        };

        console.log('📎 Dados do arquivo (protocolo doc 03/04):', {
          filename: file.name,
          size: file.size,
          type: file.type
        });

        const handleResponse = (response) => {
          clearTimeout(timeout);
          if (response?.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || 'Erro ao enviar arquivo'));
          }
        };

        const handleError = (error) => {
          clearTimeout(timeout);
          reject(new Error(error.message || 'Erro ao enviar arquivo'));
        };

        // Listeners para resposta
        socketRef.current.once('fileSent', handleResponse);
        socketRef.current.once('message:error', handleError);

        // EMITIR usando EXATAMENTE o protocolo dos documentos
        socketRef.current.emit('sendFile', fileData);
      };

      reader.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Erro ao ler arquivo'));
      };

      reader.readAsDataURL(file);
    });
  };

  // Função para conectar WhatsApp (CORRIGIDA)
  const connectWhatsApp = () => {
    if (socketRef.current) {
      console.log('🔄 Conectando WhatsApp usando protocolo dos documentos...');
      
      // USAR EVENTOS EXATOS dos documentos
      socketRef.current.emit('startWhatsApp', {
        user: 'sistema',
        timestamp: Date.now()
      });
      
      // Também tentar o outro evento mencionado nos docs
      socketRef.current.emit('whatsapp:connect', {
        timestamp: Date.now()
      });
    }
  };

  // Função para obter chats (CORRIGIDA)
  const getChats = () => {
    if (socketRef.current) {
      console.log('📋 Solicitando lista de chats usando protocolo dos documentos...');
      
      // USAR eventos dos documentos
      socketRef.current.emit('whatsapp:getChats', {
        timestamp: Date.now()
      });
    }
  };

  const messageSystemValue = {
    socket: socketRef.current,
    messages,
    conversations,
    connectionStatus,
    sendMessage,
    sendFile, // NOVA função
    connectWhatsApp,
    getChats,
    setMessages,
    setConversations,
    // === FUNCIONALIDADES AVANÇADAS ===
    favoriteChats,
    unreadChats,
    chatNames,
    bitrixIds,
    toggleFavorite,
    toggleUnread,
    updateChatName,
    setBitrixId
  };

  return (
    <MessageContext.Provider value={messageSystemValue}>
      {children}
    </MessageContext.Provider>
  );
};

// Context para mensagens
const MessageContext = React.createContext();
export const useMessages = () => {
  const context = React.useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages deve ser usado dentro de MessageSystem');
  }
  return context;
};

// ====================================
// COMPONENTE DE CHAT INDIVIDUAL MELHORADO
// ====================================
const ChatArea = ({ 
  selectedChat, 
  messages, 
  onSendMessage, 
  onSendFile, 
  bitrixId, 
  onBitrixIdChange 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Função de envio de mensagem (CORRIGIDA)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    console.log('📤 Enviando mensagem via ChatArea...');
    setSending(true);
    try {
      await onSendMessage(selectedChat.id, newMessage);
      setNewMessage(''); // Limpar apenas se sucesso
      console.log('✅ Mensagem enviada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  // Função de envio de arquivo (NOVA)
  const handleSendFile = async (file, caption = '') => {
    if (!file || sending) return;

    console.log('📎 Enviando arquivo via ChatArea...');
    setSending(true);
    try {
      await onSendFile(selectedChat.id, file, caption);
      console.log('✅ Arquivo enviado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao enviar arquivo:', error);
      alert('Erro ao enviar arquivo: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  // Função para inserir emoji
  const handleEmojiSelect = (emoji) => {
    const input = messageInputRef.current;
    if (input) {
      const cursorPos = input.selectionStart;
      const textBefore = newMessage.substring(0, cursorPos);
      const textAfter = newMessage.substring(cursorPos);
      setNewMessage(textBefore + emoji + textAfter);
      
      // Reposicionar cursor
      setTimeout(() => {
        input.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
        input.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  // Função para envio de áudio
  const handleAudioRecorded = async (audioBlob) => {
    try {
      console.log('🎙️ Áudio gravado:', audioBlob);
      
      // Converter blob para File
      const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, { 
        type: 'audio/webm;codecs=opus' 
      });
      
      await handleSendFile(audioFile, '🎵 Mensagem de voz');
      setIsRecording(false);
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      alert('Erro ao enviar áudio: ' + error.message);
    }
  };

  // Renderização de mensagem com mídia (baseada no documento 05)
  const renderMessageContent = (message) => {
    if (message.media || message.hasMedia) {
      const media = message.media || {};
      const isImage = media.mimetype?.startsWith('image/');
      const isVideo = media.mimetype?.startsWith('video/');
      const isAudio = media.mimetype?.startsWith('audio/');
      
      if (isImage) {
        return (
          <div>
            <img
              src={`${API_URL}${media.url}`}
              style={{
                maxWidth: '200px',
                maxHeight: '200px', 
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => window.open(`${API_URL}${media.url}`, '_blank')}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
              alt="Imagem"
            />
            <div style={{display: 'none'}}>🖼️ Imagem não disponível</div>
            {message.body && <div style={{marginTop: '5px'}}>{message.body}</div>}
          </div>
        );
      }
      
      if (isVideo) {
        return (
          <div>
            <video
              src={`${API_URL}${media.url}`}
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                borderRadius: '8px'
              }}
              controls
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div style={{display: 'none'}}>🎥 Vídeo não disponível</div>
            {message.body && <div style={{marginTop: '5px'}}>{message.body}</div>}
          </div>
        );
      }
      
      if (isAudio) {
        // ÁUDIO ISOLADO para não ser interrompido (documento 05)
        return (
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <audio
              src={`${API_URL}${media.url}`}
              controls
              style={{width: '200px'}}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
              }}
            />
            <span style={{display: 'none'}}>🎵 Áudio não disponível</span>
            {message.body && <div>{message.body}</div>}
          </div>
        );
      }
      
      // Outros arquivos (documentos, etc)
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px'
        }}>
          <div>📎</div>
          <div>
            <div style={{fontWeight: 'bold'}}>{media.filename}</div>
            <div style={{fontSize: '12px', color: '#666'}}>
              {media.mimetype} • {(media.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <a 
            href={`${API_URL}${media.url}`} 
            download={media.filename}
            style={{marginLeft: 'auto'}}
          >
            ⬇️
          </a>
          {message.body && <div style={{marginTop: '5px'}}>{message.body}</div>}
        </div>
      );
    }
    
    return <div>{message.body || '[Mensagem vazia]'}</div>;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div style={styles.chatArea}>
      {/* Header do Chat MELHORADO */}
      <div style={styles.chatAreaHeader}>
        <div style={styles.chatAvatar}>
          {selectedChat.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div style={styles.chatInfo}>
          <h3 style={styles.chatName}>{selectedChat.name}</h3>
          <p style={styles.chatStatus}>Online</p>
        </div>
        
        {/* SEÇÃO: ID BITRIX + AÇÕES */}
        <div style={styles.chatActions}>
          {/* Campo ID Bitrix */}
          <div style={styles.bitrixContainer}>
            <label style={styles.bitrixLabel}>ID Bitrix:</label>
            <input
              type="text"
              value={bitrixId || ''}
              onChange={(e) => onBitrixIdChange(selectedChat.id, e.target.value)}
              placeholder="Ex: 12345"
              style={styles.bitrixInput}
            />
          </div>
          
          {/* Botão Anexos */}
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            style={styles.actionButton}
            title="Ver anexos da conversa"
          >
            📎
          </button>
        </div>
      </div>

      {/* ÁREA DE ANEXOS */}
      {showAttachments && (
        <div style={styles.attachmentsArea}>
          <h4 style={styles.attachmentsTitle}>📎 Arquivos desta conversa</h4>
          <div style={styles.attachmentsList}>
            {messages
              .filter(msg => msg.media || msg.hasMedia)
              .map((msg, index) => (
                <div key={index} style={styles.attachmentItem}>
                  <span>{msg.media?.filename || 'Arquivo'}</span>
                  <button 
                    style={styles.attachmentAction}
                    onClick={() => window.open(`${API_URL}${msg.media?.url}`, '_blank')}
                  >
                    📥
                  </button>
                </div>
              ))
            }
            {messages.filter(msg => msg.media || msg.hasMedia).length === 0 && (
              <p style={styles.attachmentsNote}>Nenhum arquivo encontrado nesta conversa</p>
            )}
          </div>
        </div>
      )}

      {/* Lista de Mensagens */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.emptyMessages}>
            <p>📱 Nenhuma mensagem ainda</p>
            <p>Envie uma mensagem para iniciar a conversa</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              style={{
                ...styles.messageWrapper,
                justifyContent: message.fromMe ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  ...styles.messageBubble,
                  ...(message.fromMe ? styles.messageFromMe : styles.messageFromThem)
                }}
              >
                <div style={styles.messageText}>
                  {renderMessageContent(message)}
                </div>
                <div style={styles.messageTime}>
                  {formatTime(message.timestamp)}
                  {message.fromMe && <span style={styles.messageStatus}>✓</span>}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT DE MENSAGEM MELHORADO */}
      <div style={styles.messageForm}>
        {/* Gravador de áudio */}
        {isRecording ? (
          <div style={styles.audioRecorder}>
            <AudioRecorder
              onRecordingComplete={handleAudioRecorded}
              onCancel={() => setIsRecording(false)}
              isVisible={true}
            />
          </div>
        ) : (
          <form onSubmit={handleSendMessage} style={styles.messageInputForm}>
            {/* Botão Emoji */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={styles.emojiButton}
              title="Inserir emoji"
            >
              😀
            </button>

            {/* Input de mensagem */}
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              style={styles.messageInput}
              disabled={sending}
            />

            {/* Input file oculto */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file && onSendFile) {
                  try {
                    await handleSendFile(file);
                  } catch (error) {
                    console.error('Erro no input de arquivo:', error);
                  }
                }
                e.target.value = ''; // Limpar input
              }}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />

            {/* Botão Anexar CORRIGIDO */}
            <button
              type="button"
              style={styles.attachButton}
              title="Anexar arquivo"
              onClick={() => fileInputRef.current?.click()}
            >
              📎
            </button>

            {/* Botão Áudio */}
            <button
              type="button"
              onClick={() => setIsRecording(true)}
              style={styles.audioButton}
              title="Gravar áudio"
            >
              🎙️
            </button>

            {/* Botão Enviar */}
            <button 
              type="submit" 
              style={{
                ...styles.sendButton,
                opacity: sending ? 0.5 : 1
              }}
              disabled={sending || !newMessage.trim()}
            >
              {sending ? '⏳' : '📤'}
            </button>
          </form>
        )}
      </div>

      {/* SELETOR DE EMOJI */}
      <EmojiPicker
        isVisible={showEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        onClose={() => setShowEmojiPicker(false)}
      />
    </div>
  );
};

// ====================================
// COMPONENTE DE ITEM DE CONVERSA MELHORADO
// ====================================
const ConversationItem = ({ 
  conversation, 
  isSelected, 
  onClick, 
  isFavorite, 
  isUnread, 
  onToggleFavorite, 
  onToggleUnread, 
  onEditName 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      style={{
        ...styles.conversationItem,
        ...(isSelected ? styles.conversationSelected : {}),
        ...(isUnread ? styles.conversationUnread : {})
      }}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowMenu(!showMenu);
      }}
    >
      {/* Avatar com indicador de favorito */}
      <div style={styles.conversationAvatarContainer}>
        <div style={styles.conversationAvatar}>
          {conversation.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        {isFavorite && (
          <div style={styles.favoriteIndicator}>⭐</div>
        )}
      </div>
      
      <div style={styles.conversationInfo}>
        <div style={styles.conversationName}>{conversation.name}</div>
        <div style={styles.conversationLastMessage}>
          {conversation.lastMessage || 'Sem mensagens'}
        </div>
      </div>
      
      {/* Badges */}
      <div style={styles.conversationBadges}>
        {conversation.unreadCount > 0 && (
          <div style={styles.unreadBadge}>{conversation.unreadCount}</div>
        )}
        {isUnread && (
          <div style={styles.manualUnreadBadge}>●</div>
        )}
      </div>

      {/* Menu de contexto */}
      {showMenu && (
        <div style={styles.contextMenu}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
              setShowMenu(false);
            }}
            style={styles.contextMenuItem}
          >
            {isFavorite ? '💔 Remover favorito' : '⭐ Favoritar'}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleUnread();
              setShowMenu(false);
            }}
            style={styles.contextMenuItem}
          >
            {isUnread ? '✅ Marcar como lida' : '📩 Marcar como não lida'}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEditName();
              setShowMenu(false);
            }}
            style={styles.contextMenuItem}
          >
            ✏️ Editar nome
          </button>
        </div>
      )}
    </div>
  );
};

// ====================================
// PÁGINA DE CHAT COMPLETA COM FUNCIONALIDADES AVANÇADAS
// ====================================
const ChatPageComplete = () => {
  const { 
    messages, 
    conversations, 
    sendMessage, 
    sendFile,
    getChats, 
    connectionStatus,
    favoriteChats,
    unreadChats,
    bitrixIds,
    toggleFavorite,
    toggleUnread,
    updateChatName,
    setBitrixId
  } = useMessages();
  
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [editingConversation, setEditingConversation] = useState(null);

  // Carregar chats ao abrir página
  useEffect(() => {
    if (connectionStatus === 'ready') {
      getChats();
    }
  }, [connectionStatus, getChats]);

  // Filtrar e ordenar conversas (favoritos primeiro)
  const filteredConversations = conversations
    .filter(conv => conv.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aFavorite = favoriteChats.has(a.id);
      const bFavorite = favoriteChats.has(b.id);
      
      if (aFavorite && !bFavorite) return -1;
      if (!aFavorite && bFavorite) return 1;
      
      return b.timestamp - a.timestamp; // Mais recente primeiro
    });

  // Abrir modal de editar nome
  const handleEditName = (conversation) => {
    setEditingConversation(conversation);
    setShowEditNameModal(true);
  };

  // Salvar novo nome
  const handleSaveName = (newName) => {
    if (editingConversation && newName.trim()) {
      updateChatName(editingConversation.id, newName.trim());
    }
    setShowEditNameModal(false);
    setEditingConversation(null);
  };

  return (
    <div style={styles.chatPageContainer}>
      {/* SIDEBAR SEMPRE VISÍVEL À ESQUERDA */}
      <div style={styles.chatSidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>💬 Conversas</h3>
          <div style={styles.sidebarActions}>
            <button 
              onClick={getChats}
              style={styles.refreshButton}
              title="Atualizar conversas"
            >
              🔄
            </button>
          </div>
        </div>
        
        {/* Busca */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Lista de Conversas MELHORADA */}
        <div style={styles.conversationsList}>
          {filteredConversations.length === 0 ? (
            <div style={styles.emptyConversations}>
              <p>Nenhuma conversa encontrada</p>
              <button onClick={getChats} style={styles.loadButton}>
                Carregar conversas
              </button>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={selectedConversation?.id === conv.id}
                onClick={() => {
                  console.log('📱 Selecionando conversa:', conv.name);
                  setSelectedConversation(conv);
                  // Marcar como lida ao abrir
                  if (unreadChats.has(conv.id)) {
                    toggleUnread(conv.id);
                  }
                }}
                isFavorite={favoriteChats.has(conv.id)}
                isUnread={unreadChats.has(conv.id)}
                onToggleFavorite={() => toggleFavorite(conv.id)}
                onToggleUnread={() => toggleUnread(conv.id)}
                onEditName={() => handleEditName(conv)}
              />
            ))
          )}
        </div>
      </div>

      {/* ÁREA DE CHAT À DIREITA */}
      <div style={styles.chatMainArea}>
        {selectedConversation ? (
          <ChatArea 
            selectedChat={selectedConversation}
            messages={messages[selectedConversation.id] || []}
            onSendMessage={sendMessage}
            onSendFile={sendFile}
            bitrixId={bitrixIds[selectedConversation.id] || ''}
            onBitrixIdChange={setBitrixId}
          />
        ) : (
          <div style={styles.noChatSelected}>
            <div style={styles.welcomeMessage}>
              <h2>💬 PRIMEM WhatsApp Business</h2>
              <p>Selecione uma conversa da lista à esquerda para começar</p>
              <div style={styles.connectionStatus}>
                <strong>Status:</strong> 
                <span style={{
                  color: connectionStatus === 'ready' ? '#10B981' : '#EF4444',
                  marginLeft: '8px'
                }}>
                  {connectionStatus === 'ready' ? '🟢 Conectado' : '🔴 Desconectado'}
                </span>
              </div>
              {connectionStatus !== 'ready' && (
                <p style={styles.helpText}>
                  Verifique a conexão WhatsApp na página de Conexão
                </p>
              )}
              
              {/* ESTATÍSTICAS */}
              <div style={styles.statsContainer}>
                <div style={styles.statItem}>
                  <strong>{conversations.length}</strong>
                  <span>Conversas</span>
                </div>
                <div style={styles.statItem}>
                  <strong>{favoriteChats.size}</strong>
                  <span>Favoritas</span>
                </div>
                <div style={styles.statItem}>
                  <strong>{unreadChats.size}</strong>
                  <span>Não lidas</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL EDITAR NOME */}
      <EditNameModal
        isOpen={showEditNameModal}
        currentName={editingConversation?.name || ''}
        onSave={handleSaveName}
        onClose={() => {
          setShowEditNameModal(false);
          setEditingConversation(null);
        }}
        title="Editar Nome da Conversa"
        placeholder="Digite o novo nome..."
      />
    </div>
  );
};

// ====================================
// COMPONENTE DE PROTEÇÃO
// ====================================
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isLoggedIn, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <h2 style={styles.loadingTitle}>PRIMEM WhatsApp</h2>
          <p style={styles.loadingText}>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div style={styles.accessDeniedContainer}>
        <div style={styles.accessDeniedContent}>
          <h2 style={styles.accessDeniedTitle}>🔒 Acesso Restrito</h2>
          <p style={styles.accessDeniedText}>
            Apenas administradores podem acessar esta área.
          </p>
          <button onClick={() => window.history.back()} style={styles.backButton}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// ====================================
// DASHBOARD PRINCIPAL
// ====================================
const MainDashboard = () => {
  const navigate = useNavigate();
  const { connectionStatus, connectWhatsApp, getChats } = useMessages();

  const handleNavigateToChat = () => {
    console.log('Navegando para Chat...');
    navigate('/chat');
  };

  const handleNavigateToConnection = () => {
    console.log('Navegando para Conexão...');
    navigate('/connection');
  };

  const handleNavigateToSettings = () => {
    console.log('Navegando para Configurações...');
    alert('⚙️ Configurações em desenvolvimento!');
  };

  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      setTimeout(() => {
        connectWhatsApp();
        getChats();
      }, 2000);
    }
  }, [connectionStatus, connectWhatsApp, getChats]);

  return (
    <DashboardPage
      onNavigateToChat={handleNavigateToChat}
      onNavigateToConnection={handleNavigateToConnection}
      onNavigateToSettings={handleNavigateToSettings}
      connectionStatus={connectionStatus}
    />
  );
};

// ====================================
// ROTAS
// ====================================
const RootRoute = () => {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <h2 style={styles.loadingTitle}>PRIMEM WhatsApp</h2>
          <p style={styles.loadingText}>Iniciando sistema...</p>
        </div>
      </div>
    );
  }
  
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

const LoginRoute = () => {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Verificando autenticação...</p>
        </div>
      </div>
    );
  }
  
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainDashboard />
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <ChatPageComplete />
        </ProtectedRoute>
      } />
      <Route path="/connection" element={
        <ProtectedRoute>
          <ConnectionPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<RootRoute />} />
    </Routes>
  );
};

// ====================================
// COMPONENTE PRINCIPAL
// ====================================
function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <WhatsAppProvider>
            <MessageSystem>
              <div className="app" style={{ minHeight: '100vh' }}>
                <AppRoutes />
                <style>{globalStyles}</style>
              </div>
            </MessageSystem>
          </WhatsAppProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

// ====================================
// ESTILOS COMPLETOS
// ====================================
const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #2B4C8C 0%, #8B9DC3 100%)',
    color: 'white'
  },
  loadingContent: {
    textAlign: 'center'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 2s linear infinite',
    margin: '0 auto 24px'
  },
  loadingTitle: {
    margin: '0 0 8px 0',
    fontSize: '24px'
  },
  loadingText: {
    margin: 0,
    opacity: 0.8
  },
  accessDeniedContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f0f2f5',
    padding: '20px'
  },
  accessDeniedContent: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    textAlign: 'center'
  },
  accessDeniedTitle: {
    color: '#EF4444',
    marginBottom: '16px'
  },
  accessDeniedText: {
    marginBottom: '20px'
  },
  backButton: {
    padding: '12px 24px',
    background: '#2B4C8C',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600'
  },
  chatPageContainer: {
    display: 'flex',
    height: '100vh',
    background: '#f0f2f5'
  },
  chatSidebar: {
    width: '350px',
    minWidth: '350px',
    background: 'white',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    background: '#2B4C8C',
    color: 'white'
  },
  sidebarTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600'
  },
  sidebarActions: {
    display: 'flex',
    gap: '8px'
  },
  refreshButton: {
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  searchContainer: {
    padding: '16px',
    borderBottom: '1px solid #f3f4f6'
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#f9fafb'
  },
  conversationsList: {
    flex: 1,
    overflowY: 'auto'
  },
  emptyConversations: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#6b7280'
  },
  loadButton: {
    padding: '10px 16px',
    background: '#2B4C8C',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  
  // Conversa com indicadores
  conversationItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s',
    position: 'relative'
  },
  conversationSelected: {
    backgroundColor: '#e0f2fe',
    borderRight: '3px solid #2B4C8C'
  },
  conversationUnread: {
    backgroundColor: '#fef3cd',
    fontWeight: 'bold'
  },
  conversationAvatarContainer: {
    position: 'relative',
    marginRight: '12px'
  },
  conversationAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#2B4C8C',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px'
  },
  favoriteIndicator: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    background: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0
  },
  conversationName: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: '16px',
    marginBottom: '4px'
  },
  conversationLastMessage: {
    fontSize: '14px',
    color: '#6b7280',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  conversationBadges: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },
  unreadBadge: {
    background: '#EF4444',
    color: 'white',
    borderRadius: '12px',
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 'bold',
    minWidth: '20px',
    textAlign: 'center'
  },
  manualUnreadBadge: {
    background: '#F59E0B',
    color: 'white',
    borderRadius: '50%',
    width: '12px',
    height: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8px'
  },

  // Menu de contexto
  contextMenu: {
    position: 'absolute',
    top: '100%',
    right: '16px',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: '180px'
  },
  contextMenuItem: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'white',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
    transition: 'background-color 0.2s'
  },

  // Chat area melhorada
  chatMainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: '#f0f2f5'
  },
  noChatSelected: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
  welcomeMessage: {
    textAlign: 'center',
    padding: '40px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    maxWidth: '500px'
  },
  connectionStatus: {
    marginTop: '20px',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '14px'
  },
  helpText: {
    color: '#6b7280',
    fontSize: '14px',
    marginTop: '10px'
  },

  // Seção de estatísticas
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '24px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '14px'
  },

  // Chat area
  chatArea: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'white'
  },
  chatAreaHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    background: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  chatAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#2B4C8C',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    marginRight: '12px'
  },
  chatInfo: {
    flex: 1
  },
  chatName: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937'
  },
  chatStatus: {
    margin: 0,
    fontSize: '14px',
    color: '#10B981'
  },

  // Seções do chat header
  chatActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  bitrixContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  bitrixLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500'
  },
  bitrixInput: {
    padding: '6px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    fontSize: '14px',
    width: '100px'
  },
  actionButton: {
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '8px 10px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.2s'
  },

  // Área de anexos
  attachmentsArea: {
    background: '#f8f9fa',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 20px'
  },
  attachmentsTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  attachmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  attachmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: 'white',
    borderRadius: '6px',
    fontSize: '14px'
  },
  attachmentAction: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px'
  },
  attachmentsNote: {
    fontSize: '12px',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: '8px'
  },

  // Messages
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    background: '#f8f9fa'
  },
  emptyMessages: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280'
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '12px'
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '18px',
    wordWrap: 'break-word'
  },
  messageFromMe: {
    backgroundColor: '#2B4C8C',
    color: 'white',
    borderBottomRightRadius: '4px'
  },
  messageFromThem: {
    backgroundColor: 'white',
    color: '#1f2937',
    border: '1px solid #e5e7eb',
    borderBottomLeftRadius: '4px'
  },
  messageText: {
    marginBottom: '4px',
    lineHeight: 1.4
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  messageStatus: {
    marginLeft: '4px'
  },

  // Input melhorado
  messageForm: {
    padding: '16px 20px',
    borderTop: '1px solid #e5e7eb',
    background: 'white'
  },
  messageInputForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  emojiButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    padding: '8px'
  },
  messageInput: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#f9fafb'
  },
  attachButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '8px'
  },
  audioButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '8px'
  },
  sendButton: {
    padding: '12px 16px',
    background: '#2B4C8C',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '16px',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Gravador de áudio
  audioRecorder: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '12px'
  }
};

const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f0f2f5;
  }
  
  button {
    transition: all 0.2s ease-in-out;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  input:focus, textarea:focus {
    outline: none;
    border-color: #2B4C8C !important;
    box-shadow: 0 0 0 2px rgba(43, 76, 140, 0.1);
  }
  
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #2B4C8C;
    border-radius: 4px;
  }
  
  /* Hover nos itens de conversa */
  .conversationItem:hover {
    background-color: #f9fafb !important;
  }
  
  /* Hover nos itens do menu de contexto */
  .contextMenuItem:hover {
    background-color: #f3f4f6 !important;
  }
  
  /* Focus no input */
  .messageInput:focus {
    border-color: #2B4C8C;
    box-shadow: 0 0 0 2px rgba(43, 76, 140, 0.1);
  }
  
  /* Responsividade */
  @media (max-width: 768px) {
    .chatPageContainer {
      flex-direction: column;
    }
    
    .chatSidebar {
      width: 100%;
      min-width: 100%;
      height: 300px;
    }
    
    .chatMainArea {
      height: calc(100vh - 300px);
    }
    
    .bitrixContainer {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
    
    .chatActions {
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }
  }
`;

export default App;
ESSE É UM TESTE