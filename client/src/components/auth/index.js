// client/src/components/auth/index.js
// =====================================
// PRIMEM WHATSAPP - EXPORTAÇÃO CENTRALIZADA DOS COMPONENTES AUTH
// Importação única para todos os componentes de autenticação
// =====================================

// Importar todos os componentes de autenticação
import LoginForm from './LoginForm';
import UserProfile from './UserProfile';
import AuthGuard, { AdminOnly, ManagerOnly, ProtectedRoute } from './AuthGuard';

// ====================================
// EXPORTAÇÃO PADRÃO (RECOMENDADA)
// ====================================
export {
  LoginForm,
  UserProfile,
  AuthGuard,
  AdminOnly,
  ManagerOnly,
  ProtectedRoute
};

// ====================================
// EXPORTAÇÃO COMO OBJETO (ALTERNATIVA)
// ====================================
export const authComponents = {
  LoginForm,
  UserProfile,
  AuthGuard,
  AdminOnly,
  ManagerOnly,
  ProtectedRoute
};

// ====================================
// EXPORTAÇÃO DEFAULT PARA COMPATIBILIDADE
// ====================================
export default {
  LoginForm,
  UserProfile,
  AuthGuard,
  AdminOnly,
  ManagerOnly,
  ProtectedRoute
};

// ====================================
// CONSTANTES ÚTEIS
// ====================================
export const AUTH_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
};

export const AUTH_PERMISSIONS = {
  WHATSAPP_MANAGE: 'whatsapp.manage',
  USER_MANAGE: 'user.manage',
  SETTINGS_EDIT: 'settings.edit',
  MESSAGES_VIEW: 'messages.view',
  MESSAGES_SEND: 'messages.send',
  FILES_UPLOAD: 'files.upload',
  REPORTS_VIEW: 'reports.view'
};

// ====================================
// COMPONENTES DE CONVENIÊNCIA ADICIONAIS
// ====================================

/**
 * Hook para verificar se o usuário tem determinada permissão
 * Usa o AuthGuard internamente mas retorna apenas boolean
 */
export const useHasPermission = (permission) => {
  // Implementação seria feita usando o useAuth hook
  // Por enquanto é um placeholder
  return true;
};

/**
 * Componente para mostrar conteúdo apenas para determinada role
 * Mais leve que o AuthGuard completo
 */
export const RoleBasedContent = ({ role, children, fallback = null }) => {
  return (
    <AuthGuard
      requiredRole={role}
      showUnauthorized={false}
      fallbackComponent={() => fallback}
    >
      {children}
    </AuthGuard>
  );
};

/**
 * Componente para mostrar conteúdo apenas para determinada permissão
 * Mais leve que o AuthGuard completo
 */
export const PermissionBasedContent = ({ permission, children, fallback = null }) => {
  return (
    <AuthGuard
      requiredPermission={permission}
      showUnauthorized={false}
      fallbackComponent={() => fallback}
    >
      {children}
    </AuthGuard>
  );
};