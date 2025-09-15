// client/src/components/ui/Modal.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE MODAL
// Componente básico reutilizável para modais do sistema
// =====================================

import React, { useEffect, useRef } from 'react';

const Modal = ({ 
  isOpen = false,
  onClose,
  title = '',
  children,
  size = 'medium', // small, medium, large, full
  variant = 'default', // default, centered, bottom-sheet
  showCloseButton = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  showHeader = true,
  showFooter = false,
  footer = null,
  className = '',
  overlayClassName = '',
  style = {},
  overlayStyle = {},
  zIndex = 1000,
  ...props 
}) => {
  // ====================================
  // REFS
  // ====================================
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // ====================================
  // FECHAR COM ESC
  // ====================================
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && closeOnEscape && isOpen) {
        if (onClose) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, closeOnEscape, onClose]);

  // ====================================
  // BLOQUEAR SCROLL DO BODY
  // ====================================
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // ====================================
  // FECHAR AO CLICAR NO OVERLAY
  // ====================================
  const handleOverlayClick = (event) => {
    if (closeOnOverlay && event.target === overlayRef.current) {
      if (onClose) {
        onClose();
      }
    }
  };

  // ====================================
  // MANIPULAR CLIQUE DO BOTÃO FECHAR
  // ====================================
  const handleCloseClick = () => {
    if (onClose) {
      onClose();
    }
  };

  // ====================================
  // ESTILOS DINÂMICOS
  // ====================================
  const getOverlayStyle = () => {
    return {
      ...modalStyles.overlay,
      zIndex,
      ...overlayStyle
    };
  };

  const getModalStyle = () => {
    const baseStyle = {
      ...modalStyles.modal,
      ...modalStyles.sizes[size],
      ...modalStyles.variants[variant]
    };

    return {
      ...baseStyle,
      ...style
    };
  };

  // ====================================
  // CLASSES CSS DINÂMICAS
  // ====================================
  const getOverlayClass = () => {
    return `primem-modal-overlay ${overlayClassName}`.trim();
  };

  const getModalClass = () => {
    const baseClass = 'primem-modal';
    const sizeClass = `primem-modal--${size}`;
    const variantClass = `primem-modal--${variant}`;
    
    return `${baseClass} ${sizeClass} ${variantClass} ${className}`.trim();
  };

  // ====================================
  // NÃO RENDERIZAR SE FECHADO
  // ====================================
  if (!isOpen) {
    return null;
  }

  // ====================================
  // RENDER PRINCIPAL
  // ====================================
  return (
    <div 
      ref={overlayRef}
      className={getOverlayClass()}
      style={getOverlayStyle()}
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className={getModalClass()}
        style={getModalStyle()}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        
        {/* CABEÇALHO */}
        {showHeader && (
          <div style={modalStyles.header}>
            {title && (
              <h2 style={modalStyles.title}>{title}</h2>
            )}
            
            {showCloseButton && (
              <button 
                onClick={handleCloseClick}
                style={modalStyles.closeButton}
                title="Fechar"
                aria-label="Fechar modal"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* CONTEÚDO */}
        <div style={modalStyles.content}>
          {children}
        </div>

        {/* RODAPÉ */}
        {showFooter && footer && (
          <div style={modalStyles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ====================================
// ESTILOS PRIMEM
// ====================================
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backdropFilter: 'blur(2px)'
  },

  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    overflow: 'hidden',
    animation: 'modalFadeIn 0.2s ease-out'
  },

  // TAMANHOS
  sizes: {
    small: {
      width: '100%',
      maxWidth: '400px'
    },
    medium: {
      width: '100%',
      maxWidth: '500px'
    },
    large: {
      width: '100%',
      maxWidth: '800px'
    },
    full: {
      width: '95vw',
      height: '95vh',
      maxWidth: 'none',
      maxHeight: 'none'
    }
  },

  // VARIANTES
  variants: {
    default: {
      // Estilo padrão já aplicado
    },
    centered: {
      textAlign: 'center'
    },
    'bottom-sheet': {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      borderRadius: '12px 12px 0 0',
      animation: 'modalSlideUp 0.3s ease-out'
    }
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #e1e5f2',
    flexShrink: 0
  },

  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#2B4C7E', // Azul PRIMEM
    flex: 1,
    textAlign: 'left'
  },

  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#64748b',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    marginLeft: '16px',
    ':hover': {
      backgroundColor: '#f1f5f9',
      color: '#374151'
    }
  },

  content: {
    flex: 1,
    padding: '24px',
    overflow: 'auto'
  },

  footer: {
    padding: '16px 24px 24px',
    borderTop: '1px solid #e1e5f2',
    flexShrink: 0
  }
};

// ====================================
// COMPONENTES ESPECIALIZADOS
// ====================================

// Modal de confirmação
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger' // danger, warning, info
}) => {
  const getConfirmButtonStyle = () => {
    const variants = {
      danger: { backgroundColor: '#dc2626', color: 'white' },
      warning: { backgroundColor: '#C5793B', color: 'white' },
      info: { backgroundColor: '#2B4C7E', color: 'white' }
    };
    
    return {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      marginLeft: '12px',
      ...variants[variant]
    };
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <button
        onClick={onClose}
        style={{
          padding: '10px 20px',
          border: '1px solid #e1e5f2',
          borderRadius: '6px',
          backgroundColor: 'white',
          color: '#64748b',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        style={getConfirmButtonStyle()}
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      showFooter={true}
      footer={footer}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '16px',
          color: variant === 'danger' ? '#dc2626' : variant === 'warning' ? '#C5793B' : '#2B4C7E'
        }}>
          {variant === 'danger' ? '⚠️' : variant === 'warning' ? '🚨' : 'ℹ️'}
        </div>
        <p style={{ 
          fontSize: '16px', 
          color: '#374151', 
          margin: 0,
          lineHeight: 1.5
        }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

// Modal de alerta
export const AlertModal = ({ 
  isOpen, 
  onClose, 
  title = 'Atenção',
  message = '',
  type = 'info', // success, error, warning, info
  buttonText = 'OK'
}) => {
  const getIcon = () => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type];
  };

  const getColor = () => {
    const colors = {
      success: '#059669',
      error: '#dc2626',
      warning: '#C5793B',
      info: '#2B4C7E'
    };
    return colors[type];
  };

  const footer = (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={onClose}
        style={{
          padding: '10px 24px',
          border: 'none',
          borderRadius: '6px',
          backgroundColor: getColor(),
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        {buttonText}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      variant="centered"
      showFooter={true}
      footer={footer}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '16px',
          color: getColor()
        }}>
          {getIcon()}
        </div>
        <p style={{ 
          fontSize: '16px', 
          color: '#374151', 
          margin: 0,
          lineHeight: 1.5
        }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

// Modal de loading
export const LoadingModal = ({ 
  isOpen, 
  message = 'Carregando...',
  showClose = false,
  onClose
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    showHeader={false}
    showCloseButton={showClose}
    closeOnOverlay={showClose}
    closeOnEscape={showClose}
    size="small"
    variant="centered"
  >
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ 
        fontSize: '48px', 
        marginBottom: '16px',
        animation: 'spin 1s linear infinite'
      }}>
        ⏳
      </div>
      <p style={{ 
        fontSize: '16px', 
        color: '#64748b', 
        margin: 0
      }}>
        {message}
      </p>
    </div>
  </Modal>
);

// ====================================
// EXPORTAÇÃO PADRÃO
// ====================================
export default Modal;