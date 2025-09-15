// client/src/components/layout/Header.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE DE CABEÇALHO
// Cabeçalho principal com logo, título, status e ações do usuário
// =====================================

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// Importar componentes
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import UserProfile from '../auth/UserProfile';

// Importar hooks
import useAuth from '../../hooks/useAuth';

const Header = ({
  title = 'PRIMEM WHATSAPP',
  subtitle = 'Business Communication',
  logo = '/LOGO.png',
  showUserMenu = true,
  showNotifications = true,
  showConnectionStatus = true,
  whatsappStatus = null,
  onSettingsClick = null,
  onNotificationClick = null,
  onLogoClick = null,
  customActions = [],
  theme = 'default',
  className = '',
  style = {}
}) => {
  // ====================================
  // HOOKS
  // ====================================
  const { user, logout } = useAuth();

  // ====================================
  // ESTADOS LOCAIS
  // ====================================
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Mock
  const dropdownRef = useRef(null);

  // ====================================
  // EFEITOS
  // ====================================

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ====================================
  // HANDLERS
  // ====================================
  const handleUserMenuClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleProfileClick = () => {
    setShowUserProfile(true);
    setShowUserDropdown(false);
  };

  const handleLogout = async () => {
    setShowUserDropdown(false);
    await logout();
  };

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      window.location.reload();
    }
  };

  // ====================================
  // UTILITÁRIOS
  // ====================================
  const getConnectionStatusColor = (status) => {
    switch (status?.state) {
      case 'connected':
        return '#10b981'; // green
      case 'connecting':
      case 'waiting_qr':
        return '#f59e0b'; // amber
      case 'disconnected':
      case 'error':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getConnectionStatusText = (status) => {
    switch (status?.state) {
      case 'connected':
        return `Conectado: ${status.userInfo?.name || 'WhatsApp'}`;
      case 'connecting':
        return 'Conectando...';
      case 'waiting_qr':
        return 'Aguardando QR Code';
      case 'disconnected':
        return 'Desconectado';
      case 'error':
        return 'Erro na conexão';
      default:
        return 'Status desconhecido';
    }
  };

  // ====================================
  // ESTILOS
  // ====================================
  const getThemeStyles = () => {
    const themes = {
      default: {
        background: 'linear-gradient(135deg, #2B4C8C 0%, #8B9DC3 100%)',
        textColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)'
      },
      light: {
        background: '#ffffff',
        textColor: '#1f2937',
        borderColor: '#e5e7eb'
      },
      dark: {
        background: '#1f2937',
        textColor: 'white',
        borderColor: '#374151'
      },
      primem: {
        background: 'linear-gradient(135deg, #2B4C8C 0%, #C97A4A 100%)',
        textColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }
    };

    return themes[theme] || themes.default;
  };

  const themeStyles = getThemeStyles();

  const styles = {
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      background: themeStyles.background,
      color: themeStyles.textColor,
      borderBottom: `1px solid ${themeStyles.borderColor}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'relative',
      zIndex: 1000,
      minHeight: '70px',
      ...style
    },

    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },

    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      transition: 'background-color 0.2s'
    },

    logo: {
      width: '40px',
      height: '40px',
      objectFit: 'contain'
    },

    titleSection: {
      display: 'flex',
      flexDirection: 'column'
    },

    title: {
      fontSize: '20px',
      fontWeight: '700',
      margin: 0,
      lineHeight: '1.2'
    },

    subtitle: {
      fontSize: '13px',
      opacity: 0.8,
      margin: 0,
      lineHeight: '1.2'
    },

    centerSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },

    connectionStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500'
    },

    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      animation: 'pulse 2s infinite'
    },

    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },

    notificationButton: {
      position: 'relative',
      padding: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      borderRadius: '8px',
      color: 'inherit',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: '18px'
    },

    notificationBadge: {
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      backgroundColor: '#ef4444',
      color: 'white',
      borderRadius: '10px',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: '600'
    },

    userSection: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },

    userInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      cursor: 'pointer'
    },

    userName: {
      fontSize: '14px',
      fontWeight: '600',
      margin: 0,
      lineHeight: '1.2'
    },

    userRole: {
      fontSize: '12px',
      opacity: 0.8,
      margin: 0,
      lineHeight: '1.2'
    },

    userAvatar: {
      cursor: 'pointer',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '50%'
    },

    dropdown: {
      position: 'absolute',
      top: '100%',
      right: '0',
      marginTop: '8px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      minWidth: '200px',
      zIndex: 1000,
      overflow: 'hidden'
    },

    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      color: '#374151',
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: '14px',
      border: 'none',
      background: 'none',
      width: '100%',
      textAlign: 'left'
    },

    dropdownDivider: {
      height: '1px',
      backgroundColor: '#e5e7eb',
      margin: '4px 0'
    },

    customActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },

    // Responsividade
    '@media (max-width: 768px)': {
      header: {
        padding: '8px 16px'
      },
      
      titleSection: {
        display: 'none'
      },
      
      userInfo: {
        display: 'none'
      },
      
      centerSection: {
        display: 'none'
      }
    }
  };

  // ====================================
  // RENDER
  // ====================================
  return (
    <>
      <header className={className} style={styles.header}>
        {/* Seção Esquerda - Logo e Título */}
        <div style={styles.leftSection}>
          <div 
            style={styles.logoSection}
            onClick={handleLogoClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <img 
              src={logo} 
              alt="Logo"
              style={styles.logo}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div style={styles.titleSection}>
              <h1 style={styles.title}>{title}</h1>
              {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>
        </div>

        {/* Seção Central - Status de Conexão */}
        {showConnectionStatus && whatsappStatus && (
          <div style={styles.centerSection}>
            <div style={styles.connectionStatus}>
              <div 
                style={{
                  ...styles.statusDot,
                  backgroundColor: getConnectionStatusColor(whatsappStatus)
                }}
              />
              <span>{getConnectionStatusText(whatsappStatus)}</span>
            </div>
          </div>
        )}

        {/* Seção Direita - Ações e Usuário */}
        <div style={styles.rightSection}>
          {/* Ações Customizadas */}
          {customActions.length > 0 && (
            <div style={styles.customActions}>
              {customActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="small"
                  onClick={action.onClick}
                  title={action.title}
                >
                  {action.icon || action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Botão de Notificações */}
          {showNotifications && (
            <button
              style={styles.notificationButton}
              onClick={onNotificationClick}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              title="Notificações"
            >
              🔔
              {notificationCount > 0 && (
                <span style={styles.notificationBadge}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>
          )}

          {/* Botão de Configurações */}
          {onSettingsClick && (
            <button
              style={styles.notificationButton}
              onClick={onSettingsClick}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              title="Configurações"
            >
              ⚙️
            </button>
          )}

          {/* Menu do Usuário */}
          {showUserMenu && user && (
            <div style={styles.userSection} ref={dropdownRef}>
              <div style={styles.userInfo} onClick={handleUserMenuClick}>
                <span style={styles.userName}>{user.name}</span>
                <span style={styles.userRole}>
                  {user.role === 'admin' ? '👑 Admin' : 
                   user.role === 'manager' ? '👨‍💼 Gerente' : '👤 Usuário'}
                </span>
              </div>
              
              <div style={styles.userAvatar} onClick={handleUserMenuClick}>
                <Avatar
                  src={user.avatar}
                  name={user.name}
                  size="medium"
                />
              </div>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div style={styles.dropdown}>
                  <button
                    style={styles.dropdownItem}
                    onClick={handleProfileClick}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    👤 Meu Perfil
                  </button>
                  
                  <button
                    style={styles.dropdownItem}
                    onClick={() => {
                      setShowUserDropdown(false);
                      onSettingsClick && onSettingsClick();
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    ⚙️ Configurações
                  </button>

                  <button
                    style={styles.dropdownItem}
                    onClick={() => {
                      setShowUserDropdown(false);
                      alert('Ajuda em desenvolvimento');
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    ❓ Ajuda
                  </button>

                  <div style={styles.dropdownDivider} />
                  
                  <button
                    style={{
                      ...styles.dropdownItem,
                      color: '#dc2626'
                    }}
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    🚪 Sair
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Modal de Perfil */}
      {showUserProfile && (
        <UserProfile
          user={user}
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          onUpdateProfile={async (profileData) => {
            // Implementar atualização via hook useAuth
            console.log('Atualizando perfil:', profileData);
            return { success: true };
          }}
          onChangePassword={async (currentPassword, newPassword) => {
            // Implementar alteração de senha
            console.log('Alterando senha');
            return { success: true };
          }}
        />
      )}

      {/* CSS para animações */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

// ====================================
// PROP TYPES
// ====================================
Header.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  logo: PropTypes.string,
  showUserMenu: PropTypes.bool,
  showNotifications: PropTypes.bool,
  showConnectionStatus: PropTypes.bool,
  whatsappStatus: PropTypes.shape({
    state: PropTypes.string,
    userInfo: PropTypes.object
  }),
  onSettingsClick: PropTypes.func,
  onNotificationClick: PropTypes.func,
  onLogoClick: PropTypes.func,
  customActions: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.node,
    label: PropTypes.string,
    onClick: PropTypes.func,
    title: PropTypes.string
  })),
  theme: PropTypes.oneOf(['default', 'light', 'dark', 'primem']),
  className: PropTypes.string,
  style: PropTypes.object
};

export default Header;