// client/src/components/layout/Sidebar.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE DE BARRA LATERAL
// Navegação lateral com menus, chats e controles do WhatsApp
// =====================================

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Importar componentes
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Input from '../ui/Input';
import Loading from '../ui/Loading';

// Importar hooks
import useAuth from '../../hooks/useAuth';

const Sidebar = ({
  isCollapsed = false,
  onToggleCollapse = null,
  showWhatsAppStatus = true,
  showChatList = true,
  showNavigation = true,
  whatsappStatus = null,
  chats = [],
  selectedChatId = null,
  onChatSelect = null,
  onConnectWhatsApp = null,
  onDisconnectWhatsApp = null,
  isConnecting = false,
  qrCode = null,
  searchTerm = '',
  onSearchChange = null,
  customMenuItems = [],
  className = '',
  style = {},
  theme = 'default'
}) => {
  // ====================================
  // HOOKS
  // ====================================
  const { user } = useAuth();

  // ====================================
  // ESTADOS LOCAIS
  // ====================================
  const [activeSection, setActiveSection] = useState('chats');
  const [expandedMenus, setExpandedMenus] = useState(['main']);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // ====================================
  // EFEITOS
  // ====================================
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // ====================================
  // HANDLERS
  // ====================================
  const handleSearchChange = (value) => {
    setLocalSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleMenuToggle = (menuId) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // ====================================
  // DADOS DE NAVEGAÇÃO
  // ====================================
  const navigationItems = [
    {
      id: 'chats',
      label: 'Conversas',
      icon: '💬',
      count: chats.length,
      active: activeSection === 'chats'
    },
    {
      id: 'contacts',
      label: 'Contatos',
      icon: '👥',
      count: 0,
      active: activeSection === 'contacts'
    },
    {
      id: 'groups',
      label: 'Grupos',
      icon: '👥',
      count: chats.filter(chat => chat.isGroup).length,
      active: activeSection === 'groups'
    },
    {
      id: 'archived',
      label: 'Arquivados',
      icon: '📁',
      count: 0,
      active: activeSection === 'archived'
    },
    {
      id: 'starred',
      label: 'Favoritos',
      icon: '⭐',
      count: 0,
      active: activeSection === 'starred'
    }
  ];

  const menuItems = [
    {
      id: 'main',
      label: 'Principal',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '#dashboard' },
        { id: 'analytics', label: 'Analytics', icon: '📈', href: '#analytics' },
        { id: 'reports', label: 'Relatórios', icon: '📋', href: '#reports' }
      ]
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      items: [
        { id: 'connection', label: 'Conexão', icon: '🔌', href: '#connection' },
        { id: 'broadcast', label: 'Broadcast', icon: '📢', href: '#broadcast' },
        { id: 'templates', label: 'Modelos', icon: '📝', href: '#templates' }
      ]
    },
    {
      id: 'tools',
      label: 'Ferramentas', 
      items: [
        { id: 'scheduler', label: 'Agendador', icon: '⏰', href: '#scheduler' },
        { id: 'autoresponder', label: 'Auto-resposta', icon: '🤖', href: '#autoresponder' },
        { id: 'integrations', label: 'Integrações', icon: '🔗', href: '#integrations' }
      ]
    },
    {
      id: 'settings',
      label: 'Configurações',
      items: [
        { id: 'general', label: 'Geral', icon: '⚙️', href: '#settings/general' },
        { id: 'notifications', label: 'Notificações', icon: '🔔', href: '#settings/notifications' },
        { id: 'security', label: 'Segurança', icon: '🔒', href: '#settings/security' }
      ]
    },
    ...customMenuItems
  ];

  // ====================================
  // FILTRAR CHATS
  // ====================================
  const filteredChats = chats.filter(chat => {
    if (!localSearchTerm) return true;
    
    const searchLower = localSearchTerm.toLowerCase();
    return (
      chat.name?.toLowerCase().includes(searchLower) ||
      chat.pushname?.toLowerCase().includes(searchLower) ||
      chat.lastMessage?.body?.toLowerCase().includes(searchLower)
    );
  });

  // ====================================
  // ESTILOS
  // ====================================
  const getThemeStyles = () => {
    const themes = {
      default: {
        background: '#ffffff',
        borderColor: '#e5e7eb',
        textColor: '#374151',
        hoverColor: '#f3f4f6',
        activeColor: '#2B4C8C',
        activeTextColor: 'white'
      },
      dark: {
        background: '#1f2937',
        borderColor: '#374151',
        textColor: '#d1d5db',
        hoverColor: '#374151',
        activeColor: '#2B4C8C',
        activeTextColor: 'white'
      },
      primem: {
        background: '#f8f9fa',
        borderColor: '#dee2e6',
        textColor: '#495057',
        hoverColor: '#e9ecef',
        activeColor: '#2B4C8C',
        activeTextColor: 'white'
      }
    };

    return themes[theme] || themes.default;
  };

  const themeStyles = getThemeStyles();

  const styles = {
    sidebar: {
      width: isCollapsed ? '60px' : '320px',
      minWidth: isCollapsed ? '60px' : '320px',
      height: '100vh',
      backgroundColor: themeStyles.background,
      borderRight: `1px solid ${themeStyles.borderColor}`,
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      position: 'relative',
      ...style
    },

    header: {
      padding: isCollapsed ? '12px 8px' : '16px',
      borderBottom: `1px solid ${themeStyles.borderColor}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '64px'
    },

    collapseButton: {
      padding: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      color: themeStyles.textColor,
      fontSize: '16px',
      transition: 'background-color 0.2s'
    },

    headerTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: themeStyles.textColor,
      margin: 0,
      opacity: isCollapsed ? 0 : 1,
      transition: 'opacity 0.3s'
    },

    content: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },

    // WhatsApp Status Section
    whatsappSection: {
      padding: isCollapsed ? '8px' : '16px',
      borderBottom: `1px solid ${themeStyles.borderColor}`
    },

    statusCard: {
      padding: isCollapsed ? '8px' : '12px',
      backgroundColor: whatsappStatus?.isConnected ? '#dcfce7' : '#fef2f2',
      border: `1px solid ${whatsappStatus?.isConnected ? '#bbf7d0' : '#fecaca'}`,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },

    statusIcon: {
      fontSize: isCollapsed ? '16px' : '20px'
    },

    statusText: {
      fontSize: '14px',
      fontWeight: '500',
      color: whatsappStatus?.isConnected ? '#166534' : '#dc2626',
      opacity: isCollapsed ? 0 : 1,
      transition: 'opacity 0.3s',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    },

    qrSection: {
      padding: '16px',
      textAlign: 'center',
      opacity: isCollapsed ? 0 : 1,
      transition: 'opacity 0.3s'
    },

    qrImage: {
      width: '100%',
      maxWidth: '200px',
      height: 'auto',
      borderRadius: '8px'
    },

    qrText: {
      fontSize: '14px',
      color: themeStyles.textColor,
      marginTop: '8px'
    },

    // Navigation Section
    navigationSection: {
      padding: isCollapsed ? '8px 4px' : '8px 16px',
      borderBottom: `1px solid ${themeStyles.borderColor}`
    },

    navList: {
      display: 'flex',
      flexDirection: isCollapsed ? 'column' : 'row',
      gap: '4px',
      overflowX: isCollapsed ? 'visible' : 'auto'
    },

    navItem: {
      padding: isCollapsed ? '8px' : '6px 12px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: themeStyles.textColor,
      textAlign: isCollapsed ? 'center' : 'left',
      flexDirection: isCollapsed ? 'column' : 'row',
      minWidth: isCollapsed ? '44px' : 'auto',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap'
    },

    navItemActive: {
      backgroundColor: themeStyles.activeColor,
      color: themeStyles.activeTextColor
    },

    navIcon: {
      fontSize: isCollapsed ? '16px' : '14px'
    },

    navLabel: {
      opacity: isCollapsed ? 0 : 1,
      fontSize: isCollapsed ? '10px' : '14px',
      transition: 'opacity 0.3s'
    },

    navCount: {
      backgroundColor: '#6b7280',
      color: 'white',
      borderRadius: '10px',
      padding: '2px 6px',
      fontSize: '11px',
      fontWeight: '600',
      minWidth: '18px',
      textAlign: 'center',
      opacity: isCollapsed ? 0 : 1
    },

    // Search Section
    searchSection: {
      padding: isCollapsed ? '8px 4px' : '12px 16px',
      borderBottom: `1px solid ${themeStyles.borderColor}`,
      opacity: isCollapsed ? 0 : 1,
      transition: 'opacity 0.3s'
    },

    // Chat List Section
    chatListSection: {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },

    chatListHeader: {
      padding: isCollapsed ? '8px' : '12px 16px',
      borderBottom: `1px solid ${themeStyles.borderColor}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },

    chatListTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: themeStyles.textColor,
      opacity: isCollapsed ? 0 : 1
    },

    chatList: {
      flex: 1,
      overflow: 'auto',
      padding: isCollapsed ? '4px' : '8px'
    },

    chatItem: {
      display: 'flex',
      alignItems: 'center',
      gap: isCollapsed ? '0' : '12px',
      padding: isCollapsed ? '8px' : '12px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      margin: '2px 0',
      justifyContent: isCollapsed ? 'center' : 'flex-start'
    },

    chatItemActive: {
      backgroundColor: themeStyles.activeColor,
      color: themeStyles.activeTextColor
    },

    chatAvatar: {
      flexShrink: 0
    },

    chatInfo: {
      flex: 1,
      minWidth: 0,
      opacity: isCollapsed ? 0 : 1,
      transition: 'opacity 0.3s'
    },

    chatName: {
      fontSize: '14px',
      fontWeight: '600',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },

    chatLastMessage: {
      fontSize: '13px',
      color: themeStyles.textColor,
      opacity: 0.7,
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },

    chatMeta: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '4px',
      opacity: isCollapsed ? 0 : 1
    },

    chatTime: {
      fontSize: '12px',
      color: themeStyles.textColor,
      opacity: 0.6
    },

    chatUnread: {
      backgroundColor: '#10b981',
      color: 'white',
      borderRadius: '10px',
      padding: '2px 6px',
      fontSize: '11px',
      fontWeight: '600',
      minWidth: '18px',
      textAlign: 'center'
    },

    // Menu Section
    menuSection: {
      borderTop: `1px solid ${themeStyles.borderColor}`,
      maxHeight: '40%',
      overflow: 'auto'
    },

    menuGroup: {
      borderBottom: `1px solid ${themeStyles.borderColor}`
    },

    menuGroupHeader: {
      padding: isCollapsed ? '8px' : '12px 16px',
      backgroundColor: themeStyles.hoverColor,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '14px',
      fontWeight: '600',
      color: themeStyles.textColor
    },

    menuGroupTitle: {
      opacity: isCollapsed ? 0 : 1
    },

    menuGroupIcon: {
      fontSize: '12px',
      transition: 'transform 0.2s'
    },

    menuItems: {
      padding: isCollapsed ? '4px' : '4px 0'
    },

    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: isCollapsed ? '0' : '12px',
      padding: isCollapsed ? '8px' : '8px 32px',
      color: themeStyles.textColor,
      textDecoration: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      justifyContent: isCollapsed ? 'center' : 'flex-start'
    },

    menuItemIcon: {
      fontSize: '16px',
      width: '20px',
      textAlign: 'center'
    },

    menuItemLabel: {
      opacity: isCollapsed ? 0 : 1,
      transition: 'opacity 0.3s'
    },

    emptyState: {
      padding: '40px 20px',
      textAlign: 'center',
      color: themeStyles.textColor,
      opacity: 0.6
    },

    loadingContainer: {
      padding: '20px',
      display: 'flex',
      justifyContent: 'center'
    }
  };

  // ====================================
  // RENDER
  // ====================================
  return (
    <div className={className} style={styles.sidebar}>
      {/* Header */}
      <div style={styles.header}>
        {!isCollapsed && (
          <h2 style={styles.headerTitle}>Menu</h2>
        )}
        
        {onToggleCollapse && (
          <button
            style={styles.collapseButton}
            onClick={onToggleCollapse}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = themeStyles.hoverColor;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            title={isCollapsed ? 'Expandir' : 'Recolher'}
          >
            {isCollapsed ? '▶️' : '◀️'}
          </button>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* WhatsApp Status */}
        {showWhatsAppStatus && (
          <div style={styles.whatsappSection}>
            <div style={styles.statusCard}>
              <span style={styles.statusIcon}>
                {whatsappStatus?.isConnected ? '✅' : '❌'}
              </span>
              {!isCollapsed && (
                <span style={styles.statusText}>
                  {whatsappStatus?.isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              )}
            </div>

            {/* Botões de Conexão */}
            {!isCollapsed && (
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                {!whatsappStatus?.isConnected ? (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={onConnectWhatsApp}
                    loading={isConnecting}
                    fullWidth
                  >
                    {isConnecting ? 'Conectando...' : 'Conectar'}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={onDisconnectWhatsApp}
                    fullWidth
                  >
                    Desconectar
                  </Button>
                )}
              </div>
            )}

            {/* QR Code */}
            {qrCode && !isCollapsed && (
              <div style={styles.qrSection}>
                <img src={qrCode} alt="QR Code" style={styles.qrImage} />
                <p style={styles.qrText}>
                  Escaneie com seu WhatsApp
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        {showNavigation && (
          <div style={styles.navigationSection}>
            <div style={styles.navList}>
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  style={{
                    ...styles.navItem,
                    ...(item.active ? styles.navItemActive : {})
                  }}
                  onClick={() => handleSectionChange(item.id)}
                  onMouseEnter={(e) => {
                    if (!item.active) {
                      e.target.style.backgroundColor = themeStyles.hoverColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!item.active) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                  title={isCollapsed ? item.label : ''}
                >
                  <span style={styles.navIcon}>{item.icon}</span>
                  <span style={styles.navLabel}>{item.label}</span>
                  {item.count > 0 && (
                    <span style={styles.navCount}>{item.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        {showChatList && onSearchChange && (
          <div style={styles.searchSection}>
            <Input
              placeholder="Buscar conversas..."
              value={localSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              size="small"
            />
          </div>
        )}

        {/* Chat List */}
        {showChatList && (
          <div style={styles.chatListSection}>
            <div style={styles.chatListHeader}>
              {!isCollapsed && (
                <span style={styles.chatListTitle}>
                  Conversas ({filteredChats.length})
                </span>
              )}
            </div>

            <div style={styles.chatList}>
              {filteredChats.length === 0 ? (
                <div style={styles.emptyState}>
                  {localSearchTerm ? (
                    <>
                      🔍<br />
                      Nenhuma conversa encontrada
                    </>
                  ) : (
                    <>
                      💬<br />
                      Nenhuma conversa ainda
                    </>
                  )}
                </div>
              ) : (
                filteredChats.map(chat => (
                  <div
                    key={chat.id}
                    style={{
                      ...styles.chatItem,
                      ...(selectedChatId === chat.id ? styles.chatItemActive : {})
                    }}
                    onClick={() => onChatSelect && onChatSelect(chat.id)}
                    onMouseEnter={(e) => {
                      if (selectedChatId !== chat.id) {
                        e.target.style.backgroundColor = themeStyles.hoverColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedChatId !== chat.id) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                    title={isCollapsed ? chat.name : ''}
                  >
                    <div style={styles.chatAvatar}>
                      <Avatar
                        src={chat.profilePic}
                        name={chat.name}
                        size="medium"
                      />
                    </div>

                    <div style={styles.chatInfo}>
                      <h4 style={styles.chatName}>{chat.name}</h4>
                      {chat.lastMessage && (
                        <p style={styles.chatLastMessage}>
                          {chat.lastMessage.fromMe ? 'Você: ' : ''}
                          {chat.lastMessage.body || '📎 Mídia'}
                        </p>
                      )}
                    </div>

                    <div style={styles.chatMeta}>
                      {chat.timestamp && (
                        <span style={styles.chatTime}>
                          {new Date(chat.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                      {chat.unreadCount > 0 && (
                        <span style={styles.chatUnread}>
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div style={styles.menuSection}>
          {menuItems.map(group => (
            <div key={group.id} style={styles.menuGroup}>
              <div
                style={styles.menuGroupHeader}
                onClick={() => handleMenuToggle(group.id)}
              >
                {!isCollapsed && (
                  <span style={styles.menuGroupTitle}>{group.label}</span>
                )}
                <span
                  style={{
                    ...styles.menuGroupIcon,
                    transform: expandedMenus.includes(group.id) 
                      ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                >
                  ▼
                </span>
              </div>

              {expandedMenus.includes(group.id) && (
                <div style={styles.menuItems}>
                  {group.items.map(item => (
                    <a
                      key={item.id}
                      href={item.href}
                      style={styles.menuItem}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = themeStyles.hoverColor;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                      title={isCollapsed ? item.label : ''}
                    >
                      <span style={styles.menuItemIcon}>{item.icon}</span>
                      <span style={styles.menuItemLabel}>{item.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ====================================
// PROP TYPES
// ====================================
Sidebar.propTypes = {
  isCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  showWhatsAppStatus: PropTypes.bool,
  showChatList: PropTypes.bool,
  showNavigation: PropTypes.bool,
  whatsappStatus: PropTypes.shape({
    isConnected: PropTypes.bool,
    state: PropTypes.string,
    userInfo: PropTypes.object
  }),
  chats: PropTypes.array,
  selectedChatId: PropTypes.string,
  onChatSelect: PropTypes.func,
  onConnectWhatsApp: PropTypes.func,
  onDisconnectWhatsApp: PropTypes.func,
  isConnecting: PropTypes.bool,
  qrCode: PropTypes.string,
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  customMenuItems: PropTypes.array,
  className: PropTypes.string,
  style: PropTypes.object,
  theme: PropTypes.oneOf(['default', 'dark', 'primem'])
};

export default Sidebar;