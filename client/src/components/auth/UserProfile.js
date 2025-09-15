// client/src/components/auth/UserProfile.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE DE PERFIL DO USUÁRIO
// Extraído do App.js v8.1 - Perfil e configurações de usuário
// =====================================

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Importar componentes UI
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Loading from '../ui/Loading';

const UserProfile = ({
  user,
  isOpen = false,
  onClose,
  onUpdateProfile,
  onChangePassword,
  onDeleteAccount,
  isLoading = false,
  canEdit = true,
  showAdvanced = true,
  showDangerZone = false
}) => {
  // ====================================
  // ESTADOS DO PERFIL
  // ====================================
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    bio: '',
    avatar: null
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [validationErrors, setValidationErrors] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // ====================================
  // SINCRONIZAR DADOS DO USUÁRIO
  // ====================================
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        bio: user.bio || '',
        avatar: user.avatar || null
      });
    }
  }, [user]);

  // ====================================
  // VALIDAÇÃO
  // ====================================
  const validateProfile = () => {
    const errors = {};

    if (!profileData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (profileData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!profileData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = 'Email deve ter um formato válido';
    }

    if (profileData.phone && !/^\+?[\d\s\(\)\-]{10,}$/.test(profileData.phone)) {
      errors.phone = 'Formato de telefone inválido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'Nova senha é obrigatória';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'Nova senha deve ser diferente da atual';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ====================================
  // HANDLERS
  // ====================================
  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setUnsavedChanges(true);
    
    // Limpar erro de validação
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro de validação
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      return;
    }

    if (onUpdateProfile) {
      const result = await onUpdateProfile(profileData);
      if (result?.success) {
        setIsEditing(false);
        setUnsavedChanges(false);
      }
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setIsChangingPassword(true);
    
    if (onChangePassword) {
      const result = await onChangePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result?.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setActiveTab('profile');
      }
    }
    
    setIsChangingPassword(false);
  };

  const handleCancel = () => {
    if (unsavedChanges) {
      if (window.confirm('Descartar alterações não salvas?')) {
        setIsEditing(false);
        setUnsavedChanges(false);
        // Restaurar dados originais
        if (user) {
          setProfileData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            department: user.department || '',
            bio: user.bio || '',
            avatar: user.avatar || null
          });
        }
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleClose = () => {
    if (unsavedChanges) {
      if (window.confirm('Descartar alterações não salvas?')) {
        onClose && onClose();
      }
    } else {
      onClose && onClose();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar arquivo
      if (file.size > 2 * 1024 * 1024) { // 2MB
        alert('Imagem deve ter no máximo 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Arquivo deve ser uma imagem');
        return;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onload = (event) => {
        handleProfileChange('avatar', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ====================================
  // ESTILOS
  // ====================================
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight: '80vh'
    },

    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '24px',
      borderBottom: '1px solid #e5e7eb'
    },

    avatarSection: {
      position: 'relative',
      display: 'inline-block'
    },

    avatarOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      opacity: 0,
      cursor: 'pointer',
      transition: 'opacity 0.2s',
      color: 'white',
      fontSize: '12px'
    },

    headerInfo: {
      flex: 1
    },

    userName: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '4px'
    },

    userEmail: {
      fontSize: '14px',
      color: '#6b7280'
    },

    userRole: {
      display: 'inline-block',
      padding: '2px 8px',
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      marginTop: '4px'
    },

    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e5e7eb'
    },

    tab: {
      padding: '12px 24px',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: '#6b7280',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s'
    },

    activeTab: {
      color: '#2B4C8C',
      borderBottomColor: '#2B4C8C'
    },

    content: {
      flex: 1,
      overflow: 'auto',
      padding: '24px'
    },

    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },

    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },

    formGroupFull: {
      gridColumn: '1 / -1'
    },

    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px'
    },

    textarea: {
      minHeight: '80px',
      resize: 'vertical',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      fontFamily: 'inherit'
    },

    passwordSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '400px'
    },

    passwordInput: {
      position: 'relative'
    },

    showPasswordBtn: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#6b7280'
    },

    dangerZone: {
      marginTop: '40px',
      padding: '20px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px'
    },

    dangerTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#dc2626',
      marginBottom: '8px'
    },

    dangerDescription: {
      fontSize: '14px',
      color: '#7f1d1d',
      marginBottom: '16px'
    },

    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      padding: '24px',
      borderTop: '1px solid #e5e7eb'
    },

    hiddenInput: {
      display: 'none'
    }
  };

  // ====================================
  // RENDER
  // ====================================
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Perfil do Usuário"
      size="large"
    >
      <div style={styles.container}>
        {/* Header com Avatar */}
        <div style={styles.header}>
          <div 
            style={styles.avatarSection}
            onMouseEnter={(e) => {
              if (isEditing) {
                e.currentTarget.querySelector('.avatar-overlay').style.opacity = '1';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.querySelector('.avatar-overlay').style.opacity = '0';
            }}
          >
            <Avatar
              src={profileData.avatar}
              name={profileData.name}
              size="large"
            />
            {isEditing && (
              <div 
                className="avatar-overlay"
                style={styles.avatarOverlay}
                onClick={() => document.getElementById('avatar-input').click()}
              >
                📷
              </div>
            )}
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={styles.hiddenInput}
            />
          </div>

          <div style={styles.headerInfo}>
            <div style={styles.userName}>{user.name}</div>
            <div style={styles.userEmail}>{user.email}</div>
            {user.role && (
              <span style={styles.userRole}>
                {user.role === 'admin' ? '👑 Administrador' : '👤 Usuário'}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'profile' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('profile')}
          >
            👤 Perfil
          </button>
          
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'security' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('security')}
          >
            🔒 Segurança
          </button>
          
          {showAdvanced && (
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'advanced' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('advanced')}
            >
              ⚙️ Avançado
            </button>
          )}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {isLoading && <Loading text="Atualizando perfil..." />}

          {!isLoading && activeTab === 'profile' && (
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome Completo *</label>
                <Input
                  value={profileData.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  disabled={!isEditing}
                  error={validationErrors.name}
                  placeholder="Seu nome completo"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  disabled={!isEditing}
                  error={validationErrors.email}
                  placeholder="seu@email.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Telefone</label>
                <Input
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  disabled={!isEditing}
                  error={validationErrors.phone}
                  placeholder="+55 11 99999-9999"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Departamento</label>
                <Input
                  value={profileData.department}
                  onChange={(e) => handleProfileChange('department', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Seu departamento"
                />
              </div>

              <div style={{...styles.formGroup, ...styles.formGroupFull}}>
                <label style={styles.label}>Biografia</label>
                <textarea
                  style={styles.textarea}
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Conte um pouco sobre você..."
                  maxLength={500}
                />
              </div>
            </div>
          )}

          {!isLoading && activeTab === 'security' && (
            <div style={styles.passwordSection}>
              <h3>Alterar Senha</h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Senha Atual *</label>
                <div style={styles.passwordInput}>
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    error={validationErrors.currentPassword}
                    placeholder="Sua senha atual"
                  />
                  <button
                    type="button"
                    style={styles.showPasswordBtn}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nova Senha *</label>
                <div style={styles.passwordInput}>
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    error={validationErrors.newPassword}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    style={styles.showPasswordBtn}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Confirmar Nova Senha *</label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  error={validationErrors.confirmPassword}
                  placeholder="Digite novamente a nova senha"
                />
              </div>

              <Button
                onClick={handleChangePassword}
                loading={isChangingPassword}
                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                Alterar Senha
              </Button>
            </div>
          )}

          {!isLoading && activeTab === 'advanced' && (
            <div>
              <h3>Configurações Avançadas</h3>
              <p>Configurações avançadas em desenvolvimento...</p>

              {/* Zona de Perigo */}
              {showDangerZone && (
                <div style={styles.dangerZone}>
                  <div style={styles.dangerTitle}>⚠️ Zona de Perigo</div>
                  <div style={styles.dangerDescription}>
                    Ações irreversíveis. Prossiga com cautela.
                  </div>
                  
                  <Button
                    variant="danger"
                    onClick={onDeleteAccount}
                  >
                    Excluir Conta
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {activeTab === 'profile' && (
          <div style={styles.actions}>
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                  loading={isLoading}
                >
                  Salvar
                </Button>
              </>
            ) : (
              canEdit && (
                <Button
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                >
                  Editar Perfil
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

// ====================================
// PROP TYPES
// ====================================
UserProfile.propTypes = {
  user: PropTypes.object.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onUpdateProfile: PropTypes.func,
  onChangePassword: PropTypes.func,
  onDeleteAccount: PropTypes.func,
  isLoading: PropTypes.bool,
  canEdit: PropTypes.bool,
  showAdvanced: PropTypes.bool,
  showDangerZone: PropTypes.bool
};

export default UserProfile;