// client/src/components/chat/MessageList.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE LISTA DE MENSAGENS
// Container inteligente com scroll virtual e carregamento automático
// =====================================

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useWhatsApp } from '../../contexts/WhatsAppContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import MessageBubble from './MessageBubble';

// Cores PRIMEM
const PRIMEM_COLORS = {
  primary: '#2B4C8C',
  secondary: '#C97A4A',
  accent: '#8B9DC3',
  success: '#10B981',
  background: '#f0f2f5'
};

const MessageList = ({ 
  chatId,
  onMessageClick,
  onMediaClick,
  onFileDownload,
  onMessageReply,
  onMessageDelete,
  showAvatars = true,
  showTimestamps = true,
  showDateSeparators = true,
  autoScroll = true,
  loadMoreOnScroll = true,
  messagesPerPage = 50,
  className = '',
  style = {}
}) => {
  // ====================================
  // CONTEXTOS E ESTADOS
  // ====================================
  const { 
    messages, 
    loadChatMessages, 
    selectedChat, 
    userInfo 
  } = useWhatsApp();
  
  const { settings } = useSettingsContext();

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [scrollPosition, setScrollPosition] = useState('bottom');
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [lastReadMessage, setLastReadMessage] = useState(null);

  // ====================================
  // REFS
  // ====================================
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const observerRef = useRef(null);
  const loadMoreObserverRef = useRef(null);
  const lastScrollTop = useRef(0);
  const isUserScrolling = useRef(false);
  const autoScrollTimeout = useRef(null);

  // ====================================
  // MENSAGENS DO CHAT ATUAL
  // ====================================
  const chatMessages = useMemo(() => {
    if (!chatId || !messages[chatId]) return [];
    return messages[chatId] || [];
  }, [chatId, messages]);

  // ====================================
  // AGRUPAR MENSAGENS POR DATA
  // ====================================
  const groupedMessages = useMemo(() => {
    if (!showDateSeparators) return [{ type: 'messages', messages: chatMessages }];

    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    chatMessages.forEach(message => {
      const messageDate = new Date(message.timestamp).toDateString();
      
      if (currentDate !== messageDate) {
        // Adicionar grupo anterior se existir
        if (currentGroup.length > 0) {
          groups.push({ type: 'messages', messages: currentGroup });
          currentGroup = [];
        }
        
        // Adicionar separador de data
        groups.push({ 
          type: 'date-separator', 
          date: messageDate,
          timestamp: message.timestamp 
        });
        
        currentDate = messageDate;
      }
      
      currentGroup.push(message);
    });

    // Adicionar último grupo
    if (currentGroup.length > 0) {
      groups.push({ type: 'messages', messages: currentGroup });
    }

    return groups;
  }, [chatMessages, showDateSeparators]);

  // ====================================
  // CARREGAR MENSAGENS INICIAIS
  // ====================================
  useEffect(() => {
    if (chatId && loadChatMessages) {
      setLoading(true);
      loadChatMessages(chatId)
        .then(() => {
          setLoading(false);
          if (autoScroll) {
            scrollToBottom(false);
          }
        })
        .catch(error => {
          console.error('Erro ao carregar mensagens:', error);
          setLoading(false);
        });
    }
  }, [chatId, loadChatMessages, autoScroll]);

  // ====================================
  // AUTO-SCROLL PARA NOVAS MENSAGENS
  // ====================================
  useEffect(() => {
    if (autoScroll && chatMessages.length > 0 && !isUserScrolling.current) {
      // Delay para garantir que a mensagem foi renderizada
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }
  }, [chatMessages.length, autoScroll]);

  // ====================================
  // OBSERVADOR DE SCROLL
  // ====================================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      // Detectar se usuário está fazendo scroll manual
      if (Math.abs(scrollTop - lastScrollTop.current) > 50) {
        isUserScrolling.current = true;
        
        // Limpar timeout anterior
        if (autoScrollTimeout.current) {
          clearTimeout(autoScrollTimeout.current);
        }
        
        // Resetar após 2 segundos sem scroll
        autoScrollTimeout.current = setTimeout(() => {
          isUserScrolling.current = false;
        }, 2000);
      }
      
      lastScrollTop.current = scrollTop;
      
      // Mostrar/ocultar botão "ir para baixo"
      setShowScrollToBottom(!isAtBottom && chatMessages.length > 10);
      
      // Carregar mais mensagens se próximo do topo
      if (loadMoreOnScroll && scrollTop < 200 && hasMoreMessages && !loadingMore) {
        loadMoreMessages();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [chatMessages.length, hasMoreMessages, loadingMore, loadMoreOnScroll]);

  // ====================================
  // OBSERVADOR DE VISIBILIDADE
  // ====================================
  useEffect(() => {
    if (!containerRef.current) return;

    const options = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.5
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const messageId = entry.target.dataset.messageId;
          if (messageId && !lastReadMessage) {
            setLastReadMessage(messageId);
          }
        }
      });
    }, options);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lastReadMessage]);

  // ====================================
  // CARREGAR MAIS MENSAGENS
  // ====================================
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMoreMessages || !chatId) return;

    setLoadingMore(true);
    
    try {
      // Simular carregamento de mensagens mais antigas
      // Em um app real, faria chamada para API com offset
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Por enquanto, simular que não há mais mensagens após primeira carga
      setHasMoreMessages(false);
      
    } catch (error) {
      console.error('Erro ao carregar mais mensagens:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMoreMessages, chatId]);

  // ====================================
  // SCROLL TO BOTTOM
  // ====================================
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  }, []);

  // ====================================
  // FORMATAÇÃO DE DATA
  // ====================================
  const formatDateSeparator = useCallback((timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Hoje';
    if (isYesterday) return 'Ontem';

    // Se for esta semana, mostrar dia da semana
    const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'long' });
    }

    // Caso contrário, mostrar data completa
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  // ====================================
  // VERIFICAR SE MENSAGEM É MINHA
  // ====================================
  const isFromMe = useCallback((message) => {
    return message.fromMe || 
           (userInfo && message.from?.includes(userInfo.number)) ||
           message.author === 'me';
  }, [userInfo]);

  // ====================================
  // RENDERIZAR SEPARADOR DE DATA
  // ====================================
  const renderDateSeparator = useCallback((date, timestamp) => {
    return (
      <div key={`date-${timestamp}`} style={styles.dateSeparator}>
        <div style={styles.dateSeparatorLine}></div>
        <div style={styles.dateSeparatorText}>
          {formatDateSeparator(timestamp)}
        </div>
        <div style={styles.dateSeparatorLine}></div>
      </div>
    );
  }, [formatDateSeparator]);

  // ====================================
  // RENDERIZAR INDICADOR DE LOADING
  // ====================================
  const renderLoadingIndicator = () => {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <div style={styles.loadingText}>Carregando mensagens...</div>
      </div>
    );
  };

  // ====================================
  // RENDERIZAR LOAD MORE
  // ====================================
  const renderLoadMoreIndicator = () => {
    if (!loadingMore) return null;

    return (
      <div style={styles.loadMoreContainer}>
        <div style={styles.loadMoreSpinner}></div>
        <span>Carregando mensagens anteriores...</span>
      </div>
    );
  };

  // ====================================
  // RENDERIZAR ESTADO VAZIO
  // ====================================
  const renderEmptyState = () => {
    if (loading) return renderLoadingIndicator();

    if (!selectedChat) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💬</div>
          <div style={styles.emptyTitle}>Selecione uma conversa</div>
          <div style={styles.emptySubtitle}>
            Escolha uma conversa da lista para começar a enviar mensagens
          </div>
        </div>
      );
    }

    if (chatMessages.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🎉</div>
          <div style={styles.emptyTitle}>Inicie uma conversa</div>
          <div style={styles.emptySubtitle}>
            Envie uma mensagem para {selectedChat?.name || 'este contato'}
          </div>
        </div>
      );
    }

    return null;
  };

  // ====================================
  // RENDERIZAR BOTÃO SCROLL TO BOTTOM
  // ====================================
  const renderScrollToBottomButton = () => {
    if (!showScrollToBottom) return null;

    return (
      <button
        style={styles.scrollToBottomButton}
        onClick={() => scrollToBottom(true)}
        title="Ir para a última mensagem"
      >
        ⬇️
      </button>
    );
  };

  // ====================================
  // RENDERIZAR MENSAGENS
  // ====================================
  const renderMessages = useCallback(() => {
    return groupedMessages.map((group, groupIndex) => {
      if (group.type === 'date-separator') {
        return renderDateSeparator(group.date, group.timestamp);
      }

      return group.messages.map((message, messageIndex) => {
        const messageIsFromMe = isFromMe(message);
        const showAvatar = showAvatars && !messageIsFromMe;

        // Verificar se deve mostrar avatar (última mensagem do contato em sequência)
        const nextMessage = group.messages[messageIndex + 1];
        const shouldShowAvatar = showAvatar && (
          !nextMessage || 
          isFromMe(nextMessage) || 
          nextMessage.from !== message.from
        );

        return (
          <div
            key={message.id}
            data-message-id={message.id}
            ref={messageIndex === group.messages.length - 1 ? 
              (el) => {
                if (el && observerRef.current) {
                  observerRef.current.observe(el);
                }
              } : null
            }
          >
            <MessageBubble
              message={message}
              isFromMe={messageIsFromMe}
              showAvatar={shouldShowAvatar}
              showTimestamp={showTimestamps}
              onMediaClick={onMediaClick}
              onFileDownload={onFileDownload}
              onMessageReply={() => onMessageReply?.(message)}
              onMessageDelete={() => onMessageDelete?.(message)}
              style={{
                marginBottom: messageIndex === group.messages.length - 1 ? '16px' : '4px'
              }}
            />
          </div>
        );
      });
    });
  }, [
    groupedMessages, 
    isFromMe, 
    showAvatars, 
    showTimestamps,
    onMediaClick,
    onFileDownload,
    onMessageReply,
    onMessageDelete,
    renderDateSeparator
  ]);

  // ====================================
  // ESTILOS
  // ====================================
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: settings?.theme?.backgroundColor || PRIMEM_COLORS.background,
      position: 'relative',
      ...style
    },

    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '8px 0',
      scrollBehavior: 'smooth'
    },

    loadMoreContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '16px',
      color: '#6b7280',
      fontSize: '14px'
    },

    loadMoreSpinner: {
      width: '16px',
      height: '16px',
      border: '2px solid #f3f3f3',
      borderTop: '2px solid #6b7280',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },

    dateSeparator: {
      display: 'flex',
      alignItems: 'center',
      margin: '20px 16px',
      gap: '16px'
    },

    dateSeparatorLine: {
      flex: 1,
      height: '1px',
      backgroundColor: '#e0e0e0'
    },

    dateSeparatorText: {
      backgroundColor: 'white',
      color: '#6b7280',
      fontSize: '12px',
      fontWeight: '500',
      padding: '4px 12px',
      borderRadius: '12px',
      border: '1px solid #e0e0e0',
      whiteSpace: 'nowrap'
    },

    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '16px',
      color: '#6b7280'
    },

    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #6b7280',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },

    loadingText: {
      fontSize: '16px'
    },

    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px 20px',
      textAlign: 'center'
    },

    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px',
      opacity: 0.5
    },

    emptyTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px'
    },

    emptySubtitle: {
      fontSize: '14px',
      color: '#6b7280',
      lineHeight: '1.5',
      maxWidth: '300px'
    },

    scrollToBottomButton: {
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      border: 'none',
      backgroundColor: PRIMEM_COLORS.primary,
      color: 'white',
      fontSize: '20px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    },

    messagesEnd: {
      height: '1px'
    }
  };

  // ====================================
  // ADICIONAR ESTILOS CSS
  // ====================================
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.querySelector('#message-list-styles')) {
      const style = document.createElement('style');
      style.id = 'message-list-styles';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .message-list-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .message-list-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .message-list-container::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        .message-list-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        
        .scroll-to-bottom-button:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
        }
        
        .scroll-to-bottom-button:active {
          transform: scale(0.95) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // ====================================
  // LIMPEZA
  // ====================================
  useEffect(() => {
    return () => {
      if (autoScrollTimeout.current) {
        clearTimeout(autoScrollTimeout.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // ====================================
  // RENDERIZAÇÃO PRINCIPAL
  // ====================================
  return (
    <div className={className} style={styles.container}>
      {/* Container de mensagens */}
      <div 
        ref={containerRef}
        style={styles.messagesContainer}
        className="message-list-container"
      >
        {/* Indicador de carregamento de mais mensagens */}
        {renderLoadMoreIndicator()}

        {/* Conteúdo principal */}
        {chatMessages.length > 0 ? (
          <>
            {/* Lista de mensagens */}
            {renderMessages()}
            
            {/* Âncora para scroll to bottom */}
            <div ref={messagesEndRef} style={styles.messagesEnd} />
          </>
        ) : (
          /* Estado vazio */
          renderEmptyState()
        )}
      </div>

      {/* Botão scroll to bottom */}
      {renderScrollToBottomButton()}
    </div>
  );
};

// ====================================
// PROP TYPES
// ====================================
MessageList.propTypes = {
  chatId: PropTypes.string,
  onMessageClick: PropTypes.func,
  onMediaClick: PropTypes.func,
  onFileDownload: PropTypes.func,
  onMessageReply: PropTypes.func,
  onMessageDelete: PropTypes.func,
  showAvatars: PropTypes.bool,
  showTimestamps: PropTypes.bool,
  showDateSeparators: PropTypes.bool,
  autoScroll: PropTypes.bool,
  loadMoreOnScroll: PropTypes.bool,
  messagesPerPage: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object
};

export default MessageList;