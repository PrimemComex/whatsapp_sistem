// client/src/services/apiService.js
// =====================================
// PRIMEM WHATSAPP - SERVIÇO BASE DE API
// Centralizador de todas as chamadas HTTP
// =====================================

class ApiService {
  constructor() {
    // Configurações base
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.timeout = 30000; // 30 segundos
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // ====================================
  // MÉTODO PRINCIPAL DE REQUISIÇÃO
  // ====================================
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Configuração padrão
    const config = {
      timeout: this.timeout,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      ...options
    };

    // Log da requisição (desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`, {
        headers: config.headers,
        body: config.body
      });
    }

    try {
      // Fazer a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Log da resposta (desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        console.log(`📡 API Response: ${response.status} ${response.statusText}`);
      }

      // Verificar se a resposta é OK
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Processar resposta
      return await this.processResponse(response);

    } catch (error) {
      return this.handleRequestError(error, url);
    }
  }

  // ====================================
  // PROCESSAMENTO DE RESPOSTA
  // ====================================
  async processResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType && contentType.includes('text/')) {
      return await response.text();
    } else {
      return response;
    }
  }

  // ====================================
  // TRATAMENTO DE ERROS HTTP
  // ====================================
  async handleErrorResponse(response) {
    let errorMessage = `Erro ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // Se não conseguir parsear JSON, usar status text
      try {
        errorMessage = await response.text() || errorMessage;
      } catch (e2) {
        // Usar mensagem padrão
      }
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.response = response;
    
    throw error;
  }

  // ====================================
  // TRATAMENTO DE ERROS DE REDE
  // ====================================
  handleRequestError(error, url) {
    console.error('❌ Erro na requisição:', error);

    if (error.name === 'AbortError') {
      throw new Error('Timeout: A requisição demorou muito para responder');
    }

    if (!navigator.onLine) {
      throw new Error('Sem conexão com a internet');
    }

    if (error.message.includes('fetch')) {
      throw new Error('Erro de conexão com o servidor');
    }

    // Re-throw o erro original se não for um erro conhecido
    throw error;
  }

  // ====================================
  // MÉTODOS DE CONVENIÊNCIA
  // ====================================

  // GET Request
  async get(endpoint, params = {}) {
    const queryString = Object.keys(params).length > 0 
      ? '?' + new URLSearchParams(params).toString()
      : '';
    
    return this.request(`${endpoint}${queryString}`, {
      method: 'GET'
    });
  }

  // POST Request
  async post(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  }

  // PUT Request
  async put(endpoint, data = null) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null
    });
  }

  // DELETE Request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // PATCH Request
  async patch(endpoint, data = null) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null
    });
  }

  // ====================================
  // UPLOAD DE ARQUIVOS
  // ====================================
  async postFile(endpoint, formData, onProgress = null) {
    const url = `${this.baseURL}${endpoint}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress handler
      if (onProgress && typeof onProgress === 'function') {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      // Success handler
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      // Error handler
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed: Network error'));
      });

      // Timeout handler
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload failed: Timeout'));
      });

      // Configure and send
      xhr.open('POST', url);
      xhr.timeout = this.timeout;
      xhr.send(formData);
    });
  }

  // ====================================
  // MÉTODOS DE UTILIDADE
  // ====================================

  // Verificar se o servidor está online
  async healthCheck() {
    try {
      await this.get('/api/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Obter status do sistema
  async getSystemStatus() {
    return this.get('/api/status');
  }

  // Configurar headers customizados
  setDefaultHeader(key, value) {
    this.defaultHeaders[key] = value;
  }

  // Remover header customizado
  removeDefaultHeader(key) {
    delete this.defaultHeaders[key];
  }

  // Configurar timeout
  setTimeout(ms) {
    this.timeout = ms;
  }
}

// ====================================
// EXPORTAR INSTÂNCIA SINGLETON
// ====================================
const apiService = new ApiService();

export default apiService;