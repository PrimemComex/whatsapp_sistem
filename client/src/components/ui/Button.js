// client/src/components/ui/Button.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE BUTTON
// Componente básico reutilizável para botões do sistema
// =====================================

import React from 'react';

const Button = ({ 
  children,
  variant = 'primary', // primary, secondary, danger, success, warning, ghost
  size = 'medium',     // small, medium, large
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  icon = null,
  iconPosition = 'left', // left, right, only
  className = '',
  style = {},
  ...props 
}) => {
  // ====================================
  // MANIPULAR CLIQUE
  // ====================================
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  // ====================================
  // CLASSES CSS DINÂMICAS
  // ====================================
  const getButtonClass = () => {
    const baseClass = 'primem-button';
    const variantClass = `primem-button--${variant}`;
    const sizeClass = `primem-button--${size}`;
    const stateClasses = [
      disabled && 'primem-button--disabled',
      loading && 'primem-button--loading',
      fullWidth && 'primem-button--full-width',
      iconPosition === 'only' && 'primem-button--icon-only'
    ].filter(Boolean).join(' ');
    
    return `${baseClass} ${variantClass} ${sizeClass} ${stateClasses} ${className}`.trim();
  };

  // ====================================
  // RENDERIZAR CONTEÚDO
  // ====================================
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <span style={buttonStyles.loadingIcon}>⏳</span>
          {iconPosition !== 'only' && (
            <span style={buttonStyles.loadingText}>Carregando...</span>
          )}
        </>
      );
    }

    if (iconPosition === 'only' && icon) {
      return <span style={buttonStyles.icon}>{icon}</span>;
    }

    return (
      <>
        {icon && iconPosition === 'left' && (
          <span style={buttonStyles.iconLeft}>{icon}</span>
        )}
        
        {iconPosition !== 'only' && (
          <span style={buttonStyles.text}>{children}</span>
        )}
        
        {icon && iconPosition === 'right' && (
          <span style={buttonStyles.iconRight}>{icon}</span>
        )}
      </>
    );
  };

  // ====================================
  // ESTILOS DINÂMICOS
  // ====================================
  const getButtonStyle = () => {
    const baseStyle = {
      ...buttonStyles.base,
      ...buttonStyles.sizes[size],
      ...buttonStyles.variants[variant]
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    if (disabled || loading) {
      baseStyle.opacity = 0.6;
      baseStyle.cursor = 'not-allowed';
      baseStyle.pointerEvents = 'none';
    }

    return {
      ...baseStyle,
      ...style
    };
  };

  // ====================================
  // RENDER PRINCIPAL
  // ====================================
  return (
    <button
      type={type}
      className={getButtonClass()}
      style={getButtonStyle()}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

// ====================================
// ESTILOS PRIMEM
// ====================================
const buttonStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    textDecoration: 'none',
    userSelect: 'none',
    position: 'relative',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },

  // TAMANHOS
  sizes: {
    small: {
      padding: '6px 12px',
      fontSize: '12px',
      minHeight: '32px'
    },
    medium: {
      padding: '10px 16px',
      fontSize: '14px',
      minHeight: '40px'
    },
    large: {
      padding: '12px 20px',
      fontSize: '16px',
      minHeight: '48px'
    }
  },

  // VARIANTES
  variants: {
    primary: {
      backgroundColor: '#2B4C7E', // Azul PRIMEM
      color: 'white',
      boxShadow: '0 2px 4px rgba(43, 76, 126, 0.2)',
      ':hover': {
        backgroundColor: '#1e3a5f'
      }
    },
    secondary: {
      backgroundColor: 'white',
      color: '#2B4C7E', // Azul PRIMEM
      border: '2px solid #2B4C7E',
      ':hover': {
        backgroundColor: '#f8f9ff'
      }
    },
    danger: {
      backgroundColor: '#dc2626',
      color: 'white',
      boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
      ':hover': {
        backgroundColor: '#b91c1c'
      }
    },
    success: {
      backgroundColor: '#059669',
      color: 'white',
      boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
      ':hover': {
        backgroundColor: '#047857'
      }
    },
    warning: {
      backgroundColor: '#C5793B', // Laranja PRIMEM
      color: 'white',
      boxShadow: '0 2px 4px rgba(197, 121, 59, 0.2)',
      ':hover': {
        backgroundColor: '#a86330'
      }
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#64748b',
      ':hover': {
        backgroundColor: '#f1f5f9',
        color: '#2B4C7E'
      }
    }
  },

  // ELEMENTOS INTERNOS
  text: {
    lineHeight: 1
  },

  icon: {
    fontSize: '16px',
    lineHeight: 1
  },

  iconLeft: {
    fontSize: '16px',
    lineHeight: 1,
    marginRight: '4px'
  },

  iconRight: {
    fontSize: '16px',
    lineHeight: 1,
    marginLeft: '4px'
  },

  loadingIcon: {
    fontSize: '16px',
    lineHeight: 1
  },

  loadingText: {
    lineHeight: 1
  }
};

// ====================================
// COMPONENTES ESPECIALIZADOS
// ====================================

// Botão de ícone apenas
export const IconButton = (props) => (
  <Button {...props} iconPosition="only" />
);

// Botão primário (padrão PRIMEM)
export const PrimaryButton = (props) => (
  <Button {...props} variant="primary" />
);

// Botão secundário
export const SecondaryButton = (props) => (
  <Button {...props} variant="secondary" />
);

// Botão de perigo
export const DangerButton = (props) => (
  <Button {...props} variant="danger" />
);

// Botão de sucesso
export const SuccessButton = (props) => (
  <Button {...props} variant="success" />
);

// Botão de aviso (laranja PRIMEM)
export const WarningButton = (props) => (
  <Button {...props} variant="warning" />
);

// Botão fantasma
export const GhostButton = (props) => (
  <Button {...props} variant="ghost" />
);

// ====================================
// EXPORTAÇÃO PADRÃO
// ====================================
export default Button;
export { Button }; // ← ADICIONAR ESTA LINHA
