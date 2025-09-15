// client/src/components/auth/LoginForm.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE DE LOGIN
// Extraído do App.js v8.1 - Formulário de autenticação modular
// =====================================

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Importar componentes UI
import Button from '../ui/Button';
import Input from '../ui/Input';
import Loading from '../ui/Loading';

const LoginForm = ({
  onLogin,
  isLoading = false,
  error = '',
  onClearError,
  initialEmail = '',
  showTestUsers = true,
  autoFocus = true,
  companyName = 'PRIMEM COMEX',
  systemName = 'WHATSAPP BUSINESS',
  logo = '/LOGO.png'
}) => {
  // ====================================
  // ESTADOS DO FORMULÁRIO
  // ====================================
  const [formData, setFormData] = useState({
    email: initialEmail,
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedTestUser, setSelectedTestUser] = useState('');

  // ====================================
  // USUÁRIOS DE TESTE
  // ====================================
  const testUsers = [
    { email: 'teste@teste.com', password: '123', name: 'Usuário Teste', hint: 'Usuário padrão' },
    { email: 'admin@primem.com', password: 'admin123', name: 'Admin Primem', hint: 'Administrador' },
    { email: 'ana@primem.com', password: '123456', name: 'Ana Silva', hint: 'Comercial' },
    { email: 'carlos@primem.com', password: 'carlos123', name: 'Carlos Santos', hint: 'Operações' }
  ];

  // ====================================
  // EFEITOS
  // ====================================
  
  // Limpar erro quando dados mudarem
  useEffect(() => {
    if (error && onClearError) {
      const timer = setTimeout(() => {
        onClearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, onClearError]);

  // Auto-focus no primeiro campo
  useEffect(() => {
    if (autoFocus) {
      const emailInput = document.getElementById('login-email');
      if (emailInput) {
        emailInput.focus();
      }
    }
  }, [autoFocus]);

  // ====================================
  // VALIDAÇÃO
  // ====================================
  const validateForm = () => {
    const errors = {};

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email deve ter um formato válido';
    }

    // Validar senha
    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 3) {
      errors.password = 'Senha deve ter pelo menos 3 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ====================================
  // HANDLERS
  // ====================================
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro de validação quando o usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Limpar erro geral
    if (error && onClearError) {
      onClearError();
    }
  };

  const handleTestUserSelect = (userEmail) => {
    if (!userEmail) {
      setSelectedTestUser('');
      return;
    }

    const user = testUsers.find(u => u.email === userEmail);
    if (user) {
      setFormData({
        email: user.email,
        password: user.password
      });
      setSelectedTestUser(userEmail);
      
      // Limpar erros
      setValidationErrors({});
      if (onClearError) {
        onClearError();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (onLogin) {
      await onLogin(formData.email, formData.password, rememberMe);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // ====================================
  // ESTILOS
  // ====================================
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2B4C8C 0%, #C97A4A 100%)',
      padding: '20px'
    },
    
    loginCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      padding: '40px',
      width: '100%',
      maxWidth: '440px',
      textAlign: 'center'
    },

    header: {
      marginBottom: '32px'
    },
    
    logo: {
      width: '80px',
      height: 'auto',
      marginBottom: '16px'
    },
    
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#2B4C8C',
      marginBottom: '8px'
    },
    
    subtitle: {
      fontSize: '16px',
      color: '#666',
      fontWeight: '500'
    },

    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },

    inputGroup: {
      position: 'relative',
      textAlign: 'left'
    },

    label: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#333'
    },

    passwordContainer: {
      position: 'relative'
    },

    showPasswordButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#666',
      padding: '4px'
    },

    optionsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '14px'
    },

    rememberMe: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#666'
    },

    forgotPassword: {
      color: '#2B4C8C',
      textDecoration: 'none',
      fontWeight: '500'
    },

    error: {
      backgroundColor: '#fee',
      border: '1px solid #fcc',
      borderRadius: '8px',
      padding: '12px',
      color: '#c33',
      fontSize: '14px',
      textAlign: 'center'
    },

    testUsers: {
      marginTop: '24px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      border: '1px solid #e9ecef'
    },

    testUsersTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#495057',
      marginBottom: '12px'
    },

    testUserSelect: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ced4da',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white'
    },

    testUserHint: {
      fontSize: '12px',
      color: '#6c757d',
      fontStyle: 'italic',
      marginTop: '4px'
    },

    footer: {
      marginTop: '24px',
      paddingTop: '20px',
      borderTop: '1px solid #e9ecef',
      fontSize: '12px',
      color: '#6c757d'
    },

    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '16px',
      zIndex: 10
    }
  };

  // ====================================
  // RENDER
  // ====================================
  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        {/* Loading Overlay */}
        {isLoading && (
          <div style={styles.loadingOverlay}>
            <Loading 
              text="Conectando..."
              size="medium"
            />
          </div>
        )}

        {/* Header */}
        <div style={styles.header}>
          <img 
            src={logo} 
            alt="Logo" 
            style={styles.logo}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h1 style={styles.title}>{companyName}</h1>
          <p style={styles.subtitle}>{systemName}</p>
        </div>

        {/* Formulário */}
        <form style={styles.form} onSubmit={handleSubmit}>
          {/* Email */}
          <div style={styles.inputGroup}>
            <label htmlFor="login-email" style={styles.label}>
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="seu@email.com"
              disabled={isLoading}
              error={validationErrors.email}
              autoComplete="username"
              required
            />
          </div>

          {/* Senha */}
          <div style={styles.inputGroup}>
            <label htmlFor="login-password" style={styles.label}>
              Senha
            </label>
            <div style={styles.passwordContainer}>
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Sua senha"
                disabled={isLoading}
                error={validationErrors.password}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                style={styles.showPasswordButton}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          {/* Opções */}
          <div style={styles.optionsRow}>
            <label style={styles.rememberMe}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              Lembrar-me
            </label>
            
            <a href="#" style={styles.forgotPassword}>
              Esqueci a senha
            </a>
          </div>

          {/* Erro */}
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {/* Botão de Login */}
          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={isLoading}
            loading={isLoading}
            fullWidth
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {/* Usuários de Teste */}
        {showTestUsers && !isLoading && (
          <div style={styles.testUsers}>
            <div style={styles.testUsersTitle}>
              💡 Usuários de Teste:
            </div>
            <select
              style={styles.testUserSelect}
              value={selectedTestUser}
              onChange={(e) => handleTestUserSelect(e.target.value)}
            >
              <option value="">Selecione um usuário de teste...</option>
              {testUsers.map(user => (
                <option key={user.email} value={user.email}>
                  {user.name} - {user.email}
                </option>
              ))}
            </select>
            {selectedTestUser && (
              <div style={styles.testUserHint}>
                💡 {testUsers.find(u => u.email === selectedTestUser)?.hint}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          Desenvolvido por Primem Comex • Versão 9.0
        </div>
      </div>
    </div>
  );
};

// ====================================
// PROP TYPES
// ====================================
LoginForm.propTypes = {
  onLogin: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onClearError: PropTypes.func,
  initialEmail: PropTypes.string,
  showTestUsers: PropTypes.bool,
  autoFocus: PropTypes.bool,
  companyName: PropTypes.string,
  systemName: PropTypes.string,
  logo: PropTypes.string
};

export default LoginForm;