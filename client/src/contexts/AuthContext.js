// client/src/contexts/AuthContext.js
// =====================================
// PRIMEM WHATSAPP - AUTH CONTEXT v2.2 - COMPLETO E CORRIGIDO
// Sistema de autenticação completo com todas as funcionalidades
// ✅ Mantém todas as 30+ funcionalidades do sistema original
// ✅ Corrige erros de clearError e hooks problemáticos
// ✅ Sistema robusto com 700+ linhas de funcionalidades
// =====================================

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// Criar contexto
const AuthContext = createContext();

// ====================================
// CONFIGURAÇÕES DE USUÁRIOS TESTE COMPLETAS
// ====================================
const TEST_USERS = [
  {
    id: 'admin-001',
    name: 'Administrador PRIMEM',
    email: 'admin@primem.com',
    password: 'admin123',
    displayName: 'Admin PRIMEM',
    role: 'admin',
    department: 'TI',
    permissions: [
      'all', 'view_all_chats', 'manage_users', 'system_settings',
      'text_configs', 'bitrix_integration', 'user_management',
      'advanced_settings', 'audit_logs', 'backup_restore',
      'delete_messages', 'view_reports', 'manage_departments',
      'chatbot_config', 'auto_response_config', 'signature_management'
    ],
    settings: {
      theme: 'light',
      notifications: true,
      signature: 'Atenciosamente,\nAdministrador\nPRIMEM COMEX\n📞 +55 11 4002-8900',
      autoSignature: true,
      soundNotifications: true,
      desktopNotifications: true,
      emailNotifications: false,
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo'
    },
    preferences: {
      chatListDensity: 'comfortable',
      messagePreview: true,
      showTimestamps: true,
      showDeliveryStatus: true,
      compactMode: false,
      darkModeAuto: false
    },
    bitrixAccess: {
      canConfigureIntegration: true,
      canManageTemplates: true,
      canViewLogs: true,
      canTestConnection: true
    },
    isActive: true,
    lastLogin: null,
    createdAt: new Date('2025-01-01'),
    avatar: 'https://ui-avatars.com/api/?name=Admin+PRIMEM&background=2B4C8C&color=fff',
    phone: '+55 11 99999-0001',
    extension: '1001'
  },
  {
    id: 'test-001', 
    name: 'Usuário Teste',
    email: 'teste@teste.com',
    password: '123',
    displayName: 'Teste User',
    role: 'manager',
    department: 'Comercial',
    permissions: [
      'view_all_chats', 'manage_department', 'view_reports',
      'send_messages', 'upload_files', 'manage_contacts',
      'assign_chats', 'view_team_performance', 'manage_signatures'
    ],
    settings: {
      theme: 'light',
      notifications: true,
      signature: 'Cordialmente,\nEquipe Comercial\nPRIMEM COMEX\n📧 comercial@primem.com.br',
      autoSignature: true,
      soundNotifications: true,
      desktopNotifications: true,
      emailNotifications: true,
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo'
    },
    preferences: {
      chatListDensity: 'comfortable',
      messagePreview: true,
      showTimestamps: true,
      showDeliveryStatus: true,
      compactMode: false,
      darkModeAuto: false
    },
    bitrixAccess: {
      canConfigureIntegration: false,
      canManageTemplates: false,
      canViewLogs: false,
      canTestConnection: false
    },
    isActive: true,
    lastLogin: null,
    createdAt: new Date('2025-01-01'),
    avatar: 'https://ui-avatars.com/api/?name=Teste+User&background=C97A4A&color=fff',
    phone: '+55 11 99999-0002',
    extension: '2001'
  },
  {
    id: 'ana-001',
    name: 'Ana Comercial',
    email: 'ana@primem.com', 
    password: '123456',
    displayName: 'Ana - Comercial',
    role: 'agent',
    department: 'Comercial',
    permissions: [
      'view_assigned_chats', 'send_messages', 'upload_files',
      'manage_assigned_contacts', 'view_department_reports',
      'use_chatbot', 'schedule_messages'
    ],
    settings: {
      theme: 'light',
      notifications: true,
      signature: 'Ana Silva\nConsultora Comercial\nPRIMEM COMEX\n📞 +55 11 4002-8900 ramal 2001\n📧 ana@primem.com.br',
      autoSignature: true,
      soundNotifications: true,
      desktopNotifications: true,
      emailNotifications: false,
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo'
    },
    preferences: {
      chatListDensity: 'compact',
      messagePreview: true,
      showTimestamps: true,
      showDeliveryStatus: true,
      compactMode: true,
      darkModeAuto: false
    },
    bitrixAccess: {
      canConfigureIntegration: false,
      canManageTemplates: false,
      canViewLogs: false,
      canTestConnection: false
    },
    isActive: true,
    lastLogin: null,
    createdAt: new Date('2025-01-01'),
    avatar: 'https://ui-avatars.com/api/?name=Ana+Silva&background=8B9DC3&color=fff',
    phone: '+55 11 99999-0003',
    extension: '2001'
  },
  {
    id: 'bruno-001',
    name: 'Bruno Operacional',
    email: 'bruno@primem.com',
    password: '123456', 
    displayName: 'Bruno - Operacional',
    role: 'agent',
    department: 'Operacional',
    permissions: [
      'view_assigned_chats', 'send_messages', 'upload_files',
      'manage_shipping', 'view_logistics', 'track_orders',
      'use_chatbot', 'schedule_messages'
    ],
    settings: {
      theme: 'dark',
      notifications: true,
      signature: 'Bruno Santos\nAnalista Operacional\nPRIMEM COMEX\n📞 +55 11 4002-8900 ramal 3001\n🚢 Departamento de Logística',
      autoSignature: true,
      soundNotifications: false,
      desktopNotifications: true,
      emailNotifications: true,
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo'
    },
    preferences: {
      chatListDensity: 'comfortable',
      messagePreview: false,
      showTimestamps: true,
      showDeliveryStatus: true,
      compactMode: false,
      darkModeAuto: true
    },
    bitrixAccess: {
      canConfigureIntegration: false,
      canManageTemplates: false,
      canViewLogs: false,
      canTestConnection: false
    },
    isActive: true,
    lastLogin: null,
    createdAt: new Date('2025-01-01'),
    avatar: 'https://ui-avatars.com/api/?name=Bruno+Santos&background=28a745&color=fff',
    phone: '+55 11 99999-0004',
    extension: '3001'
  },
  {
    id: 'viewer-001',
    name: 'Usuário Visualização',
    email: 'viewer@primem.com',
    password: '123456',
    displayName: 'Viewer',
    role: 'viewer',
    department: 'Suporte',
    permissions: ['view_assigned_chats', 'view_reports_readonly'],
    settings: {
      theme: 'light',
      notifications: false,
      signature: '',
      autoSignature: false,
      soundNotifications: false,
      desktopNotifications: false,
      emailNotifications: false,
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo'
    },
    preferences: {
      chatListDensity: 'comfortable',
      messagePreview: true,
      showTimestamps: true,
      showDeliveryStatus: false,
      compactMode: false,
      darkModeAuto: false
    },
    bitrixAccess: {
      canConfigureIntegration: false,
      canManageTemplates: false,
      canViewLogs: false,
      canTestConnection: false
    },
    isActive: true,
    lastLogin: null,
    createdAt: new Date('2025-01-01'),
    avatar: 'https://ui-avatars.com/api/?name=Viewer&background=6c757d&color=fff',
    phone: null,
    extension: null
  },
  {
    id: 'supervisor-001',
    name: 'Supervisor Geral',
    email: 'supervisor@primem.com',
    password: 'super123',
    displayName: 'Supervisor',
    role: 'manager',
    department: 'Geral',
    permissions: [
      'view_all_chats', 'manage_all_departments', 'view_all_reports',
      'send_messages', 'upload_files', 'manage_contacts',
      'assign_chats', 'view_team_performance', 'moderate_chats',
      'chatbot_supervision', 'quality_control'
    ],
    settings: {
      theme: 'dark',
      notifications: true,
      signature: 'Supervisão Geral\nPRIMEM COMEX\n📞 +55 11 4002-8900\n🏢 Matriz São Paulo',
      autoSignature: true,
      soundNotifications: true,
      desktopNotifications: true,
      emailNotifications: true,
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo'
    },
    preferences: {
      chatListDensity: 'compact',
      messagePreview: true,
      showTimestamps: true,
      showDeliveryStatus: true,
      compactMode: false,
      darkModeAuto: false
    },
    bitrixAccess: {
      canConfigureIntegration: false,
      canManageTemplates: true,
      canViewLogs: true,
      canTestConnection: false
    },
    isActive: true,
    lastLogin: null,
    createdAt: new Date('2025-01-01'),
    avatar: 'https://ui-avatars.com/api/?name=Supervisor&background=dc3545&color=fff',
    phone: '+55 11 99999-0005',
    extension: '1000'
  }
];

// ====================================
// DEFINIÇÕES DE ROLES E PERMISSÕES COMPLETAS
// ====================================
const ROLE_DEFINITIONS = {
  admin: {
    name: 'Administrador',
    description: 'Acesso completo ao sistema',
    level: 100,
    permissions: [
      'all', 'view_all_chats', 'manage_users', 'system_settings',
      'text_configs', 'bitrix_integration', 'user_management',
      'advanced_settings', 'audit_logs', 'backup_restore',
      'delete_messages', 'view_reports', 'manage_departments',
      'chatbot_config', 'auto_response_config', 'signature_management',
      'api_access', 'webhook_management', 'database_access'
    ],
    restrictions: [],
    canAccessTextConfigs: true,
    canAccessUserManagement: true,
    canAccessSystemSettings: true,
    canAccessBitrixIntegration: true,
    canAccessAuditLogs: true,
    canManageRoles: true,
    canDeleteMessages: true,
    canViewAllChats: true,
    canManageWebhooks: true,
    canAccessAPI: true,
    canBackupRestore: true,
    maxFileUploadSize: 50 * 1024 * 1024, // 50MB
    dailyMessageLimit: -1, // Unlimited
    canScheduleMessages: true,
    canUseChatbot: true,
    canConfigureChatbot: true
  },
  manager: {
    name: 'Gerente',
    description: 'Gerenciar departamento e visualizar relatórios',
    level: 75,
    permissions: [
      'view_all_chats', 'manage_department', 'view_reports',
      'send_messages', 'upload_files', 'manage_contacts',
      'assign_chats', 'view_team_performance', 'manage_signatures',
      'moderate_chats', 'quality_control', 'schedule_messages'
    ],
    restrictions: ['cannot_delete_system_messages', 'limited_user_management'],
    canAccessTextConfigs: false,
    canAccessUserManagement: false, 
    canAccessSystemSettings: false,
    canAccessBitrixIntegration: false,
    canAccessAuditLogs: false,
    canManageRoles: false,
    canDeleteMessages: false,
    canViewAllChats: true,
    canManageWebhooks: false,
    canAccessAPI: false,
    canBackupRestore: false,
    maxFileUploadSize: 20 * 1024 * 1024, // 20MB
    dailyMessageLimit: 500,
    canScheduleMessages: true,
    canUseChatbot: true,
    canConfigureChatbot: false
  },
  agent: {
    name: 'Agente',
    description: 'Atendimento de chats designados',
    level: 50,
    permissions: [
      'view_assigned_chats', 'send_messages', 'upload_files',
      'manage_assigned_contacts', 'view_own_performance',
      'use_chatbot', 'schedule_messages'
    ],
    restrictions: ['assigned_chats_only', 'limited_file_types', 'no_system_access'],
    canAccessTextConfigs: false,
    canAccessUserManagement: false,
    canAccessSystemSettings: false, 
    canAccessBitrixIntegration: false,
    canAccessAuditLogs: false,
    canManageRoles: false,
    canDeleteMessages: false,
    canViewAllChats: false,
    canManageWebhooks: false,
    canAccessAPI: false,
    canBackupRestore: false,
    maxFileUploadSize: 16 * 1024 * 1024, // 16MB
    dailyMessageLimit: 200,
    canScheduleMessages: true,
    canUseChatbot: true,
    canConfigureChatbot: false
  },
  viewer: {
    name: 'Visualizador',
    description: 'Apenas visualização de chats',
    level: 25,
    permissions: ['view_assigned_chats', 'view_reports_readonly'],
    restrictions: ['read_only', 'no_message_sending', 'no_file_upload', 'no_system_access'],
    canAccessTextConfigs: false,
    canAccessUserManagement: false,
    canAccessSystemSettings: false,
    canAccessBitrixIntegration: false, 
    canAccessAuditLogs: false,
    canManageRoles: false,
    canDeleteMessages: false,
    canViewAllChats: false,
    canManageWebhooks: false,
    canAccessAPI: false,
    canBackupRestore: false,
    maxFileUploadSize: 0, // No upload
    dailyMessageLimit: 0, // No messages
    canScheduleMessages: false,
    canUseChatbot: false,
    canConfigureChatbot: false
  }
};

// ====================================
// CONFIGURAÇÕES DO SISTEMA
// ====================================
const SYSTEM_CONFIG = {
  session: {
    timeout: 24 * 60 * 60 * 1000, // 24 horas
    rememberMeTimeout: 30 * 24 * 60 * 60 * 1000, // 30 dias
    warningTime: 5 * 60 * 1000, // 5 minutos antes de expirar
    refreshTokenTime: 15 * 60 * 1000 // 15 minutos
  },
  security: {
    maxLoginAttempts: 3,
    lockoutDuration: 15 * 60 * 1000, // 15 minutos
    passwordMinLength: 3,
    requireStrongPassword: false,
    enableTwoFactor: false
  },
  features: {
    enableNotifications: true,
    enableAudioRecording: true,
    enableFileUpload: true,
    enableChatbot: true,
    enableAutoResponse: true,
    enableBitrixIntegration: true,
    enableTextConfigs: true,
    enableUserManagement: true
  },
  limits: {
    maxConcurrentSessions: 3,
    maxFileSize: 16 * 1024 * 1024,
    maxDailyMessages: 1000,
    maxConversations: 100
  }
};

// ====================================
// PROVIDER DO CONTEXTO COMPLETO
// ====================================
export function AuthProvider({ children }) {
  // Estados principais
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  
  // Estados para features avançadas
  const [permissions, setPermissions] = useState([]);
  const [roleDefinition, setRoleDefinition] = useState(null);
  const [lastActivity, setLastActivity] = useState(new Date());
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEnd, setLockoutEnd] = useState(null);
  
  // Estados para estatísticas
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [onlineTime, setOnlineTime] = useState(0);
  const [activityStats, setActivityStats] = useState({
    messagesReceived: 0,
    messagesSent: 0,
    filesUploaded: 0,
    chatsHandled: 0
  });

  // Refs para gerenciar timers
  const sessionTimeoutRef = useRef(null);
  const activityTimerRef = useRef(null);
  const lockoutTimerRef = useRef(null);
  
  // ====================================
  // FUNÇÃO DE LOGIN PRINCIPAL COMPLETA
  // ====================================
  const login = useCallback(async (email, password, rememberMe = false, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔐 Tentando login:', { 
        email, 
        rememberMe, 
        attempts: loginAttempts,
        isLocked 
      });

      // Verificar se está bloqueado
      if (isLocked && lockoutEnd && new Date() < lockoutEnd) {
        const remainingTime = Math.ceil((lockoutEnd - new Date()) / 1000);
        throw new Error(`Conta bloqueada. Tente novamente em ${remainingTime} segundos.`);
      }

      // Validar inputs
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      if (password.length < SYSTEM_CONFIG.security.passwordMinLength) {
        throw new Error(`Senha deve ter pelo menos ${SYSTEM_CONFIG.security.passwordMinLength} caracteres`);
      }

      // Simular delay de autenticação
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

      // Buscar usuário teste
      const testUser = TEST_USERS.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password &&
        u.isActive
      );

      let userData;

      if (testUser) {
        console.log('✅ Usuário teste encontrado:', testUser.email);
        
        userData = {
          ...testUser,
          lastLogin: new Date(),
          sessionId: generateSessionId(),
          loginMethod: 'test_user',
          loginIP: '127.0.0.1',
          userAgent: navigator.userAgent,
          loginOptions: options
        };
        
        delete userData.password;
      } else {
        // Incrementar tentativas de login
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        // Verificar se deve bloquear
        if (newAttempts >= SYSTEM_CONFIG.security.maxLoginAttempts) {
          const lockEnd = new Date(Date.now() + SYSTEM_CONFIG.security.lockoutDuration);
          setIsLocked(true);
          setLockoutEnd(lockEnd);
          
          // Timer para desbloquear
          if (lockoutTimerRef.current) {
            clearTimeout(lockoutTimerRef.current);
          }
          lockoutTimerRef.current = setTimeout(() => {
            setIsLocked(false);
            setLockoutEnd(null);
            setLoginAttempts(0);
          }, SYSTEM_CONFIG.security.lockoutDuration);

          throw new Error(`Muitas tentativas de login. Conta bloqueada por ${SYSTEM_CONFIG.security.lockoutDuration / 60000} minutos.`);
        }

        throw new Error('Credenciais inválidas');
      }

      // Resetar tentativas de login
      setLoginAttempts(0);
      setIsLocked(false);
      setLockoutEnd(null);
      if (lockoutTimerRef.current) {
        clearTimeout(lockoutTimerRef.current);
      }

      // Configurar dados da sessão
      const session = {
        id: userData.sessionId,
        userId: userData.id,
        loginTime: new Date(),
        lastActivity: new Date(),
        rememberMe,
        expiresAt: rememberMe 
          ? new Date(Date.now() + SYSTEM_CONFIG.session.rememberMeTimeout)
          : new Date(Date.now() + SYSTEM_CONFIG.session.timeout),
        loginMethod: userData.loginMethod,
        loginIP: userData.loginIP,
        userAgent: userData.userAgent,
        isActive: true
      };

      // Obter definição da role
      const roleInfo = ROLE_DEFINITIONS[userData.role] || ROLE_DEFINITIONS.viewer;

      // Atualizar estados
      setUser(userData);
      setIsLoggedIn(true);
      setPermissions(userData.permissions || roleInfo.permissions);
      setRoleDefinition(roleInfo);
      setSessionData(session);
      setLastActivity(new Date());
      setDailyMessageCount(0);
      setOnlineTime(0);

      // Resetar estatísticas
      setActivityStats({
        messagesReceived: 0,
        messagesSent: 0,
        filesUploaded: 0,
        chatsHandled: 0
      });

      // Persistir dados
      const storageType = rememberMe ? localStorage : sessionStorage;
      storageType.setItem('primem_user', JSON.stringify(userData));
      storageType.setItem('primem_session', JSON.stringify(session));
      if (rememberMe) {
        localStorage.setItem('primem_remember', 'true');
      }

      // Configurar timeout da sessão
      setupSessionTimeout(session.expiresAt);

      // Iniciar timer de atividade
      startActivityTimer();

      console.log('🎉 Login bem-sucedido:', {
        user: userData.email,
        role: userData.role,
        permissions: userData.permissions?.length || 0,
        sessionId: session.id,
        expiresAt: session.expiresAt
      });

      return {
        success: true,
        user: userData,
        session: session,
        message: 'Login realizado com sucesso'
      };

    } catch (err) {
      console.error('❌ Erro no login:', err);
      
      setError(err.message);
      setUser(null);
      setIsLoggedIn(false);
      setPermissions([]);
      setRoleDefinition(null);
      setSessionData(null);

      // Limpar dados persistidos em caso de erro
      localStorage.removeItem('primem_user');
      localStorage.removeItem('primem_session');
      localStorage.removeItem('primem_remember');
      sessionStorage.removeItem('primem_user');
      sessionStorage.removeItem('primem_session');

      return {
        success: false,
        error: err.message,
        attempts: loginAttempts + 1,
        isLocked: isLocked
      };
    } finally {
      setLoading(false);
    }
  }, [loginAttempts, isLocked, lockoutEnd]);

  // ====================================
  // FUNÇÃO DE LOGOUT COMPLETA
  // ====================================
  const logout = useCallback(async (reason = 'user_logout') => {
    try {
      console.log('🚪 Executando logout:', reason);

      // Parar todos os timers
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
        activityTimerRef.current = null;
      }
      if (lockoutTimerRef.current) {
        clearTimeout(lockoutTimerRef.current);
        lockoutTimerRef.current = null;
      }

      // Calcular tempo online
      const sessionDuration = sessionData 
        ? new Date() - new Date(sessionData.loginTime)
        : 0;

      // Registrar logout (simulado)
      if (user && sessionData) {
        console.log('📊 Estatísticas da sessão:', {
          user: user.email,
          duration: sessionDuration,
          messagesCount: activityStats.messagesSent + activityStats.messagesReceived,
          reason
        });
      }

      // Resetar todos os estados
      setUser(null);
      setIsLoggedIn(false);
      setPermissions([]);
      setRoleDefinition(null);
      setSessionData(null);
      setLastActivity(new Date());
      setError(null);
      setDailyMessageCount(0);
      setOnlineTime(0);
      setActivityStats({
        messagesReceived: 0,
        messagesSent: 0,
        filesUploaded: 0,
        chatsHandled: 0
      });

      // Limpar dados persistidos
      localStorage.removeItem('primem_user');
      localStorage.removeItem('primem_session');
      localStorage.removeItem('primem_remember');
      sessionStorage.removeItem('primem_user');
      sessionStorage.removeItem('primem_session');

      console.log('✅ Logout concluído');

    } catch (err) {
      console.error('Erro durante logout:', err);
    }
  }, [user, sessionData, activityStats]);

  // ====================================
  // FUNÇÕES DE VERIFICAÇÃO AVANÇADAS
  // ====================================
  const hasPermission = useCallback((permission) => {
    if (!user || !permissions) return false;
    if (permissions.includes('all')) return true;
    return permissions.includes(permission);
  }, [user, permissions]);

  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  const hasAnyPermission = useCallback((permissionList) => {
    if (!Array.isArray(permissionList)) return false;
    return permissionList.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissionList) => {
    if (!Array.isArray(permissionList)) return false;
    return permissionList.every(permission => hasPermission(permission));
  }, [hasPermission]);

  const canAccess = useCallback((feature) => {
    if (!roleDefinition) return false;
    
    const accessMap = {
      textConfigs: roleDefinition.canAccessTextConfigs,
      userManagement: roleDefinition.canAccessUserManagement,
      systemSettings: roleDefinition.canAccessSystemSettings,
      bitrixIntegration: roleDefinition.canAccessBitrixIntegration,
      auditLogs: roleDefinition.canAccessAuditLogs,
      roleManagement: roleDefinition.canManageRoles,
      api: roleDefinition.canAccessAPI,
      webhooks: roleDefinition.canManageWebhooks,
      backup: roleDefinition.canBackupRestore,
      allChats: roleDefinition.canViewAllChats,
      deleteMessages: roleDefinition.canDeleteMessages,
      chatbot: roleDefinition.canUseChatbot,
      configureChatbot: roleDefinition.canConfigureChatbot,
      scheduleMessages: roleDefinition.canScheduleMessages
    };

    return accessMap[feature] || false;
  }, [roleDefinition]);

  const canPerformAction = useCallback((action, context = {}) => {
    if (!user || !roleDefinition) return false;

    const actionChecks = {
      sendMessage: () => {
        if (roleDefinition.dailyMessageLimit === 0) return false;
        if (roleDefinition.dailyMessageLimit === -1) return true;
        return dailyMessageCount < roleDefinition.dailyMessageLimit;
      },
      uploadFile: () => {
        if (!hasPermission('upload_files')) return false;
        if (context.fileSize && context.fileSize > roleDefinition.maxFileUploadSize) return false;
        return true;
      },
      deleteMessage: () => {
        if (!roleDefinition.canDeleteMessages) return false;
        if (context.messageOwnerId && context.messageOwnerId !== user.id && !hasPermission('delete_all_messages')) return false;
        return true;
      },
      viewChat: () => {
        if (roleDefinition.canViewAllChats) return true;
        if (context.chatAssignee && context.chatAssignee === user.id) return true;
        if (context.chatDepartment && context.chatDepartment === user.department && hasPermission('view_department_chats')) return true;
        return false;
      }
    };

    return actionChecks[action] ? actionChecks[action]() : false;
  }, [user, roleDefinition, dailyMessageCount, hasPermission]);

  // ====================================
  // FUNÇÕES DE GESTÃO DE USUÁRIO
  // ====================================
  const updateUser = useCallback(async (updates) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };
      
      setUser(updatedUser);

      // Atualizar dados persistidos
      const rememberMe = localStorage.getItem('primem_remember') === 'true';
      const storageType = rememberMe ? localStorage : sessionStorage;
      storageType.setItem('primem_user', JSON.stringify(updatedUser));

      console.log('✅ Usuário atualizado:', Object.keys(updates));

      return { success: true };

    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      throw err;
    }
  }, [user]);

  const updateUserSettings = useCallback(async (settings) => {
    return await updateUser({ 
      settings: { 
        ...user?.settings, 
        ...settings 
      } 
    });
  }, [user, updateUser]);

  const updateUserPreferences = useCallback(async (preferences) => {
    return await updateUser({ 
      preferences: { 
        ...user?.preferences, 
        ...preferences 
      } 
    });
  }, [user, updateUser]);

  // ====================================
  // FUNÇÕES DE SESSÃO E ATIVIDADE
  // ====================================
  const updateActivity = useCallback(() => {
    if (isLoggedIn) {
      setLastActivity(new Date());
      
      // Atualizar sessão se necessário
      if (sessionData) {
        const updatedSession = {
          ...sessionData,
          lastActivity: new Date()
        };
        setSessionData(updatedSession);
        
        const rememberMe = localStorage.getItem('primem_remember') === 'true';
        const storageType = rememberMe ? localStorage : sessionStorage;
        storageType.setItem('primem_session', JSON.stringify(updatedSession));
      }
    }
  }, [isLoggedIn, sessionData]);

  const extendSession = useCallback((additionalTime = SYSTEM_CONFIG.session.timeout) => {
    if (!sessionData) return;

    const newExpiryTime = new Date(Date.now() + additionalTime);
    const updatedSession = {
      ...sessionData,
      expiresAt: newExpiryTime,
      lastActivity: new Date()
    };

    setSessionData(updatedSession);
    
    const rememberMe = localStorage.getItem('primem_remember') === 'true';
    const storageType = rememberMe ? localStorage : sessionStorage;
    storageType.setItem('primem_session', JSON.stringify(updatedSession));

    setupSessionTimeout(newExpiryTime);

    console.log('⏰ Sessão estendida até:', newExpiryTime);
  }, [sessionData]);

  // ====================================
  // FUNÇÕES DE ESTATÍSTICAS
  // ====================================
  const incrementMessageCount = useCallback((type = 'sent') => {
    setDailyMessageCount(prev => prev + 1);
    setActivityStats(prev => ({
      ...prev,
      [type === 'sent' ? 'messagesSent' : 'messagesReceived']: prev[type === 'sent' ? 'messagesSent' : 'messagesReceived'] + 1
    }));
  }, []);

  const incrementFileUpload = useCallback(() => {
    setActivityStats(prev => ({
      ...prev,
      filesUploaded: prev.filesUploaded + 1
    }));
  }, []);

  const incrementChatHandled = useCallback(() => {
    setActivityStats(prev => ({
      ...prev,
      chatsHandled: prev.chatsHandled + 1
    }));
  }, []);

  // ====================================
  // FUNÇÕES AUXILIARES
  // ====================================
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getSessionTimeRemaining = useCallback(() => {
    if (!sessionData) return 0;
    return Math.max(0, new Date(sessionData.expiresAt) - new Date());
  }, [sessionData]);

  const isSessionExpiring = useCallback(() => {
    if (!sessionData) return false;
    const timeRemaining = getSessionTimeRemaining();
    return timeRemaining > 0 && timeRemaining <= SYSTEM_CONFIG.session.warningTime;
  }, [sessionData, getSessionTimeRemaining]);

  // ====================================
  // VERIFICAR SESSÃO AO CARREGAR
  // ====================================
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);

      const rememberMe = localStorage.getItem('primem_remember') === 'true';
      const storedUser = rememberMe 
        ? localStorage.getItem('primem_user')
        : sessionStorage.getItem('primem_user');
      const storedSession = rememberMe
        ? localStorage.getItem('primem_session')
        : sessionStorage.getItem('primem_session');

      if (!storedUser || !storedSession) {
        console.log('🔍 Nenhuma sessão encontrada');
        return;
      }

      const userData = JSON.parse(storedUser);
      const sessionDataStored = JSON.parse(storedSession);

      // Verificar se a sessão não expirou
      const now = new Date();
      const expiresAt = new Date(sessionDataStored.expiresAt);

      if (now > expiresAt) {
        console.log('⏰ Sessão expirada');
        await logout('session_expired');
        return;
      }

      // Verificar se o usuário ainda está ativo
      const currentTestUser = TEST_USERS.find(u => u.id === userData.id);
      if (currentTestUser && !currentTestUser.isActive) {
        console.log('🚫 Usuário desativado');
        await logout('user_disabled');
        return;
      }

      // Restaurar sessão
      const roleInfo = ROLE_DEFINITIONS[userData.role] || ROLE_DEFINITIONS.viewer;

      setUser(userData);
      setIsLoggedIn(true);
      setPermissions(userData.permissions || roleInfo.permissions);
      setRoleDefinition(roleInfo);
      setSessionData(sessionDataStored);
      setLastActivity(new Date());

      // Configurar timeout da sessão
      setupSessionTimeout(expiresAt);

      // Iniciar timer de atividade
      startActivityTimer();

      console.log('🔄 Sessão restaurada:', {
        user: userData.email,
        expiresAt,
        timeRemaining: expiresAt - now
      });

    } catch (err) {
      console.error('Erro ao verificar sessão:', err);
      await logout('session_error');
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // ====================================
  // CONFIGURAR TIMEOUT DA SESSÃO
  // ====================================
  const setupSessionTimeout = useCallback((expiresAt) => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    const now = new Date();
    const timeUntilExpiry = new Date(expiresAt) - now;

    if (timeUntilExpiry > 0) {
      sessionTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Sessão expirada por timeout');
        logout('session_timeout');
      }, timeUntilExpiry);
    }
  }, [logout]);

  // ====================================
  // INICIAR TIMER DE ATIVIDADE
  // ====================================
  const startActivityTimer = useCallback(() => {
    if (activityTimerRef.current) {
      clearInterval(activityTimerRef.current);
    }

    activityTimerRef.current = setInterval(() => {
      setOnlineTime(prev => prev + 1); // Incrementa a cada minuto
      updateActivity();
    }, 60000); // A cada minuto
  }, [updateActivity]);

  // ====================================
  // GERAR ID ÚNICO PARA SESSÃO
  // ====================================
  function generateSessionId() {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 9);
    const userPart = Math.random().toString(36).substr(2, 5);
    return `sess_${timestamp}_${randomPart}_${userPart}`;
  }

  // ====================================
  // EFFECTS
  // ====================================
  useEffect(() => {
    checkSession();
    
    // Cleanup na desmontagem
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
      }
      if (lockoutTimerRef.current) {
        clearTimeout(lockoutTimerRef.current);
      }
    };
  }, []); // Executa apenas na montagem

  // ====================================
  // VALOR DO CONTEXTO COMPLETO
  // ====================================
  const contextValue = {
    // Estados principais
    user,
    isLoggedIn,
    loading,
    error,
    sessionData,
    permissions,
    roleDefinition,
    lastActivity,

    // Estados de controle
    loginAttempts,
    isLocked,
    lockoutEnd,

    // Estatísticas
    dailyMessageCount,
    onlineTime,
    activityStats,

    // Funções de autenticação
    login,
    logout,
    updateUser,
    updateUserSettings,
    updateUserPreferences,
    clearError,

    // Funções de sessão
    checkSession,
    updateActivity,
    extendSession,
    getSessionTimeRemaining,
    isSessionExpiring,

    // Funções de verificação
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    canPerformAction,

    // Funções de estatísticas
    incrementMessageCount,
    incrementFileUpload,
    incrementChatHandled,

    // Informações do usuário
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isAgent: user?.role === 'agent',
    isViewer: user?.role === 'viewer',

    // Informações da sessão
    isSessionValid: sessionData && new Date(sessionData.expiresAt) > new Date(),
    sessionTimeRemaining: getSessionTimeRemaining(),
    sessionWarning: isSessionExpiring(),

    // Dados auxiliares
    testUsers: TEST_USERS,
    roleDefinitions: ROLE_DEFINITIONS,
    systemConfig: SYSTEM_CONFIG
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ====================================
// HOOK CUSTOMIZADO
// ====================================
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

// ====================================
// COMPONENTES DE PROTEÇÃO AVANÇADOS
// ====================================
export function AuthGuard({ children, requirePermission, requireRole, requireAnyPermission, requireAllPermissions, fallback }) {
  const { isLoggedIn, hasPermission, hasRole, hasAnyPermission, hasAllPermissions, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <div>Verificando autenticação...</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return fallback || (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔐</div>
          <div>Redirecionando para login...</div>
        </div>
      </div>
    );
  }

  // Verificações de permissão
  const checks = [
    { condition: requirePermission, check: () => hasPermission(requirePermission), message: `Permissão necessária: ${requirePermission}` },
    { condition: requireRole, check: () => hasRole(requireRole), message: `Role necessária: ${requireRole}` },
    { condition: requireAnyPermission, check: () => hasAnyPermission(requireAnyPermission), message: `Uma das permissões necessárias: ${requireAnyPermission?.join(', ')}` },
    { condition: requireAllPermissions, check: () => hasAllPermissions(requireAllPermissions), message: `Todas as permissões necessárias: ${requireAllPermissions?.join(', ')}` }
  ];

  for (const { condition, check, message } of checks) {
    if (condition && !check()) {
      return fallback || (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
          <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>Acesso Negado</h3>
          <p style={{ color: '#6c757d', marginBottom: '10px' }}>Você não tem as permissões necessárias para acessar este recurso.</p>
          <small style={{ color: '#6c757d' }}>{message}</small>
        </div>
      );
    }
  }

  return children;
}

export function AdminOnly({ children, fallback }) {
  return (
    <AuthGuard requireRole="admin" fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

export function ManagerOrHigher({ children, fallback }) {
  return (
    <AuthGuard requireAnyPermission={['all', 'manage_department', 'manage_all_departments']} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

export function AgentOrHigher({ children, fallback }) {
  return (
    <AuthGuard requireAnyPermission={['all', 'send_messages', 'manage_department']} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

export default AuthContext;