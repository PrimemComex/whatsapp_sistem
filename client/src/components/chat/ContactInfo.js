// client/src/components/chat/ContactInfo.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE INFORMAÇÕES DO CONTATO
// Painel/Modal completo com informações detalhadas do contato
// =====================================

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useWhatsApp } from '../../contexts/WhatsAppContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';

// Cores PRIMEM
const PRIMEM_COLORS = {
  primary: '#2B4C8C',
  secondary: '#C97A4A',
  accent: '#8B9DC3',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  background: '#f0f2f5'
};

const ContactInfo = ({ 
  chat,
  isOpen = false,
  onClose,
  onBlock,
  onUnblock,
  onMute,
  onUnmute,
  onClearChat,
  onDeleteChat,
  onStarMessages,
  className = '',
  style = {}
}) => {
  // ====================================
  // CONTEXTOS E ESTADOS
  // ====================================
  const { onlineContacts, lastSeen, messages } = useWhatsApp();
  const { settings } = useSettingsContext();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState('info'); // info, media, files, links
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [contactDetails, setContactDetails] = useState(null);
  const [sharedMedia, setSharedMedia] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [sharedLinks, setSharedLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  // ====================================
  // EXTRAIR DADOS DO CHAT
  // ====================================
  const {
    id,
    name = 'Contato',
    avatar = null,
    number = '',
    isGroup = false,
    participants = [],
    description = '',
    isBlocked = false,
    isMuted = false,
    isPinned = false
  } = chat || {};

  const chatId = id?._serialized || id;
  const isOnline = onlineContacts?.has?.(chatId) || false;
  const lastSeenTime = lastSeen?.[chatId];

  // ====================================
  // CARREGAR DADOS DETALHADOS
  // ====================================
  useEffect(() => {
    if (isOpen && chat) {
      loadContactDetails();
      loadSharedContent();
    }
  }, [isOpen, chat]);

  const loadContactDetails = useCallback(async () => {
    setLoading(true);
    try {
      // Simular carregamento de detalhes do contato
      // Em um app real, faria chamada para API
      const details = {
        fullName: name,
        phoneNumber: number,
        status: 'Disponível',
        about: isGroup ? description : 'Olá! Estou usando o WhatsApp.',
        commonGroups: isGroup ? [] : ['Família', 'Trabalho'],
        joinDate: isGroup ? new Date() : null,
        createdBy: isGroup ? 'Admin' : null
      };
      
      setContactDetails(details);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setLoading(false);
    }
  }, [name, number, description, isGroup]);

  const loadSharedContent = useCallback(() => {
    if (!messages || !chatId) return;

    const chatMessages = messages[chatId] || [];
    const media = [];
    const files = [];
    const links = [];

    chatMessages.forEach(message => {
      if (message.hasMedia && message.media) {
        const { mimetype, filename, url, size } = message.media;
        
        if (mimetype?.startsWith('image/') || mimetype?.startsWith('video/')) {
          media.push({
            id: message.id,
            type: mimetype?.startsWith('image/') ? 'image' : 'video',
            url,
            filename,
            timestamp: message.timestamp,
            size
          });
        } else {
          files.push({
            id: message.id,
            filename: filename || 'Arquivo',
            mimetype,
            url,
            size,
            timestamp: message.timestamp
          });
        }
      }

      // Extrair links do corpo da mensagem
      if (message.body) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = message.body.match(urlRegex);
        if (urls) {
          urls.forEach(url => {
            links.push({
              id: `${message.id}_${url}`,
              url,
              title: extractDomain(url),
              timestamp: message.timestamp
            });
          });
        }
      }
    });

    setSharedMedia(media.slice(0, 50)); // Limitar para performance
    setSharedFiles(files.slice(0, 50));
    setSharedLinks(links.slice(0, 50));
  }, [messages, chatId]);

  // ====================================
  // FORMATAÇÃO DE TEMPO
  // ====================================
  const formatLastSeen = useCallback(() => {
    if (isOnline) return 'online agora';
    if (!lastSeenTime) return 'visto há muito tempo';

    const date = new Date(lastSeenTime);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffMinutes < 1) return 'visto agora';
    if (diffMinutes < 60) return `visto há ${diffMinutes} min`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `visto há ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `visto há ${diffDays}d`;
    
    return `visto em ${date.toLocaleDateString('pt-BR')}`;
  }, [isOnline, lastSeenTime]);

  // ====================================
  // RENDERIZAR CABEÇALHO
  // ====================================
  const renderHeader = () => {
    return (
      <div style={styles.header}>
        <button
          style={styles.closeButton}
          onClick={onClose}
          title="Fechar"
        >
          ←
        </button>
        
        <div style={styles.headerTitle}>
          Informações do {isGroup ? 'grupo' : 'contato'}
        </div>
        
        <button
          style={styles.menuButton}
          title="Mais opções"
        >
          ⋮
        </button>
      </div>
    );
  };

  // ====================================
  // RENDERIZAR PERFIL
  // ====================================
  const renderProfile = () => {
    return (
      <div style={styles.profileSection}>
        {/* Avatar grande */}
        <div style={styles.avatarContainer}>
          {avatar ? (
            <img 
              src={avatar} 
              alt={name}
              style={styles.avatarLarge}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div style={{
            ...styles.avatarFallbackLarge,
            display: avatar ? 'none' : 'flex'
          }}>
            {isGroup ? '👥' : name.charAt(0).toUpperCase()}
          </div>
          
          {/* Indicador online */}
          {!isGroup && isOnline && (
            <div style={styles.onlineIndicatorLarge}></div>
          )}
        </div>

        {/* Nome e status */}
        <div style={styles.profileInfo}>
          <h2 style={styles.profileName}>{name}</h2>
          
          {!isGroup && (
            <div style={styles.profileStatus}>
              {formatLastSeen()}
            </div>
          )}
          
          {isGroup && (
            <div style={styles.groupStats}>
              {participants.length} participantes
            </div>
          )}
        </div>

        {/* Ações rápidas */}
        <div style={styles.quickActions}>
          <button style={styles.quickActionButton} title="Ligar">
            <span style={styles.quickActionIcon}>📞</span>
            <span style={styles.quickActionLabel}>Ligar</span>
          </button>
          
          <button style={styles.quickActionButton} title="Vídeo">
            <span style={styles.quickActionIcon}>📹</span>
            <span style={styles.quickActionLabel}>Vídeo</span>
          </button>
          
          <button style={styles.quickActionButton} title="Buscar">
            <span style={styles.quickActionIcon}>🔍</span>
            <span style={styles.quickActionLabel}>Buscar</span>
          </button>
        </div>
      </div>
    );
  };

  // ====================================
  // RENDERIZAR TABS
  // ====================================
  const renderTabs = () => {
    const tabs = [
      { id: 'info', label: 'Informações', icon: 'ℹ️' },
      { id: 'media', label: 'Mídia', icon: '🖼️', count: sharedMedia.length },
      { id: 'files', label: 'Arquivos', icon: '📎', count: sharedFiles.length },
      { id: 'links', label: 'Links', icon: '🔗', count: sharedLinks.length }
    ];

    return (
      <div style={styles.tabsContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === tab.id ? PRIMEM_COLORS.primary : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280'
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span style={styles.tabCount}>({tab.count})</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  // ====================================
  // RENDERIZAR ABA INFORMAÇÕES
  // ====================================
  const renderInfoTab = () => {
    if (loading) {
      return (
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <div>Carregando informações...</div>
        </div>
      );
    }

    return (
      <div style={styles.infoContent}>
        {/* Informações básicas */}
        <div style={styles.infoSection}>
          <h3 style={styles.sectionTitle}>Informações</h3>
          
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Telefone:</span>
            <span style={styles.infoValue}>{number || 'Não disponível'}</span>
          </div>
          
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Sobre:</span>
            <span style={styles.infoValue}>
              {contactDetails?.about || 'Nenhuma informação disponível'}
            </span>
          </div>
          
          {isGroup && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Descrição:</span>
              <span style={styles.infoValue}>
                {description || 'Nenhuma descrição'}
              </span>
            </div>
          )}
        </div>

        {/* Grupos em comum (só para contatos) */}
        {!isGroup && contactDetails?.commonGroups?.length > 0 && (
          <div style={styles.infoSection}>
            <h3 style={styles.sectionTitle}>Grupos em comum</h3>
            {contactDetails.commonGroups.map((group, index) => (
              <div key={index} style={styles.commonGroup}>
                <span style={styles.groupIcon}>👥</span>
                <span>{group}</span>
              </div>
            ))}
          </div>
        )}

        {/* Participantes (só para grupos) */}
        {isGroup && participants.length > 0 && (
          <div style={styles.infoSection}>
            <h3 style={styles.sectionTitle}>
              Participantes ({participants.length})
            </h3>
            <div style={styles.participantsList}>
              {participants.slice(0, 10).map((participant, index) => (
                <div key={index} style={styles.participant}>
                  <div style={styles.participantAvatar}>
                    {participant.name?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div style={styles.participantInfo}>
                    <div style={styles.participantName}>
                      {participant.name || 'Participante'}
                    </div>
                    <div style={styles.participantNumber}>
                      {participant.number || ''}
                    </div>
                  </div>
                  {participant.isAdmin && (
                    <span style={styles.adminBadge}>Admin</span>
                  )}
                </div>
              ))}
              {participants.length > 10 && (
                <div style={styles.moreParticipants}>
                  +{participants.length - 10} participantes
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ações */}
        <div style={styles.actionsSection}>
          <button
            style={{
              ...styles.actionButton,
              backgroundColor: isMuted ? PRIMEM_COLORS.warning : PRIMEM_COLORS.accent
            }}
            onClick={() => isMuted ? onUnmute?.(chat) : onMute?.(chat)}
          >
            {isMuted ? '🔊 Ativar som' : '🔇 Silenciar'}
          </button>
          
          <button
            style={{
              ...styles.actionButton,
              backgroundColor: PRIMEM_COLORS.secondary
            }}
            onClick={() => onStarMessages?.(chat)}
          >
            ⭐ Mensagens favoritas
          </button>
          
          <button
            style={{
              ...styles.actionButton,
              backgroundColor: PRIMEM_COLORS.warning
            }}
            onClick={() => setShowConfirmDialog('clear')}
          >
            🗑️ Limpar conversa
          </button>
          
          {!isGroup && (
            <button
              style={{
                ...styles.actionButton,
                backgroundColor: isBlocked ? PRIMEM_COLORS.success : PRIMEM_COLORS.danger
              }}
              onClick={() => isBlocked ? onUnblock?.(chat) : setShowConfirmDialog('block')}
            >
              {isBlocked ? '✅ Desbloquear' : '🚫 Bloquear contato'}
            </button>
          )}
          
          {hasPermission('admin') && (
            <button
              style={{
                ...styles.actionButton,
                backgroundColor: PRIMEM_COLORS.danger
              }}
              onClick={() => setShowConfirmDialog('delete')}
            >
              ❌ Deletar conversa
            </button>
          )}
        </div>
      </div>
    );
  };

  // ====================================
  // RENDERIZAR ABA MÍDIA
  // ====================================
  const renderMediaTab = () => {
    if (sharedMedia.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🖼️</div>
          <div>Nenhuma mídia compartilhada</div>
        </div>
      );
    }

    return (
      <div style={styles.mediaGrid}>
        {sharedMedia.map(item => (
          <div key={item.id} style={styles.mediaItem}>
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.filename}
                style={styles.mediaImage}
                onClick={() => {
                  // TODO: Abrir lightbox
                  console.log('Abrir imagem:', item.url);
                }}
              />
            ) : (
              <div style={styles.videoThumbnail}>
                <video
                  src={item.url}
                  style={styles.mediaVideo}
                  onClick={() => {
                    // TODO: Abrir player
                    console.log('Abrir vídeo:', item.url);
                  }}
                />
                <div style={styles.playButton}>▶️</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ====================================
  // RENDERIZAR ABA ARQUIVOS
  // ====================================
  const renderFilesTab = () => {
    if (sharedFiles.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📎</div>
          <div>Nenhum arquivo compartilhado</div>
        </div>
      );
    }

    return (
      <div style={styles.filesList}>
        {sharedFiles.map(file => (
          <div key={file.id} style={styles.fileItem}>
            <div style={styles.fileIcon}>
              {getFileIcon(file.mimetype)}
            </div>
            <div style={styles.fileInfo}>
              <div style={styles.fileName}>{file.filename}</div>
              <div style={styles.fileDetails}>
                {formatFileSize(file.size)} • {formatDate(file.timestamp)}
              </div>
            </div>
            <button
              style={styles.downloadButton}
              onClick={() => downloadFile(file.url, file.filename)}
              title="Download"
            >
              📥
            </button>
          </div>
        ))}
      </div>
    );
  };

  // ====================================
  // RENDERIZAR ABA LINKS
  // ====================================
  const renderLinksTab = () => {
    if (sharedLinks.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔗</div>
          <div>Nenhum link compartilhado</div>
        </div>
      );
    }

    return (
      <div style={styles.linksList}>
        {sharedLinks.map(link => (
          <div key={link.id} style={styles.linkItem}>
            <div style={styles.linkIcon}>🔗</div>
            <div style={styles.linkInfo}>
              <div style={styles.linkTitle}>{link.title}</div>
              <div style={styles.linkUrl}>{link.url}</div>
              <div style={styles.linkDate}>
                {formatDate(link.timestamp)}
              </div>
            </div>
            <button
              style={styles.openLinkButton}
              onClick={() => window.open(link.url, '_blank')}
              title="Abrir link"
            >
              🔗
            </button>
          </div>
        ))}
      </div>
    );
  };

  // ====================================
  // RENDERIZAR DIALOG DE CONFIRMAÇÃO
  // ====================================
  const renderConfirmDialog = () => {
    if (!showConfirmDialog) return null;

    const configs = {
      block: {
        title: 'Bloquear contato',
        message: `Tem certeza que deseja bloquear ${name}?`,
        action: () => onBlock?.(chat),
        danger: true
      },
      clear: {
        title: 'Limpar conversa',
        message: `Todas as mensagens de ${name} serão excluídas.`,
        action: () => onClearChat?.(chat),
        danger: true
      },
      delete: {
        title: 'Deletar conversa',
        message: `A conversa com ${name} será excluída permanentemente.`,
        action: () => onDeleteChat?.(chat),
        danger: true
      }
    };

    const config = configs[showConfirmDialog];

    return (
      <div style={styles.dialogOverlay}>
        <div style={styles.dialog}>
          <h3 style={styles.dialogTitle}>{config.title}</h3>
          <p style={styles.dialogMessage}>{config.message}</p>
          
          <div style={styles.dialogActions}>
            <button
              style={styles.dialogCancelButton}
              onClick={() => setShowConfirmDialog(null)}
            >
              Cancelar
            </button>
            <button
              style={{
                ...styles.dialogConfirmButton,
                backgroundColor: config.danger ? PRIMEM_COLORS.danger : PRIMEM_COLORS.primary
              }}
              onClick={() => {
                config.action();
                setShowConfirmDialog(null);
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ====================================
  // FUNÇÕES AUXILIARES
  // ====================================
  const extractDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const getFileIcon = (mimetype) => {
    if (!mimetype) return '📄';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('excel')) return '📊';
    if (mimetype.includes('powerpoint')) return '📋';
    if (mimetype.includes('zip') || mimetype.includes('rar')) return '🗃️';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ====================================
  // ESTILOS
  // ====================================
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: isOpen ? 'flex' : 'none',
      justifyContent: 'flex-end'
    },

    container: {
      width: '400px',
      maxWidth: '90vw',
      height: '100vh',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
      transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease',
      ...style
    },

    header: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: PRIMEM_COLORS.primary,
      color: 'white'
    },

    closeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '8px',
      marginRight: '12px'
    },

    headerTitle: {
      flex: 1,
      fontSize: '18px',
      fontWeight: 'bold'
    },

    menuButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '8px'
    },

    profileSection: {
      padding: '24px',
      textAlign: 'center',
      borderBottom: '1px solid #e0e0e0'
    },

    avatarContainer: {
      position: 'relative',
      display: 'inline-block',
      marginBottom: '16px'
    },

    avatarLarge: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      objectFit: 'cover'
    },

    avatarFallbackLarge: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      backgroundColor: PRIMEM_COLORS.accent,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      fontWeight: 'bold'
    },

    onlineIndicatorLarge: {
      position: 'absolute',
      bottom: '8px',
      right: '8px',
      width: '24px',
      height: '24px',
      backgroundColor: PRIMEM_COLORS.success,
      borderRadius: '50%',
      border: '4px solid white'
    },

    profileInfo: {
      marginBottom: '20px'
    },

    profileName: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: '0 0 8px 0'
    },

    profileStatus: {
      fontSize: '14px',
      color: '#6b7280'
    },

    groupStats: {
      fontSize: '14px',
      color: '#6b7280'
    },

    quickActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px'
    },

    quickActionButton: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '12px',
      borderRadius: '8px',
      transition: 'background-color 0.2s ease'
    },

    quickActionIcon: {
      fontSize: '24px'
    },

    quickActionLabel: {
      fontSize: '12px',
      color: '#6b7280'
    },

    tabsContainer: {
      display: 'flex',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#f9fafb'
    },

    tab: {
      flex: 1,
      padding: '12px 8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.2s ease'
    },

    tabCount: {
      fontSize: '10px',
      opacity: 0.8
    },

    content: {
      flex: 1,
      overflowY: 'auto'
    },

    loadingState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      color: '#6b7280'
    },

    spinner: {
      width: '32px',
      height: '32px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '16px'
    },

    infoContent: {
      padding: '16px'
    },

    infoSection: {
      marginBottom: '24px'
    },

    sectionTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '12px',
      margin: '0 0 12px 0'
    },

    infoItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '8px 0',
      borderBottom: '1px solid #f3f4f6'
    },

    infoLabel: {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: '500',
      minWidth: '80px'
    },

    infoValue: {
      fontSize: '14px',
      color: '#1f2937',
      flex: 1,
      textAlign: 'right'
    },

    commonGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 0',
      fontSize: '14px',
      color: '#374151'
    },

    groupIcon: {
      fontSize: '16px'
    },

    participantsList: {
      maxHeight: '300px',
      overflowY: 'auto'
    },

    participant: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0',
      borderBottom: '1px solid #f3f4f6'
    },

    participantAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: PRIMEM_COLORS.accent,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold'
    },

    participantInfo: {
      flex: 1
    },

    participantName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1f2937'
    },

    participantNumber: {
      fontSize: '12px',
      color: '#6b7280'
    },

    adminBadge: {
      fontSize: '10px',
      backgroundColor: PRIMEM_COLORS.warning,
      color: 'white',
      padding: '2px 6px',
      borderRadius: '8px',
      fontWeight: 'bold'
    },

    moreParticipants: {
      padding: '12px 0',
      textAlign: 'center',
      color: '#6b7280',
      fontSize: '14px',
      fontStyle: 'italic'
    },

    actionsSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },

    actionButton: {
      padding: '12px 16px',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'opacity 0.2s ease'
    },

    mediaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '4px',
      padding: '8px'
    },

    mediaItem: {
      aspectRatio: '1',
      overflow: 'hidden',
      borderRadius: '4px',
      cursor: 'pointer'
    },

    mediaImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },

    videoThumbnail: {
      position: 'relative',
      width: '100%',
      height: '100%'
    },

    mediaVideo: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },

    playButton: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: '50%',
      padding: '8px'
    },

    filesList: {
      padding: '8px'
    },

    fileItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      borderBottom: '1px solid #f3f4f6'
    },

    fileIcon: {
      fontSize: '24px'
    },

    fileInfo: {
      flex: 1
    },

    fileName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1f2937',
      marginBottom: '4px'
    },

    fileDetails: {
      fontSize: '12px',
      color: '#6b7280'
    },

    downloadButton: {
      background: 'none',
      border: 'none',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '4px'
    },

    linksList: {
      padding: '8px'
    },

    linkItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      borderBottom: '1px solid #f3f4f6'
    },

    linkIcon: {
      fontSize: '20px'
    },

    linkInfo: {
      flex: 1
    },

    linkTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1f2937',
      marginBottom: '4px'
    },

    linkUrl: {
      fontSize: '12px',
      color: PRIMEM_COLORS.primary,
      marginBottom: '2px'
    },

    linkDate: {
      fontSize: '10px',
      color: '#9ca3af'
    },

    openLinkButton: {
      background: 'none',
      border: 'none',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '4px'
    },

    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      color: '#6b7280',
      textAlign: 'center'
    },

    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px',
      opacity: 0.5
    },

    dialogOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    },

    dialog: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '400px',
      width: '90%',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
    },

    dialogTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '12px',
      margin: '0 0 12px 0'
    },

    dialogMessage: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '20px',
      lineHeight: '1.5',
      margin: '0 0 20px 0'
    },

    dialogActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },

    dialogCancelButton: {
      padding: '8px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: 'white',
      color: '#374151',
      cursor: 'pointer',
      fontSize: '14px'
    },

    dialogConfirmButton: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    }
  };

  // ====================================
  // ADICIONAR ESTILOS CSS
  // ====================================
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.querySelector('#contact-info-styles')) {
      const style = document.createElement('style');
      style.id = 'contact-info-styles';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .contact-info-quick-action:hover {
          background-color: #f3f4f6 !important;
        }
        .contact-info-action-button:hover {
          opacity: 0.9 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // ====================================
  // RENDERIZAÇÃO PRINCIPAL
  // ====================================
  if (!chat) return null;

  return (
    <>
      <div 
        className={className}
        style={styles.overlay}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose?.();
          }
        }}
      >
        <div style={styles.container}>
          {/* Cabeçalho */}
          {renderHeader()}

          {/* Perfil */}
          {renderProfile()}

          {/* Tabs */}
          {renderTabs()}

          {/* Conteúdo */}
          <div style={styles.content}>
            {activeTab === 'info' && renderInfoTab()}
            {activeTab === 'media' && renderMediaTab()}
            {activeTab === 'files' && renderFilesTab()}
            {activeTab === 'links' && renderLinksTab()}
          </div>
        </div>
      </div>

      {/* Dialog de confirmação */}
      {renderConfirmDialog()}
    </>
  );
};

// ====================================
// PROP TYPES
// ====================================
ContactInfo.propTypes = {
  chat: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    name: PropTypes.string,
    avatar: PropTypes.string,
    number: PropTypes.string,
    isGroup: PropTypes.bool,
    participants: PropTypes.array,
    description: PropTypes.string,
    isBlocked: PropTypes.bool,
    isMuted: PropTypes.bool,
    isPinned: PropTypes.bool
  }),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onBlock: PropTypes.func,
  onUnblock: PropTypes.func,
  onMute: PropTypes.func,
  onUnmute: PropTypes.func,
  onClearChat: PropTypes.func,
  onDeleteChat: PropTypes.func,
  onStarMessages: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object
};

export default ContactInfo;