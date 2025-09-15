// client/src/hooks/useAuth.js - VERSÃO SEM LOOPS
// ====================================
// 🔑 HOOK DE AUTENTICAÇÃO - VERSÃO ANTI-LOOP
// ====================================

import { useState, useEffect, useCallback } from 'react';

export const useAuth = () => {
  // Estados principais
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const STORAGE_KEY = 'primem_current_user';
  const MAX_LOGIN_ATTEMPTS = 5;

  // Usuários de teste
  const TEST_USERS = [
    { id: 1, email: 'teste@teste.com', password: '123', name: 'Usuário Teste', role: 'agent' },
    { id: 2, email: 'admin@primem.com', password: 'admin123', name: 'Admin Primem', role: 'admin' },
    { id: 3, email: 'ana@primem.com', password: '123456', name: 'Ana Silva', role: 'agent' },
    { id: 4, email: 'carlos@primem.com', password: 'carlos123', name: 'Carlos Santos', role: 'manager' }
  ];

  // EFEITO DE INICIALIZAÇÃO - APENAS UMA VEZ
  useEffect(() => {
    let mounted = true; // Prevenir updates se componente desmontado
    
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem(STORAGE_KEY);
        if (savedUser && mounted) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();
    
    return () => {
      mounted = false; // Cleanup
    };
  }, []); // DEPENDÊNCIAS VAZIAS - SÓ EXECUTA UMA VEZ

  // FUNÇÃO clearError - ESTÁVEL
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // LOGIN - ESTÁVEL
  const login = useCallback(async (credentials) => {
    const { email, password } = credentials;
    
    setLoading(true);
    setError(null);

    try {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validações
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      // Buscar usuário
      const foundUser = TEST_USERS.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );
      
      if (!foundUser) {
        setLoginAttempts(prev => prev + 1);
        throw new Error('Email ou senha incorretos. Tente: teste@teste.com / 123');
      }

      // Dados do usuário
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        displayName: foundUser.name,
        department: foundUser.role === 'admin' ? 'Administração' : 'Operacional',
        loginAt: new Date().toISOString()
      };

      // Atualizar estados
      setUser(userData);
      setIsLoggedIn(true);
      setLoginAttempts(0);
      setError(null);
      
      // Salvar
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

      return { success: true, user: userData };

    } catch (error) {
      setError(error.message);
      setIsLoggedIn(false);
      setUser(null);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []); // SEM DEPENDÊNCIAS QUE MUDAM

  // LOGOUT - ESTÁVEL
  const logout = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
    setError(null);
    setLoginAttempts(0);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // UPDATE PROFILE - ESTÁVEL
  const updateProfile = useCallback((newData) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...newData, updatedAt: new Date().toISOString() };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  }, [user]);

  // VERIFICAÇÕES
  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user?.role]); // DEPENDÊNCIA ESPECÍFICA

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    const permissions = {
      admin: ['all'],
      manager: ['view_all_chats', 'manage_department', 'view_reports'],
      agent: ['view_assigned_chats', 'send_messages', 'upload_files'],
      viewer: ['view_assigned_chats']
    };
    
    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  }, [user?.role]);

  // RETORNO ESTÁVEL
  return {
    // Estados
    user,
    isLoggedIn,
    loading,
    error,
    loginAttempts,
    isBlocked: false,
    blockTimeRemaining: 0,
    
    // Funções
    login,
    logout,
    clearError,
    updateProfile,
    isAdmin,
    hasPermission,
    
    // Constantes
    MAX_LOGIN_ATTEMPTS,
    TEST_USERS: process.env.NODE_ENV === 'development' ? TEST_USERS : undefined
  };
};

export default useAuth;