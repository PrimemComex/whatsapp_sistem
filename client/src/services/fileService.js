// client/src/services/fileService.js
// =====================================
// PRIMEM WHATSAPP - SERVIÇO DE ARQUIVOS
// Gerencia upload, download e processamento de arquivos
// =====================================

import apiService from './apiService';

class FileService {
  constructor() {
    this.maxFileSize = 16 * 1024 * 1024; // 16MB (limite WhatsApp)
    this.allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/3gp'],
      audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain', 'application/zip', 'application/rar']
    };
    
    // Cache para preview de arquivos
    this.previewCache = new Map();
    this.compressionQuality = 0.8;
  }

  // ====================================
  // VALIDAÇÃO DE ARQUIVOS
  // ====================================

  /**
   * Validar arquivo antes do upload
   * @param {File} file 
   * @returns {Object} { valid: boolean, error?: string, type?: string }
   */
  validateFile(file) {
    try {
      // Verificar se é um arquivo válido
      if (!file || !(file instanceof File)) {
        return { valid: false, error: 'Arquivo inválido' };
      }

      // Verificar tamanho
      if (file.size > this.maxFileSize) {
        const maxSizeMB = (this.maxFileSize / 1024 / 1024).toFixed(1);
        return { 
          valid: false, 
          error: `Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB` 
        };
      }

      // Verificar se o arquivo não está vazio
      if (file.size === 0) {
        return { valid: false, error: 'Arquivo está vazio' };
      }

      // Determinar tipo do arquivo
      const fileType = this.getFileType(file);
      
      if (!fileType) {
        return { 
          valid: false, 
          error: 'Tipo de arquivo não suportado' 
        };
      }

      // Validações específicas por tipo
      const typeValidation = this.validateFileByType(file, fileType);
      if (!typeValidation.valid) {
        return typeValidation;
      }

      return { 
        valid: true, 
        type: fileType,
        size: file.size,
        name: file.name
      };

    } catch (error) {
      console.error('❌ Erro na validação do arquivo:', error);
      return { valid: false, error: 'Erro ao validar arquivo' };
    }
  }

  /**
   * Determinar tipo do arquivo
   * @param {File} file 
   * @returns {string|null}
   */
  getFileType(file) {
    const mimeType = file.type;
    
    for (const [type, mimes] of Object.entries(this.allowedTypes)) {
      if (mimes.includes(mimeType)) {
        return type;
      }
    }
    
    // Verificar por extensão se MIME não identificar
    const extension = file.name.split('.').pop().toLowerCase();
    
    const extensionMap = {
      // Imagens
      jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image',
      // Vídeos
      mp4: 'video', avi: 'video', mov: 'video', wmv: 'video', '3gp': 'video',
      // Áudios
      mp3: 'audio', wav: 'audio', ogg: 'audio', m4a: 'audio', aac: 'audio',
      // Documentos
      pdf: 'document', doc: 'document', docx: 'document', 
      xls: 'document', xlsx: 'document', ppt: 'document', pptx: 'document',
      txt: 'document', zip: 'document', rar: 'document'
    };
    
    return extensionMap[extension] || null;
  }

  /**
   * Validar arquivo por tipo específico
   * @param {File} file 
   * @param {string} type 
   * @returns {Object}
   */
  validateFileByType(file, type) {
    switch (type) {
      case 'image':
        return this.validateImage(file);
      case 'video':
        return this.validateVideo(file);
      case 'audio':
        return this.validateAudio(file);
      case 'document':
        return this.validateDocument(file);
      default:
        return { valid: true };
    }
  }

  /**
   * Validar imagem
   * @param {File} file 
   * @returns {Object}
   */
  validateImage(file) {
    // Validar dimensões máximas (opcional)
    const maxDimension = 4096; // pixels
    
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        if (img.width > maxDimension || img.height > maxDimension) {
          resolve({ 
            valid: false, 
            error: `Imagem muito grande. Máximo: ${maxDimension}x${maxDimension} pixels` 
          });
        } else {
          resolve({ valid: true });
        }
      };
      
      img.onerror = () => {
        resolve({ valid: false, error: 'Arquivo de imagem corrompido' });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validar vídeo
   * @param {File} file 
   * @returns {Object}
   */
  validateVideo(file) {
    // Limite específico para vídeos (menor que o geral)
    const maxVideoSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxVideoSize) {
      return { 
        valid: false, 
        error: 'Vídeo muito grande. Máximo permitido: 10MB' 
      };
    }
    
    return { valid: true };
  }

  /**
   * Validar áudio
   * @param {File} file 
   * @returns {Object}
   */
  validateAudio(file) {
    // Limite específico para áudios
    const maxAudioSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxAudioSize) {
      return { 
        valid: false, 
        error: 'Áudio muito grande. Máximo permitido: 5MB' 
      };
    }
    
    return { valid: true };
  }

  /**
   * Validar documento
   * @param {File} file 
   * @returns {Object}
   */
  validateDocument(file) {
    return { valid: true };
  }

  // ====================================
  // UPLOAD DE ARQUIVOS
  // ====================================

  /**
   * Enviar arquivo via WhatsApp
   * @param {string} chatId 
   * @param {File} file 
   * @param {string} caption - Legenda opcional
   * @param {function} onProgress - Callback de progresso
   * @returns {Promise<Object>}
   */
  async sendFile(chatId, file, caption = '', onProgress = null) {
    try {
      console.log('📎 Iniciando envio de arquivo:', file.name);

      // Validar arquivo
      const validation = await this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Preparar FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('number', chatId);
      
      if (caption.trim()) {
        formData.append('caption', caption.trim());
      }

      // Fazer upload com progresso
      const response = await apiService.postFile(
        '/api/whatsapp/send-media', 
        formData, 
        onProgress
      );

      if (response.success) {
        console.log('✅ Arquivo enviado com sucesso:', response.filename);
        
        return {
          success: true,
          filename: response.filename,
          url: response.url,
          messageId: response.messageId
        };
      }

      throw new Error(response.message || 'Erro ao enviar arquivo');

    } catch (error) {
      console.error('❌ Erro ao enviar arquivo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload de arquivo para o servidor (sem enviar via WhatsApp)
   * @param {File} file 
   * @param {function} onProgress 
   * @returns {Promise<Object>}
   */
  async uploadFile(file, onProgress = null) {
    try {
      console.log('📤 Fazendo upload de arquivo:', file.name);

      const validation = await this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await apiService.postFile(
        '/api/files/upload', 
        formData, 
        onProgress
      );

      if (response.success) {
        console.log('✅ Upload concluído:', response.filename);
        return response;
      }

      throw new Error(response.message || 'Erro no upload');

    } catch (error) {
      console.error('❌ Erro no upload:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ====================================
  // PREVIEW E PROCESSAMENTO
  // ====================================

  /**
   * Gerar preview de arquivo
   * @param {File} file 
   * @returns {Promise<Object>}
   */
  async generatePreview(file) {
    try {
      // Verificar cache
      const cacheKey = `${file.name}_${file.size}_${file.lastModified}`;
      if (this.previewCache.has(cacheKey)) {
        return this.previewCache.get(cacheKey);
      }

      const fileType = this.getFileType(file);
      let preview = null;

      switch (fileType) {
        case 'image':
          preview = await this.generateImagePreview(file);
          break;
        case 'video':
          preview = await this.generateVideoPreview(file);
          break;
        case 'audio':
          preview = await this.generateAudioPreview(file);
          break;
        default:
          preview = this.generateDocumentPreview(file);
      }

      // Salvar no cache
      this.previewCache.set(cacheKey, preview);

      return preview;

    } catch (error) {
      console.error('❌ Erro ao gerar preview:', error);
      return this.getDefaultPreview(file);
    }
  }

  /**
   * Gerar preview de imagem
   * @param {File} file 
   * @returns {Promise<Object>}
   */
  async generateImagePreview(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Criar canvas para redimensionar
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calcular dimensões do preview (max 300px)
          const maxSize = 300;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Desenhar imagem redimensionada
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve({
            type: 'image',
            url: e.target.result,
            thumbnail: canvas.toDataURL('image/jpeg', 0.7),
            width: img.width,
            height: img.height,
            size: file.size
          });
        };
        
        img.src = e.target.result;
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Gerar preview de vídeo
   * @param {File} file 
   * @returns {Promise<Object>}
   */
  async generateVideoPreview(file) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        // Capturar frame aos 2 segundos ou no início
        video.currentTime = Math.min(2, video.duration / 2);
      };
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = Math.min(video.videoWidth, 300);
        canvas.height = Math.min(video.videoHeight, 300);
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        URL.revokeObjectURL(url);
        
        resolve({
          type: 'video',
          url: URL.createObjectURL(file),
          thumbnail: canvas.toDataURL('image/jpeg', 0.7),
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          size: file.size
        });
      };
      
      video.src = url;
    });
  }

  /**
   * Gerar preview de áudio
   * @param {File} file 
   * @returns {Promise<Object>}
   */
  async generateAudioPreview(file) {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        
        resolve({
          type: 'audio',
          url: URL.createObjectURL(file),
          duration: audio.duration,
          size: file.size
        });
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(this.getDefaultPreview(file));
      };
      
      audio.src = url;
    });
  }

  /**
   * Gerar preview de documento
   * @param {File} file 
   * @returns {Object}
   */
  generateDocumentPreview(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    const iconMap = {
      pdf: '📄', doc: '📝', docx: '📝',
      xls: '📊', xlsx: '📊',
      ppt: '📋', pptx: '📋',
      txt: '📄', zip: '🗃️', rar: '🗃️'
    };
    
    return {
      type: 'document',
      icon: iconMap[extension] || '📎',
      name: file.name,
      size: file.size,
      extension: extension.toUpperCase()
    };
  }

  /**
   * Preview padrão em caso de erro
   * @param {File} file 
   * @returns {Object}
   */
  getDefaultPreview(file) {
    return {
      type: 'unknown',
      icon: '📎',
      name: file.name,
      size: file.size
    };
  }

  // ====================================
  // DOWNLOAD E UTILITÁRIOS
  // ====================================

  /**
   * Download de arquivo
   * @param {string} url 
   * @param {string} filename 
   */
  async downloadFile(url, filename) {
    try {
      console.log('📥 Iniciando download:', filename);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Criar link temporário para download
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(downloadUrl);
      
      console.log('✅ Download concluído:', filename);

    } catch (error) {
      console.error('❌ Erro no download:', error);
      throw error;
    }
  }

  /**
   * Formatar tamanho de arquivo
   * @param {number} bytes 
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formatar duração de mídia
   * @param {number} seconds 
   * @returns {string}
   */
  formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Comprimir imagem
   * @param {File} file 
   * @param {number} quality 
   * @returns {Promise<File>}
   */
  async compressImage(file, quality = this.compressionQuality) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // ====================================
  // LIMPEZA DE CACHE
  // ====================================

  /**
   * Limpar cache de previews
   */
  clearPreviewCache() {
    this.previewCache.clear();
    console.log('🗑️ Cache de previews limpo');
  }

  /**
   * Configurar tamanho máximo de arquivo
   * @param {number} sizeInMB 
   */
  setMaxFileSize(sizeInMB) {
    this.maxFileSize = sizeInMB * 1024 * 1024;
    console.log(`📏 Tamanho máximo de arquivo definido: ${sizeInMB}MB`);
  }
}

// ====================================
// EXPORTAR INSTÂNCIA SINGLETON
// ====================================
const fileService = new FileService();

export default fileService;