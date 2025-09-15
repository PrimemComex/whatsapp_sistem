// =====================================
// SISTEMA DE ROTAS - PRIMEM WHATSAPP
// Arquivo: client/src/routes/AppRoutes.js
// =====================================

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ====================================
// COMPONENTES DE PROTEÇÃO E LOADING
// ====================================
import Loading from '../components/ui/Loading';
import AuthGuard, { PublicRoute, AdminGuard } from '../components/auth/AuthGuard';

// ====================================
// PÁGINAS COM LAZY LOADING
// ====================================
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));  
const ChatPage = React.lazy(() => import('../pages/ChatPage'));
const ConnectionPage = React.lazy(() => import('../pages/ConnectionPage'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));

// ====================================
// COMPONENTE DE ROTAS PRINCIPAL
// ====================================
export const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading message="Carregando página..." />}>
      <Routes>
        {/* ====================================
            ROTA RAIZ - REDIRECIONAMENTO
            ==================================== */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />

        {/* ====================================
            ROTA PÚBLICA - LOGIN
            ==================================== */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />

        {/* ====================================
            ROTAS PROTEGIDAS - USUÁRIOS LOGADOS
            ==================================== */}
        
        {/* Dashboard Principal */}
        <Route 
          path="/dashboard" 
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          } 
        />

        {/* Chat Geral */}
        <Route 
          path="/chat" 
          element={
            <AuthGuard>
              <ChatPage />
            </AuthGuard>
          } 
        />

        {/* Chat com Contato Específico */}
        <Route 
          path="/chat/:contactId" 
          element={
            <AuthGuard>
              <ChatPage />
            </AuthGuard>
          } 
        />

        {/* Conexão WhatsApp */}
        <Route 
          path="/connection" 
          element={
            <AuthGuard>
              <ConnectionPage />
            </AuthGuard>
          } 
        />

        {/* Configurações */}
        <Route 
          path="/settings" 
          element={
            <AuthGuard>
              <SettingsPage />
            </AuthGuard>
          } 
        />

        {/* ====================================
            ROTAS ADMINISTRATIVAS (FUTURAS)
            ==================================== */}
        
        {/* Gerenciamento de Usuários */}
        <Route 
          path="/admin/users" 
          element={
            <AdminGuard>
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>👥 Gerenciamento de Usuários</h2>
                <p>Funcionalidade em desenvolvimento...</p>
              </div>
            </AdminGuard>
          } 
        />

        {/* Configurações do Sistema */}
        <Route 
          path="/admin/system" 
          element={
            <AdminGuard>
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>⚙️ Configurações do Sistema</h2>
                <p>Funcionalidade em desenvolvimento...</p>
              </div>
            </AdminGuard>
          } 
        />

        {/* ====================================
            ROTA 404 - NÃO ENCONTRADA
            ==================================== */}
        <Route 
          path="*" 
          element={
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              color: '#666'
            }}>
              <h2>🔍 Página não encontrada</h2>
              <p>A página que você procura não existe.</p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                style={{
                  background: '#2B4C8C',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Voltar ao Dashboard
              </button>
            </div>
          } 
        />
      </Routes>
    </Suspense>
  );
};

// ====================================
// ROTAS DE DESENVOLVIMENTO (TEMPORÁRIO)
// ====================================
export const DevRoutes = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px',
      background: '#f0f0f0',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      border: '1px solid #ddd'
    }}>
      <strong>🚧 Modo Desenvolvimento</strong><br />
      <a href="/login">Login</a> | 
      <a href="/dashboard"> Dashboard</a> | 
      <a href="/chat"> Chat</a> | 
      <a href="/connection"> Conexão</a> | 
      <a href="/settings"> Configurações</a>
    </div>
  );
};

export default AppRoutes;