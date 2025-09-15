// ==========================================
// ARQUIVO: client/src/pages/ChatPage.js
// ==========================================
// SUBSTITUA COMPLETAMENTE O ARQUIVO EXISTENTE POR ESTE CÓDIGO
// SOLUÇÃO DEFINITIVA PARA MENSAGENS NÃO APARECEREM

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import useWhatsApp from '../hooks/useWhatsApp';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const {
    isConnected,
    status,
    qrCode,
    chats,
    messages,
    selectedChat,
    error,
    loading,
    connect,
    sendMessage,
    selectChat
  } = useWhatsApp();

  // Estados locais
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [messageLoadError, setMessageLoadError] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Função auxiliar para normalizar IDs
  const normalizeId = useCallback((id) => {
    if (!id) return '';
    return id.replace('@c.us', '').replace('@g.us', '').replace('@broadcast', '');
  }, []);

  // Função auxiliar para log detalhado
  const debugLog = useCallback((message, data = null) => {
    console.log(`🔍 CHATPAGE: ${message}`, data);
  }, []);

  // Conectar automaticamente
  useEffect(() => {
    if (!isConnected && status !== 'connecting' && status !== 'qr') {
      debugLog('Auto-conectando WhatsApp...');
      connect();
    }
  }, [isConnected, status, connect]);

  // Filtrar chats
  useEffect(() => {
    if (Array.isArray(chats)) {
      const filtered = chats.filter(chat => {
        const name = (chat?.name || '').toLowerCase();
        const id = (chat?.id?._serialized || '').toLowerCase();
        const phone = normalizeId(id).toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return name.includes(searchLower) || 
               id.includes(searchLower) || 
               phone.includes(searchLower);
      });
      setFilteredChats(filtered);
      debugLog(`Chats filtrados: ${filtered.length} de ${chats.length} total`);
    }
  }, [chats, searchTerm, normalizeId]);

  // CORREÇÃO PRINCIPAL: Carregamento robusto de mensagens
  useEffect(() => {
    const loadMessagesForChat = () => {
      setMessageLoadError(null);
      
      if (!selectedChat || !Array.isArray(messages)) {
        debugLog('Requisitos não atendidos para carregar mensagens', {
          hasSelectedChat: !!selectedChat,
          isMessagesArray: Array.isArray(messages),
          messagesLength: messages?.length || 0
        });
        setChatMessages([]);
        return;
      }

      const chatId = selectedChat.id?._serialized;
      if (!chatId) {
        debugLog('Chat sem ID válido', selectedChat);
        setChatMessages([]);
        setMessageLoadError('Chat sem ID válido');
        return;
      }

      debugLog('Iniciando carregamento de mensagens', {
        chatName: selectedChat.name,
        chatId: chatId,
        totalMessages: messages.length
      });

      // ESTRATÉGIA 1: Match direto por IDs
      let foundMessages = messages.filter(msg => {
        const msgChatId = msg.chatId || msg.chat?.id?._serialized;
        const msgFrom = msg.from;
        const msgTo = msg.to;
        const msgRemoteId = msg.id?.remote;

        return msgChatId === chatId || 
               msgFrom === chatId || 
               msgTo === chatId ||
               msgRemoteId === chatId;
      });

      debugLog(`Estratégia 1 (Match direto): ${foundMessages.length} mensagens`);

      // ESTRATÉGIA 2: Match por número normalizado
      if (foundMessages.length === 0) {
        const normalizedChatId = normalizeId(chatId);
        
        foundMessages = messages.filter(msg => {
          const msgChatId = normalizeId(msg.chatId || msg.chat?.id?._serialized || '');
          const msgFrom = normalizeId(msg.from || '');
          const msgTo = normalizeId(msg.to || '');
          const msgRemoteId = normalizeId(msg.id?.remote || '');

          return msgChatId === normalizedChatId || 
                 msgFrom === normalizedChatId || 
                 msgTo === normalizedChatId ||
                 msgRemoteId === normalizedChatId;
        });

        debugLog(`Estratégia 2 (Números normalizados): ${foundMessages.length} mensagens`);
      }

      // ESTRATÉGIA 3: Match parcial (contém)
      if (foundMessages.length === 0) {
        const searchTerms = [chatId, normalizeId(chatId)];
        
        foundMessages = messages.filter(msg => {
          const identifiers = [
            msg.chatId || '',
            msg.from || '',
            msg.to || '',
            msg.id?.remote || '',
            msg.chat?.id?._serialized || ''
          ];

          return searchTerms.some(term => 
            identifiers.some(id => 
              (id && term && (id.includes(term) || term.includes(id)))
            )
          );
        });

        debugLog(`Estratégia 3 (Match parcial): ${foundMessages.length} mensagens`);
      }

      // ESTRATÉGIA 4: Match por contato (para grupos)
      if (foundMessages.length === 0 && selectedChat.isGroup) {
        debugLog('Tentando match para grupo...');
        
        foundMessages = messages.filter(msg => {
          const msgChat = msg.chat?.id?._serialized || msg.chatId || '';
          return msgChat.includes('g.us') && (
            msgChat.includes(normalizeId(chatId)) ||
            normalizeId(chatId).includes(normalizeId(msgChat))
          );
        });

        debugLog(`Estratégia 4 (Grupos): ${foundMessages.length} mensagens`);
      }

      // ESTRATÉGIA 5: Debug completo (última tentativa)
      if (foundMessages.length === 0) {
        debugLog('DIAGNÓSTICO COMPLETO - Nenhuma mensagem encontrada');
        debugLog('Chat procurado:', {
          id: chatId,
          name: selectedChat.name,
          normalized: normalizeId(chatId),
          isGroup: selectedChat.isGroup
        });

        if (messages.length > 0) {
          debugLog('Amostra de mensagens disponíveis:');
          messages.slice(0, 5).forEach((msg, i) => {
            debugLog(`Mensagem ${i + 1}:`, {
              chatId: msg.chatId,
              from: msg.from,
              to: msg.to,
              remoteId: msg.id?.remote,
              body: msg.body?.substring(0, 30) + '...'
            });
          });

          // Listar IDs únicos disponíveis
          const uniqueIds = new Set();
          messages.forEach(msg => {
            if (msg.chatId) uniqueIds.add(msg.chatId);
            if (msg.from) uniqueIds.add(msg.from);
            if (msg.to) uniqueIds.add(msg.to);
            if (msg.id?.remote) uniqueIds.add(msg.id.remote);
          });

          debugLog('IDs únicos disponíveis:', Array.from(uniqueIds).slice(0, 10));
        }

        setMessageLoadError('Nenhuma mensagem encontrada para este chat');
      } else {
        // Ordenar mensagens por timestamp
        const sortedMessages = foundMessages.sort((a, b) => {
          const timeA = a.timestamp || a.date || a.createdAt || 0;
          const timeB = b.timestamp || b.date || b.createdAt || 0;
          return timeA - timeB;
        });

        setChatMessages(sortedMessages);
        debugLog(`✅ SUCESSO: ${sortedMessages.length} mensagens carregadas e ordenadas`);

        if (sortedMessages.length > 0) {
          debugLog('Primeira mensagem:', {
            body: sortedMessages[0].body?.substring(0, 50),
            timestamp: sortedMessages[0].timestamp,
            fromMe: sortedMessages[0].fromMe
          });
          debugLog('Última mensagem:', {
            body: sortedMessages[sortedMessages.length - 1].body?.substring(0, 50),
            timestamp: sortedMessages[sortedMessages.length - 1].timestamp,
            fromMe: sortedMessages[sortedMessages.length - 1].fromMe
          });
        }
      }
    };

    loadMessagesForChat();
  }, [selectedChat, messages, normalizeId, debugLog]);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current && chatMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [chatMessages]);

  // Handlers
  const handleChatSelect = useCallback((chat) => {
    debugLog(`Chat selecionado: ${chat.name || 'sem nome'}`, {
      id: chat.id?._serialized,
      isGroup: chat.isGroup
    });
    selectChat(chat);
  }, [selectChat, debugLog]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      debugLog('Enviando mensagem...', {
        chatId: selectedChat.id._serialized,
        message: newMessage.substring(0, 50) + '...'
      });
      
      await sendMessage(selectedChat.id._serialized, newMessage);
      setNewMessage('');
      debugLog('Mensagem enviada com sucesso');
    } catch (error) {
      debugLog('Erro ao enviar mensagem', error);
      alert('Erro ao enviar mensagem: ' + error.message);
    }
  }, [newMessage, selectedChat, sendMessage, debugLog]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Upload handlers
  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      debugLog('Arquivo selecionado', { name: file.name, size: file.size });
      
      if (file.size > 16 * 1024 * 1024) {
        alert('❌ Arquivo muito grande. Máximo 16MB.');
        return;
      }
      
      alert(`📎 Upload selecionado: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)\n\nFuncionalidade de upload será implementada em breve.`);
    }
  }, [debugLog]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      debugLog('Arquivo arrastado', { name: file.name, size: file.size });
      
      if (file.size > 16 * 1024 * 1024) {
        alert('❌ Arquivo muito grande. Máximo 16MB.');
        return;
      }
      
      alert(`📂 Arquivo arrastado: ${file.name}\n\nUpload será implementado em breve.`);
    }
  }, [debugLog]);

  // Render de mensagem otimizado
  const renderMessage = useCallback((msg, index) => {
    const isFromMe = msg.fromMe;
    const timestamp = msg.timestamp || msg.date || msg.createdAt;
    const messageTime = timestamp ? new Date(timestamp * 1000) : new Date();
    
    return (
      <div 
        key={`msg_${msg.id || index}_${timestamp}`}
        style={{
          display: 'flex',
          justifyContent: isFromMe ? 'flex-end' : 'flex-start',
          marginBottom: '12px'
        }}
      >
        <div
          style={{
            maxWidth: '70%',
            padding: '12px 16px',
            borderRadius: isFromMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            backgroundColor: isFromMe ? '#2B4C8C' : '#ffffff',
            color: isFromMe ? 'white' : 'black',
            boxShadow: isFromMe ? '0 2px 4px rgba(43,76,140,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
            border: isFromMe ? 'none' : '1px solid #e0e0e0',
            wordWrap: 'break-word'
          }}
        >
          <div style={{ marginBottom: '4px' }}>
            {msg.body || (msg.hasMedia ? '📎 Arquivo de mídia' : 'Mensagem vazia')}
          </div>
          <div
            style={{
              fontSize: '11px',
              opacity: 0.7,
              textAlign: 'right',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {messageTime.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
            {isFromMe && <span>✓✓</span>}
          </div>
        </div>
      </div>
    );
  }, []);

  // Status badge
  const getStatusBadge = useCallback(() => {
    if (status === 'connected' && isConnected) {
      return { text: '🟢 WhatsApp Conectado', color: '#10B981' };
    } else if (status === 'connecting') {
      return { text: '🟡 Conectando...', color: '#F59E0B' };
    } else if (status === 'qr') {
      return { text: '📱 Aguardando QR Code', color: '#3B82F6' };
    } else if (error) {
      return { text: '🔴 Erro de Conexão', color: '#EF4444' };
    } else {
      return { text: '⚫ Desconectado', color: '#6B7280' };
    }
  }, [status, isConnected, error]);

  const statusBadge = getStatusBadge();

  // Render principal
  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f0f2f5' 
    }}>
      
      {/* SIDEBAR ESQUERDA */}
      <div style={{ 
        width: '350px', 
        backgroundColor: 'white',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        
        {/* Header da sidebar */}
        <div style={{ 
          padding: '20px', 
          background: 'linear-gradient(135deg, #2B4C8C 0%, #C97A4A 100%)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📱 PRIMEM WhatsApp
              </h1>
              <div style={{ 
                fontSize: '12px', 
                marginTop: '4px',
                opacity: 0.9,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ color: statusBadge.color }}>●</span>
                {statusBadge.text}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => connect()}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
                title="Reconectar WhatsApp"
              >
                🔄
              </button>
              <button 
                onClick={logout}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
                title="Fazer Logout"
              >
                🚪
              </button>
            </div>
          </div>
        </div>

        {/* Info do usuário */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2B4C8C, #C97A4A)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>
              {user?.name || 'Usuário'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {user?.role || 'agent'} • {user?.email || 'N/A'}
            </div>
          </div>
        </div>

        {/* Busca */}
        <div style={{ padding: '16px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '20px',
              outline: 'none',
              fontSize: '14px',
              backgroundColor: '#f8f9fa'
            }}
          />
        </div>

        {/* Estatísticas */}
        <div style={{ 
          padding: '0 16px 16px',
          fontSize: '13px',
          color: '#666'
        }}>
          {status === 'connected' && `💬 ${chats.length} conversas • ${messages.length} mensagens`}
          {status === 'connecting' && '🔄 Carregando conversas...'}
          {status === 'qr' && '📱 Escaneie o QR Code abaixo'}
          {error && `❌ ${error}`}
        </div>

        {/* Lista de conversas */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          borderTop: '1px solid #f0f0f0'
        }}>
          {filteredChats.length > 0 ? (
            filteredChats.map((chat, index) => (
              <div
                key={chat.id?._serialized || `chat_${index}`}
                onClick={() => handleChatSelect(chat)}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  backgroundColor: selectedChat?.id?._serialized === chat.id?._serialized 
                    ? '#e3f2fd' 
                    : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedChat?.id?._serialized !== chat.id?._serialized) {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedChat?.id?._serialized !== chat.id?._serialized) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {chat.name ? chat.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: '600',
                      fontSize: '15px',
                      color: '#1a1a1a',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {chat.name || 'Chat sem nome'}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {normalizeId(chat.id?._serialized || 'ID não disponível')}
                    </div>
                  </div>
                  
                  {chat.unreadCount > 0 && (
                    <div style={{
                      backgroundColor: '#25D366',
                      color: 'white',
                      borderRadius: '50%',
                      minWidth: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center', 
              color: '#666',
              fontSize: '14px'
            }}>
              {loading && (
                <>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #2B4C8C',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px'
                  }}></div>
                  Carregando conversas...
                </>
              )}
              {!loading && chats.length === 0 && '📭 Nenhuma conversa disponível'}
              {!loading && chats.length > 0 && '🔍 Nenhuma conversa encontrada'}
            </div>
          )}
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#f0f2f5'
      }}>
        
        {/* QR CODE */}
        {status === 'qr' && qrCode && (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '40px',
            backgroundColor: 'white'
          }}>
            <div style={{ 
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <div style={{ fontSize: '72px', marginBottom: '16px' }}>📱</div>
              <h2 style={{ 
                color: '#2B4C8C',
                fontSize: '28px',
                marginBottom: '8px',
                fontWeight: '600'
              }}>
                Conectar WhatsApp
              </h2>
              <p style={{ 
                color: '#666',
                fontSize: '16px',
                margin: 0
              }}>
                Escaneie o código QR com seu WhatsApp
              </p>
            </div>
            
            <div style={{ 
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0',
              marginBottom: '24px'
            }}>
              <img 
                src={qrCode} 
                alt="QR Code WhatsApp" 
                style={{ 
                  width: '280px', 
                  height: '280px',
                  display: 'block'
                }}
              />
            </div>
            
            <div style={{ 
              marginTop: '24px',
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              <p style={{ 
                color: '#666',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: 0
              }}>
                <strong>Como conectar:</strong><br />
                1. Abra o WhatsApp no seu celular<br />
                2. Toque em Menu → Dispositivos conectados<br />
                3. Toque em "Conectar dispositivo"<br />
                4. Escaneie o código QR acima
              </p>
            </div>
          </div>
        )}

        {/* CHAT SELECIONADO */}
        {selectedChat && status === 'connected' && (
          <>
            {/* Header do chat */}
            <div style={{ 
              padding: '16px 24px', 
              backgroundColor: 'white',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                {selectedChat.name ? selectedChat.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '2px'
                }}>
                  {selectedChat.name || 'Chat sem nome'}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666'
                }}>
                  {normalizeId(selectedChat.id?._serialized)} • 🟢 Online • {chatMessages.length} mensagens
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s ease'
                }}>🔍</button>
                <button style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s ease'
                }}>⋮</button>
              </div>
            </div>

            {/* Área de mensagens */}
            <div 
              style={{ 
                flex: 1, 
                padding: '24px', 
                overflowY: 'auto',
                backgroundColor: '#f0f2f5',
                ...(dragOver && {
                  backgroundColor: `rgba(43,76,140,0.1)`,
                  border: `2px dashed #2B4C8C`
                })
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {chatMessages.length > 0 ? (
                <>
                  {chatMessages.map((msg, index) => {
                    const showDateSeparator = index === 0 || 
                      new Date((msg.timestamp || msg.date || msg.createdAt || 0) * 1000).toDateString() !== 
                      new Date((chatMessages[index - 1]?.timestamp || chatMessages[index - 1]?.date || chatMessages[index - 1]?.createdAt || 0) * 1000).toDateString();

                    return (
                      <React.Fragment key={`fragment_${msg.id}_${index}`}>
                        {showDateSeparator && (
                          <div style={{
                            textAlign: 'center',
                            margin: '16px 0',
                            position: 'relative'
                          }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              borderRadius: '12px',
                              fontSize: '12px',
                              color: '#666',
                              border: '1px solid #e0e0e0'
                            }}>
                              {new Date((msg.timestamp || msg.date || msg.createdAt || 0) * 1000).toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                        {renderMessage(msg, index)}
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#666',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '72px', marginBottom: '16px' }}>💬</div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                    {messageLoadError || 'Nenhuma mensagem ainda'}
                  </h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                    {messageLoadError ? 'Verifique o console para mais detalhes' : 'Inicie a conversa enviando uma mensagem'}
                  </p>
                  <small style={{ fontSize: '12px', color: '#999' }}>
                    Chat: {selectedChat.name}<br/>
                    ID: {selectedChat.id?._serialized}<br/>
                    Mensagens no sistema: {messages.length}<br/>
                    Status: {status}
                  </small>
                </div>
              )}
            </div>

            {/* Input de mensagem */}
            <div style={{ 
              padding: '16px 24px', 
              backgroundColor: 'white',
              borderTop: '1px solid #e0e0e0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '12px'
              }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s ease'
                  }}
                  title="Anexar arquivo"
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  📎
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '24px',
                    outline: 'none',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2B4C8C'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />

                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s ease'
                  }}
                  title="Adicionar emoji"
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  😊
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: newMessage.trim() ? '#25D366' : '#ccc',
                    color: 'white',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: newMessage.trim() ? '0 2px 8px rgba(37, 211, 102, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (newMessage.trim()) {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.backgroundColor = '#20B954';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newMessage.trim()) {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.backgroundColor = '#25D366';
                    }
                  }}
                >
                  ↗️
                </button>
              </div>
            </div>
          </>
        )}

        {/* ESTADO VAZIO */}
        {!selectedChat && status === 'connected' && (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#666',
            backgroundColor: 'white',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '96px', 
              marginBottom: '24px',
              opacity: 0.3 
            }}>
              💬
            </div>
            <h2 style={{ 
              fontSize: '24px',
              color: '#2B4C8C',
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              Selecione uma conversa
            </h2>
            <p style={{ 
              fontSize: '16px',
              color: '#666',
              margin: 0
            }}>
              Escolha uma conversa na lista ao lado para começar
            </p>
          </div>
        )}

        {/* CARREGANDO */}
        {(status === 'connecting' || loading) && (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'white'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #2B4C8C',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '24px'
            }}></div>
            <h3 style={{ color: '#2B4C8C', marginBottom: '8px' }}>
              {status === 'connecting' ? 'Conectando ao WhatsApp...' : 'Carregando...'}
            </h3>
            <p style={{ color: '#666', textAlign: 'center' }}>
              {status === 'connecting' ? 'Estabelecendo conexão segura' : 'Aguarde um momento'}
            </p>
          </div>
        )}

        {/* ERRO */}
        {(status === 'error' || status === 'disconnected') && error && (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'white'
          }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>❌</div>
            <h3 style={{ color: '#EF4444', marginBottom: '8px' }}>Erro de Conexão</h3>
            <p style={{ 
              color: '#666', 
              textAlign: 'center', 
              maxWidth: '400px',
              marginBottom: '24px'
            }}>
              {error}
            </p>
            <button 
              onClick={connect}
              style={{
                padding: '12px 24px',
                backgroundColor: '#2B4C8C',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              🔄 Tentar Novamente
            </button>
          </div>
        )}
      </div>

      {/* CSS para animação de loading */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;