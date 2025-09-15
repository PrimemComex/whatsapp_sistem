// client/src/components/chat/ChatHeader.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE CABEÇALHO DO CHAT
// Cabeçalho com informações do contato e ações do chat
// =====================================

import React, { useState, useCallback, useEffect } from 'react';
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

const ChatHeader = ({ 
  chat,
  onBackClick,
  onSearchClick,
  onCallClick,
  onVideoCallClick,
  onMenuClick,
  onContactClick,
  showBackButton = false,
  showActions = true,
  className = '',
  style = {}
}) => {
  // ====================================
  // CONTEXTOS E ESTADOS
  // ====================================
  const { isTyping, onlineContacts, lastSeen } = useWhatsApp();
  const { settings } = useSettingsContext();
  const [showContactInfo, setShowContactInfo] = useState(false);

  // ====================================
  // EXTRAIR DADOS DO CHAT
  // ====================================
  const {
    id,
    name = 'Contato',
    avatar = null,
    isGroup = false,
    participants = [],
    description = '',
    unreadCount = 0
  } = chat || {};

  const chatId = id?._serialized || id;
  const isOnline = onlineContacts?.has?.(chatId) || false;
  const lastSeenTime = lastSeen?.[chatId];
  const isTypingNow = isTyping?.[chatId] || false;

  // ====================================
  // FORMATAÇÃO DE STATUS
  // ====================================
  const getStatusText = useCallback(() => {
    if (isTypingNow) {
      return 'digitando...';
    }

    if (isGroup) {
      if (participants.length > 0) {
        return `${participants.length} participantes`;
      }
      return 'Grupo';
    }

    if (isOnline) {
      return 'online';
    }

    if (lastSeenTime) {
      const lastSeenDate = new Date(lastSeenTime);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
      
      if (diffMinutes < 1) {
        return 'visto agora';
      } else if (diffMinutes < 60) {
        return `visto há ${diffMinutes} min`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) {
          return `visto há ${diffHours}h`;
        } else {
          const diffDays = Math.floor(diffHours / 24);
          return `visto há ${diffDays}d`;
        }
      }
    }

    return 'offline';
  }, [isTypingNow, isGroup, participants.length, isOnline, lastSeenTime]);

  // ====================================
  // RENDERIZAR AVATAR
  // ====================================
  const renderAvatar = () => {
    return (
      <div style={styles.avatarContainer}>
        {avatar ? (
          <img 
            src={avatar} 
            alt={name}
            style={styles.avatar}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div style={{
          ...styles.avatarFallback,
          display: avatar ? 'none' : 'flex'
        }}>
          {isGroup ? '👥' : name.charAt(0).toUpperCase()}
        </div>
        
        {/* Indicador online */}
        {!isGroup && isOnline && (
          <div style={styles.onlineIndicator}></div>
        )}
      </div>
    );
  };

  // ====================================
  // RENDERIZAR INFORMAÇÕES DO CONTATO
  // ====================================
  const renderContactInfo = () => {
    return (
      <div 
        style={styles.contactInfo}
        onClick={() => onContactClick && onContactClick(chat)}
      >
        <div style={styles.contactName}>
          {name}
          {unreadCount > 0 && (
            <span style={styles.unreadBadge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <div style={{
          ...styles.contactStatus,
          color: isTypingNow ? PRIMEM_COLORS.primary : styles.contactStatus.color
        }}>
          {getStatusText()}
        </div>
      </div>
    );
  };

  // ====================================
  // RENDERIZAR AÇÕES
  // ====================================
  const renderActions = () => {
    if (!showActions) return null;

    return (
      <div style={styles.actions}>
        {/* Buscar */}
        <button
          style={styles.actionButton}
          onClick={onSearchClick}
          title="Buscar na conversa"
        >
          🔍
        </button>

        {/* Chamada de voz */}
        {!isGroup && (
          <button
            style={styles.actionButton}
            onClick={onCallClick}
            title="Chamada de voz"
          >
            📞
          </button>
        )}

        {/* Chamada de vídeo */}
        {!isGroup && (
          <button
            style={styles.actionButton}
            onClick={onVideoCallClick}
            title="Chamada de vídeo"
          >
            📹
          </button>
        )}

        {/* Menu */}
        <button
          style={styles.actionButton}
          onClick={onMenuClick}
          title="Mais opções"
        >
          ⋮
        </button>
      </div>
    );
  };

  // ====================================
  // RENDERIZAR INFORMAÇÕES DETALHADAS
  // ====================================
  const renderDetailedInfo = () => {
    if (!showContactInfo) return null;

    return (
      <div style={styles.detailedInfo}>
        <div style={styles.detailedContent}>
          <div style={styles.detailedHeader}>
            <div style={styles.detailedAvatar}>
              {renderAvatar()}
            </div>
            <div style={styles.detailedText}>
              <div style={styles.detailedName}>{name}</div>
              <div style={styles.detailedPhone}>
                {chat?.number || 'Número não disponível'}
              </div>
            </div>
          </div>

          {isGroup && (
            <div style={styles.groupInfo}>
              <div style={styles.groupDescription}>
                {description || 'Sem descrição'}
              </div>
              <div style={styles.participantsList}>
                <strong>Participantes ({participants.length}):</strong>
                {participants.slice(0, 5).map((participant, index) => (
                  <div key={index} style={styles.participant}>
                    {participant.name || participant.number}
                  </div>
                ))}
                {participants.length > 5 && (
                  <div style={styles.moreParticipants}>
                    +{participants.length - 5} mais
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={styles.detailedActions}>
            <button style={styles.detailedActionButton}>
              📋 Informações
            </button>
            <button style={styles.detailedActionButton}>
              🔇 Silenciar
            </button>
            <button style={styles.detailedActionButton}>
              🗑️ Limpar conversa
            </button>
          </div>
        </div>
        <div 
          style={styles.detailedOverlay}
          onClick={() => setShowContactInfo(false)}
        ></div>
      </div>
    );
  };

  // ====================================
  // MANIPULADORES DE EVENTOS
  // ====================================
  const handleContactInfoToggle = () => {
    setShowContactInfo(!showContactInfo);
    if (onContactClick) {
      onContactClick(chat);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && showContactInfo) {
      setShowContactInfo(false);
    }
  };

  // ====================================
  // EFEITOS
  // ====================================
  useEffect(() => {
    if (showContactInfo) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showContactInfo]);

  // ====================================
  // ESTILOS
  // ====================================
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e0e0e0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      zIndex: 10,
      ...style
    },

    backButton: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '8px',
      marginRight: '8px',
      borderRadius: '50%',
      transition: 'background-color 0.2s ease',
      color: PRIMEM_COLORS.primary
    },

    avatarContainer: {
      position: 'relative',
      marginRight: '12px',
      cursor: 'pointer'
    },

    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      objectFit: 'cover'
    },

    avatarFallback: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: PRIMEM_COLORS.accent,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold'
    },

    onlineIndicator: {
      position: 'absolute',
      bottom: '2px',
      right: '2px',
      width: '12px',
      height: '12px',
      backgroundColor: PRIMEM_COLORS.success,
      borderRadius: '50%',
      border: '2px solid white'
    },

    contactInfo: {
      flex: 1,
      cursor: 'pointer',
      userSelect: 'none'
    },

    contactName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '2px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },

    contactStatus: {
      fontSize: '13px',
      color: '#6b7280',
      fontStyle: isTypingNow ? 'italic' : 'normal'
    },

    unreadBadge: {
      backgroundColor: PRIMEM_COLORS.primary,
      color: 'white',
      fontSize: '11px',
      fontWeight: 'bold',
      padding: '2px 6px',
      borderRadius: '10px',
      minWidth: '18px',
      textAlign: 'center'
    },

    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },

    actionButton: {
      background: 'none',
      border: 'none',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      transition: 'background-color 0.2s ease',
      color: '#6b7280'
    },

    // Informações detalhadas
    detailedInfo: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '80px'
    },

    detailedOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      cursor: 'pointer'
    },

    detailedContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '400px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto',
      position: 'relative',
      zIndex: 1001,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
    },

    detailedHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px'
    },

    detailedAvatar: {
      marginRight: '16px'
    },

    detailedText: {
      flex: 1
    },

    detailedName: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '4px'
    },

    detailedPhone: {
      fontSize: '14px',
      color: '#6b7280'
    },

    groupInfo: {
      marginBottom: '20px'
    },

    groupDescription: {
      fontSize: '14px',
      color: '#374151',
      marginBottom: '12px',
      padding: '8px',
      backgroundColor: '#f9fafb',
      borderRadius: '6px'
    },

    participantsList: {
      fontSize: '14px'
    },

    participant: {
      padding: '4px 0',
      color: '#374151'
    },

    moreParticipants: {
      padding: '4px 0',
      color: '#6b7280',
      fontStyle: 'italic'
    },

    detailedActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },

    detailedActionButton: {
      padding: '12px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      textAlign: 'left',
      transition: 'background-color 0.2s ease'
    }
  };

  // ====================================
  // ADICIONAR ESTILOS HOVER VIA CSS
  // ====================================
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.querySelector('#chat-header-styles')) {
      const style = document.createElement('style');
      style.id = 'chat-header-styles';
      style.textContent = `
        .chat-header-back-button:hover {
          background-color: rgba(43, 76, 140, 0.1) !important;
        }
        .chat-header-action-button:hover {
          background-color: #f3f4f6 !important;
        }
        .chat-header-detailed-action-button:hover {
          background-color: #f9fafb !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // ====================================
  // RENDERIZAÇÃO PRINCIPAL
  // ====================================
  if (!chat) {
    return (
      <div style={styles.container} className={className}>
        <div style={{
          flex: 1,
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          Selecione uma conversa para começar
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={styles.container} className={className}>
        {/* Botão voltar */}
        {showBackButton && (
          <button
            style={styles.backButton}
            className="chat-header-back-button"
            onClick={onBackClick}
            title="Voltar"
          >
            ←
          </button>
        )}

        {/* Avatar */}
        <div onClick={handleContactInfoToggle}>
          {renderAvatar()}
        </div>

        {/* Informações do contato */}
        <div onClick={handleContactInfoToggle}>
          {renderContactInfo()}
        </div>

        {/* Ações */}
        {renderActions()}
      </div>

      {/* Informações detalhadas */}
      {renderDetailedInfo()}
    </>
  );
};

// ====================================
// PROP TYPES
// ====================================
ChatHeader.propTypes = {
  chat: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    name: PropTypes.string,
    avatar: PropTypes.string,
    isGroup: PropTypes.bool,
    participants: PropTypes.array,
    description: PropTypes.string,
    unreadCount: PropTypes.number,
    number: PropTypes.string
  }),
  onBackClick: PropTypes.func,
  onSearchClick: PropTypes.func,
  onCallClick: PropTypes.func,
  onVideoCallClick: PropTypes.func,
  onMenuClick: PropTypes.func,
  onContactClick: PropTypes.func,
  showBackButton: PropTypes.bool,
  showActions: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

export default ChatHeader;