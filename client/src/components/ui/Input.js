// ====================================
// 🔤 INPUT COMPONENT - WARNING CSS CORRIGIDO
// Componente de input sem conflitos CSS border/borderColor
// ====================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const Input = ({
  type = 'text',
  value,
  defaultValue = '',
  placeholder = '',
  disabled = false,
  readOnly = false,
  required = false,
  error = '',
  success = '',
  label = '',
  icon = null,
  iconPosition = 'left',
  clearable = false,
  showCharCount = false,
  maxLength,
  variant = 'default',
  size = 'medium',
  fullWidth = false,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onClear,
  className = '',
  style = {},
  ...props
}) => {
  // === ESTADOS INTERNOS ===
  const [internalValue, setInternalValue] = useState(value || defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  
  // === REFS ===
  const inputRef = useRef(null);

  // === SINCRONIZAR VALOR EXTERNO ===
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // === HANDLERS ===
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    
    setInternalValue(newValue);
    
    if (onChange) {
      onChange(e);
    }
  }, [onChange, maxLength]);

  const handleFocus = useCallback((e) => {
    setIsFocused(true);
    
    if (onFocus) {
      onFocus(e);
    }
  }, [onFocus]);

  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    
    if (onBlur) {
      onBlur(e);
    }
  }, [onBlur]);

  const handleKeyDown = useCallback((e) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  }, [onKeyDown]);

  const handleClear = useCallback(() => {
    setInternalValue('');
    
    if (onChange) {
      const fakeEvent = {
        target: { value: '' },
        type: 'change'
      };
      onChange(fakeEvent);
    }
    
    if (onClear) {
      onClear();
    }
    
    // Focar no input após limpar
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onChange, onClear]);

  // === CLASSES CSS DINÂMICAS ===
  const getContainerClass = () => {
    const baseClass = 'primem-input-container';
    const variantClass = `primem-input-container--${variant}`;
    const sizeClass = `primem-input-container--${size}`;
    const stateClasses = [
      disabled && 'primem-input-container--disabled',
      error && 'primem-input-container--error',
      success && 'primem-input-container--success',
      isFocused && 'primem-input-container--focused',
      fullWidth && 'primem-input-container--full-width'
    ].filter(Boolean).join(' ');
    
    return `${baseClass} ${variantClass} ${sizeClass} ${stateClasses} ${className}`.trim();
  };

  // === ESTILOS DINÂMICOS ===
  const getContainerStyle = () => {
    const baseStyle = {
      ...inputStyles.container,
      ...inputStyles.variants[variant],
      ...inputStyles.sizes[size]
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // ✅ CORREÇÃO: Usar propriedades separadas ao invés de shorthand
    if (error) {
      baseStyle.borderColor = '#dc2626';
      baseStyle.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
    } else if (success) {
      baseStyle.borderColor = '#059669';
      baseStyle.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
    } else if (isFocused) {
      baseStyle.borderColor = '#2B4C7E'; // Azul PRIMEM
      baseStyle.boxShadow = '0 0 0 3px rgba(43, 76, 126, 0.1)';
    }

    if (disabled) {
      baseStyle.backgroundColor = '#f1f5f9';
      baseStyle.borderColor = '#e2e8f0';
      baseStyle.cursor = 'not-allowed';
    }

    return {
      ...baseStyle,
      ...style
    };
  };

  const getInputStyle = () => {
    const baseStyle = {
      ...inputStyles.input
    };

    if (icon) {
      if (iconPosition === 'left') {
        baseStyle.paddingLeft = '40px';
      } else {
        baseStyle.paddingRight = '40px';
      }
    }

    if (clearable && internalValue) {
      baseStyle.paddingRight = iconPosition === 'right' && icon ? '70px' : '40px';
    }

    if (disabled) {
      baseStyle.cursor = 'not-allowed';
    }

    return baseStyle;
  };

  // === RENDER PRINCIPAL ===
  return (
    <div style={{ width: fullWidth ? '100%' : 'auto' }}>
      
      {/* LABEL */}
      {label && (
        <label style={inputStyles.label}>
          {label}
          {required && <span style={inputStyles.required}>*</span>}
        </label>
      )}

      {/* CONTAINER DO INPUT */}
      <div 
        className={getContainerClass()}
        style={getContainerStyle()}
      >
        
        {/* ÍCONE ESQUERDO */}
        {icon && iconPosition === 'left' && (
          <span style={{ ...inputStyles.icon, ...inputStyles.iconLeft }}>
            {icon}
          </span>
        )}

        {/* INPUT */}
        <input
          ref={inputRef}
          type={type}
          value={internalValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={getInputStyle()}
          {...props}
        />

        {/* ÍCONE DIREITO */}
        {icon && iconPosition === 'right' && (
          <span style={{ ...inputStyles.icon, ...inputStyles.iconRight }}>
            {icon}
          </span>
        )}

        {/* BOTÃO LIMPAR */}
        {clearable && internalValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              ...inputStyles.clearButton,
              right: icon && iconPosition === 'right' ? '40px' : '8px'
            }}
            title="Limpar"
          >
            ✕
          </button>
        )}
      </div>

      {/* INFORMAÇÕES ADICIONAIS */}
      <div style={inputStyles.footer}>
        
        {/* MENSAGEM DE ERRO */}
        {error && (
          <div style={inputStyles.errorMessage}>
            <span style={inputStyles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* MENSAGEM DE SUCESSO */}
        {success && (
          <div style={inputStyles.successMessage}>
            <span style={inputStyles.successIcon}>✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* CONTADOR DE CARACTERES */}
        {showCharCount && maxLength && (
          <div style={inputStyles.charCount}>
            <span style={{
              color: internalValue.length > maxLength * 0.8 ? '#C5793B' : '#64748b'
            }}>
              {internalValue.length}/{maxLength}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// === PROP TYPES ===
Input.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  success: PropTypes.string,
  label: PropTypes.string,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  clearable: PropTypes.bool,
  showCharCount: PropTypes.bool,
  maxLength: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'outlined', 'filled']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  onClear: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object
};

// === ESTILOS PRIMEM ===
const inputStyles = {
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2B4C7E', // Azul PRIMEM
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },

  required: {
    color: '#dc2626',
    marginLeft: '2px'
  },

  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    transition: 'all 0.2s ease'
  },

  // ✅ CORREÇÃO: Usar propriedades separadas ao invés de shorthand 'border'
  variants: {
    default: {
      backgroundColor: 'white',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#e1e5f2',
      borderRadius: '8px'
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#e1e5f2',
      borderRadius: '8px'
    },
    filled: {
      backgroundColor: '#f8f9ff',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderRadius: '8px'
    }
  },

  sizes: {
    small: {
      minHeight: '36px',
      fontSize: '14px'
    },
    medium: {
      minHeight: '40px',
      fontSize: '14px'
    },
    large: {
      minHeight: '48px',
      fontSize: '16px'
    }
  },

  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    padding: '0 12px',
    fontSize: 'inherit',
    color: '#1f2937',
    fontFamily: 'inherit',
    '::placeholder': {
      color: '#9ca3af'
    }
  },

  icon: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '16px',
    color: '#64748b',
    pointerEvents: 'none',
    zIndex: 1
  },

  iconLeft: {
    left: '12px'
  },

  iconRight: {
    right: '12px'
  },

  clearButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '14px',
    padding: '4px',
    borderRadius: '4px',
    transition: 'color 0.2s ease',
    ':hover': {
      color: '#dc2626'
    }
  },

  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: '4px',
    minHeight: '20px'
  },

  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#dc2626'
  },

  errorIcon: {
    fontSize: '12px'
  },

  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#059669'
  },

  successIcon: {
    fontSize: '12px'
  },

  charCount: {
    fontSize: '12px',
    color: '#64748b',
    marginLeft: 'auto'
  }
};

export default Input;