// ARQUIVO: client/src/components/layout/Navigation.js (CÓDIGO JAVASCRIPT COMPLETO)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useWhatsApp from '../../hooks/useWhatsApp';
import './Navigation.css';

const Navigation = ({ 
  onNavigateToChat, 
  onNavigateToConnection, 
  onNavigateToSettings,
  currentPage = 'dashboard',
  onCollapseToggle,
  defaultCollapsed = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isConnected, connectionStatus, clientInfo, qrCode } = useWhatsApp();
  
  // Estados expandidos
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeen, setLastSeen] = useState('Online');
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [connectionRetries, setConnectionRetries] = useState(0);

  // Refs para performance
  const navigationRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  // Estados dinâmicos otimizados
  useEffect(() => {
    let interval;
    if (isConnected) {
      // Simular contagem de não lidas com throttling
      interval = setInterval(() => {
        if (Date.now() - lastUpdateRef.current > 5000) { // Throttle 5s
          setUnreadCount(Math.floor(Math.random() * 15));
          lastUpdateRef.current = Date.now();
        }
      }, 10000);
    } else {
      setUnreadCount(0);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // Atualizar last seen de forma otimizada
  useEffect(() => {
    const updateLastSeen = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setLastSeen(`Ativo ${timeString}`);
    };

    updateLastSeen();
    const interval = setInterval(updateLastSeen, 60000);
    return () => clearInterval(interval);
  }, []);

  // Monitorar tentativas de reconexão
  useEffect(() => {
    if (connectionStatus?.includes('reconectando')) {
      setConnectionRetries(prev => prev + 1);
    } else if (isConnected) {
      setConnectionRetries(0);
    }
  }, [connectionStatus, isConnected]);

  // Sistema de notificações interno
  const addNotification = useCallback((message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Manter apenas 5
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  // Menu items com configurações avançadas
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
      count: null,
      description: 'Visão geral e estatísticas',
      shortcut: 'Ctrl+D',
      color: '#3b82f6',
      requiresConnection: false,
      adminOnly: false,
      onClick: () => navigate('/dashboard')
    },
    {
      id: 'chat',
      label: 'Conversas',
      icon: '💬',
      path: '/chat',
      count: unreadCount > 0 ? unreadCount : null,
      description: 'Gerenciar conversas WhatsApp',
      shortcut: 'Ctrl+C',
      color: '#10b981',
      requiresConnection: true,
      adminOnly: false,
      badge: !isConnected ? { text: 'Offline', color: '#ef4444' } : null,
      loading: connectionStatus === 'connecting',
      onClick: () => {
        if (isConnected) {
          if (onNavigateToChat) {
            onNavigateToChat();
          } else {
            navigate('/chat');
          }
        } else {
          addNotification('WhatsApp não está conectado', 'error');
        }
      }
    },
    {
      id: 'connection',
      label: 'Conexão',
      icon: '🔗',
      path: '/connection',
      status: isConnected ? 'connected' : 'disconnected',
      description: 'Status da conexão WhatsApp',
      shortcut: 'Ctrl+K',
      color: isConnected ? '#10b981' : '#ef4444',
      requiresConnection: false,
      adminOnly: false,
      count: connectionRetries > 0 ? connectionRetries : null,
      onClick: () => {
        if (onNavigateToConnection) {
          onNavigateToConnection();
        } else {
          navigate('/connection');
        }
      }
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: '⚙️',
      path: '/settings',
      description: 'Configurações do sistema',
      shortcut: 'Ctrl+,',
      color: '#6b7280',
      requiresConnection: false,
      adminOnly: false,
      onClick: () => {
        if (onNavigateToSettings) {
          onNavigateToSettings();
        } else {
          navigate('/settings');
        }
      }
    },
    {
      id: 'admin',
      label: 'Administração',
      icon: '🛠️',
      path: '/admin',
      description: 'Painel administrativo',
      shortcut: 'Ctrl+A',
      color: '#f59e0b',
      requiresConnection: false,
      adminOnly: true,
      subItems: [
        { label: 'Usuários', path: '/admin/users', icon: '👥' },
        { label: 'Configurações de Texto', path: '/admin/text-configs', icon: '📝' },
        { label: 'Integração Bitrix', path: '/admin/bitrix', icon: '🔗' },
        { label: 'Logs do Sistema', path: '/admin/logs', icon: '📋' }
      ],
      onClick: () => {
        if (user?.role === 'admin') {
          navigate('/admin');
        } else {
          addNotification('Acesso restrito a administradores', 'error');
        }
      }
    }
  ];

  // Detectar página ativa
  const isActive = useCallback((item) => {
    if (currentPage && currentPage === item.id) return true;
    return location.pathname === item.path || 
           (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
  }, [currentPage, location.pathname]);

  // Handler de navegação com logging e validação
  const handleNavigation = useCallback(async (item) => {
    console.log(`🔄 Navegando: ${item.label} -> ${item.path}`);
    
    setIsLoading(true);
    
    try {
      // Validações
      if (item.requiresConnection && !isConnected) {
        throw new Error('WhatsApp não está conectado');
      }
      
      if (item.adminOnly && user?.role !== 'admin') {
        throw new Error('Acesso restrito a administradores');
      }
      
      // Executar navegação
      if (item.onClick) {
        await item.onClick();
      } else {
        navigate(item.path);
      }
      
      // Fechar menu mobile
      setIsMobileMenuOpen(false);
      
      console.log(`✅ Navegação executada para: ${item.path}`);
      addNotification(`Navegando para ${item.label}`, 'success');
      
    } catch (error) {
      console.error('❌ Erro na navegação:', error);
      addNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, user?.role, navigate, onNavigateToChat, onNavigateToConnection, onNavigateToSettings, addNotification]);

  // Handler de logout com confirmação
  const handleLogout = useCallback(async () => {
    if (!window.confirm('Tem certeza que deseja sair do sistema?')) {
      return;
    }

    console.log('🚪 Iniciando logout...');
    setIsLoading(true);
    
    try {
      await logout();
      navigate('/login');
      console.log('✅ Logout concluído');
      addNotification('Logout realizado com sucesso', 'success');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      addNotification('Erro ao fazer logout', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [logout, navigate, addNotification]);

  // Handler de collapse
  const handleCollapseToggle = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    
    if (onCollapseToggle) {
      onCollapseToggle(newCollapsed);
    }
    
    // Salvar preferência
    localStorage.setItem('navigation-collapsed', JSON.stringify(newCollapsed));
  }, [isCollapsed, onCollapseToggle]);

  // Restaurar estado de collapse
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('navigation-collapsed');
    if (savedCollapsed) {
      try {
        setIsCollapsed(JSON.parse(savedCollapsed));
      } catch (error) {
        console.warn('Erro ao restaurar estado de collapse:', error);
      }
    }
  }, []);

  // Atalhos do teclado expandidos
  useEffect(() => {
    const handleKeyboard = (e) => {
      // Atalhos com Ctrl/Cmd
      if (e.ctrlKey || e.metaKey) {
        const item = menuItems.find(item => 
          item.shortcut?.toLowerCase().includes(e.key.toLowerCase())
        );
        
        if (item) {
          e.preventDefault();
          handleNavigation(item);
          return;
        }
        
        // Atalhos especiais
        switch (e.key.toLowerCase()) {
          case 'q':
            e.preventDefault();
            handleLogout();
            break;
          case 'b':
            e.preventDefault();
            handleCollapseToggle();
            break;
          default:
            break;
        }
      }
      
      // ESC para fechar menu mobile
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [menuItems, handleNavigation, handleLogout, handleCollapseToggle, isMobileMenuOpen]);

  // Detectar clique fora (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navigationRef.current && !navigationRef.current.contains(event.target) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Filtrar itens do menu baseado em permissões
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    return true;
  });

  // Status da conexão expandido
  const getConnectionStatusInfo = () => {
    if (isConnected) {
      return {
        icon: '✅',
        text: 'WhatsApp Conectado',
        detail: clientInfo?.number || 'Dispositivo conectado',
        class: 'connected'
      };
    }
    
    if (connectionStatus === 'connecting' || connectionStatus === 'reconnecting') {
      return {
        icon: '🔄',
        text: 'Conectando...',
        detail: connectionRetries > 0 ? `Tentativa ${connectionRetries}` : 'Iniciando conexão',
        class: 'connecting'
      };
    }
    
    return {
      icon: '❌',
      text: 'WhatsApp Desconectado',
      detail: connectionStatus || 'Clique para conectar',
      class: 'disconnected'
    };
  };

  const connectionInfo = getConnectionStatusInfo();

  return (
    <>
      {/* Overlay mobile */}
      {isMobileMenuOpen && (
        <div 
          className="nav-mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <nav 
        ref={navigationRef}
        className={`navigation ${isCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
      >
        {/* Botão de collapse */}
        <button
          className="nav-collapse-btn"
          onClick={handleCollapseToggle}
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>

        {/* Header Expandido */}
        <div className="nav-header">
          <div className="nav-brand">
            <div className="nav-logo">
              <img src="/LOGO.png" alt="PRIMEM" className="nav-logo-img" />
              <span className="nav-logo-text">PRIMEM WhatsApp</span>
            </div>
            <div className="nav-version">v2.0.0 • Build 16</div>
          </div>
          
          <div className="nav-user-section">
            <div className="nav-user-card">
              <div className="nav-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="nav-user-info">
                <span className="nav-user-name">{user?.name || 'Usuário'}</span>
                <span className="nav-user-role">{user?.role || 'agent'}</span>
                <span className="nav-user-status">{lastSeen}</span>
              </div>
              <div className="nav-user-indicator">
                <div className="status-dot online"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Status WhatsApp Expandido */}
        <div className="nav-whatsapp-status">
          <div className={`whatsapp-card ${connectionInfo.class}`}>
            <div className="whatsapp-icon">{connectionInfo.icon}</div>
            <div className="whatsapp-info">
              <span className="whatsapp-status">{connectionInfo.text}</span>
              <small className="whatsapp-detail">{connectionInfo.detail}</small>
              {qrCode && !isConnected && (
                <small className="whatsapp-number">QR Code disponível</small>
              )}
            </div>
          </div>
        </div>

        {/* Notificações internas */}
        {notifications.length > 0 && !isCollapsed && (
          <div className="nav-notifications">
            {notifications.slice(0, 3).map(notification => (
              <div 
                key={notification.id}
                className={`nav-notification nav-notification-${notification.type}`}
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}

        {/* Menu Principal */}
        <div className="nav-menu">
          <div className="nav-menu-header">
            <span>NAVEGAÇÃO</span>
          </div>
          
          {filteredMenuItems.map((item) => {
            const active = isActive(item);
            const disabled = (item.requiresConnection && !isConnected) || 
                           (item.adminOnly && user?.role !== 'admin') ||
                           isLoading;
            
            return (
              <div
                key={item.id}
                className={`nav-menu-item ${active ? 'active' : ''} ${disabled ? 'disabled' : ''} ${item.loading ? 'nav-item-loading' : ''}`}
                onClick={() => !disabled && handleNavigation(item)}
                title={`${item.description}\n${item.shortcut ? `Atalho: ${item.shortcut}` : ''}`}
              >
                <div className="nav-item-content">
                  <span className="nav-item-icon">{item.icon}</span>
                  <div className="nav-item-text">
                    <span className="nav-item-label">{item.label}</span>
                    <small className="nav-item-desc">{item.description}</small>
                  </div>
                </div>
                
                <div className="nav-item-indicators">
                  {/* Count badge */}
                  {item.count && (
                    <span className="nav-item-count">{item.count}</span>
                  )}
                  
                  {/* Status indicator */}
                  {item.status && (
                    <span className={`nav-item-status ${item.status}`}>
                      {item.status === 'connected' ? '●' : '○'}
                    </span>
                  )}
                  
                  {/* Badge */}
                  {item.badge && (
                    <span 
                      className="nav-item-badge" 
                      style={{ backgroundColor: item.badge.color }}
                    >
                      {item.badge.text}
                    </span>
                  )}
                  
                  {/* Shortcut */}
                  {!isCollapsed && (
                    <span className="nav-item-shortcut">{item.shortcut}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ações Rápidas */}
        <div className="nav-quick-actions">
          <div className="nav-menu-header">
            <span>AÇÕES RÁPIDAS</span>
          </div>
          
          <button 
            className="nav-quick-action"
            onClick={() => handleNavigation({ path: '/chat', label: 'Nova Conversa' })}
            disabled={!isConnected || isLoading}
          >
            <span>💬</span>
            <span>Nova Conversa</span>
          </button>
          
          <button 
            className="nav-quick-action"
            onClick={() => window.location.reload()}
            disabled={isLoading}
          >
            <span>🔄</span>
            <span>Atualizar Página</span>
          </button>

          <button 
            className="nav-quick-action"
            onClick={() => handleCollapseToggle()}
          >
            <span>{isCollapsed ? '▶' : '◀'}</span>
            <span>{isCollapsed ? 'Expandir' : 'Recolher'}</span>
          </button>
        </div>

        {/* Debug Info */}
        {!isCollapsed && (
          <div className="nav-debug">
            <small>Rota: {location.pathname}</small>
            <small>Status: {connectionStatus || 'N/A'}</small>
            <small>Usuário: {user?.name || 'N/A'}</small>
            <small>Collapsed: {isCollapsed ? 'Sim' : 'Não'}</small>
            <small>Build: {new Date().toLocaleDateString()}</small>
          </div>
        )}

        {/* Footer */}
        <div className="nav-footer">
          <button 
            className="nav-logout" 
            onClick={handleLogout}
            disabled={isLoading}
          >
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Sair do Sistema</span>
            <span className="logout-shortcut">Ctrl+Q</span>
          </button>
          
          <div className="nav-footer-info">
            <small>© 2025 PRIMEM COMEX</small>
            <small>Desenvolvido por David Fortunato</small>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;