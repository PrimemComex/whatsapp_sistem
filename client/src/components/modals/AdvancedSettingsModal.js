// components/modals/AdvancedSettingsModal.js
import React, { useState, useEffect } from 'react';

const AdvancedSettingsModal = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [settings, setSettings] = useState({
    // Cores do sistema
    primaryColor: '#2B4C8C',
    secondaryColor: '#C97A4A',
    accentColor: '#8B9DC3',
    backgroundColor: '#f0f2f5',
    
    // Logo e branding
    companyName: 'PRIMEM COMEX',
    systemName: 'WHATSAPP BUSINESS',
    logoUrl: '',
    
    // Textos dos botões
    loginButtonText: 'ENTRAR NO SISTEMA',
    sendButtonText: 'Enviar',
    attachButtonText: 'Anexar',
    connectButtonText: 'Conectar WhatsApp',
    
    // Configurações de mensagens
    showTimestamps: true,
    showDeliveryStatus: true,
    enableSounds: true,
    defaultEmojiSkin: '👋',
    
    // Outras configurações
    maxFileSize: 16, // MB
    autoDownloadMedia: true,
    compactMode: false,
    
    ...currentSettings
  });

  const [activeSettingsTab, setActiveSettingsTab] = useState('appearance');

  useEffect(() => {
    if (isOpen && currentSettings) {
      setSettings(prev => ({ ...prev, ...currentSettings }));
    }
  }, [isOpen, currentSettings]);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{...modalStyles.modal, minWidth: '700px', maxHeight: '80vh'}} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>⚙️ Configurações Avançadas</h3>
          <button style={modalStyles.closeBtn} onClick={onClose}>✖</button>
        </div>
        
        <div style={modalStyles.body}>
          {/* Sub-tabs para configurações */}
          <div style={advancedSettingsStyles.tabs}>
            <button 
              style={{
                ...advancedSettingsStyles.tab,
                ...(activeSettingsTab === 'appearance' ? advancedSettingsStyles.tabActive : {})
              }}
              onClick={() => setActiveSettingsTab('appearance')}
            >
              🎨 Aparência
            </button>
            <button 
              style={{
                ...advancedSettingsStyles.tab,
                ...(activeSettingsTab === 'branding' ? advancedSettingsStyles.tabActive : {})
              }}
              onClick={() => setActiveSettingsTab('branding')}
            >
              🏢 Marca
            </button>
            <button 
              style={{
                ...advancedSettingsStyles.tab,
                ...(activeSettingsTab === 'interface' ? advancedSettingsStyles.tabActive : {})
              }}
              onClick={() => setActiveSettingsTab('interface')}
            >
              🖥️ Interface
            </button>
            <button 
              style={{
                ...advancedSettingsStyles.tab,
                ...(activeSettingsTab === 'behavior' ? advancedSettingsStyles.tabActive : {})
              }}
              onClick={() => setActiveSettingsTab('behavior')}
            >
              ⚡ Comportamento
            </button>
          </div>

          <div style={advancedSettingsStyles.content}>
            {/* ABA APARÊNCIA */}
            {activeSettingsTab === 'appearance' && (
              <div>
                <h4>🎨 Cores do Sistema</h4>
                <div style={advancedSettingsStyles.colorGrid}>
                  <div style={advancedSettingsStyles.colorItem}>
                    <label>Cor Primária:</label>
                    <div style={advancedSettingsStyles.colorInputContainer}>
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        style={advancedSettingsStyles.colorInput}
                      />
                      <span style={advancedSettingsStyles.colorValue}>{settings.primaryColor}</span>
                    </div>
                  </div>
                  
                  <div style={advancedSettingsStyles.colorItem}>
                    <label>Cor Secundária:</label>
                    <div style={advancedSettingsStyles.colorInputContainer}>
                      <input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                        style={advancedSettingsStyles.colorInput}
                      />
                      <span style={advancedSettingsStyles.colorValue}>{settings.secondaryColor}</span>
                    </div>
                  </div>
                  
                  <div style={advancedSettingsStyles.colorItem}>
                    <label>Cor de Destaque:</label>
                    <div style={advancedSettingsStyles.colorInputContainer}>
                      <input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => updateSetting('accentColor', e.target.value)}
                        style={advancedSettingsStyles.colorInput}
                      />
                      <span style={advancedSettingsStyles.colorValue}>{settings.accentColor}</span>
                    </div>
                  </div>
                  
                  <div style={advancedSettingsStyles.colorItem}>
                    <label>Cor de Fundo:</label>
                    <div style={advancedSettingsStyles.colorInputContainer}>
                      <input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                        style={advancedSettingsStyles.colorInput}
                      />
                      <span style={advancedSettingsStyles.colorValue}>{settings.backgroundColor}</span>
                    </div>
                  </div>
                </div>
                
                <div style={advancedSettingsStyles.preview}>
                  <h5>📱 Preview:</h5>
                  <div style={{
                    ...advancedSettingsStyles.previewCard,
                    backgroundColor: settings.primaryColor,
                    color: 'white'
                  }}>
                    <span>Header com cor primária</span>
                  </div>
                  <div style={{
                    ...advancedSettingsStyles.previewCard,
                    backgroundColor: settings.secondaryColor,
                    color: 'white'
                  }}>
                    <span>Botão com cor secundária</span>
                  </div>
                </div>
              </div>
            )}

            {/* ABA MARCA */}
            {activeSettingsTab === 'branding' && (
              <div>
                <h4>🏢 Marca da Empresa</h4>
                <div style={advancedSettingsStyles.formGroup}>
                  <label style={modalStyles.label}>Nome da Empresa:</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => updateSetting('companyName', e.target.value)}
                    style={modalStyles.input}
                    placeholder="PRIMEM COMEX"
                  />
                </div>
                
                <div style={advancedSettingsStyles.formGroup}>
                  <label style={modalStyles.label}>Nome do Sistema:</label>
                  <input
                    type="text"
                    value={settings.systemName}
                    onChange={(e) => updateSetting('systemName', e.target.value)}
                    style={modalStyles.input}
                    placeholder="WHATSAPP BUSINESS"
                  />
                </div>
                
                <div style={advancedSettingsStyles.formGroup}>
                  <label style={modalStyles.label}>URL do Logo:</label>
                  <input
                    type="url"
                    value={settings.logoUrl}
                    onChange={(e) => updateSetting('logoUrl', e.target.value)}
                    style={modalStyles.input}
                    placeholder="https://exemplo.com/logo.png"
                  />
                  <small style={modalStyles.hint}>
                    URL da imagem do logo (deixe vazio para usar padrão)
                  </small>
                </div>

                {settings.logoUrl && (
                  <div style={advancedSettingsStyles.logoPreview}>
                    <h5>🖼️ Preview do Logo:</h5>
                    <img 
                      src={settings.logoUrl} 
                      alt="Logo Preview" 
                      style={advancedSettingsStyles.logoImg}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ABA INTERFACE */}
            {activeSettingsTab === 'interface' && (
              <div>
                <h4>🖥️ Textos da Interface</h4>
                <div style={advancedSettingsStyles.formGroup}>
                  <label style={modalStyles.label}>Botão de Login:</label>
                  <input
                    type="text"
                    value={settings.loginButtonText}
                    onChange={(e) => updateSetting('loginButtonText', e.target.value)}
                    style={modalStyles.input}
                    placeholder="ENTRAR NO SISTEMA"
                  />
                </div>
                
                <div style={advancedSettingsStyles.formGroup}>
                  <label style={modalStyles.label}>Botão de Enviar:</label>
                  <input
                    type="text"
                    value={settings.sendButtonText}
                    onChange={(e) => updateSetting('sendButtonText', e.target.value)}
                    style={modalStyles.input}
                    placeholder="Enviar"
                  />
                </div>
                
                <div style={advancedSettingsStyles.formGroup}>
                  <label style={modalStyles.label}>Botão de Anexar:</label>
                  <input
                    type="text"
                    value={settings.attachButtonText}
                    onChange={(e) => updateSetting('attachButtonText', e.target.value)}
                    style={modalStyles.input}
                    placeholder="Anexar"
                  />
                </div>
                
                <div style={advancedSettingsStyles.formGroup}>
                  <label style={modalStyles.label}>Botão Conectar WhatsApp:</label>
                  <input
                    type="text"
                    value={settings.connectButtonText}
                    onChange={(e) => updateSetting('connectButtonText', e.target.value)}
                    style={modalStyles.input}
                    placeholder="Conectar WhatsApp"
                  />
                </div>

                <h4>😊 Emoji Padrão</h4>
                <div style={advancedSettingsStyles.formGroup}>
                  <label style={modalStyles.label}>Emoji de Saudação:</label>
                  <select
                    value={settings.defaultEmojiSkin}
                    onChange={(e) => updateSetting('defaultEmojiSkin', e.target.value)}
                    style={modalStyles.input}
                  >
                    <option value="👋">👋 Acenar</option>
                    <option value="😊">😊 Sorrindo</option>
                    <option value="🎉">🎉 Celebração</option>
                    <option value="💼">💼 Negócios</option>
                    <option value="📞">📞 Telefone</option>
                  </select>
                </div>
              </div>
            )}

            {/* ABA COMPORTAMENTO */}
            {activeSettingsTab === 'behavior' && (
              <div>
                <h4>⚡ Comportamento do Sistema</h4>
                <div style={advancedSettingsStyles.switchGroup}>
                  <div style={advancedSettingsStyles.switchItem}>
                    <label>🕒 Mostrar horários nas mensagens</label>
                    <input
                      type="checkbox"
                      checked={settings.showTimestamps}
                      onChange={(e) => updateSetting('showTimestamps', e.target.checked)}
                      style={advancedSettingsStyles.switch}
                    />
                  </div>
                  
                  <div style={advancedSettingsStyles.switchItem}>
                    <label>✅ Mostrar status de entrega</label>
                    <input
                      type="checkbox"
                      checked={settings.showDeliveryStatus}
                      onChange={(e) => updateSetting('showDeliveryStatus', e.target.checked)}
                      style={advancedSettingsStyles.switch}
                    />
                  </div>
                  
                  <div style={advancedSettingsStyles.switchItem}>
                    <label>🔊 Sons de notificação</label>
                    <input
                      type="checkbox"
                      checked={settings.enableSounds}
                      onChange={(e) => updateSetting('enableSounds', e.target.checked)}
                      style={advancedSettingsStyles.switch}
                    />
                  </div>
                  
                  <div style={advancedSettingsStyles.switchItem}>
                    <label>📥 Download automático de mídia</label>
                    <input
                      type="checkbox"
                      checked={settings.autoDownloadMedia}
                      onChange={(e) => updateSetting('autoDownloadMedia', e.target.checked)}
                      style={advancedSettingsStyles.switch}
                    />
                  </div>
                  
                  <div style={advancedSettingsStyles.switchItem}>
                    <label>📱 Modo compacto</label>
                    <input
                      type="checkbox"
                      checked={settings.compactMode}
                      onChange={(e) => updateSetting('compactMode', e.target.checked)}
                      style={advancedSettingsStyles.switch}
                    />
                  </div>
                </div>
                
                <div style={advancedSettingsStyles.formGroup}>
                  <label style={modalStyles.label}>📄 Tamanho máximo de arquivo (MB):</label>
                  <input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value))}
                    style={modalStyles.input}
                    min="1"
                    max="100"
                  />
                  <small style={modalStyles.hint}>
                    Arquivos maiores que este valor não poderão ser enviados
                  </small>
                </div>

                <h4>🔄 Configurações Avançadas</h4>
                <div style={advancedSettingsStyles.formGroup}>
                  <label style={modalStyles.label}>🌐 Idioma da Interface:</label>
                  <select
                    value={settings.language || 'pt-BR'}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    style={modalStyles.input}
                  >
                    <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                    <option value="en-US">🇺🇸 English (US)</option>
                    <option value="es-ES">🇪🇸 Español</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* FOOTER COM BOTÕES */}
        <div style={modalStyles.footer}>
          <button style={modalStyles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button style={modalStyles.saveBtn} onClick={handleSave}>
            💾 Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

// ================================
// ESTILOS
// ================================

const modalStyles = {
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
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '15px 20px 20px 20px',
    borderTop: '1px solid #eee',
    marginTop: '20px'
  },
  cancelBtn: {
    padding: '10px 20px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    backgroundColor: 'white',
    color: '#666',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  saveBtn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#2B4C8C',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s'
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
  hint: {
    display: 'block',
    marginTop: '5px',
    color: '#666',
    fontSize: '12px'
  }
};

const advancedSettingsStyles = {
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #eee',
    marginBottom: '20px'
  },
  tab: {
    flex: 1,
    padding: '10px 8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#666',
    transition: 'all 0.3s',
    borderBottom: '2px solid transparent'
  },
  tabActive: {
    color: '#2B4C8C',
    borderBottom: '2px solid #2B4C8C',
    fontWeight: 'bold'
  },
  content: {
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '10px 0'
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  colorItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  colorInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  colorInput: {
    width: '50px',
    height: '30px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  colorValue: {
    fontSize: '12px',
    color: '#666',
    fontFamily: 'monospace'
  },
  preview: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  previewCard: {
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '8px',
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: '20px'
  },
  switchGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px'
  },
  switchItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  switch: {
    width: '50px',
    height: '25px',
    cursor: 'pointer'
  },
  logoPreview: {
    marginTop: '15px',
    textAlign: 'center'
  },
  logoImg: {
    maxWidth: '200px',
    maxHeight: '100px',
    borderRadius: '8px',
    border: '1px solid #ddd'
  }
};

export default AdvancedSettingsModal;