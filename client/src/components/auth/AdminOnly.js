// ====================================
// 👑 ADMIN ONLY - Controle de Acesso Admin
// Protege páginas que só administradores podem acessar
// ====================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthGuard from './AuthGuard';

const AdminOnly = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <AuthGuard>
      {user?.role === 'admin' ? (
        children
      ) : (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          color: '#6b7280',
          textAlign: 'center',
          padding: '40px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔒</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#ef4444',
            marginBottom: '16px'
          }}>
            Acesso Restrito
          </h2>
          <p style={{
            fontSize: '16px',
            marginBottom: '24px',
            maxWidth: '400px',
            lineHeight: '1.5'
          }}>
            Esta página é restrita a administradores do sistema.
            <br />
            Seu perfil atual: <strong>{user?.role || 'Desconhecido'}</strong>
          </p>
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={() => window.history.back()}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
            >
              ⬅️ Voltar
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                backgroundColor: '#2B4C8C',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1e3a73'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2B4C8C'}
            >
              🏠 Dashboard
            </button>
          </div>
        </div>
      )}
    </AuthGuard>
  );
};

export default AdminOnly;
export { AdminOnly };