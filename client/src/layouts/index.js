// ====================================
// 🏗️ EXPORTAÇÕES CENTRALIZADAS - LAYOUTS
// Centraliza todas as exportações dos layouts
// ====================================

// === IMPORTS ===
import AuthLayout from './AuthLayout';
import DashboardLayout from './DashboardLayout';
import ChatLayout from './ChatLayout';

// === LAYOUTS PRINCIPAIS ===
export { default as AuthLayout } from './AuthLayout';
export { default as DashboardLayout } from './DashboardLayout';
export { default as ChatLayout } from './ChatLayout';

// === EXPORTAÇÕES NOMEADAS ALTERNATIVAS ===
export {
  AuthLayout as Auth,
  DashboardLayout as Dashboard,
  ChatLayout as Chat
};

// === VERIFICAÇÃO DE EXISTÊNCIA ===
// Este comentário serve como lembrete dos layouts que devem existir:
/*
LAYOUTS NECESSÁRIOS:

1. AuthLayout.js - Layout para páginas de autenticação (login)
   - Fundo com gradiente PRIMEM
   - Logo centralizada
   - Card de login responsivo

2. DashboardLayout.js - Layout principal do sistema
   - Header com navegação
   - Sidebar com menu
   - Área de conteúdo principal
   - Footer (opcional)

3. ChatLayout.js - Layout específico para chat
   - Sidebar com lista de conversas
   - Área principal de mensagens
   - Header com info do chat
   - Input fixo no rodapé

SE ALGUM LAYOUT NÃO EXISTIR, CRIAR COM ESTRUTURA BÁSICA
*/