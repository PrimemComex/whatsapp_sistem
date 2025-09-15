// =====================================
// DASHBOARD LAYOUT - CORREÇÃO DEFINITIVA
// Arquivo: client/src/layouts/DashboardLayout.js
// Remove completamente a dependência do SettingsContext
// =====================================

import React from 'react';

// ====================================
// HOOKS BÁSICOS (SÓ OS QUE FUNCIONAM)
// ====================================
import { useAuth } from '../contexts/AuthContext';
import { useWhatsApp } from '../contexts/WhatsAppContext';

const DashboardLayout = ({ children }) => {
  // ====================================
  // HOOKS NO TOPO - SEMPRE
  // ====================================
  const authData = useAuth();
  const whatsappData = useWhatsApp();

  // ====================================
  // DESTRUCTURING COM FALLBACKS
  // ====================================
  const { 
    isAuthenticated = false, 
    user = {}, 
    loading: authLoading = false 
  } = authData || {};

  const { 
    isConnected = false, 
    status: whatsappStatus = 'Desconectado', 
    loading: whatsappLoading = false 
  } = whatsappData || {};

  // ====================================
  // CONFIGURAÇÕES FIXAS (SEM CONTEXT)
  // ====================================
  const theme = 'light';
  const isLoading = authLoading || whatsappLoading;

  // ====================================
  // LOADING STATE
  // ====================================
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #2B4C8C',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#2B4C8C', fontSize: '16px' }}>Carregando sistema...</p>
      </div>
    );
  }

  // ====================================
  // NÃO AUTENTICADO
  // ====================================
  if (!isAuthenticated) {
    return (
      <div style={{ 
        padding: '50px', 
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '20px' }}>⚠️ Acesso Negado</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>Redirecionando para login...</p>
        <div style={{
          width: '30px',
          height: '30px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #d32f2f',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  // ====================================
  // ESTILOS DO LAYOUT
  // ====================================
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      backgroundColor: '#2B4C8C',
      color: 'white',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    title: {
      margin: 0,
      fontSize: '22px',
      fontWeight: '600'
    },
    version: {
      fontSize: '11px',
      backgroundColor: 'rgba(255,255,255,0.15)',
      padding: '3px 8px',
      borderRadius: '4px',
      fontWeight: '500'
    },
    userArea: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      fontSize: '14px'
    },
    userRole: {
      backgroundColor: '#C97A4A',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statusBar: {
      backgroundColor: isConnected ? '#25D366' : '#f44336',
      color: 'white',
      padding: '10px 24px',
      fontSize: '14px',
      fontWeight: '500',
      textAlign: 'center'
    },
    nav: {
      backgroundColor: 'white',
      borderBottom: '1px solid #e0e0e0',
      padding: '12px 24px',
      display: 'flex',
      gap: '24px',
      flexWrap: 'wrap'
    },
    navLink: {
      color: '#2B4C8C',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      padding: '6px 0',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s ease'
    },
    main: {
      flex: 1,
      padding: '24px',
      overflow: 'auto',
      backgroundColor: 'white',
      margin: '16px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    footer: {
      padding: '16px 24px',
      borderTop: '1px solid #e0e0e0',
      textAlign: 'center',
      fontSize: '13px',
      color: '#666',
      backgroundColor: 'white'
    }
  };

  // ====================================
  // RENDER PRINCIPAL
  // ====================================
  return (
    <div style={styles.container}>
      {/* Header PRIMEM */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <h1 style={styles.title}>🚀 PRIMEM WhatsApp</h1>
          <span style={styles.version}>Versão Modular</span>
        </div>
        
        <div style={styles.userArea}>
          <span>👤 {user?.name || user?.email || 'Usuário'}</span>
          <span style={{ opacity: 0.7 }}>|</span>
          <span style={styles.userRole}>
            {user?.role || 'USER'}
          </span>
        </div>
      </header>

      {/* Status WhatsApp */}
      <div style={styles.statusBar}>
        {isConnected ? (
          <>✅ WhatsApp Conectado{whatsappStatus && whatsappStatus !== 'Desconectado' ? ` - ${whatsappStatus}` : ''}</>
        ) : (
          <>❌ WhatsApp Desconectado{whatsappStatus && whatsappStatus !== 'Desconectado' ? ` - ${whatsappStatus}` : ''}</>
        )}
      </div>

      {/* Navegação */}
      <nav style={styles.nav}>
        <a href="/dashboard" style={styles.navLink}>🏠 Dashboard</a>
        <a href="/chat" style={styles.navLink}>💬 Chat</a>
        <a href="/connection" style={styles.navLink}>📱 Conexão</a>
        <a href="/settings" style={styles.navLink}>⚙️ Configurações</a>
      </nav>

      {/* Conteúdo Principal */}
      <main style={styles.main}>
        {children}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <strong>PRIMEM COMEX</strong> © 2025 - Sistema WhatsApp Business Modular
      </footer>
    </div>
  );
};

export default DashboardLayout;

// ====================================
// CSS GLOBAL PARA ANIMAÇÕES
// ====================================
if (typeof document !== 'undefined' && !document.querySelector('[data-dashboard-spin]')) {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  style.setAttribute('data-dashboard-spin', 'true');
  document.head.appendChild(style);
}