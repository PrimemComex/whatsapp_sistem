// client/src/components/chat/MessageBubble.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE BOLHA DE MENSAGEM
// Renderiza mensagens com suporte a texto, mídia e arquivos
// =====================================

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSettingsContext } from '../../contexts/SettingsContext';

// Cores PRIMEM
const PRIMEM_COLORS = {
  primary: '#2B4C8C',
  secondary: '#C97A4A',
  accent: '#8B9DC3',
  success: '#10B981',
  background: '#f0f2f5'
};

const MessageBubble = ({ 
  message,
  isFromMe = false,
  showAvatar = true,
  showTimestamp = true,
  showStatus = true,
  onMediaClick,
  onFileDownload,
  onMessageReply,
  onMessageDelete,
  className = '',
  style = {}
}) => {
  // ====================================
  // CONTEXTOS E ESTADOS
  // ====================================
  const { settings } = useSettingsContext();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullTimestamp, setShowFullTimestamp] = useState(false);

  // ====================================
  // EXTRAIR DADOS DA MENSAGEM
  // ====================================
  const {
    id,
    body = '',
    timestamp,
    hasMedia = false,
    media = null,
    contact = {},
    type = 'text',
    status = 'sent',
    isForwarded = false,
    quotedMessage = null
  } = message;

  const contactName = contact?.name || contact?.pushname || contact?.number || 'Contato';
  const avatar = contact?.avatar || null;

  // ====================================
  // FORMATAÇÃO DE TEMPO
  // ====================================
  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (showFullTimestamp) {
      return date.toLocaleString('pt-BR');
    }
    
    if (diffDays === 0) {
      // Hoje - apenas hora
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      // Ontem
      return 'Ontem ' + date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays < 7) {
      // Esta semana
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit'
      });
    } else {
      // Mais antigo
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }, [showFullTimestamp]);

  // ====================================
  // RENDERIZAR AVATAR
  // ====================================
  const renderAvatar = () => {
    if (!showAvatar || isFromMe) return null;

    return (
      <div style={styles.avatarContainer}>
        {avatar ? (
          <img 
            src={avatar} 
            alt={contactName}
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
          {contactName.charAt(0).toUpperCase()}
        </div>
      </div>
    );
  };

  // ====================================
  // RENDERIZAR STATUS DA MENSAGEM
  // ====================================
  const renderStatus = () => {
    if (!showStatus || !isFromMe) return null;

    const statusIcons = {
      sending: '🕐',
      sent: '✓',
      delivered: '✓✓',
      read: '✓✓'
    };

    const statusColors = {
      sending: '#9CA3AF',
      sent: '#9CA3AF',
      delivered: '#9CA3AF',
      read: PRIMEM_COLORS.primary
    };

    return (
      <span style={{
        ...styles.status,
        color: statusColors[status] || '#9CA3AF'
      }}>
        {statusIcons[status] || '✓'}
      </span>
    );
  };

  // ====================================
  // RENDERIZAR MENSAGEM CITADA
  // ====================================
  const renderQuotedMessage = () => {
    if (!quotedMessage) return null;

    return (
      <div style={styles.quotedMessage}>
        <div style={styles.quotedBar}></div>
        <div style={styles.quotedContent}>
          <div style={styles.quotedAuthor}>
            {quotedMessage.contact?.name || 'Contato'}
          </div>
          <div style={styles.quotedText}>
            {quotedMessage.body || 'Mídia'}
          </div>
        </div>
      </div>
    );
  };

  // ====================================
  // RENDERIZAR CONTEÚDO DE MÍDIA
  // ====================================
  const renderMediaContent = () => {
    if (!hasMedia || !media) return null;

    const { mimetype, filename, url, size } = media;
    const API_BASE = 'http://localhost:3001';
    const fullUrl = url?.startsWith('http') ? url : `${API_BASE}${url}`;

    // Imagem
    if (mimetype?.startsWith('image/')) {
      return (
        <div style={styles.mediaContainer}>
          <img
            src={fullUrl}
            alt={filename || 'Imagem'}
            style={{
              ...styles.image,
              opacity: imageLoaded ? 1 : 0
            }}
            onLoad={() => setImageLoaded(true)}
            onClick={() => onMediaClick && onMediaClick(media)}
          />
          {!imageLoaded && (
            <div style={styles.imageLoader}>
              <div style={styles.spinner}></div>
            </div>
          )}
          {body && (
            <div style={styles.imageCaption}>
              {body}
            </div>
          )}
        </div>
      );
    }

    // Vídeo
    if (mimetype?.startsWith('video/')) {
      return (
        <div style={styles.mediaContainer}>
          <video
            src={fullUrl}
            controls
            style={styles.video}
            onClick={() => onMediaClick && onMediaClick(media)}
          >
            Seu navegador não suporta vídeo.
          </video>
          {body && (
            <div style={styles.imageCaption}>
              {body}
            </div>
          )}
        </div>
      );
    }

    // Áudio
    if (mimetype?.startsWith('audio/')) {
      return (
        <div style={styles.audioContainer}>
          <div style={styles.audioIcon}>🎵</div>
          <audio
            src={fullUrl}
            controls
            style={styles.audio}
          >
            Seu navegador não suporta áudio.
          </audio>
          <div style={styles.audioInfo}>
            <div style={styles.audioName}>
              {filename || 'Áudio'}
            </div>
            {size && (
              <div style={styles.audioSize}>
                {formatFileSize(size)}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Documento
    return (
      <div style={styles.documentContainer}>
        <div style={styles.documentIcon}>
          {getDocumentIcon(mimetype)}
        </div>
        <div style={styles.documentInfo}>
          <div style={styles.documentName}>
            {filename || 'Documento'}
          </div>
          {size && (
            <div style={styles.documentSize}>
              {formatFileSize(size)}
            </div>
          )}
        </div>
        <button
          style={styles.downloadButton}
          onClick={() => onFileDownload && onFileDownload(media)}
          title="Download"
        >
          📥
        </button>
      </div>
    );
  };

  // ====================================
  // RENDERIZAR CONTEÚDO DE TEXTO
  // ====================================
  const renderTextContent = () => {
    if (!body || hasMedia) return null;

    // Detectar links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = body.split(urlRegex);

    return (
      <div style={styles.textContent}>
        {parts.map((part, index) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                {part}
              </a>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  // ====================================
  // FUNÇÕES AUXILIARES
  // ====================================
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentIcon = (mimetype) => {
    if (!mimetype) return '📄';
    
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('excel')) return '📊';
    if (mimetype.includes('powerpoint')) return '📋';
    if (mimetype.includes('zip') || mimetype.includes('rar')) return '🗃️';
    
    return '📎';
  };

  // ====================================
  // MANIPULADORES DE EVENTOS
  // ====================================
  const handleBubbleClick = () => {
    // Implementar ações do bubble (selecionar, etc.)
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    // Implementar menu de contexto (responder, deletar, etc.)
  };

  // ====================================
  // ESTILOS
  // ====================================
  const styles = {
    container: {
      display: 'flex',
      flexDirection: isFromMe ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: '8px',
      margin: '8px 16px',
      ...style
    },

    avatarContainer: {
      position: 'relative',
      flexShrink: 0
    },

    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      objectFit: 'cover'
    },

    avatarFallback: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: PRIMEM_COLORS.accent,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold'
    },

    bubble: {
      maxWidth: '70%',
      padding: '8px 12px',
      borderRadius: '18px',
      backgroundColor: isFromMe ? PRIMEM_COLORS.primary : '#ffffff',
      color: isFromMe ? '#ffffff' : '#000000',
      position: 'relative',
      wordWrap: 'break-word',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer'
    },

    forwardedLabel: {
      fontSize: '12px',
      color: isFromMe ? 'rgba(255,255,255,0.7)' : '#666',
      fontStyle: 'italic',
      marginBottom: '4px'
    },

    quotedMessage: {
      display: 'flex',
      marginBottom: '8px',
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: '8px',
      padding: '6px',
      fontSize: '13px'
    },

    quotedBar: {
      width: '3px',
      backgroundColor: PRIMEM_COLORS.accent,
      borderRadius: '2px',
      marginRight: '8px'
    },

    quotedContent: {
      flex: 1
    },

    quotedAuthor: {
      fontWeight: 'bold',
      color: PRIMEM_COLORS.accent,
      fontSize: '12px',
      marginBottom: '2px'
    },

    quotedText: {
      color: isFromMe ? 'rgba(255,255,255,0.8)' : '#666',
      fontSize: '12px'
    },

    mediaContainer: {
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden'
    },

    image: {
      maxWidth: '300px',
      maxHeight: '400px',
      width: '100%',
      height: 'auto',
      display: 'block',
      cursor: 'pointer',
      transition: 'opacity 0.3s ease'
    },

    imageLoader: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    spinner: {
      width: '24px',
      height: '24px',
      border: '2px solid #f3f3f3',
      borderTop: '2px solid #333',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },

    imageCaption: {
      padding: '8px',
      backgroundColor: 'rgba(0,0,0,0.05)',
      fontSize: '14px',
      lineHeight: '1.4'
    },

    video: {
      maxWidth: '300px',
      maxHeight: '400px',
      width: '100%',
      height: 'auto'
    },

    audioContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: '8px',
      minWidth: '200px'
    },

    audioIcon: {
      fontSize: '20px'
    },

    audio: {
      flex: 1,
      height: '32px'
    },

    audioInfo: {
      display: 'flex',
      flexDirection: 'column',
      fontSize: '12px'
    },

    audioName: {
      fontWeight: '500'
    },

    audioSize: {
      color: isFromMe ? 'rgba(255,255,255,0.7)' : '#666',
      fontSize: '11px'
    },

    documentContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: '8px',
      minWidth: '200px'
    },

    documentIcon: {
      fontSize: '24px',
      flexShrink: 0
    },

    documentInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },

    documentName: {
      fontWeight: '500',
      fontSize: '14px',
      marginBottom: '2px'
    },

    documentSize: {
      color: isFromMe ? 'rgba(255,255,255,0.7)' : '#666',
      fontSize: '12px'
    },

    downloadButton: {
      background: 'none',
      border: 'none',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      opacity: 0.7,
      transition: 'opacity 0.2s ease'
    },

    textContent: {
      fontSize: '14px',
      lineHeight: '1.4',
      whiteSpace: 'pre-wrap'
    },

    link: {
      color: isFromMe ? '#B3D9FF' : PRIMEM_COLORS.primary,
      textDecoration: 'underline'
    },

    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '4px',
      marginTop: '4px',
      fontSize: '11px',
      color: isFromMe ? 'rgba(255,255,255,0.7)' : '#666'
    },

    timestamp: {
      cursor: 'pointer'
    },

    status: {
      fontSize: '12px'
    }
  };

  // ====================================
  // RENDERIZAÇÃO PRINCIPAL
  // ====================================
  return (
    <div 
      className={className}
      style={styles.container}
      onClick={handleBubbleClick}
      onContextMenu={handleContextMenu}
    >
      {renderAvatar()}
      
      <div style={styles.bubble}>
        {/* Label de encaminhado */}
        {isForwarded && (
          <div style={styles.forwardedLabel}>
            📤 Encaminhado
          </div>
        )}

        {/* Mensagem citada */}
        {renderQuotedMessage()}

        {/* Conteúdo principal */}
        {hasMedia ? renderMediaContent() : renderTextContent()}

        {/* Rodapé com timestamp e status */}
        <div style={styles.footer}>
          {showTimestamp && (
            <span 
              style={styles.timestamp}
              onClick={() => setShowFullTimestamp(!showFullTimestamp)}
              title="Clique para ver timestamp completo"
            >
              {formatTime(timestamp)}
            </span>
          )}
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};

// ====================================
// PROP TYPES
// ====================================
MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    body: PropTypes.string,
    timestamp: PropTypes.number,
    hasMedia: PropTypes.bool,
    media: PropTypes.object,
    contact: PropTypes.object,
    type: PropTypes.string,
    status: PropTypes.string,
    isForwarded: PropTypes.bool,
    quotedMessage: PropTypes.object
  }).isRequired,
  isFromMe: PropTypes.bool,
  showAvatar: PropTypes.bool,
  showTimestamp: PropTypes.bool,
  showStatus: PropTypes.bool,
  onMediaClick: PropTypes.func,
  onFileDownload: PropTypes.func,
  onMessageReply: PropTypes.func,
  onMessageDelete: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object
};

// ====================================
// CSS KEYFRAMES (adicionar ao head se não existir)
// ====================================
if (typeof document !== 'undefined' && !document.querySelector('#message-bubble-styles')) {
  const style = document.createElement('style');
  style.id = 'message-bubble-styles';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default MessageBubble;