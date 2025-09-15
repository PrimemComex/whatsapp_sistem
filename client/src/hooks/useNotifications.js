// ====================================
// 🔔 HOOK useNotifications - Simples
// Hook básico para mostrar notificações
// ====================================

import { useCallback } from 'react';

export const useNotifications = () => {
  const showNotification = useCallback((message, options = {}) => {
    const type = options.type || 'info';
    
    // Por enquanto usar alert simples
    // No futuro pode integrar com toast library
    if (type === 'error') {
      alert('❌ ' + message);
    } else if (type === 'success') {
      alert('✅ ' + message);
    } else if (type === 'warning') {
      alert('⚠️ ' + message);
    } else {
      alert('ℹ️ ' + message);
    }
  }, []);

  return {
    showNotification
  };
};

export default useNotifications;