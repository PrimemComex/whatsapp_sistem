// client/src/services/authService.js
// =====================================
// PRIMEM WHATSAPP - SERVIÇO DE AUTENTICAÇÃO
// Gerencia login, logout e sessões de usuário
// =====================================

import apiService from './apiService';

class AuthService {
  constructor() {
    this.storageKey = 'primem_whatsapp_user';
    this.tokenKey = 'primem_whatsapp_token';
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 horas
  }

  // ====================================
  // LOGIN E AUTENTICAÇÃO
  // ====================================

  /**
   * Realizar login do usuário
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} Dados do usuário logado
   */
  async login(email, password) {
    try {
      console.log('🔐 Iniciando login para:', email);

      const response = await apiService.post('/api/login', {
        email: email.trim().toLowerCase(),
        password: password
      });

      if (response.success && response.user) {
        // Salvar dados do usuário
        await this.saveUserData(response.user, response.token);
        
        console.log('✅ Login realizado com sucesso:', response.user.name);
        
        return {
          success: true,
          user: response.user,
          message: 'Login realizado com sucesso!'
        };
      } else {
        throw new Error(response.message || 'Credenciais inválidas');
      }

    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      
      return {
        success: false,
        error: error.message,
        message: this.getLoginErrorMessage(error)
      };
    }
  }

  /**
   * Logout do usuário
   */
  async logout() {
    try {
      console.log('🚪 Realizando logout...');

      // Tentar notificar o servidor (opcional)
      try {
        await apiService.post('/api/logout');
      } catch (e) {
        // Ignorar erros de logout no servidor
        console.warn('⚠️ Erro ao notificar logout no servidor:', e.message);
      }

      // Limpar dados locais
      this.clearUserData();
      
      console.log('✅ Logout realizado com sucesso');
      
      return {
        success: true,
        message: 'Logout realizado com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro no logout:', error);
      
      // Mesmo com erro, limpar dados locais
      this.clearUserData();
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ====================================
  // GERENCIAMENTO DE SESSÃO
  // ====================================

  /**
   * Verificar se o usuário está logado
   * @returns {boolean}
   */
  isAuthenticated() {
    const user = this.getCurrentUser();
    const token = this.getToken();
    
    if (!user || !token) {
      return false;
    }

    // Verificar se a sessão expirou
    if (this.isSessionExpired()) {
      this.clearUserData();
      return false;
    }

    return true;
  }

  /**
   * Obter usuário atual
   * @returns {Object|null}
   */
  getCurrentUser() {
    try {
      const userData = localStorage.getItem(this.storageKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Erro ao recuperar dados do usuário:', error);
      return null;
    }
  }

  /**
   * Obter token atual
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Verificar se a sessão expirou
   * @returns {boolean}
   */
  isSessionExpired() {
    const user = this.getCurrentUser();
    if (!user || !user.loginTime) {
      return true;
    }

    const loginTime = new Date(user.loginTime);
    const now = new Date();
    const timeDiff = now.getTime() - loginTime.getTime();

    return timeDiff > this.sessionTimeout;
  }

  /**
   * Renovar sessão
   */
  async renewSession() {
    try {
      const response = await apiService.post('/api/auth/renew');
      
      if (response.success) {
        // Atualizar tempo de login
        const user = this.getCurrentUser();
        if (user) {
          user.loginTime = new Date().toISOString();
          localStorage.setItem(this.storageKey, JSON.stringify(user));
        }
        
        return { success: true };
      }
      
      throw new Error(response.message || 'Erro ao renovar sessão');
      
    } catch (error) {
      console.error('❌ Erro ao renovar sessão:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // PERFIL E CONFIGURAÇÕES
  // ====================================

  /**
   * Atualizar perfil do usuário
   * @param {Object} profileData 
   */
  async updateProfile(profileData) {
    try {
      const response = await apiService.put('/api/user/profile', profileData);
      
      if (response.success) {
        // Atualizar dados locais
        const currentUser = this.getCurrentUser();
        const updatedUser = { ...currentUser, ...response.user };
        localStorage.setItem(this.storageKey, JSON.stringify(updatedUser));
        
        return { success: true, user: updatedUser };
      }
      
      throw new Error(response.message || 'Erro ao atualizar perfil');
      
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Alterar senha
   * @param {string} currentPassword 
   * @param {string} newPassword 
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiService.put('/api/user/password', {
        currentPassword,
        newPassword
      });
      
      if (response.success) {
        return { success: true, message: 'Senha alterada com sucesso' };
      }
      
      throw new Error(response.message || 'Erro ao alterar senha');
      
    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // UTILIDADES PRIVADAS
  // ====================================

  /**
   * Salvar dados do usuário
   * @param {Object} user 
   * @param {string} token 
   */
  async saveUserData(user, token) {
    try {
      // Adicionar timestamp de login
      const userData = {
        ...user,
        loginTime: new Date().toISOString()
      };

      // Salvar no localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(userData));
      
      if (token) {
        localStorage.setItem(this.tokenKey, token);
      }

      // Configurar header de autorização para futuras requisições
      if (token) {
        apiService.setDefaultHeader('Authorization', `Bearer ${token}`);
      }

    } catch (error) {
      console.error('❌ Erro ao salvar dados do usuário:', error);
      throw new Error('Erro ao salvar dados de login');
    }
  }

  /**
   * Limpar dados do usuário
   */
  clearUserData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.tokenKey);
    apiService.removeDefaultHeader('Authorization');
  }

  /**
   * Obter mensagem de erro de login
   * @param {Error} error 
   * @returns {string}
   */
  getLoginErrorMessage(error) {
    if (error.message.includes('credentials') || error.message.includes('inválidas')) {
      return 'Email ou senha incorretos';
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Erro de conexão com o servidor';
    }
    
    if (error.message.includes('timeout')) {
      return 'Timeout: Servidor demorou para responder';
    }
    
    return error.message || 'Erro desconhecido no login';
  }

  // ====================================
  // INFORMAÇÕES SOBRE USUÁRIOS DE TESTE
  // ====================================

  /**
   * Obter lista de usuários de teste (apenas emails para ajuda)
   * @returns {Array}
   */
  getTestUsers() {
    return [
      { email: 'teste@teste.com', name: 'Usuário Teste' },
      { email: 'admin@primem.com', name: 'Admin Primem' },
      { email: 'ana@primem.com', name: 'Ana Silva' },
      { email: 'carlos@primem.com', name: 'Carlos Santos' }
    ];
  }

  /**
   * Verificar permissões do usuário
   * @param {string} permission 
   * @returns {boolean}
   */
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Admin tem todas as permissões
    if (user.role === 'admin') return true;

    // Implementar lógica de permissões conforme necessário
    switch (permission) {
      case 'whatsapp.manage':
        return user.role === 'admin' || user.role === 'manager';
      case 'user.manage':
        return user.role === 'admin';
      case 'settings.edit':
        return user.role === 'admin';
      default:
        return true; // Permissões básicas para usuários logados
    }
  }

  // ====================================
  // INICIALIZAÇÃO
  // ====================================

  /**
   * Inicializar serviço de autenticação
   */
  init() {
    // Verificar se há token salvo e configurar headers
    const token = this.getToken();
    if (token) {
      apiService.setDefaultHeader('Authorization', `Bearer ${token}`);
    }

    // Verificar sessão expirada
    if (this.isSessionExpired()) {
      this.clearUserData();
    }
  }
}

// ====================================
// EXPORTAR INSTÂNCIA SINGLETON
// ====================================
const authService = new AuthService();

// Inicializar o serviço
authService.init();

export default authService;