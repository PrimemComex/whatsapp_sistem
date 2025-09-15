// ====================================
// 📄 EXPORTAÇÕES CENTRALIZADAS - PÁGINAS
// Centraliza todas as exportações das páginas
// ====================================

// === PÁGINAS PRINCIPAIS ===
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import ChatPage from './ChatPage';
import ConnectionPage from './ConnectionPage';
import SettingsPage from './SettingsPage';

// === PÁGINAS ADMINISTRATIVAS ===
import TextConfigPage from './admin/TextConfigPage';
import BitrixIntegrationPage from './admin/BitrixIntegrationPage';
import UserManagementPage from './admin/UserManagementPage';

// === EXPORTAÇÕES DEFAULT ===
export { default as LoginPage } from './LoginPage';
export { default as DashboardPage } from './DashboardPage';
export { default as ChatPage } from './ChatPage';
export { default as ConnectionPage } from './ConnectionPage';
export { default as SettingsPage } from './SettingsPage';

// === PÁGINAS ADMINISTRATIVAS ===
export { default as TextConfigPage } from './admin/TextConfigPage';
export { default as BitrixIntegrationPage } from './admin/BitrixIntegrationPage';
export { default as UserManagementPage } from './admin/UserManagementPage';

// === EXPORTAÇÕES NOMEADAS ALTERNATIVAS ===
export {
  LoginPage as Login,
  DashboardPage as Dashboard,
  ChatPage as Chat,
  ConnectionPage as Connection,
  SettingsPage as Settings,
  TextConfigPage as TextConfig,
  BitrixIntegrationPage as BitrixIntegration,
  UserManagementPage as UserManagement
};