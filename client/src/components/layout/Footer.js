// client/src/components/layout/Footer.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE DE RODAPÉ
// Rodapé com informações do sistema, status e links úteis
// =====================================

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Footer = ({
  showSystemInfo = true,
  showConnectionStatus = true,
  showQuickActions = true,
  whatsappStatus = null,
  systemVersion = '9.0',
  companyName = 'Primem Comex',
  customLinks = [],
  onQuickAction = null,
  className = '',
  style = {},
  theme = 'default',
  position = 'relative' // 'fixed', 'sticky', 'relative'
}) => {
  // ====================================
  // ESTADOS LOCAIS
  // ====================================
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStats, setSystemStats] = useState({
    uptime: '00:00:00',
    memory: '0%',
    messages: 0
  });

  // ====================================
  // EFEITOS
  // ====================================

  // Atualizar tempo atual
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simular estatísticas do sistema
  useEffect(() => {
    const updateStats = () => {
      const startTime = Date.now() - (Math.random() * 3600000); // Simular uptime
      const uptime = new Date(Date.now() - startTime);
      
      setSystemStats({
        uptime: uptime.toISOString().substr(11, 8),
        memory: Math.floor(Math.random() * 30 + 40) + '%',
        messages: Math.floor(Math.random() * 1000 + 500)
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Atualizar a cada 30s

    return () => clearInterval(interval);
  }, []);

  // ====================================
  // HANDLERS
  // ====================================
  const handleQuickAction = (action) => {
    if (onQuickAction) {
      onQuickAction(action);
    }
  };

  const handleLinkClick = (link) => {
    if (link.onClick) {
      link.onClick();
    } else if (link.href) {
      window.open(link.href, link.external ? '_blank' : '_self');
    }
  };

  // ====================================
  // QUICK ACTIONS
  // ====================================
  const quickActions = [
    {
      id: 'refresh',
      label: 'Atualizar',
      icon: '🔄',
      title: 'Atualizar página'
    },
    {
      id: 'help',
      label: 'Ajuda',
      icon: '❓',
      title: 'Central de ajuda'
    },
    {
      id: 'support',
      label: 'Suporte',
      icon: '🆘',
      title: 'Contatar suporte'
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: '💬',
      title: 'Enviar feedback'
    }
  ];

  // ====================================
  // LINKS PADRÃO
  // ====================================
  const defaultLinks = [
    {
      id: 'privacy',
      label: 'Privacidade',
      href: '#privacy'
    },
    {
      id: 'terms',
      label: 'Termos de Uso',
      href: '#terms'
    },
    {
      id: 'docs',
      label: 'Documentação',
      href: '#docs'
    },
    {
      id: 'changelog',
      label: 'Novidades',
      href: '#changelog'
    }
  ];

  const allLinks = [...defaultLinks, ...customLinks];

  // ====================================
  // UTILITÁRIOS
  // ====================================
  const getConnectionStatusInfo = () => {
    if (!whatsappStatus) return { text: 'N/A', color: '#6b7280', icon: '⚫' };

    switch (whatsappStatus.state) {
      case 'connected':
        return { 
          text: 'Online', 
          color: '#10b981', 
          icon: '🟢',
          detail: whatsappStatus.userInfo?.name || 'Conectado'
        };
      case 'connecting':
        return { 
          text: 'Conectando', 
          color: '#f59e0b', 
          icon: '🟡',
          detail: 'Estabelecendo conexão'
        };
      case 'waiting_qr':
        return { 
          text: 'Aguardando QR', 
          color: '#f59e0b', 
          icon: '🟡',
          detail: 'Escaneie o QR Code'
        };
      case 'disconnected':
        return { 
          text: 'Offline', 
          color: '#6b7280', 
          icon: '⚫',
          detail: 'WhatsApp desconectado'
        };
      case 'error':
        return { 
          text: 'Erro', 
          color: '#ef4444', 
          icon: '🔴',
          detail: 'Falha na conexão'
        };
      default:
        return { 
          text: 'Desconhecido', 
          color: '#6b7280', 
          icon: '⚫',
          detail: 'Status não identificado'
        };
    }
  };

  // ====================================
  // ESTILOS
  // ====================================
  const getThemeStyles = () => {
    const themes = {
      default: {
        background: '#f8f9fa',
        borderColor: '#e5e7eb',
        textColor: '#6b7280',
        linkColor: '#2B4C8C',
        hoverColor: '#f3f4f6'
      },
      dark: {
        background: '#1f2937',
        borderColor: '#374151',
        textColor: '#9ca3af',
        linkColor: '#60a5fa',
        hoverColor: '#374151'
      },
      primem: {
        background: 'linear-gradient(135deg, #2B4C8C 0%, #8B9DC3 100%)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textColor: 'white',
        linkColor: 'white',
        hoverColor: 'rgba(255, 255, 255, 0.1)'
      },
      minimal: {
        background: 'transparent',
        borderColor: 'transparent',
        textColor: '#6b7280',
        linkColor: '#2B4C8C',
        hoverColor: '#f3f4f6'
      }
    };

    return themes[theme] || themes.default;
  };

  const themeStyles = getThemeStyles();
  const connectionStatus = getConnectionStatusInfo();

  const styles = {
    footer: {
      background: themeStyles.background,
      borderTop: `1px solid ${themeStyles.borderColor}`,
      color: themeStyles.textColor,
      fontSize: '13px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      minHeight: '48px',
      position: position,
      bottom: position === 'fixed' ? 0 : 'auto',
      left: position === 'fixed' ? 0 : 'auto',
      right: position === 'fixed' ? 0 : 'auto',
      zIndex: position === 'fixed' ? 1000 : 'auto',
      ...style
    },

    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      flexWrap: 'wrap'
    },

    systemInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap'
    },

    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },

    infoLabel: {
      fontWeight: '500',
      opacity: 0.8
    },

    infoValue: {
      fontWeight: '600'
    },

    connectionInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 8px',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      borderRadius: '12px',
      border: `1px solid ${connectionStatus.color}20`
    },

    connectionDot: {
      fontSize: '8px'
    },

    connectionText: {
      color: connectionStatus.color,
      fontWeight: '500'
    },

    connectionDetail: {
      opacity: 0.7,
      marginLeft: '4px'
    },

    centerSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap'
    },

    quickActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },

    quickAction: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '6px',
      color: themeStyles.textColor,
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s',
      textDecoration: 'none'
    },

    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap'
    },

    links: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap'
    },

    link: {
      color: themeStyles.linkColor,
      textDecoration: 'none',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'opacity 0.2s'
    },

    copyright: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      opacity: 0.7
    },

    version: {
      padding: '2px 6px',
      backgroundColor: themeStyles.linkColor,
      color: theme === 'primem' ? 'rgba(0,0,0,0.8)' : 'white',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600'
    },

    // Responsividade
    '@media (max-width: 768px)': {
      footer: {
        padding: '8px 16px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px'
      },

      systemInfo: {
        gap: '12px'
      },

      links: {
        gap: '12px'
      }
    }
  };

  // ====================================
  // RENDER
  // ====================================
  return (
    <footer className={className} style={styles.footer}>
      {/* Seção Esquerda - Informações do Sistema */}
      <div style={styles.leftSection}>
        {showSystemInfo && (
          <div style={styles.systemInfo}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>⏱️ Uptime:</span>
              <span style={styles.infoValue}>{systemStats.uptime}</span>
            </div>
            
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>🧠 Memória:</span>
              <span style={styles.infoValue}>{systemStats.memory}</span>
            </div>
            
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>💬 Mensagens:</span>
              <span style={styles.infoValue}>{systemStats.messages.toLocaleString()}</span>
            </div>
          </div>
        )}

        {showConnectionStatus && whatsappStatus && (
          <div style={styles.connectionInfo}>
            <span style={styles.connectionDot}>{connectionStatus.icon}</span>
            <span style={styles.connectionText}>
              WhatsApp: {connectionStatus.text}
            </span>
            {connectionStatus.detail && (
              <span style={styles.connectionDetail}>
                ({connectionStatus.detail})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Seção Central - Ações Rápidas */}
      {showQuickActions && (
        <div style={styles.centerSection}>
          <div style={styles.quickActions}>
            {quickActions.map(action => (
              <button
                key={action.id}
                style={styles.quickAction}
                onClick={() => handleQuickAction(action.id)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = themeStyles.hoverColor;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
                title={action.title}
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seção Direita - Links e Copyright */}
      <div style={styles.rightSection}>
        {allLinks.length > 0 && (
          <div style={styles.links}>
            {allLinks.map(link => (
              <a
                key={link.id}
                style={styles.link}
                onClick={() => handleLinkClick(link)}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div style={styles.copyright}>
          <span>© 2025 {companyName}</span>
          <span style={styles.version}>v{systemVersion}</span>
          <span>•</span>
          <span>{currentTime.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</span>
        </div>
      </div>
    </footer>
  );
};

// ====================================
// PROP TYPES
// ====================================
Footer.propTypes = {
  showSystemInfo: PropTypes.bool,
  showConnectionStatus: PropTypes.bool,
  showQuickActions: PropTypes.bool,
  whatsappStatus: PropTypes.shape({
    state: PropTypes.string,
    userInfo: PropTypes.object,
    isConnected: PropTypes.bool
  }),
  systemVersion: PropTypes.string,
  companyName: PropTypes.string,
  customLinks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    href: PropTypes.string,
    onClick: PropTypes.func,
    external: PropTypes.bool
  })),
  onQuickAction: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  theme: PropTypes.oneOf(['default', 'dark', 'primem', 'minimal']),
  position: PropTypes.oneOf(['relative', 'fixed', 'sticky'])
};

export default Footer;