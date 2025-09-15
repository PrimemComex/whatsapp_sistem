// ====================================
// ⚙️ CONTEXTO DE CONFIGURAÇÕES - CORRIGIDO
// Context para configurações do sistema
// ====================================

import React, { createContext, useContext, useState, useCallback } from 'react';

// === CONFIGURAÇÕES PADRÃO ===
const defaultSettings = {
  theme: 'light',
  language: 'pt-BR',
  notifications: {
    desktop: true,
    sound: true,
    email: false
  },
  chat: {
    sendWithEnter: true,
    showTimestamps: true,
    groupByDate: true,
    autoScroll: true
  },
  privacy: {
    readReceipts: true,
    onlineStatus: true,
    lastSeen: true
  },
  signature: {
    enabled: false,
    text: '',
    global: true
  }
};

// === CRIAR CONTEXTO ===
const SettingsContext = createContext();

// === PROVIDER ===
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('primem_settings');
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return defaultSettings;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // === LIMPAR ERRO ===
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // === ATUALIZAR CONFIGURAÇÃO ===
  const updateSetting = useCallback((path, value) => {
    try {
      setSettings(prev => {
        const newSettings = { ...prev };
        
        // Suporte para path aninhado (ex: 'notifications.desktop')
        const keys = path.split('.');
        let current = newSettings;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return newSettings;
      });
      
      setHasChanges(true);
      setError(null);
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      setError('Erro ao atualizar configuração');
    }
  }, []);

  // === SALVAR CONFIGURAÇÕES ===
  const saveSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 500));

      localStorage.setItem('primem_settings', JSON.stringify(settings));
      setHasChanges(false);

      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setError('Erro ao salvar configurações');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [settings]);

  // === RESETAR CONFIGURAÇÕES ===
  const resetSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setSettings(defaultSettings);
      localStorage.setItem('primem_settings', JSON.stringify(defaultSettings));
      setHasChanges(false);

      return { success: true };
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
      setError('Erro ao resetar configurações');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // === EXPORTAR CONFIGURAÇÕES ===
  const exportSettings = useCallback(() => {
    try {
      const exportData = {
        settings,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Erro ao exportar configurações:', error);
      setError('Erro ao exportar configurações');
      return null;
    }
  }, [settings]);

  // === IMPORTAR CONFIGURAÇÕES ===
  const importSettings = useCallback(async (importData) => {
    try {
      setLoading(true);
      setError(null);

      const data = JSON.parse(importData);
      
      if (!data.settings) {
        throw new Error('Dados de importação inválidos');
      }

      const newSettings = { ...defaultSettings, ...data.settings };
      setSettings(newSettings);
      setHasChanges(true);

      return { success: true, settings: newSettings };
    } catch (error) {
      console.error('Erro ao importar configurações:', error);
      setError('Erro ao importar configurações: ' + error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // === VALOR DO CONTEXTO ===
  const contextValue = {
    // Estados
    settings,
    loading,
    error,
    hasChanges,
    
    // Funções
    updateSetting,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
    clearError, // ✅ IMPORTANTE: clearError incluído
    
    // Utilitários
    defaultSettings
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// === HOOK PARA USAR CONTEXTO ===
export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  
  if (!context) {
    throw new Error('useSettingsContext deve ser usado dentro de SettingsProvider');
  }
  
  return context;
};

// === ALIAS PARA COMPATIBILIDADE ===
export const useSettings = useSettingsContext;

export default SettingsContext;