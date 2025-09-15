// client/src/layouts/ChatLayout.js
// =====================================
// PRIMEM WHATSAPP - LAYOUT DE CHAT
// Layout otimizado para interface de conversas
// =====================================

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

// Importar componentes
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import Loading from '../components/ui/Loading';

// Importar hooks
import { useAuth } from '../contexts/AuthContext';
import { useWhatsApp } from '../contexts/WhatsAppContext';
import { useSettingsContext } from '../contexts/SettingsContext';

// Cores PRIMEM
const PRIMEM_COLORS = {
  primary: '#2B4C8C',
  secondary: '#C97A4A',
  accent: '#8B9DC3',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  background: '#f0f2f5',
  white: '#ffffff',
  text: '#374151'
};

const ChatLayout = ({
  children,
  chats = [],
  selectedChatId,
  onChatSelect,
  searchTerm = '',
  onSearchChange,
  whatsappStatus,
  showHeader = true,
  showFooter = false,
  showChatList = true,
  showSearchBar = true,
  showConnectionStatus = true,
  showQuickActions = true,
  chatListWidth = '350px',
  headerProps = {},
  footerProps = {},
  className = '',
  style = {}
}) => {
  // ====================================
  // CONTEXTOS E HOOKS
  // ====================================
  const { user, logout } = useAuth();
  const { 
    messages,
    isConnecting,
    connectWhatsApp,
    disconnectWhatsApp
  } = useWhatsApp();
  
  const { settings } = useSettingsContext();

  // ====================================
  // ESTADOS LOCAIS
  // ====================================
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMobileChatList, setShowMobileChatList] = useState(true);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [filteredChats, setFilteredChats] = useState(chats);
  const [chatListCollapsed, setChatListCollapsed] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());

  // ====================================
  // EFEITOS
  // ====================================
  useEffect(() => {
    // Responsividade
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Em mobile, mostrar lista de chats apenas se nenhum chat estiver selecionado
      if (mobile && selectedChatId) {
        setShowMobileChatList(false);
      } else if (mobile && !selectedChatId) {
        setShowMobileChatList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Executar imediatamente

    return () => window.removeEventListener('resize', handleResize);
  }, [selectedChatId]);

  useEffect(() => {
    // Sincronizar termo de busca
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    // Filtrar chats baseado no termo de busca
    const filtered = chats.filter(chat => {
      const matchesName = chat.name.toLowerCase().includes(localSearchTerm.toLowerCase());
      const matchesPhone = chat.id._serialized.includes(localSearchTerm);
      const lastMessage = getLastMessage(chat);
      const matchesMessage = lastMessage && 
        lastMessage.toLowerCase().includes(localSearchTerm.toLowerCase());
      
      return matchesName || matchesPhone || matchesMessage;
    });

    setFilteredChats(filtered);
  }, [chats, localSearchTerm]);

  // ====================================
  // FUNÇÕES AUXILIARES
  // ====================================
  const getLastMessage = (chat) => {
    const chatMessages = messages.filter(msg => 
      msg.from === chat.id._serialized || 
      msg.to === chat.id._serialized
    );
    
    if (chatMessages.length === 0) return null;
    
    const lastMsg = chatMessages[chatMessages.length - 1];
    
    if (lastMsg.hasMedia) {
      return getMediaTypeText(lastMsg);
    }
    
    return lastMsg.body || 'Mensagem sem texto';
  };

  const getMediaTypeText = (message) => {
    if (!message.hasMedia) return '';
    
    const mimeType = message.media?.mimetype || '';
    
    if (mimeType.startsWith('image/')) return '📷 Foto';
    if (mimeType.startsWith('video/')) return '🎥 Vídeo';
    if (mimeType.startsWith('audio/')) return '🎵 Áudio';
    if (mimeType.includes('pdf')) return '📄 PDF';
    if (mimeType.includes('document')) return '📎 Documento';
    
    return '📎 Arquivo';
  };

  const getLastMessageTime = (chat) => {
    const chatMessages = messages.filter(msg => 
      msg.from === chat.id._serialized || 
      msg.to === chat.id._serialized
    );
    
    if (chatMessages.length === 0) return '';
    
    const lastMsg = chatMessages[chatMessages.length - 1];
    const date = new Date(lastMsg.timestamp);
    
    // Se foi hoje, mostrar só a hora
    if (isToday(date)) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Se foi essa semana, mostrar dia da semana
    if (isThisWeek(date)) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    }
    
    // Senão, mostrar data
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisWeek = (date) => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo && date <= today;
  };

  const getUnreadCount = (chat) => {
    return messages.filter(msg => 
      msg.from === chat.id._serialized && 
      !msg.fromMe &&
      !msg.isRead
    ).length;
  };

  const getChatStatusIcon = (chat) => {
    if (onlineUsers.has(chat.id._serialized)) {
      return '🟢'; // Online
    }
    if (typingUsers.has(chat.id._serialized)) {
      return '✏️'; // Digitando
    }
    return '⚫'; // Offline
  };

  // ====================================
  // HANDLERS
  // ====================================
  const handleSearchChange = useCallback((value) => {
    setLocalSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  }, [onSearchChange]);

  const handleChatSelect = (chat) => {
    if (onChatSelect) {
      onChatSelect(chat);
    }
    
    // Em mobile, esconder lista de chats após seleção
    if (isMobile) {
      setShowMobileChatList(false);
    }
  };

  const handleBackToList = () => {
    if (isMobile) {
      setShowMobileChatList(true);
    }
  };

  const handleChatListToggle = () => {
    setChatListCollapsed(prev => !prev);
  };

  const handleLogout = () => {
    logout();
  };

  // ====================================
  // ESTILOS
  // ====================================
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: PRIMEM_COLORS.background,
      ...style
    },

    mainContainer: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden'
    },

    // LISTA DE CHATS
    chatListContainer: {
      width: chatListCollapsed ? '70px' : chatListWidth,
      backgroundColor: PRIMEM_COLORS.white,
      borderRight: `1px solid ${PRIMEM_COLORS.accent}20`,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      ...(isMobile && {
        position: 'absolute',
        left: showMobileChatList ? 0 : '-100%',
        top: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '380px',
        zIndex: 100,
        transition: 'left 0.3s ease',
        boxShadow: showMobileChatList ? '2px 0 8px rgba(0, 0, 0, 0.1)' : 'none'
      })
    },

    chatListHeader: {
      padding: '16px',
      borderBottom: `1px solid ${PRIMEM_COLORS.accent}20`,
      backgroundColor: PRIMEM_COLORS.primary,
      color: PRIMEM_COLORS.white
    },

    chatListTitle: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: showSearchBar ? '12px' : '0'
    },

    chatListTitleText: {
      fontSize: '18px',
      fontWeight: '700'
    },

    collapseButton: {
      background: 'none',
      border: 'none',
      color: PRIMEM_COLORS.white,
      fontSize: '18px',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: `${PRIMEM_COLORS.white}20`
      }
    },

    searchContainer: {
      position: 'relative'
    },

    searchInput: {
      width: '100%',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '20px',
      backgroundColor: `${PRIMEM_COLORS.white}20`,
      color: PRIMEM_COLORS.white,
      fontSize: '14px',
      '&::placeholder': {
        color: `${PRIMEM_COLORS.white}70`
      }
    },

    chatList: {
      flex: 1,
      overflow: 'auto'
    },

    chatItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px',
      cursor: 'pointer',
      borderBottom: `1px solid ${PRIMEM_COLORS.accent}10`,
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: PRIMEM_COLORS.background
      }
    },

    chatItemActive: {
      backgroundColor: `${PRIMEM_COLORS.primary}10`,
      borderRight: `4px solid ${PRIMEM_COLORS.primary}`
    },

    chatAvatar: {
      position: 'relative',
      marginRight: chatListCollapsed ? '0' : '12px'
    },

    chatAvatarImage: {
      width: '50px',
      height: '50px',
      borderRadius: '25px',
      backgroundColor: PRIMEM_COLORS.accent,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: '700',
      color: PRIMEM_COLORS.white
    },

    chatStatusIndicator: {
      position: 'absolute',
      bottom: '2px',
      right: '2px',
      fontSize: '12px',
      background: PRIMEM_COLORS.white,
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    chatInfo: {
      flex: 1,
      minWidth: 0,
      display: chatListCollapsed ? 'none' : 'block'
    },

    chatName: {
      fontSize: '16px',
      fontWeight: '600',
      color: PRIMEM_COLORS.text,
      marginBottom: '4px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },

    chatLastMessage: {
      fontSize: '14px',
      color: PRIMEM_COLORS.text,
      opacity: 0.7,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },

    chatMeta: {
      display: chatListCollapsed ? 'none' : 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '4px'
    },

    chatTime: {
      fontSize: '12px',
      color: PRIMEM_COLORS.text,
      opacity: 0.5
    },

    unreadBadge: {
      backgroundColor: PRIMEM_COLORS.success,
      color: PRIMEM_COLORS.white,
      borderRadius: '12px',
      padding: '2px 6px',
      fontSize: '11px',
      fontWeight: '600',
      minWidth: '18px',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    // ÁREA DE CONTEÚDO
    contentArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    },

    contentAreaEmpty: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      flexDirection: 'column',
      backgroundColor: PRIMEM_COLORS.background,
      color: PRIMEM_COLORS.text,
      opacity: 0.7
    },

    emptyStateIcon: {
      fontSize: '64px',
      marginBottom: '16px',
      opacity: 0.5
    },

    emptyStateTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px'
    },

    emptyStateText: {
      fontSize: '14px',
      textAlign: 'center',
      maxWidth: '300px',
      lineHeight: '1.5'
    },

    // BOTÃO DE VOLTAR (MOBILE)
    backButton: {
      position: 'absolute',
      top: '16px',
      left: '16px',
      zIndex: 10,
      backgroundColor: PRIMEM_COLORS.white,
      border: `1px solid ${PRIMEM_COLORS.accent}40`,
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '18px',
      color: PRIMEM_COLORS.primary,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease'
    },

    // CONNECTION STATUS
    connectionBanner: {
      padding: '8px 16px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '600'
    },

    connectionBannerConnecting: {
      backgroundColor: `${PRIMEM_COLORS.warning}20`,
      color: PRIMEM_COLORS.warning
    },

    connectionBannerDisconnected: {
      backgroundColor: `${PRIMEM_COLORS.error}20`,
      color: PRIMEM_COLORS.error
    },

    // LISTA VAZIA
    emptyList: {
      padding: '40px 20px',
      textAlign: 'center',
      color: PRIMEM_COLORS.text,
      opacity: 0.7
    },

    emptyListIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    },

    emptyListTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px'
    },

    emptyListText: {
      fontSize: '14px',
      lineHeight: '1.5'
    }
  };

  // ====================================
  // RENDERIZAÇÃO
  // ====================================
  return (
    <div className={className} style={styles.container}>
      {/* HEADER */}
      {showHeader && (
        <Header
          title={`${filteredChats.length} conversas`}
          subtitle={`WhatsApp ${whatsappStatus === 'connected' ? 'conectado' : 'desconectado'}`}
          user={user}
          whatsappStatus={whatsappStatus}
          onLogout={handleLogout}
          showUserMenu={true}
          showConnectionStatus={showConnectionStatus}
          isMobile={isMobile}
          {...headerProps}
        />
      )}

      {/* CONNECTION STATUS BANNER */}
      {showConnectionStatus && whatsappStatus !== 'connected' && (
        <div 
          style={{
            ...styles.connectionBanner,
            ...(whatsappStatus === 'connecting' 
              ? styles.connectionBannerConnecting 
              : styles.connectionBannerDisconnected
            )
          }}
        >
          {whatsappStatus === 'connecting' && (
            <>
              ⏳ Conectando WhatsApp... {isConnecting && <Loading size="small" />}
            </>
          )}
          {whatsappStatus === 'disconnected' && (
            <>
              ❌ WhatsApp desconectado - 
              <Button
                onClick={connectWhatsApp}
                style={{ 
                  marginLeft: '8px',
                  fontSize: '12px',
                  padding: '2px 8px',
                  backgroundColor: PRIMEM_COLORS.error
                }}
              >
                Conectar
              </Button>
            </>
          )}
        </div>
      )}

      {/* CONTAINER PRINCIPAL */}
      <div style={styles.mainContainer}>
        {/* LISTA DE CHATS */}
        {showChatList && (
          <div style={styles.chatListContainer}>
            <div style={styles.chatListHeader}>
              <div style={styles.chatListTitle}>
                <span style={styles.chatListTitleText}>
                  {chatListCollapsed ? '💬' : '💬 Conversas'}
                </span>
                {!isMobile && (
                  <button
                    style={styles.collapseButton}
                    onClick={handleChatListToggle}
                    title={chatListCollapsed ? 'Expandir' : 'Recolher'}
                  >
                    {chatListCollapsed ? '▶️' : '◀️'}
                  </button>
                )}
              </div>
              
              {showSearchBar && !chatListCollapsed && (
                <div style={styles.searchContainer}>
                  <Input
                    value={localSearchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Buscar conversas..."
                    style={styles.searchInput}
                  />
                </div>
              )}
            </div>

            <div style={styles.chatList}>
              {filteredChats.length === 0 ? (
                <div style={styles.emptyList}>
                  <div style={styles.emptyListIcon}>💬</div>
                  {localSearchTerm ? (
                    <>
                      <div style={styles.emptyListTitle}>
                        Nenhuma conversa encontrada
                      </div>
                      <div style={styles.emptyListText}>
                        Tente buscar por outro termo
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={styles.emptyListTitle}>
                        Nenhuma conversa ainda
                      </div>
                      <div style={styles.emptyListText}>
                        Aguarde mensagens chegarem no WhatsApp
                      </div>
                    </>
                  )}
                </div>
              ) : (
                filteredChats.map(chat => {
                  const isActive = selectedChatId === chat.id._serialized;
                  const unreadCount = getUnreadCount(chat);
                  const lastMessage = getLastMessage(chat);
                  const lastMessageTime = getLastMessageTime(chat);
                  
                  return (
                    <div
                      key={chat.id._serialized}
                      style={{
                        ...styles.chatItem,
                        ...(isActive ? styles.chatItemActive : {})
                      }}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <div style={styles.chatAvatar}>
                        <div style={styles.chatAvatarImage}>
                          {chat.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={styles.chatStatusIndicator}>
                          {getChatStatusIcon(chat)}
                        </div>
                      </div>

                      <div style={styles.chatInfo}>
                        <div style={styles.chatName}>
                          {chat.name}
                        </div>
                        {lastMessage && (
                          <div style={styles.chatLastMessage}>
                            {lastMessage.length > 35 
                              ? `${lastMessage.slice(0, 35)}...` 
                              : lastMessage}
                          </div>
                        )}
                      </div>

                      <div style={styles.chatMeta}>
                        {lastMessageTime && (
                          <div style={styles.chatTime}>
                            {lastMessageTime}
                          </div>
                        )}
                        {unreadCount > 0 && (
                          <div style={styles.unreadBadge}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ÁREA DE CONTEÚDO */}
        <div style={styles.contentArea}>
          {/* BOTÃO VOLTAR (MOBILE) */}
          {isMobile && !showMobileChatList && (
            <button
              style={styles.backButton}
              onClick={handleBackToList}
              title="Voltar para lista"
            >
              ←
            </button>
          )}

          {/* CONTEÚDO */}
          {children || (
            <div style={styles.contentAreaEmpty}>
              <div style={styles.emptyStateIcon}>💬</div>
              <div style={styles.emptyStateTitle}>
                Selecione uma conversa
              </div>
              <div style={styles.emptyStateText}>
                Escolha uma conversa da lista para começar a enviar mensagens
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      {showFooter && (
        <Footer
          whatsappStatus={whatsappStatus}
          showConnectionStatus={showConnectionStatus}
          {...footerProps}
        />
      )}
    </div>
  );
};

// ====================================
// PROP TYPES
// ====================================
ChatLayout.propTypes = {
  children: PropTypes.node,
  chats: PropTypes.array,
  selectedChatId: PropTypes.string,
  onChatSelect: PropTypes.func,
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  whatsappStatus: PropTypes.string,
  showHeader: PropTypes.bool,
  showFooter: PropTypes.bool,
  showChatList: PropTypes.bool,
  showSearchBar: PropTypes.bool,
  showConnectionStatus: PropTypes.bool,
  showQuickActions: PropTypes.bool,
  chatListWidth: PropTypes.string,
  headerProps: PropTypes.object,
  footerProps: PropTypes.object,
  className: PropTypes.string,
  style: PropTypes.object
};

export default ChatLayout;