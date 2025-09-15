// client/src/components/layout/index.js
// =====================================
// PRIMEM WHATSAPP - EXPORTAÇÃO CENTRALIZADA DOS COMPONENTES DE LAYOUT
// Importação única para todos os componentes de layout estrutural
// =====================================

// Importar todos os componentes de layout
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Navigation, { Breadcrumb, Tabs, Pills, SidebarNavigation } from './Navigation';

// ====================================
// EXPORTAÇÃO PADRÃO (RECOMENDADA)
// ====================================
export {
  Header,
  Sidebar,
  Footer,
  Navigation,
  Breadcrumb,
  Tabs,
  Pills,
  SidebarNavigation
};

// ====================================
// EXPORTAÇÃO COMO OBJETO (ALTERNATIVA)
// ====================================
export const layoutComponents = {
  Header,
  Sidebar,
  Footer,
  Navigation,
  Breadcrumb,
  Tabs,
  Pills,
  SidebarNavigation
};

// ====================================
// EXPORTAÇÃO DEFAULT PARA COMPATIBILIDADE
// ====================================
export default {
  Header,
  Sidebar,
  Footer,
  Navigation,
  Breadcrumb,
  Tabs,
  Pills,
  SidebarNavigation
};

// ====================================
// COMPONENTES DE LAYOUT COMPOSTOS
// ====================================

/**
 * Layout básico com Header, Sidebar e Footer
 */
export const BasicLayout = ({ 
  children,
  showHeader = true,
  showSidebar = true,
  showFooter = true,
  sidebarCollapsed = false,
  headerProps = {},
  sidebarProps = {},
  footerProps = {},
  className = '',
  style = {}
}) => {
  const layoutStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      ...style
    },
    
    main: {
      flex: 1,
      display: 'flex',
      overflow: 'hidden'
    },
    
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '20px'
    }
  };

  return (
    <div className={className} style={layoutStyles.container}>
      {showHeader && <Header {...headerProps} />}
      
      <div style={layoutStyles.main}>
        {showSidebar && (
          <Sidebar 
            isCollapsed={sidebarCollapsed} 
            {...sidebarProps} 
          />
        )}
        
        <div style={layoutStyles.content}>
          {children}
        </div>
      </div>
      
      {showFooter && <Footer {...footerProps} />}
    </div>
  );
};

/**
 * Layout da aplicação principal (Dashboard)
 */
export const DashboardLayout = ({ 
  children,
  user,
  whatsappStatus,
  onLogout,
  onSettingsClick,
  className = '',
  ...props 
}) => {
  return (
    <BasicLayout
      className={className}
      headerProps={{
        title: 'PRIMEM WHATSAPP',
        subtitle: 'Business Communication',
        showUserMenu: true,
        showConnectionStatus: true,
        whatsappStatus,
        onSettingsClick,
        customActions: [
          {
            icon: '📊',
            label: 'Dashboard',
            onClick: () => console.log('Dashboard clicked'),
            title: 'Ir para Dashboard'
          }
        ]
      }}
      sidebarProps={{
        showWhatsAppStatus: true,
        showChatList: true,
        whatsappStatus,
        ...props.sidebarProps
      }}
      footerProps={{
        showSystemInfo: true,
        showConnectionStatus: true,
        whatsappStatus,
        ...props.footerProps
      }}
      {...props}
    >
      {children}
    </BasicLayout>
  );
};

/**
 * Layout para chat (sem sidebar de menu, apenas chats)
 */
export const ChatLayout = ({ 
  children,
  chats = [],
  selectedChatId,
  onChatSelect,
  searchTerm,
  onSearchChange,
  whatsappStatus,
  className = '',
  ...props 
}) => {
  return (
    <BasicLayout
      className={className}
      headerProps={{
        title: 'PRIMEM WHATSAPP',
        subtitle: `${chats.length} conversas`,
        showConnectionStatus: true,
        whatsappStatus,
        ...props.headerProps
      }}
      sidebarProps={{
        showWhatsAppStatus: false,
        showChatList: true,
        showNavigation: false,
        chats,
        selectedChatId,
        onChatSelect,
        searchTerm,
        onSearchChange,
        whatsappStatus,
        ...props.sidebarProps
      }}
      footerProps={{
        showSystemInfo: false,
        showConnectionStatus: true,
        showQuickActions: false,
        whatsappStatus,
        position: 'relative',
        ...props.footerProps
      }}
      {...props}
    >
      {children}
    </BasicLayout>
  );
};

/**
 * Layout de autenticação (apenas centralized content)
 */
export const AuthLayout = ({ 
  children,
  showHeader = false,
  showFooter = true,
  className = '',
  ...props 
}) => {
  const authStyles = {
    container: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #2B4C8C 0%, #C97A4A 100%)'
    },
    
    content: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }
  };

  return (
    <div className={className} style={authStyles.container}>
      {showHeader && (
        <Header 
          title="PRIMEM COMEX"
          subtitle="Sistema de Autenticação"
          showUserMenu={false}
          showNotifications={false}
          showConnectionStatus={false}
          theme="primem"
          {...props.headerProps}
        />
      )}
      
      <div style={authStyles.content}>
        {children}
      </div>
      
      {showFooter && (
        <Footer
          showSystemInfo={false}
          showConnectionStatus={false}
          showQuickActions={false}
          theme="primem"
          position="relative"
          {...props.footerProps}
        />
      )}
    </div>
  );
};

/**
 * Layout modal/overlay
 */
export const ModalLayout = ({ 
  children,
  title,
  onClose,
  showHeader = true,
  className = '',
  style = {}
}) => {
  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    
    container: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      maxWidth: '90vw',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      ...style
    },
    
    header: {
      padding: '20px 24px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    
    closeButton: {
      padding: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '20px',
      color: '#6b7280'
    },
    
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '24px'
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div 
        className={className} 
        style={modalStyles.container}
        onClick={(e) => e.stopPropagation()}
      >
        {showHeader && (
          <div style={modalStyles.header}>
            <h2 style={modalStyles.title}>{title}</h2>
            <button 
              style={modalStyles.closeButton}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              ✕
            </button>
          </div>
        )}
        
        <div style={modalStyles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ====================================
// CONSTANTES ÚTEIS
// ====================================
export const LAYOUT_TYPES = {
  BASIC: 'basic',
  DASHBOARD: 'dashboard',
  CHAT: 'chat',
  AUTH: 'auth',
  MODAL: 'modal'
};

export const LAYOUT_THEMES = {
  DEFAULT: 'default',
  DARK: 'dark',
  PRIMEM: 'primem',
  MINIMAL: 'minimal'
};

export const NAVIGATION_TYPES = {
  BREADCRUMB: 'breadcrumb',
  TABS: 'tabs',
  PILLS: 'pills',
  SIDEBAR: 'sidebar'
};

// ====================================
// HOOKS ÚTEIS
// ====================================

/**
 * Hook para gerenciar colapso da sidebar
 */
export const useSidebarCollapse = (initialState = false) => {
  const [isCollapsed, setIsCollapsed] = React.useState(initialState);
  
  const toggle = () => setIsCollapsed(prev => !prev);
  const collapse = () => setIsCollapsed(true);
  const expand = () => setIsCollapsed(false);
  
  return {
    isCollapsed,
    toggle,
    collapse,
    expand
  };
};

/**
 * Hook para gerenciar navegação ativa
 */
export const useActiveNavigation = (initialActive = null) => {
  const [activeItem, setActiveItem] = React.useState(initialActive);
  const [history, setHistory] = React.useState([]);
  
  const navigate = (item) => {
    setHistory(prev => [...prev, activeItem]);
    setActiveItem(item);
  };
  
  const goBack = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setActiveItem(previous);
    }
  };
  
  const reset = () => {
    setActiveItem(initialActive);
    setHistory([]);
  };
  
  return {
    activeItem,
    history,
    navigate,
    goBack,
    reset,
    canGoBack: history.length > 0
  };
};