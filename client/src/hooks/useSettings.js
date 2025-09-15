// client/src/hooks/useSettings.js
// =====================================
// PRIMEM WHATSAPP - HOOK DE CONFIGURAÇÕES
// Gerencia todas as configurações do usuário e do sistema
// =====================================

import { useState, useEffect, useCallback } from 'react';

// Configurações padrão baseadas na marca PRIMEM
const DEFAULT_SETTINGS = {
  // Configurações de Aparência - Cores PRIMEM
  theme: {
    mode: 'light', // light, dark, auto
    primaryColor: '#2B4C8C',    // Azul PRIMEM
    secondaryColor: '#C97A4A',  // Laranja PRIMEM
    accentColor: '#8B9DC3',     // Azul claro PRIMEM
    backgroundColor: '#f0f2f5',
    textColor: '#1f2937',
    borderColor: '#e5e7eb'
  },
  
  // Configurações da Empresa
  company: {
    name: 'PRIMEM COMEX',
    systemName: 'WHATSAPP BUSINESS',
    logo: '/LOGO.png',
    website: 'https://primem.com.br',
    supportEmail: 'suporte@primem.com.br'
  },
  
  // Configurações do Chat
  chat: {
    messagesPerPage: 50,
    autoScroll: true,
    showTimestamps: true,
    messagePreview: true,
    soundEnabled: true,
    typingIndicator: true,
    readReceipts: true,
    messageFormat: 'default', // default, compact, detailed
    fontSize: 'medium' // small, medium, large
  },
  
  // Configurações de Notificações
  notifications: {
    enabled: true,
    desktop: true,
    sound: true,
    vibration: true,
    newMessage: true,
    newChat: true,
    mentions: true,
    soundFile: '/sounds/notification.wav',
    volume: 0.7,
    showPreview: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  },
  
  // Configurações de Upload/Download
  files: {
    maxSize: 16 * 1024 * 1024, // 16MB
    allowedTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'],
    autoDownload: true,
    autoCompress: false,
    downloadPath: '/downloads',
    previewImages: true,
    previewVideos: true
  },
  
  // Configurações de Privacidade
  privacy: {
    hideLastSeen: false,
    hideReadReceipts: false,
    allowGroups: true,
    allowUnknownContacts: false,
    autoArchive: false,
    dataRetention: 30 // dias
  },
  
  // Configurações de Performance
  performance: {
    messageCache: 1000,
    imageQuality: 'high', // low, medium, high
    animationsEnabled: true,
    preloadMessages: true,
    compression: 'auto' // auto, always, never
  },
  
  // Configurações de Acessibilidade
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true
  },
  
  // Configurações do Usuário
  user: {
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h', // 12h, 24h
    firstName: '',
    lastName: '',
    avatar: null,
    status: 'Disponível'
  },
  
  // Configurações Avançadas
  advanced: {
    debugMode: false,
    developerMode: false,
    backupEnabled: true,
    backupFrequency: 'weekly', // daily, weekly, monthly
    cacheEnabled: true,
    analyticsEnabled: true,
    crashReporting: true
  }
};

export const useSettings = () => {
  // ====================================
  // ESTADOS
  // ====================================
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // ====================================
  // CARREGAR CONFIGURAÇÕES
  // ====================================
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Tentar carregar do localStorage primeiro
      const savedSettings = localStorage.getItem('primem_settings');
      
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Mesclar com configurações padrão para garantir novas propriedades
        const merged = mergeSettings(DEFAULT_SETTINGS, parsed);
        setSettings(merged);
      } else {
        // Usar configurações padrão na primeira execução
        setSettings(DEFAULT_SETTINGS);
        await saveSettings(DEFAULT_SETTINGS);
      }
      
      setLastSaved(new Date());
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      setError('Erro ao carregar configurações. Usando padrões.');
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  // ====================================
  // SALVAR CONFIGURAÇÕES
  // ====================================
  const saveSettings = useCallback(async (newSettings = settings) => {
    try {
      setError(null);
      
      // Salvar no localStorage
      localStorage.setItem('primem_settings', JSON.stringify(newSettings));
      
      // TODO: Salvar no servidor quando implementado
      // await apiService.post('/api/user/settings', newSettings);
      
      setHasChanges(false);
      setLastSaved(new Date());
      
      // Aplicar tema se mudou
      if (newSettings.theme !== settings.theme) {
        applyTheme(newSettings.theme);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      setError('Erro ao salvar configurações');
      return { success: false, error: err.message };
    }
  }, [settings]);

  // ====================================
  // ATUALIZAR CONFIGURAÇÃO ESPECÍFICA
  // ====================================
  const updateSetting = useCallback((path, value) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings };
      
      // Navegar pelo path (ex: 'theme.primaryColor')
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      
      setHasChanges(true);
      return newSettings;
    });
  }, []);

  // ====================================
  // RESETAR CONFIGURAÇÕES
  // ====================================
  const resetSettings = useCallback(async (section = null) => {
    try {
      let newSettings;
      
      if (section) {
        // Resetar apenas uma seção
        newSettings = {
          ...settings,
          [section]: DEFAULT_SETTINGS[section]
        };
      } else {
        // Resetar tudo
        newSettings = { ...DEFAULT_SETTINGS };
      }
      
      setSettings(newSettings);
      await saveSettings(newSettings);
      
      return { success: true };
    } catch (err) {
      setError('Erro ao resetar configurações');
      return { success: false, error: err.message };
    }
  }, [settings, saveSettings]);

  // ====================================
  // IMPORTAR/EXPORTAR CONFIGURAÇÕES
  // ====================================
  const exportSettings = useCallback(() => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `primem-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (err) {
      setError('Erro ao exportar configurações');
      return { success: false, error: err.message };
    }
  }, [settings]);

  const importSettings = useCallback(async (file) => {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      // Validar estrutura básica
      if (!imported || typeof imported !== 'object') {
        throw new Error('Arquivo de configurações inválido');
      }
      
      // Mesclar com configurações padrão
      const merged = mergeSettings(DEFAULT_SETTINGS, imported);
      
      setSettings(merged);
      await saveSettings(merged);
      
      return { success: true };
    } catch (err) {
      setError('Erro ao importar configurações: ' + err.message);
      return { success: false, error: err.message };
    }
  }, [saveSettings]);

  // ====================================
  // FUNÇÕES AUXILIARES
  // ====================================
  
  // Mesclar configurações recursivamente
  const mergeSettings = (defaults, custom) => {
    const result = { ...defaults };
    
    for (const key in custom) {
      if (custom.hasOwnProperty(key)) {
        if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && custom[key] !== null) {
          result[key] = mergeSettings(defaults[key] || {}, custom[key]);
        } else {
          result[key] = custom[key];
        }
      }
    }
    
    return result;
  };
  
  // Aplicar tema no CSS
  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    // Aplicar variáveis CSS customizadas
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--border-color', theme.borderColor);
    
    // Aplicar classe do modo
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.mode}`);
  };

  // ====================================
  // GETTERS ESPECÍFICOS
  // ====================================
  const getTheme = useCallback(() => settings.theme, [settings.theme]);
  const getNotifications = useCallback(() => settings.notifications, [settings.notifications]);
  const getChat = useCallback(() => settings.chat, [settings.chat]);
  const getFiles = useCallback(() => settings.files, [settings.files]);
  const getUser = useCallback(() => settings.user, [settings.user]);
  const getCompany = useCallback(() => settings.company, [settings.company]);

  // ====================================
  // VERIFICADORES
  // ====================================
  const isDarkMode = useCallback(() => {
    if (settings.theme.mode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return settings.theme.mode === 'dark';
  }, [settings.theme.mode]);

  const isQuietHours = useCallback(() => {
    if (!settings.notifications.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const start = timeToMinutes(settings.notifications.quietHours.start);
    const end = timeToMinutes(settings.notifications.quietHours.end);
    
    if (start < end) {
      return currentTime >= start && currentTime <= end;
    } else {
      return currentTime >= start || currentTime <= end;
    }
  }, [settings.notifications.quietHours]);

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // ====================================
  // EFEITOS
  // ====================================
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Aplicar tema quando carregado
  useEffect(() => {
    if (!loading) {
      applyTheme(settings.theme);
    }
  }, [settings.theme, loading]);

  // Auto-save periódico
  useEffect(() => {
    if (hasChanges) {
      const timer = setTimeout(() => {
        saveSettings();
      }, 2000); // Auto-save após 2 segundos de inatividade
      
      return () => clearTimeout(timer);
    }
  }, [hasChanges, saveSettings]);

  // ====================================
  // RETORNO DO HOOK
  // ====================================
  return {
    // Estados
    settings,
    loading,
    error,
    hasChanges,
    lastSaved,
    
    // Ações principais
    updateSetting,
    saveSettings,
    resetSettings,
    loadSettings,
    
    // Import/Export
    exportSettings,
    importSettings,
    
    // Getters específicos
    getTheme,
    getNotifications,
    getChat,
    getFiles,
    getUser,
    getCompany,
    
    // Verificadores
    isDarkMode,
    isQuietHours,
    
    // Configurações padrão para reset
    defaultSettings: DEFAULT_SETTINGS
  };
};