// client/src/components/modals/EditNameModal.js
// =====================================
// PRIMEM WHATSAPP - MODAL EDITAR NOME
// Extraído do App.js v8.1 - Modal modular para edição de nome
// =====================================

import React, { useState, useRef, useEffect } from 'react';

const EditNameModal = ({ 
  isOpen, 
  currentName = '', 
  onSave, 
  onClose,
  title = 'Editar Nome',
  placeholder = 'Digite o novo nome...',
  maxLength = 50,
  className = ''
}) => {
  // ====================================
  // ESTADOS
  // ====================================
  const [name, setName] = useState(currentName);
  const [isLoading, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ====================================
  // REFS
  // ====================================
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // ====================================
  // ATUALIZAR NOME QUANDO PROP MUDA
  // ====================================
  useEffect(() => {
    setName(currentName);
    setError('');
  }, [currentName, isOpen]);

  // ====================================
  // FOCO NO INPUT QUANDO ABRE
  // ====================================
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
        inputRef.current.select();
      }, 100);
    }
  }, [isOpen]);

  // ====================================
  // FECHAR COM ESC
  // ====================================
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
      if (event.key === 'Enter' && isOpen) {
        handleSave();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, name]);

  // ====================================
  // FECHAR AO CLICAR FORA
  // ====================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // ====================================
  // VALIDAÇÕES
  // ====================================
  const validateName = (value) => {
    if (!value.trim()) {
      return 'Nome não pode estar vazio';
    }
    if (value.trim().length < 2) {
      return 'Nome deve ter pelo menos 2 caracteres';
    }
    if (value.length > maxLength) {
      return `Nome deve ter no máximo ${maxLength} caracteres`;
    }
    return '';
  };

  // ====================================
  // MANIPULAR MUDANÇA NO INPUT
  // ====================================
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    
    // Validar em tempo real
    const validationError = validateName(value);
    setError(validationError);
  };

  // ====================================
  // SALVAR NOME
  // ====================================
  const handleSave = async () => {
    const trimmedName = name.trim();
    
    // Validar
    const validationError = validateName(trimmedName);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Verificar se mudou
    if (trimmedName === currentName.trim()) {
      handleClose();
      return;
    }

    try {
      setSaving(true);
      setError('');

      console.log('📝 Salvando nome:', trimmedName);

      if (onSave) {
        await onSave(trimmedName);
      }

      console.log('✅ Nome salvo com sucesso');
      handleClose();

    } catch (err) {
      console.error('❌ Erro ao salvar nome:', err);
      setError(err.message || 'Erro ao salvar nome. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // ====================================
  // FECHAR MODAL
  // ====================================
  const handleClose = () => {
    if (isLoading) return; // Não fechar se salvando

    setName(currentName); // Resetar para valor original
    setError('');
    
    if (onClose) {
      onClose();
    }
  };

  // ====================================
  // NÃO RENDERIZAR SE FECHADO
  // ====================================
  if (!isOpen) return null;

  // ====================================
  // RENDER PRINCIPAL
  // ====================================
  return (
    <div style={styles.overlay} className={className}>
      <div ref={modalRef} style={styles.modal}>
        
        {/* CABEÇALHO */}
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button 
            onClick={handleClose} 
            style={styles.closeButton}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {/* CONTEÚDO */}
        <div style={styles.content}>
          
          {/* CAMPO DE NOME */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nome:</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={isLoading}
              style={{
                ...styles.input,
                ...(error ? styles.inputError : {})
              }}
            />
            
            {/* CONTADOR DE CARACTERES */}
            <div style={styles.charCounter}>
              {name.length}/{maxLength}
            </div>
          </div>

          {/* ERRO */}
          {error && (
            <div style={styles.errorContainer}>
              <span style={styles.errorIcon}>⚠️</span>
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          {/* INFORMAÇÃO */}
          <div style={styles.infoContainer}>
            <span style={styles.infoIcon}>💡</span>
            <span style={styles.infoText}>
              O nome será exibido nas conversas e no perfil
            </span>
          </div>
        </div>

        {/* RODAPÉ */}
        <div style={styles.footer}>
          <button 
            onClick={handleClose}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            Cancelar
          </button>
          
          <button 
            onClick={handleSave}
            style={{
              ...styles.saveButton,
              ...(isLoading ? styles.saveButtonLoading : {}),
              ...(error || !name.trim() ? styles.saveButtonDisabled : {})
            }}
            disabled={isLoading || !!error || !name.trim()}
          >
            {isLoading ? '💾 Salvando...' : '💾 Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ====================================
// ESTILOS PRIMEM
// ====================================
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },

  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'column'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #e1e5f2'
  },

  title: {
    margin: 0,
    color: '#2B4C7E', // Azul PRIMEM
    fontSize: '18px',
    fontWeight: '600'
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
    transition: 'background-color 0.2s'
  },

  content: {
    flex: 1,
    padding: '24px'
  },

  inputGroup: {
    marginBottom: '16px'
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#2B4C7E', // Azul PRIMEM
    fontSize: '14px',
    fontWeight: '600'
  },

  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e1e5f2',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },

  inputError: {
    borderColor: '#dc2626'
  },

  charCounter: {
    textAlign: 'right',
    marginTop: '4px',
    fontSize: '12px',
    color: '#64748b'
  },

  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    marginBottom: '16px'
  },

  errorIcon: {
    fontSize: '16px'
  },

  errorText: {
    color: '#dc2626',
    fontSize: '14px'
  },

  infoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px'
  },

  infoIcon: {
    fontSize: '16px'
  },

  infoText: {
    color: '#0369a1',
    fontSize: '14px'
  },

  footer: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px 24px',
    borderTop: '1px solid #e1e5f2'
  },

  cancelButton: {
    flex: 1,
    padding: '12px 20px',
    border: '2px solid #e1e5f2',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit'
  },

  saveButton: {
    flex: 1,
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#2B4C7E', // Azul PRIMEM
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontFamily: 'inherit'
  },

  saveButtonLoading: {
    backgroundColor: '#64748b',
    cursor: 'not-allowed'
  },

  saveButtonDisabled: {
    backgroundColor: '#e1e5f2',
    color: '#94a3b8',
    cursor: 'not-allowed'
  }
};

export default EditNameModal;