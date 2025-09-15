// ====================================
// 🛣️ SISTEMA DE ROTAS - PRIMEM WhatsApp v16.0
// 📦 Utiliza todas as páginas modulares criadas
// 🔐 Controle de acesso por perfil de usuário
// ====================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// === PÁGINAS PRINCIPAIS ===
import {
  LoginPage,
  DashboardPage,
  ChatPage,
  ConnectionPage,
  SettingsPage
} from '../pages';

// === LAYOUTS ===
import {
  AuthLayout,
  DashboardLayout,
  ChatLayout
} from '../layouts';

// === COMPONENTES DE PROTEÇÃO ===
import { AuthGuard } from '../components/auth/AuthGuard';

// === PÁGINAS ADMINISTRATIVAS (imports como default) ===
import TextConfigPage from '../pages/admin/TextConfigPage';
import BitrixIntegrationPage from '../pages/admin/BitrixIntegrationPage';
import UserManagementPage from '../pages/admin/UserManagementPage';

// === COMPONENTE DE CONTROLE ADMIN ===
import { AdminOnly } from '../components/auth/AdminOnly';

// ====================================
// 🛣️ COMPONENTE PRINCIPAL DE ROTAS
// ====================================
export function AppRoutes() {
  return (
    <Routes>
      {/* === ROTA RAIZ === */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* === AUTENTICAÇÃO === */}
      <Route 
        path="/login" 
        element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        } 
      />
      
      {/* === ROTAS PROTEGIDAS === */}
      <Route path="/dashboard" element={
        <AuthGuard>
          <DashboardLayout>
            <DashboardPage />
          </DashboardLayout>
        </AuthGuard>
      } />
      
      {/* === CHAT === */}
      <Route path="/chat" element={
        <AuthGuard>
          <ChatLayout>
            <ChatPage />
          </ChatLayout>
        </AuthGuard>
      } />
      
      <Route path="/chat/:contactId" element={
        <AuthGuard>
          <ChatLayout>
            <ChatPage />
          </ChatLayout>
        </AuthGuard>
      } />
      
      {/* === CONEXÃO WHATSAPP === */}
      <Route path="/connection" element={
        <AuthGuard>
          <DashboardLayout>
            <ConnectionPage />
          </DashboardLayout>
        </AuthGuard>
      } />
      
      {/* === CONFIGURAÇÕES === */}
      <Route path="/settings" element={
        <AuthGuard>
          <DashboardLayout>
            <SettingsPage />
          </DashboardLayout>
        </AuthGuard>
      } />
      
      {/* ====================================
          🔒 ROTAS ADMINISTRATIVAS (v16.0)
          Só Admin tem acesso
      ====================================*/}
      <Route path="/admin/text-configs" element={
        <AdminOnly>
          <DashboardLayout>
            <TextConfigPage />
          </DashboardLayout>
        </AdminOnly>
      } />
      
      <Route path="/admin/bitrix-integration" element={
        <AdminOnly>
          <DashboardLayout>
            <BitrixIntegrationPage />
          </DashboardLayout>
        </AdminOnly>
      } />
      
      <Route path="/admin/users" element={
        <AdminOnly>
          <DashboardLayout>
            <UserManagementPage />
          </DashboardLayout>
        </AdminOnly>
      } />
      
      <Route path="/admin/users" element={
        <AdminOnly>
          <DashboardLayout>
            <UserManagementPage />
          </DashboardLayout>
        </AdminOnly>
      } />
      
      {/* === ROTA 404 === */}
      <Route path="*" element={
        <AuthGuard>
          <DashboardLayout>
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <h2>📄 Página não encontrada</h2>
              <p>A página que você procura não existe.</p>
            </div>
          </DashboardLayout>
        </AuthGuard>
      } />
    </Routes>
  );
}