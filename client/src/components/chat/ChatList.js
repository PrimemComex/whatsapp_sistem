// client/src/components/chat/ChatList.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE LISTA DE CONVERSAS
// Lista de chats com busca, filtros e ordenação
// =====================================

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useWhatsApp } from '../../contexts/WhatsAppContext';
import { useSettingsContext } from '../../contexts/SettingsContext';

// Cores PRIMEM
const PRIMEM_COLORS = {
  primary: '#2B4C8C',
  secondary: '#C97A4A',
  accent: '#8B9DC3',
  success: '#10B981',
  background: '#f0f2f5'
};

const ChatList = ({ 
  onChatSelect,
  selectedChatId,
  showSearch = true,
  showFilters = true,
  showNewChatButton = true,
  maxHeight = '100%',
  className = '',
  style = {}
}) => {
  // ====================================
  // CONTEXTOS E ESTADOS
  // ====================================
  const { 
    chats, 
    loading, 
    unreadCount, 
    isTyping, 
    onlineContacts,
    loadChats 
  } = useWhatsApp();
  
  const { settings } = useSettingsContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, groups, contacts
  const [sortBy, setSortBy] = useState('timestamp'); // timestamp, name, unread
  const [showDropdown, setShowDropdown] = useState(false);

  // ====================================
  // FILTROS E ORDENAÇÃO
  // ====================================
  const filteredAndSortedChats = useMemo(() => {
    let filtered = [...(chats || [])];

    // Aplicar busca
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(chat => 
        (chat.name || '').toLowerCase().includes(search) ||
        (chat.lastMessage || '').toLowerCase().includes(search) ||
        (chat.number || '').includes(search)
      );
    }

    // Aplicar filtros
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(chat => (chat.unreadCount || 0) > 0);
        break;
      case 'groups':
        filtered = filtered.filter(chat => chat.isGroup);
        break;
      case 'contacts':
        filtered = filtered.filter(chat => !chat.isGroup);
        break;
      default:
        // 'all' - não filtrar
        break;
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'unread':
          return (b.unreadCount || 0) - (a.unreadCount || 0);
        case 'timestamp':
        default:
          return (b.timestamp || 0) - (a.timestamp || 0);
      }
    });

    return filtered;
  }, [chats, searchTerm, filter, sortBy]);

  // ====================================
  // FORMATAÇÃO DE TEMPO
  // ====================================
  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Hoje - apenas hora
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      // Ontem
      return 'Ontem';
    } else if (diffDays < 7) {
      // Esta semana
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      // Mais antigo
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit',
        month: '2-digit'
      });
    }
  }, []);

  // ====================================
  // RENDERIZAR ITEM DE CHAT
  // ====================================
  const renderChatItem = useCallback((chat) => {
    const chatId = chat.id?._serialized || chat.id;
    const isSelected = selectedChatId === chatId;
    const isOnline = onlineContacts?.has?.(chatId) || false;
    const typingNow = isTyping?.[chatId] || false;
    const hasUnread = (chat.unreadCount || 0) > 0;

    return (
      <div
        key={chatId}
        style={{
          ...styles.chatItem,
          backgroundColor: isSelected ? PRIMEM_COLORS.accent + '20' : 'transparent'
        }}
        onClick={() => onChatSelect && onChatSelect(chat)}
        className="chat-list-item"
      >
        {/* Avatar */}
        <div style={styles.avatarContainer}>
          {chat.avatar ? (
            <img 
              src={chat.avatar} 
              alt={chat.name}
              style={styles.avatar}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div style={{
            ...styles.avatarFallback,
            display: chat.avatar ? 'none' : 'flex'
          }}>
            {chat.isGroup ? '👥' : (chat.name || 'C').charAt(0).toUpperCase()}
          </div>
          
          {/* Indicador online */}
          {!chat.isGroup && isOnline && (
            <div style={styles.onlineIndicator}></div>
          )}
        </div>

        {/* Conteúdo do chat */}
        <div style={styles.chatContent}>
          {/* Linha superior: Nome e timestamp */}
          <div style={styles.chatHeader}>
            <div style={styles.chatName}>
              {chat.name || 'Sem nome'}
            </div>
            <div style={styles.timestamp}>
              {formatTimestamp(chat.timestamp)}
            </div>
          </div>

          {/* Linha inferior: Última mensagem e badge */}
          <div style={styles.chatFooter}>
            <div style={styles.lastMessage}>
              {typingNow ? (
                <span style={styles.typingIndicator}>
                  <span style={styles.typingDots}>
                    <span>•</span>
                    <span>•</span>
                    <span>•</span>
                  </span>
                  digitando...
                </span>
              ) : (
                <span style={{
                  fontWeight: hasUnread ? '600' : 'normal',
                  color: hasUnread ? '#1f2937' : '#6b7280'
                }}>
                  {chat.lastMessage || 'Sem mensagens'}
                </span>
              )}
            </div>
            
            {/* Badge de não lidas */}
            {hasUnread && (
              <div style={styles.unreadBadge}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [selectedChatId, onlineContacts, isTyping, formatTimestamp, onChatSelect]);

  // ====================================
  // RENDERIZAR BARRA DE BUSCA
  // ====================================
  const renderSearchBar = () => {
    if (!showSearch) return null;

    return (
      <div style={styles.searchContainer}>
        <div style={styles.searchInputContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
            className="chat-list-search-input"
          />
          {searchTerm && (
            <button
              style={styles.clearSearchButton}
              onClick={() => setSearchTerm('')}
              title="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  };

  // ====================================
  // RENDERIZAR FILTROS
  // ====================================
  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div style={styles.filtersContainer}>
        <div style={styles.filterTabs}>
          <button
            style={{
              ...styles.filterTab,
              backgroundColor: filter === 'all' ? PRIMEM_COLORS.primary : 'transparent',
              color: filter === 'all' ? 'white' : '#6b7280'
            }}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            style={{
              ...styles.filterTab,
              backgroundColor: filter === 'unread' ? PRIMEM_COLORS.primary : 'transparent',
              color: filter === 'unread' ? 'white' : '#6b7280'
            }}
            onClick={() => setFilter('unread')}
          >
            Não lidas ({unreadCount})
          </button>
          <button
            style={{
              ...styles.filterTab,
              backgroundColor: filter === 'groups' ? PRIMEM_COLORS.primary : 'transparent',
              color: filter === 'groups' ? 'white' : '#6b7280'
            }}
            onClick={() => setFilter('groups')}
          >
            Grupos
          </button>
        </div>

        {/* Dropdown de ordenação */}
        <div style={styles.sortContainer}>
          <button
            style={styles.sortButton}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            ⋯
          </button>
          
          {showDropdown && (
            <div style={styles.sortDropdown}>
              <button
                style={{
                  ...styles.sortOption,
                  fontWeight: sortBy === 'timestamp' ? 'bold' : 'normal'
                }}
                onClick={() => {
                  setSortBy('timestamp');
                  setShowDropdown(false);
                }}
              >
                📅 Mais recentes
              </button>
              <button
                style={{
                  ...styles.sortOption,
                  fontWeight: sortBy === 'name' ? 'bold' : 'normal'
                }}
                onClick={() => {
                  setSortBy('name');
                  setShowDropdown(false);
                }}
              >
                🔤 Nome
              </button>
              <button
                style={{
                  ...styles.sortOption,
                  fontWeight: sortBy === 'unread' ? 'bold' : 'normal'
                }}
                onClick={() => {
                  setSortBy('unread');
                  setShowDropdown(false);
                }}
              >
                📩 Não lidas
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ====================================
  // RENDERIZAR CABEÇALHO
  // ====================================
  const renderHeader = () => {
    return (
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          Conversas ({filteredAndSortedChats.length})
        </div>
        
        {showNewChatButton && (
          <button
            style={styles.newChatButton}
            onClick={() => {
              // TODO: Implementar nova conversa
              console.log('Nova conversa');
            }}
            title="Nova conversa"
          >
            ✏️
          </button>
        )}
      </div>
    );
  };

  // ====================================
  // RENDERIZAR ESTADO VAZIO
  // ====================================
  const renderEmptyState = () => {
    if (loading) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.loadingSpinner}></div>
          <div>Carregando conversas...</div>
        </div>
      );
    }

    if (searchTerm && filteredAndSortedChats.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <div>Nenhuma conversa encontrada</div>
          <div style={styles.emptySubtext}>
            Tente buscar por outro termo
          </div>
        </div>
      );
    }

    if (chats?.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💬</div>
          <div>Nenhuma conversa ainda</div>
          <div style={styles.emptySubtext}>
            Suas conversas aparecerão aqui
          </div>
        </div>
      );
    }

    return null;
  };

  // ====================================
  // EFEITOS
  // ====================================
  useEffect(() => {
    // Fechar dropdown ao clicar fora
    const handleClickOutside = (e) => {
      if (showDropdown && !e.target.closest('.sort-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  // Carregar chats iniciais
  useEffect(() => {
    if (loadChats) {
      loadChats();
    }
  }, [loadChats]);

  // ====================================
  // ESTILOS
  // ====================================
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight,
      backgroundColor: '#ffffff',
      ...style
    },

    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      borderBottom: '1px solid #e0e0e0'
    },

    headerTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1f2937'
    },

    newChatButton: {
      width: '36px',
      height: '36px',
      border: 'none',
      borderRadius: '50%',
      backgroundColor: PRIMEM_COLORS.primary,
      color: 'white',
      cursor: 'pointer',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s ease'
    },

    searchContainer: {
      padding: '12px 16px',
      borderBottom: '1px solid #e0e0e0'
    },

    searchInputContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },

    searchIcon: {
      position: 'absolute',
      left: '12px',
      fontSize: '16px',
      color: '#9ca3af',
      zIndex: 1
    },

    searchInput: {
      width: '100%',
      padding: '10px 40px 10px 40px',
      border: '1px solid #e0e0e0',
      borderRadius: '20px',
      fontSize: '14px',
      outline: 'none',
      backgroundColor: '#f9fafb',
      transition: 'border-color 0.2s ease'
    },

    clearSearchButton: {
      position: 'absolute',
      right: '12px',
      background: 'none',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      color: '#9ca3af',
      padding: '4px'
    },

    filtersContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 16px',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#f9fafb'
    },

    filterTabs: {
      display: 'flex',
      gap: '4px'
    },

    filterTab: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '16px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '500'
    },

    sortContainer: {
      position: 'relative'
    },

    sortButton: {
      width: '32px',
      height: '32px',
      border: 'none',
      borderRadius: '50%',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '16px',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease'
    },

    sortDropdown: {
      position: 'absolute',
      top: '100%',
      right: '0',
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 100,
      minWidth: '160px'
    },

    sortOption: {
      width: '100%',
      padding: '12px 16px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '14px',
      textAlign: 'left',
      transition: 'background-color 0.2s ease'
    },

    chatList: {
      flex: 1,
      overflowY: 'auto',
      scrollbarWidth: 'thin'
    },

    chatItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      borderBottom: '1px solid #f3f4f6'
    },

    avatarContainer: {
      position: 'relative',
      marginRight: '12px',
      flexShrink: 0
    },

    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      objectFit: 'cover'
    },

    avatarFallback: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: PRIMEM_COLORS.accent,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 'bold'
    },

    onlineIndicator: {
      position: 'absolute',
      bottom: '2px',
      right: '2px',
      width: '14px',
      height: '14px',
      backgroundColor: PRIMEM_COLORS.success,
      borderRadius: '50%',
      border: '2px solid white'
    },

    chatContent: {
      flex: 1,
      minWidth: 0
    },

    chatHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '4px'
    },

    chatName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: 1,
      marginRight: '8px'
    },

    timestamp: {
      fontSize: '12px',
      color: '#9ca3af',
      flexShrink: 0
    },

    chatFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },

    lastMessage: {
      fontSize: '14px',
      color: '#6b7280',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: 1,
      marginRight: '8px'
    },

    typingIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: PRIMEM_COLORS.primary,
      fontStyle: 'italic'
    },

    typingDots: {
      display: 'flex',
      gap: '2px'
    },

    unreadBadge: {
      backgroundColor: PRIMEM_COLORS.primary,
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold',
      padding: '2px 8px',
      borderRadius: '12px',
      minWidth: '20px',
      textAlign: 'center',
      flexShrink: 0
    },

    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      color: '#6b7280'
    },

    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    },

    emptySubtext: {
      fontSize: '14px',
      marginTop: '8px',
      color: '#9ca3af'
    },

    loadingSpinner: {
      width: '32px',
      height: '32px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '16px'
    }
  };

  // ====================================
  // ADICIONAR ESTILOS CSS
  // ====================================
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.querySelector('#chat-list-styles')) {
      const style = document.createElement('style');
      style.id = 'chat-list-styles';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .chat-list-item:hover {
          background-color: #f9fafb !important;
        }
        .chat-list-search-input:focus {
          border-color: ${PRIMEM_COLORS.primary} !important;
          background-color: white !important;
        }
        .chat-list-sort-button:hover {
          background-color: #f3f4f6 !important;
        }
        .chat-list-sort-option:hover {
          background-color: #f9fafb !important;
        }
        .chat-list-new-chat-button:hover {
          transform: scale(1.05) !important;
        }
        .chat-list::-webkit-scrollbar {
          width: 6px;
        }
        .chat-list::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .chat-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .chat-list::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // ====================================
  // RENDERIZAÇÃO PRINCIPAL
  // ====================================
  return (
    <div className={className} style={styles.container}>
      {/* Cabeçalho */}
      {renderHeader()}

      {/* Barra de busca */}
      {renderSearchBar()}

      {/* Filtros */}
      {renderFilters()}

      {/* Lista de chats */}
      <div style={styles.chatList} className="chat-list">
        {filteredAndSortedChats.length > 0 ? (
          filteredAndSortedChats.map(renderChatItem)
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
};

// ====================================
// PROP TYPES
// ====================================
ChatList.propTypes = {
  onChatSelect: PropTypes.func,
  selectedChatId: PropTypes.string,
  showSearch: PropTypes.bool,
  showFilters: PropTypes.bool,
  showNewChatButton: PropTypes.bool,
  maxHeight: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object
};

export default ChatList;