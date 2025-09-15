// client/src/pages/LoginPage.js
// =====================================
// PRIMEM WHATSAPP - PÁGINA DE LOGIN
// Página modular de autenticação com validação completa
// =====================================

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Importar contextos e hooks
import { useAuth } from '../contexts/AuthContext';
import { useSettingsContext } from '../contexts/SettingsContext';

// Importar componentes
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';
import AuthLayout from '../layouts/AuthLayout';

// Cores PRIMEM
const PRIMEM_COLORS = {
  primary: '#2B4C8C',
  secondary: '#C97A4A', 
  accent: '#8B9DC3',
  success: '#10B981',
  error: '#EF4444',
  background: '#f0f2f5',
  white: '#ffffff',
  text: '#374151'
};

const LoginPage = ({
  onLoginSuccess,
  redirectTo = '/dashboard',
  showCreateAccount = false,
  allowGuestAccess = false,
  className = '',
  style = {}
}) => {
  // ====================================
  // CONTEXTOS E HOOKS
  // ====================================
  const { 
    login, 
    loading, 
    error, 
    loginAttempts, 
    isBlocked, 
    blockTimeRemaining,
    clearError,
    TEST_USERS
  } = useAuth();
  
  const { settings } = useSettingsContext();

  // ====================================
  // ESTADOS LOCAIS
  // ====================================
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showTestUsers, setShowTestUsers] = useState(false);

  // ====================================
  // EFEITOS
  // ====================================
  useEffect(() => {
    // Limpar erros quando o componente monta
    clearError();
    
    // Verificar se há credenciais salvas
    const savedEmail = localStorage.getItem('primem_remember_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, [clearError]);

  useEffect(() => {
    // Limpar erros quando o usuário digita
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // ====================================
  // HANDLERS
  // ====================================
  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro específico do campo
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validar senha
    if (!formData.password.trim()) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 3) {
      errors.password = 'Senha deve ter pelo menos 3 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isBlocked || loading || isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Salvar email se "Lembrar de mim" estiver marcado
        if (rememberMe) {
          localStorage.setItem('primem_remember_email', formData.email);
        } else {
          localStorage.removeItem('primem_remember_email');
        }

        // Callback de sucesso
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        }
      }
    } catch (err) {
      console.error('Erro no login:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestUserLogin = async (testUser) => {
    setFormData({
      email: testUser.email,
      password: testUser.password
    });
    
    setIsSubmitting(true);
    
    try {
      const result = await login(testUser.email, testUser.password);
      if (result.success && onLoginSuccess) {
        onLoginSuccess(result.user);
      }
    } catch (err) {
      console.error('Erro no login de teste:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====================================
  // ESTILOS
  // ====================================
  const styles = {
    container: {
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      ...style
    },

    card: {
      background: PRIMEM_COLORS.white,
      borderRadius: '16px',
      padding: '40px 32px',
      boxShadow: '0 10px 25px rgba(43, 76, 140, 0.1)',
      border: `1px solid ${PRIMEM_COLORS.accent}20`
    },

    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },

    logo: {
      width: '80px',
      height: '80px',
      margin: '0 auto 16px',
      background: `linear-gradient(135deg, ${PRIMEM_COLORS.primary}, ${PRIMEM_COLORS.secondary})`,
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      color: PRIMEM_COLORS.white,
      fontWeight: 'bold'
    },

    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: PRIMEM_COLORS.primary,
      marginBottom: '8px'
    },

    subtitle: {
      fontSize: '16px',
      color: PRIMEM_COLORS.text,
      opacity: 0.7
    },

    form: {
      width: '100%'
    },

    inputGroup: {
      marginBottom: '24px'
    },

    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: PRIMEM_COLORS.text,
      marginBottom: '8px'
    },

    inputWrapper: {
      position: 'relative'
    },

    input: {
      width: '100%',
      padding: '12px 16px',
      border: `2px solid ${PRIMEM_COLORS.accent}40`,
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      backgroundColor: PRIMEM_COLORS.background,
      '&:focus': {
        outline: 'none',
        borderColor: PRIMEM_COLORS.primary,
        backgroundColor: PRIMEM_COLORS.white
      }
    },

    passwordToggle: {
      position: 'absolute',
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '18px',
      opacity: 0.6,
      transition: 'opacity 0.2s'
    },

    errorText: {
      fontSize: '14px',
      color: PRIMEM_COLORS.error,
      marginTop: '6px'
    },

    rememberMe: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '24px',
      fontSize: '14px',
      color: PRIMEM_COLORS.text
    },

    checkbox: {
      marginRight: '8px'
    },

    submitButton: {
      width: '100%',
      padding: '16px',
      backgroundColor: PRIMEM_COLORS.primary,
      color: PRIMEM_COLORS.white,
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '16px',
      '&:hover': {
        backgroundColor: PRIMEM_COLORS.secondary
      }
    },

    submitButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },

    errorMessage: {
      padding: '12px 16px',
      backgroundColor: `${PRIMEM_COLORS.error}10`,
      border: `1px solid ${PRIMEM_COLORS.error}30`,
      borderRadius: '8px',
      color: PRIMEM_COLORS.error,
      fontSize: '14px',
      marginBottom: '16px',
      textAlign: 'center'
    },

    blockMessage: {
      padding: '16px',
      backgroundColor: `${PRIMEM_COLORS.error}10`,
      border: `2px solid ${PRIMEM_COLORS.error}30`,
      borderRadius: '8px',
      color: PRIMEM_COLORS.error,
      fontSize: '14px',
      marginBottom: '16px',
      textAlign: 'center',
      fontWeight: '600'
    },

    testUsers: {
      marginTop: '24px',
      padding: '16px',
      backgroundColor: `${PRIMEM_COLORS.accent}10`,
      borderRadius: '8px',
      border: `1px solid ${PRIMEM_COLORS.accent}30`
    },

    testUsersHeader: {
      fontSize: '14px',
      fontWeight: '600',
      color: PRIMEM_COLORS.primary,
      marginBottom: '12px',
      textAlign: 'center'
    },

    testUserButton: {
      width: '100%',
      padding: '8px 12px',
      margin: '4px 0',
      backgroundColor: PRIMEM_COLORS.white,
      border: `1px solid ${PRIMEM_COLORS.accent}40`,
      borderRadius: '6px',
      fontSize: '12px',
      color: PRIMEM_COLORS.text,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: PRIMEM_COLORS.background,
        borderColor: PRIMEM_COLORS.primary
      }
    },

    footer: {
      marginTop: '24px',
      textAlign: 'center'
    },

    toggleTestUsers: {
      background: 'none',
      border: 'none',
      color: PRIMEM_COLORS.primary,
      fontSize: '14px',
      cursor: 'pointer',
      textDecoration: 'underline'
    }
  };

  // ====================================
  // RENDERIZAÇÃO
  // ====================================
  return (
    <AuthLayout className={className}>
      <div style={styles.container}>
        <div style={styles.card}>
          {/* HEADER */}
          <div style={styles.header}>
            <div style={styles.logo}>
              P
            </div>
            <h1 style={styles.title}>
              {settings.company?.name || 'PRIMEM COMEX'}
            </h1>
            <p style={styles.subtitle}>
              Sistema de WhatsApp Business
            </p>
          </div>

          {/* BLOQUEIO POR TENTATIVAS */}
          {isBlocked && (
            <div style={styles.blockMessage}>
              ⚠️ Muitas tentativas de login.<br />
              Tente novamente em {Math.ceil(blockTimeRemaining / 1000)}s
            </div>
          )}

          {/* ERRO DE LOGIN */}
          {error && !isBlocked && (
            <div style={styles.errorMessage}>
              {error}
              <br />
              <small>Tentativa {loginAttempts}/5</small>
            </div>
          )}

          {/* FORMULÁRIO */}
          <form style={styles.form} onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seuemail@empresa.com"
                disabled={isBlocked || loading || isSubmitting}
                error={formErrors.email}
                autoComplete="email"
                style={styles.input}
              />
              {formErrors.email && (
                <div style={styles.errorText}>{formErrors.email}</div>
              )}
            </div>

            {/* SENHA */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Senha</label>
              <div style={styles.inputWrapper}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Digite sua senha"
                  disabled={isBlocked || loading || isSubmitting}
                  error={formErrors.password}
                  autoComplete="current-password"
                  style={styles.input}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isBlocked || loading || isSubmitting}
                >
                  {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
              {formErrors.password && (
                <div style={styles.errorText}>{formErrors.password}</div>
              )}
            </div>

            {/* LEMBRAR DE MIM */}
            <label style={styles.rememberMe}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isBlocked || loading || isSubmitting}
                style={styles.checkbox}
              />
              Lembrar de mim
            </label>

            {/* BOTÃO DE SUBMIT */}
            <Button
              type="submit"
              disabled={isBlocked || loading || isSubmitting}
              style={{
                ...styles.submitButton,
                ...(isBlocked || loading || isSubmitting ? styles.submitButtonDisabled : {})
              }}
            >
              {loading || isSubmitting ? (
                <>
                  <Loading size="small" color="white" />
                  &nbsp; Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* FOOTER */}
          <div style={styles.footer}>
            <button
              type="button"
              style={styles.toggleTestUsers}
              onClick={() => setShowTestUsers(!showTestUsers)}
              disabled={loading || isSubmitting}
            >
              {showTestUsers ? 'Ocultar' : 'Mostrar'} usuários de teste
            </button>

            {/* USUÁRIOS DE TESTE */}
            {showTestUsers && (
              <div style={styles.testUsers}>
                <div style={styles.testUsersHeader}>
                  👥 Usuários de Teste
                </div>
                {TEST_USERS.map((user, index) => (
                  <button
                    key={index}
                    type="button"
                    style={styles.testUserButton}
                    onClick={() => handleTestUserLogin(user)}
                    disabled={loading || isSubmitting || isBlocked}
                  >
                    <strong>{user.email}</strong><br />
                    <small>{user.name} - {user.role}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

// ====================================
// PROP TYPES
// ====================================
LoginPage.propTypes = {
  onLoginSuccess: PropTypes.func,
  redirectTo: PropTypes.string,
  showCreateAccount: PropTypes.bool,
  allowGuestAccess: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

export default LoginPage;