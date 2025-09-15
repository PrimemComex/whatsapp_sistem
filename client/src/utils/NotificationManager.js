// client/src/utils/NotificationManager.js
class NotificationManager {
  constructor() {
    this.notifications = [];
    this.container = null;
    this.init();
  }

  init() {
    // Criar container de notificações se não existir
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    const id = Date.now() + Math.random();
    
    // Configurar estilos baseado no tipo
    const colors = {
      success: { bg: '#4CAF50', icon: '✅' },
      error: { bg: '#f44336', icon: '❌' },
      warning: { bg: '#ff9800', icon: '⚠️' },
      info: { bg: '#2196F3', icon: 'ℹ️' }
    };
    
    const style = colors[type] || colors.info;
    
    notification.style.cssText = `
      background: ${style.bg};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      min-width: 300px;
      max-width: 400px;
      word-wrap: break-word;
      pointer-events: auto;
      cursor: pointer;
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;
    `;
    
    notification.innerHTML = `
      <span style="font-size: 16px;">${style.icon}</span>
      <span style="flex: 1;">${message}</span>
      <span style="cursor: pointer; font-weight: bold; opacity: 0.8;">×</span>
    `;
    
    // Adicionar ao container
    this.container.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Fechar ao clicar
    notification.onclick = () => {
      this.remove(notification);
    };
    
    // Auto remover
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification);
      }, duration);
    }
    
    // Salvar referência
    this.notifications.push({ id, element: notification });
    
    return id;
  }

  remove(notification) {
    if (notification && notification.parentNode) {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }

  success(message, duration = 4000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 6000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 5000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 4000) {
    return this.show(message, 'info', duration);
  }

  clear() {
    this.notifications.forEach(({ element }) => {
      this.remove(element);
    });
    this.notifications = [];
  }

  // Método para notificações do browser (se permitido)
  static requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  static showBrowserNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        ...options
      });
    }
  }

  // Notificação completa (toast + browser se disponível)
  notify(message, type = 'info', options = {}) {
    // Toast notification
    const toastId = this.show(message, type, options.duration);
    
    // Browser notification para mensagens importantes
    if (type === 'error' || options.browser) {
      NotificationManager.showBrowserNotification('PRIMEM WhatsApp', {
        body: message,
        tag: `primem-${type}-${Date.now()}`
      });
    }
    
    return toastId;
  }
}

// Criar instância singleton
const notificationManager = new NotificationManager();

// Solicitar permissão para notificações do browser
NotificationManager.requestPermission();

export default notificationManager;