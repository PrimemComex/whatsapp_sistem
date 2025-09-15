// client/src/pages/SettingsPage.js
// =====================================
// PRIMEM WHATSAPP - PÁGINA DE CONFIGURAÇÕES
// Configurações completas do sistema com todas as opções
// =====================================

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

// Importar contextos e hooks
import { useAuth } from '../contexts/AuthContext';
import { useSettingsContext } from '../contexts/SettingsContext';
import { useWhatsApp } from '../contexts/WhatsAppContext';

// Importar componentes
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';

// Cores PRIMEM
const PRIMEM_COLORS = {
  primary: '#2B4C8C',
  secondary: '#C97A4A',
  accent: '#8B9DC3',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  background: '#f0f2f5',
  white: '#ffffff',
  text: '#374151'
};

const SettingsPage = ({
  onBackToDashboard,
  className = '',
  style = {}
}) => {
  // ====================================
  // CONTEXTOS E HOOKS
  // ====================================
  const { user, updateProfile, logout } = useAuth();
  const { 
    settings,
    updateSetting,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
    hasChanges,
    loading: settingsLoading,
    error: settingsError
  } = useSettingsContext();
  
  const { status } = useWhatsApp();

  // ====================================
  // ESTADOS LOCAIS
  // ====================================
  const [activeTab, setActiveTab] = useState('general');
  const [localSettings, setLocalSettings] = useState(settings);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved', 'error'

  // ====================================
  // EFEITOS
  // ====================================
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    // Auto-save após 2 segundos de inatividade
    const autoSaveTimer = setTimeout(() => {
      if (hasChanges && Object.keys(validationErrors).length === 0) {
        handleSave(false); // Save silencioso
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [localSettings, hasChanges, validationErrors]);

  // ====================================
  // FUNÇÕES AUXILIARES
  // ====================================
  const validateSetting = (category, key, value) => {
    const errors = { ...validationErrors };
    const settingKey = `${category}.${key}`;
    
    // Limpar erro anterior
    delete errors[settingKey];
    
    // Validações específicas
    if (category === 'user') {
      if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[settingKey] = 'Email inválido';
      }
      if (key === 'name' && !value.trim()) {
        errors[settingKey] = 'Nome é obrigatório';
      }
    }
    
    if (category === 'notifications') {
      if (key === 'quietHoursStart' || key === 'quietHoursEnd') {
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          errors[settingKey] = 'Formato de hora inválido (HH:MM)';
        }
      }
    }
    
    if (category === 'company') {
      if (key === 'name' && !value.trim()) {
        errors[settingKey] = 'Nome da empresa é obrigatório';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ====================================
  // HANDLERS
  // ====================================
  const handleSettingChange = useCallback((category, key, value) => {
    if (validateSetting(category, key, value)) {
      const newSettings = {
        ...localSettings,
        [category]: {
          ...localSettings[category],
          [key]: value
        }
      };
      
      setLocalSettings(newSettings);
      updateSetting(`${category}.${key}`, value);
    }
  }, [localSettings, updateSetting]);

  const handleSave = async (showFeedback = true) => {
    if (Object.keys(validationErrors).length > 0) {
      if (showFeedback) {
        setSaveStatus('error');
      }
      return;
    }

    if (showFeedback) {
      setSaveStatus('saving');
    }
    
    setIsLoading(true);
    
    try {
      await saveSettings();
      if (showFeedback) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      if (showFeedback) {
        setSaveStatus('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await resetSettings();
      setShowResetConfirm(false);
      setLocalSettings(settings);
      setValidationErrors({});
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const exportedSettings = exportSettings();
    setExportData(JSON.stringify(exportedSettings, null, 2));
    setShowExportModal(true);
  };

  const handleImport = async () => {
    try {
      const parsedData = JSON.parse(importData);
      await importSettings(parsedData);
      setShowImportModal(false);
      setImportData('');
    } catch (error) {
      console.error('Erro ao importar configurações:', error);
      alert('Dados inválidos para importação');
    }
  };

  const handleLogout = () => {
    logout();
  };

  // ====================================
  // ESTILOS
  // ====================================
  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      ...style
    },

    header: {
      marginBottom: '32px'
    },

    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: PRIMEM_COLORS.primary,
      marginBottom: '8px'
    },

    subtitle: {
      fontSize: '16px',
      color: PRIMEM_COLORS.text,
      opacity: 0.7,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },

    saveStatus: {
      fontSize: '14px',
      fontWeight: '600',
      padding: '4px 8px',
      borderRadius: '4px',
      marginLeft: '12px'
    },

    tabsContainer: {
      marginBottom: '24px'
    },

    tabs: {
      display: 'flex',
      backgroundColor: PRIMEM_COLORS.white,
      borderRadius: '12px',
      padding: '4px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      border: `1px solid ${PRIMEM_COLORS.accent}20`,
      overflowX: 'auto'
    },

    tab: {
      flex: 1,
      minWidth: '120px',
      padding: '12px 16px',
      border: 'none',
      backgroundColor: 'transparent',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      color: PRIMEM_COLORS.text,
      transition: 'all 0.2s ease',
      textAlign: 'center',
      whiteSpace: 'nowrap'
    },

    activeTab: {
      backgroundColor: PRIMEM_COLORS.primary,
      color: PRIMEM_COLORS.white,
      boxShadow: '0 2px 4px rgba(43, 76, 140, 0.3)'
    },

    contentCard: {
      backgroundColor: PRIMEM_COLORS.white,
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: `1px solid ${PRIMEM_COLORS.accent}20`,
      marginBottom: '24px'
    },

    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: PRIMEM_COLORS.primary,
      marginBottom: '20px',
      paddingBottom: '12px',
      borderBottom: `2px solid ${PRIMEM_COLORS.accent}20`
    },

    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px'
    },

    formGroup: {
      marginBottom: '20px'
    },

    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: PRIMEM_COLORS.text,
      marginBottom: '8px'
    },

    input: {
      width: '100%',
      padding: '12px 16px',
      border: `2px solid ${PRIMEM_COLORS.accent}40`,
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.3s ease',
      '&:focus': {
        outline: 'none',
        borderColor: PRIMEM_COLORS.primary
      }
    },

    inputError: {
      borderColor: PRIMEM_COLORS.error
    },

    errorText: {
      fontSize: '12px',
      color: PRIMEM_COLORS.error,
      marginTop: '4px'
    },

    toggle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: PRIMEM_COLORS.background,
      borderRadius: '8px',
      cursor: 'pointer'
    },

    toggleLabel: {
      fontSize: '14px',
      color: PRIMEM_COLORS.text
    },

    toggleSwitch: {
      position: 'relative',
      width: '48px',
      height: '24px',
      backgroundColor: PRIMEM_COLORS.accent,
      borderRadius: '12px',
      transition: 'background-color 0.3s ease'
    },

    toggleSwitchActive: {
      backgroundColor: PRIMEM_COLORS.success
    },

    toggleKnob: {
      position: 'absolute',
      width: '20px',
      height: '20px',
      backgroundColor: PRIMEM_COLORS.white,
      borderRadius: '10px',
      top: '2px',
      left: '2px',
      transition: 'transform 0.3s ease'
    },

    toggleKnobActive: {
      transform: 'translateX(24px)'
    },

    select: {
      width: '100%',
      padding: '12px 16px',
      border: `2px solid ${PRIMEM_COLORS.accent}40`,
      borderRadius: '8px',
      fontSize: '16px',
      backgroundColor: PRIMEM_COLORS.white,
      cursor: 'pointer'
    },

    textarea: {
      width: '100%',
      minHeight: '100px',
      padding: '12px 16px',
      border: `2px solid ${PRIMEM_COLORS.accent}40`,
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'monospace',
      resize: 'vertical'
    },

    colorPicker: {
      width: '60px',
      height: '40px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    },

    actionsContainer: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      marginTop: '24px'
    },

    actionButton: {
      minWidth: '120px'
    }
  };

  // ====================================
  // RENDERIZAÇÃO DE ABAS
  // ====================================
  const renderGeneralSettings = () => (
    <div style={styles.contentCard}>
      <h3 style={styles.sectionTitle}>⚙️ Configurações Gerais</h3>
      
      <div style={styles.formGrid}>
        {/* INFORMAÇÕES DA EMPRESA */}
        <div>
          <h4 style={{ color: PRIMEM_COLORS.primary, marginBottom: '16px' }}>
            🏢 Empresa
          </h4>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Nome da Empresa</label>
            <Input
              value={localSettings.company?.name || ''}
              onChange={(e) => handleSettingChange('company', 'name', e.target.value)}
              placeholder="Nome da sua empresa"
              error={validationErrors['company.name']}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Slogan</label>
            <Input
              value={localSettings.company?.slogan || ''}
              onChange={(e) => handleSettingChange('company', 'slogan', e.target.value)}
              placeholder="Slogan da empresa"
            />
          </div>
        </div>

        {/* TEMA E CORES */}
        <div>
          <h4 style={{ color: PRIMEM_COLORS.primary, marginBottom: '16px' }}>
            🎨 Aparência
          </h4>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Tema</label>
            <select
              style={styles.select}
              value={localSettings.theme?.mode || 'light'}
              onChange={(e) => handleSettingChange('theme', 'mode', e.target.value)}
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="auto">Automático</option>
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Cor Primária</label>
            <input
              type="color"
              style={styles.colorPicker}
              value={localSettings.theme?.primaryColor || PRIMEM_COLORS.primary}
              onChange={(e) => handleSettingChange('theme', 'primaryColor', e.target.value)}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Cor Secundária</label>
            <input
              type="color"
              style={styles.colorPicker}
              value={localSettings.theme?.secondaryColor || PRIMEM_COLORS.secondary}
              onChange={(e) => handleSettingChange('theme', 'secondaryColor', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div style={styles.contentCard}>
      <h3 style={styles.sectionTitle}>🔔 Notificações</h3>
      
      <div style={styles.formGrid}>
        <div>
          <div style={styles.formGroup}>
            <div 
              style={styles.toggle}
              onClick={() => handleSettingChange('notifications', 'enabled', !localSettings.notifications?.enabled)}
            >
              <span style={styles.toggleLabel}>Ativar notificações</span>
              <div style={{
                ...styles.toggleSwitch,
                ...(localSettings.notifications?.enabled ? styles.toggleSwitchActive : {})
              }}>
                <div style={{
                  ...styles.toggleKnob,
                  ...(localSettings.notifications?.enabled ? styles.toggleKnobActive : {})
                }} />
              </div>
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <div 
              style={styles.toggle}
              onClick={() => handleSettingChange('notifications', 'desktop', !localSettings.notifications?.desktop)}
            >
              <span style={styles.toggleLabel}>Notificações desktop</span>
              <div style={{
                ...styles.toggleSwitch,
                ...(localSettings.notifications?.desktop ? styles.toggleSwitchActive : {})
              }}>
                <div style={{
                  ...styles.toggleKnob,
                  ...(localSettings.notifications?.desktop ? styles.toggleKnobActive : {})
                }} />
              </div>
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <div 
              style={styles.toggle}
              onClick={() => handleSettingChange('notifications', 'sound', !localSettings.notifications?.sound)}
            >
              <span style={styles.toggleLabel}>Som de notificação</span>
              <div style={{
                ...styles.toggleSwitch,
                ...(localSettings.notifications?.sound ? styles.toggleSwitchActive : {})
              }}>
                <div style={{
                  ...styles.toggleKnob,
                  ...(localSettings.notifications?.sound ? styles.toggleKnobActive : {})
                }} />
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Horário silencioso - Início</label>
            <Input
              type="time"
              value={localSettings.notifications?.quietHoursStart || '22:00'}
              onChange={(e) => handleSettingChange('notifications', 'quietHoursStart', e.target.value)}
              error={validationErrors['notifications.quietHoursStart']}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Horário silencioso - Fim</label>
            <Input
              type="time"
              value={localSettings.notifications?.quietHoursEnd || '08:00'}
              onChange={(e) => handleSettingChange('notifications', 'quietHoursEnd', e.target.value)}
              error={validationErrors['notifications.quietHoursEnd']}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderChatSettings = () => (
    <div style={styles.contentCard}>
      <h3 style={styles.sectionTitle}>💬 Chat</h3>
      
      <div style={styles.formGrid}>
        <div>
          <div style={styles.formGroup}>
            <div 
              style={styles.toggle}
              onClick={() => handleSettingChange('chat', 'showMediaPreview', !localSettings.chat?.showMediaPreview)}
            >
              <span style={styles.toggleLabel}>Preview de mídia</span>
              <div style={{
                ...styles.toggleSwitch,
                ...(localSettings.chat?.showMediaPreview ? styles.toggleSwitchActive : {})
              }}>
                <div style={{
                  ...styles.toggleKnob,
                  ...(localSettings.chat?.showMediaPreview ? styles.toggleKnobActive : {})
                }} />
              </div>
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <div 
              style={styles.toggle}
              onClick={() => handleSettingChange('chat', 'autoDownloadMedia', !localSettings.chat?.autoDownloadMedia)}
            >
              <span style={styles.toggleLabel}>Download automático de mídia</span>
              <div style={{
                ...styles.toggleSwitch,
                ...(localSettings.chat?.autoDownloadMedia ? styles.toggleSwitchActive : {})
              }}>
                <div style={{
                  ...styles.toggleKnob,
                  ...(localSettings.chat?.autoDownloadMedia ? styles.toggleKnobActive : {})
                }} />
              </div>
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Tamanho máximo de arquivo (MB)</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={localSettings.chat?.maxFileSize || 16}
              onChange={(e) => handleSettingChange('chat', 'maxFileSize', parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Mensagem de boas-vindas</label>
            <textarea
              style={styles.textarea}
              value={localSettings.chat?.welcomeMessage || ''}
              onChange={(e) => handleSettingChange('chat', 'welcomeMessage', e.target.value)}
              placeholder="Mensagem automática para novos contatos"
              rows="4"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Mensagem de ausência</label>
            <textarea
              style={styles.textarea}
              value={localSettings.chat?.awayMessage || ''}
              onChange={(e) => handleSettingChange('chat', 'awayMessage', e.target.value)}
              placeholder="Mensagem automática quando ausente"
              rows="4"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div style={styles.contentCard}>
      <h3 style={styles.sectionTitle}>💾 Backup e Dados</h3>
      
      <div style={styles.formGrid}>
        <div>
          <h4 style={{ color: PRIMEM_COLORS.primary, marginBottom: '16px' }}>
            📤 Exportar Configurações
          </h4>
          <p style={{ marginBottom: '16px', fontSize: '14px', color: PRIMEM_COLORS.text, opacity: 0.8 }}>
            Salve suas configurações para fazer backup ou transferir para outro dispositivo
          </p>
          <Button
            onClick={handleExport}
            style={{ backgroundColor: PRIMEM_COLORS.success }}
          >
            📤 Exportar
          </Button>
        </div>
        
        <div>
          <h4 style={{ color: PRIMEM_COLORS.primary, marginBottom: '16px' }}>
            📥 Importar Configurações
          </h4>
          <p style={{ marginBottom: '16px', fontSize: '14px', color: PRIMEM_COLORS.text, opacity: 0.8 }}>
            Restaure configurações de um backup anterior
          </p>
          <Button
            onClick={() => setShowImportModal(true)}
            style={{ backgroundColor: PRIMEM_COLORS.warning }}
          >
            📥 Importar
          </Button>
        </div>
        
        <div>
          <h4 style={{ color: PRIMEM_COLORS.primary, marginBottom: '16px' }}>
            🔄 Restaurar Padrões
          </h4>
          <p style={{ marginBottom: '16px', fontSize: '14px', color: PRIMEM_COLORS.text, opacity: 0.8 }}>
            Volte todas as configurações para os valores padrão
          </p>
          <Button
            onClick={() => setShowResetConfirm(true)}
            style={{ backgroundColor: PRIMEM_COLORS.error }}
          >
            🔄 Restaurar
          </Button>
        </div>
      </div>
    </div>
  );

  // ====================================
  // RENDERIZAÇÃO PRINCIPAL
  // ====================================
  return (
    <DashboardLayout
      user={user}
      whatsappStatus={status}
      onLogout={handleLogout}
      className={className}
    >
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>Configurações</h1>
          <div style={styles.subtitle}>
            <span>Personalize o sistema conforme suas necessidades</span>
            {saveStatus && (
              <span style={{
                ...styles.saveStatus,
                backgroundColor: saveStatus === 'saved' ? `${PRIMEM_COLORS.success}20` : 
                               saveStatus === 'saving' ? `${PRIMEM_COLORS.warning}20` :
                               `${PRIMEM_COLORS.error}20`,
                color: saveStatus === 'saved' ? PRIMEM_COLORS.success : 
                       saveStatus === 'saving' ? PRIMEM_COLORS.warning :
                       PRIMEM_COLORS.error
              }}>
                {saveStatus === 'saved' && '✅ Salvo'}
                {saveStatus === 'saving' && '⏳ Salvando...'}
                {saveStatus === 'error' && '❌ Erro ao salvar'}
              </span>
            )}
          </div>
        </div>

        {/* TABS */}
        <div style={styles.tabsContainer}>
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'general' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('general')}
            >
              ⚙️ Geral
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'notifications' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 Notificações
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'chat' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('chat')}
            >
              💬 Chat
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'data' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('data')}
            >
              💾 Dados
            </button>
          </div>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'notifications' && renderNotificationSettings()}
        {activeTab === 'chat' && renderChatSettings()}
        {activeTab === 'data' && renderDataSettings()}

        {/* AÇÕES */}
        <div style={styles.actionsContainer}>
          {onBackToDashboard && (
            <Button
              onClick={onBackToDashboard}
              style={{ 
                ...styles.actionButton,
                backgroundColor: 'transparent',
                color: PRIMEM_COLORS.primary,
                border: `1px solid ${PRIMEM_COLORS.primary}`
              }}
            >
              ← Voltar
            </Button>
          )}
          
          <Button
            onClick={() => handleSave(true)}
            disabled={isLoading || Object.keys(validationErrors).length > 0}
            style={{ 
              ...styles.actionButton,
              backgroundColor: PRIMEM_COLORS.success
            }}
          >
            {isLoading ? (
              <>
                <Loading size="small" color="white" />
                &nbsp; Salvando...
              </>
            ) : (
              '💾 Salvar'
            )}
          </Button>
        </div>

        {/* MODAIS */}
        
        {/* MODAL DE RESET */}
        <Modal
          isVisible={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          title="Confirmar Reset"
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <p style={{ marginBottom: '24px' }}>
              Tem certeza que deseja restaurar todas as configurações?<br />
              Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button
                onClick={() => setShowResetConfirm(false)}
                style={{ backgroundColor: PRIMEM_COLORS.accent }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReset}
                style={{ backgroundColor: PRIMEM_COLORS.error }}
              >
                Restaurar
              </Button>
            </div>
          </div>
        </Modal>

        {/* MODAL DE EXPORT */}
        <Modal
          isVisible={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Exportar Configurações"
        >
          <div>
            <p style={{ marginBottom: '16px' }}>
              Copie o texto abaixo para fazer backup das suas configurações:
            </p>
            <textarea
              style={{
                ...styles.textarea,
                minHeight: '200px',
                fontFamily: 'monospace'
              }}
              value={exportData}
              readOnly
              onClick={(e) => e.target.select()}
            />
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(exportData);
                  alert('Configurações copiadas!');
                }}
                style={{ backgroundColor: PRIMEM_COLORS.success }}
              >
                📋 Copiar
              </Button>
            </div>
          </div>
        </Modal>

        {/* MODAL DE IMPORT */}
        <Modal
          isVisible={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Importar Configurações"
        >
          <div>
            <p style={{ marginBottom: '16px' }}>
              Cole o texto das configurações exportadas:
            </p>
            <textarea
              style={{
                ...styles.textarea,
                minHeight: '200px',
                fontFamily: 'monospace'
              }}
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Cole aqui o JSON das configurações..."
            />
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setShowImportModal(false)}
                style={{ backgroundColor: PRIMEM_COLORS.accent }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importData.trim()}
                style={{ backgroundColor: PRIMEM_COLORS.success }}
              >
                📥 Importar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

// ====================================
// PROP TYPES
// ====================================
SettingsPage.propTypes = {
  onBackToDashboard: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object
};

export default SettingsPage;