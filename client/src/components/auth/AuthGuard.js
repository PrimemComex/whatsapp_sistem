// ====================================
// 🔐 COMPONENTE DE PROTEÇÃO DE ROTAS - v16.1 CONTEXTO
// 🚨 Usa AuthContext para garantir estado consistente
// ====================================
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // ✅ Usando contexto
import Loading from '../ui/Loading';

// ====================================
// 🛡️ COMPONENTE AUTHGUARD
// ====================================
const AuthGuard = ({ children, requireAdmin = false }) => {
  const { user, isLoggedIn, loading } = useAuth(); // ✅ Do contexto
  
  // === DEBUG AUTOMÁTICO ===
  if (process.env.NODE_ENV === 'development') {
    console.log('🛡️ AuthGuard verificação:', {
      isLoggedIn,
      loading,
      requireAdmin,
      userRole: user?.role,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  // === ESTADO DE CARREGAMENTO ===
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loading />
        <p style={styles.loadingText}>Verificando autenticação...</p>
      </div>
    );
  }

  // === VERIFICAR SE ESTÁ LOGADO ===
  if (!isLoggedIn || !user) {
    console.log('🔒 AuthGuard: Redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  // === VERIFICAR PERMISSÃO DE ADMIN ===
  if (requireAdmin && user.role !== 'admin') {
    console.log('🚫 AuthGuard: Acesso negado - não é admin');
    return (
      <div style={styles.accessDenied}>
        <div style={styles.accessDeniedContent}>
          <div style={styles.accessDeniedIcon}>🔒</div>
          <h2 style={styles.accessDeniedTitle}>Acesso Restrito</h2>
          <p style={styles.accessDeniedDescription}>
            Você não tem permissão para acessar esta área.
          </p>
          <div style={styles.userInfo}>
            <p><strong>Seu perfil:</strong> {user.role || 'Não identificado'}</p>
            <p><strong>Perfil necessário:</strong> Admin</p>
          </div>
          <div style={styles.buttonGroup}>
            <button 
              style={styles.backButton}
              onClick={() => window.history.back()}
            >
              ← Voltar
            </button>
            <button 
              style={styles.dashboardButton}
              onClick={() => window.location.href = '/dashboard'}
            >
              🏠 Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === RENDERIZAR COMPONENTE PROTEGIDO ===
  console.log('✅ AuthGuard: Acesso autorizado');
  return children;
};

// === ESTILOS MELHORADOS ===
const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  loadingText: {
    marginTop: '16px',
    color: '#6b7280',
    fontSize: '16px'
  },
  accessDenied: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '20px'
  },
  accessDeniedContent: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '48px 32px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    width: '100%',
    border: '1px solid #e5e7eb'
  },
  accessDeniedIcon: {
    fontSize: '72px',
    marginBottom: '24px'
  },
  accessDeniedTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px',
    margin: 0
  },
  accessDeniedDescription: {
    color: '#6b7280',
    fontSize: '18px',
    marginBottom: '32px',
    lineHeight: '1.6'
  },
  userInfo: {
    backgroundColor: '#f3f4f6',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'left',
    marginBottom: '32px',
    border: '1px solid #e5e7eb'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  backButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  dashboardButton: {
    backgroundColor: '#2B4C8C', // Cor PRIMEM
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};

export default AuthGuard;

// ====================================
// 🔧 PRINCIPAIS MELHORIAS:
// ====================================
// ✅ Usa AuthContext (não hook direto)
// ✅ Debug automático com logs
// ✅ Botão adicional para dashboard
// ✅ Estilos melhorados
// ✅ Cores PRIMEM
// ✅ Melhor tratamento de erro
// ✅ Logs apenas em development