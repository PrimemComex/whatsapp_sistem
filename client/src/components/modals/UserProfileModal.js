// client/src/components/modals/UserProfileModal.js
import React, { useState, useEffect } from 'react';

const UserProfileModal = ({ isOpen, onClose, currentUser, onSave }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    displayName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        displayName: currentUser.displayName || currentUser.name || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
    }
  }, [isOpen, currentUser]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!profileData.displayName.trim()) {
      newErrors.displayName = 'Nome de exibição é obrigatório';
    }
    
    if (profileData.newPassword) {
      if (profileData.newPassword.length < 3) {
        newErrors.newPassword = 'Nova senha deve ter pelo menos 3 caracteres';
      }
      
      if (profileData.newPassword !== profileData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(profileData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{...styles.modal, minWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>👤 Configuração de Usuário</h3>
          <button style={styles.closeBtn} onClick={onClose}>❌</button>
        </div>
        
        <div style={styles.body}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nome completo:</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
              style={{...styles.input, ...(errors.name ? styles.inputError : {})}}
              placeholder="Seu nome completo..."
            />
            {errors.name && <span style={styles.error}>{errors.name}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
              style={{...styles.input, ...(errors.email ? styles.inputError : {})}}
              placeholder="seu@email.com"
            />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nome de exibição nas mensagens:</label>
            <input
              type="text"
              value={profileData.displayName}
              onChange={(e) => setProfileData(prev => ({...prev, displayName: e.target.value}))}
              style={{...styles.input, ...(errors.displayName ? styles.inputError : {})}}
              placeholder="Como seu nome aparecerá nas mensagens..."
            />
            {errors.displayName && <span style={styles.error}>{errors.displayName}</span>}
            <small style={styles.hint}>
              Este nome aparecerá nas mensagens que você enviar
            </small>
          </div>

          <div style={styles.separator}>
            <h4 style={styles.sectionTitle}>Alterar Senha (Opcional)</h4>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nova senha:</label>
            <div style={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                value={profileData.newPassword}
                onChange={(e) => setProfileData(prev => ({...prev, newPassword: e.target.value}))}
                style={{...styles.input, ...(errors.newPassword ? styles.inputError : {}), paddingRight: '40px'}}
                placeholder="Digite a nova senha..."
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.newPassword && <span style={styles.error}>{errors.newPassword}</span>}
          </div>

          {profileData.newPassword && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirmar nova senha:</label>
              <input
                type={showPassword ? "text" : "password"}
                value={profileData.confirmPassword}
                onChange={(e) => setProfileData(prev => ({...prev, confirmPassword: e.target.value}))}
                style={{...styles.input, ...(errors.confirmPassword ? styles.inputError : {})}}
                placeholder="Confirme a nova senha..."
              />
              {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
            </div>
          )}
        </div>
        
        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button style={styles.saveBtn} onClick={handleSave}>
            💾 Salvar Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

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
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    minWidth: '400px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 0 20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px',
    marginBottom: '20px'
  },
  title: {
    margin: 0,
    color: '#2B4C8C',
    fontSize: '18px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666',
    padding: '5px'
  },
  body: {
    padding: '0 20px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box'
  },
  inputError: {
    borderColor: '#dc3545'
  },
  hint: {
    display: 'block',
    marginTop: '5px',
    color: '#666',
    fontSize: '12px'
  },
  error: {
    display: 'block',
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '5px'
  },
  separator: {
    margin: '25px 0',
    paddingTop: '15px',
    borderTop: '1px solid #eee'
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    color: '#2B4C8C',
    fontSize: '16px'
  },
  passwordContainer: {
    position: 'relative'
  },
  passwordToggle: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#666'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '20px',
    borderTop: '1px solid #eee',
    marginTop: '20px'
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  saveBtn: {
    padding: '10px 20px',
    backgroundColor: '#2B4C8C',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default UserProfileModal;