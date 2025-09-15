// client/src/hooks/useFileUpload.js
// =====================================
// PRIMEM WHATSAPP - HOOK DE UPLOAD DE ARQUIVOS
// Sistema robusto de upload com validação, compressão e fallback
// =====================================

import { useState, useCallback, useRef } from 'react';

// Configurações padrão
const DEFAULT_CONFIG = {
  maxSize: 16 * 1024 * 1024, // 16MB (limite WhatsApp)
  maxFiles: 10,
  allowedTypes: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/rar'
  ],
  compressImages: true,
  compressQuality: 0.8,
  endpoint: 'http://localhost:3001/api/whatsapp/send-media',
  chunkSize: 1024 * 1024, // 1MB chunks para arquivos grandes
  retryAttempts: 3,
  retryDelay: 1000
};

// Tipos de arquivo por categoria
const FILE_CATEGORIES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
  video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg', 'audio/flac'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ],
  archive: ['application/zip', 'application/rar', 'application/7z']
};

export const useFileUpload = (config = {}) => {
  // ====================================
  // CONFIGURAÇÃO FINAL
  // ====================================
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // ====================================
  // ESTADOS
  // ====================================
  const [uploads, setUploads] = useState([]); // Lista de uploads ativos
  const [queue, setQueue] = useState([]); // Fila de upload
  const [errors, setErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);
  const [completedFiles, setCompletedFiles] = useState([]);
  
  // ====================================
  // REFS
  // ====================================
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  const abortControllersRef = useRef(new Map());

  // ====================================
  // VALIDAÇÃO DE ARQUIVOS
  // ====================================
  const validateFile = useCallback((file) => {
    const errors = [];
    
    // Verificar tamanho
    if (file.size > finalConfig.maxSize) {
      errors.push(`Arquivo muito grande. Máximo: ${formatFileSize(finalConfig.maxSize)}`);
    }
    
    // Verificar tipo
    if (!finalConfig.allowedTypes.includes(file.type)) {
      errors.push(`Tipo de arquivo não permitido: ${file.type}`);
    }
    
    // Verificar nome do arquivo
    if (file.name.length > 255) {
      errors.push('Nome do arquivo muito longo');
    }
    
    // Verificar caracteres especiais no nome
    const invalidChars = /[<>:"/\\|?*]/g;
    if (invalidChars.test(file.name)) {
      errors.push('Nome do arquivo contém caracteres inválidos');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [finalConfig.maxSize, finalConfig.allowedTypes]);

  // ====================================
  // COMPRESSÃO DE IMAGENS
  // ====================================
  const compressImage = useCallback((file) => {
    return new Promise((resolve) => {
      if (!finalConfig.compressImages || !isImageFile(file)) {
        resolve(file);
        return;
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular dimensões mantendo proporção
        let { width, height } = img;
        const maxDimension = 1920; // Máximo 1920px
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para blob
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              // Criar novo arquivo comprimido
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              // Manter original se compressão não reduziu
              resolve(file);
            }
          },
          file.type,
          finalConfig.compressQuality
        );
      };
      
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }, [finalConfig.compressImages, finalConfig.compressQuality]);

  // ====================================
  // GERAR PREVIEW
  // ====================================
  const generatePreview = useCallback((file) => {
    return new Promise((resolve) => {
      const category = getFileCategory(file);
      
      if (category === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } else if (category === 'video') {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          video.currentTime = 1; // Capturar frame no segundo 1
        };
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          resolve(canvas.toDataURL());
          URL.revokeObjectURL(video.src);
        };
        video.onerror = () => {
          URL.revokeObjectURL(video.src);
          resolve(null);
        };
        video.src = URL.createObjectURL(file);
      } else {
        resolve(null);
      }
    });
  }, []);

  // ====================================
  // UPLOAD PRINCIPAL
  // ====================================
  const uploadFile = useCallback(async (file, options = {}) => {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Validar arquivo
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Comprimir se necessário
      const processedFile = await compressImage(file);
      
      // Gerar preview
      const preview = await generatePreview(processedFile);
      
      // Criar objeto de upload
      const uploadObj = {
        id: uploadId,
        file: processedFile,
        originalFile: file,
        name: file.name,
        size: processedFile.size,
        type: file.type,
        category: getFileCategory(file),
        preview,
        progress: 0,
        status: 'preparing', // preparing, uploading, completed, error, cancelled
        error: null,
        speed: 0,
        timeRemaining: 0,
        startTime: Date.now(),
        ...options
      };
      
      // Adicionar à lista de uploads
      setUploads(prev => [...prev, uploadObj]);
      
      // Iniciar upload
      await performUpload(uploadObj);
      
      return uploadObj;
      
    } catch (error) {
      console.error('Erro no upload:', error);
      setErrors(prev => [...prev, { id: uploadId, message: error.message }]);
      throw error;
    }
  }, [validateFile, compressImage, generatePreview]);

  // ====================================
  // EXECUTAR UPLOAD
  // ====================================
  const performUpload = useCallback(async (uploadObj) => {
    const { id, file, chatId, caption = '' } = uploadObj;
    
    try {
      // Atualizar status
      setUploads(prev => prev.map(u => 
        u.id === id ? { ...u, status: 'uploading' } : u
      ));
      
      // Criar FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', chatId || '');
      formData.append('caption', caption);
      
      // Criar controller de abort
      const abortController = new AbortController();
      abortControllersRef.current.set(id, abortController);
      
      // Configurar fetch com progress
      const response = await fetchWithProgress(
        finalConfig.endpoint,
        {
          method: 'POST',
          body: formData,
          signal: abortController.signal
        },
        (progress) => {
          // Atualizar progresso
          setUploads(prev => prev.map(u => 
            u.id === id ? { 
              ...u, 
              progress,
              speed: calculateSpeed(u.startTime, file.size, progress),
              timeRemaining: calculateTimeRemaining(u.startTime, file.size, progress)
            } : u
          ));
        }
      );
      
      if (!response.ok) {
        throw new Error(`Upload falhou: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Upload completado
      setUploads(prev => prev.map(u => 
        u.id === id ? { 
          ...u, 
          status: 'completed',
          progress: 100,
          result
        } : u
      ));
      
      setCompletedFiles(prev => [...prev, { ...uploadObj, result }]);
      
      return result;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        // Upload cancelado
        setUploads(prev => prev.map(u => 
          u.id === id ? { ...u, status: 'cancelled' } : u
        ));
      } else {
        // Erro no upload
        setUploads(prev => prev.map(u => 
          u.id === id ? { 
            ...u, 
            status: 'error',
            error: error.message
          } : u
        ));
        setErrors(prev => [...prev, { id, message: error.message }]);
      }
      
      throw error;
    } finally {
      abortControllersRef.current.delete(id);
    }
  }, [finalConfig.endpoint]);

  // ====================================
  // FETCH COM PROGRESS
  // ====================================
  const fetchWithProgress = (url, options, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            ok: true,
            status: xhr.status,
            statusText: xhr.statusText,
            json: () => Promise.resolve(JSON.parse(xhr.responseText))
          });
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });
      
      // Configurar abort signal
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          xhr.abort();
        });
      }
      
      xhr.open(options.method || 'GET', url);
      xhr.send(options.body);
    });
  };

  // ====================================
  // UPLOAD MÚLTIPLO
  // ====================================
  const uploadMultiple = useCallback(async (files, options = {}) => {
    if (files.length > finalConfig.maxFiles) {
      throw new Error(`Máximo de ${finalConfig.maxFiles} arquivos por vez`);
    }
    
    setIsUploading(true);
    const results = [];
    
    try {
      // Upload sequencial para evitar sobrecarga
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadFile(file, options);
        results.push(result);
        
        // Atualizar progresso total
        const progress = Math.round(((i + 1) / files.length) * 100);
        setTotalProgress(progress);
      }
      
      return results;
    } finally {
      setIsUploading(false);
      setTotalProgress(0);
    }
  }, [finalConfig.maxFiles, uploadFile]);

  // ====================================
  // CANCELAR UPLOAD
  // ====================================
  const cancelUpload = useCallback((uploadId) => {
    const controller = abortControllersRef.current.get(uploadId);
    if (controller) {
      controller.abort();
    }
  }, []);

  // ====================================
  // REMOVER UPLOAD DA LISTA
  // ====================================
  const removeUpload = useCallback((uploadId) => {
    setUploads(prev => prev.filter(u => u.id !== uploadId));
    setErrors(prev => prev.filter(e => e.id !== uploadId));
  }, []);

  // ====================================
  // LIMPAR TODOS
  // ====================================
  const clearAll = useCallback(() => {
    // Cancelar uploads ativos
    uploads.forEach(upload => {
      if (upload.status === 'uploading') {
        cancelUpload(upload.id);
      }
    });
    
    setUploads([]);
    setErrors([]);
    setCompletedFiles([]);
    setTotalProgress(0);
  }, [uploads, cancelUpload]);

  // ====================================
  // DRAG & DROP
  // ====================================
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadMultiple(files);
    }
  }, [uploadMultiple]);

  // ====================================
  // SELEÇÃO DE ARQUIVOS
  // ====================================
  const selectFiles = useCallback((multiple = true) => {
    if (fileInputRef.current) {
      fileInputRef.current.multiple = multiple;
      fileInputRef.current.accept = finalConfig.allowedTypes.join(',');
      fileInputRef.current.click();
    }
  }, [finalConfig.allowedTypes]);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (files.length === 1) {
        uploadFile(files[0]);
      } else {
        uploadMultiple(files);
      }
    }
    // Limpar input para permitir mesmo arquivo novamente
    e.target.value = '';
  }, [uploadFile, uploadMultiple]);

  // ====================================
  // FUNÇÕES AUXILIARES
  // ====================================
  const getFileCategory = (file) => {
    for (const [category, types] of Object.entries(FILE_CATEGORIES)) {
      if (types.includes(file.type)) {
        return category;
      }
    }
    return 'other';
  };

  const isImageFile = (file) => {
    return FILE_CATEGORIES.image.includes(file.type);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateSpeed = (startTime, totalSize, progress) => {
    const elapsed = (Date.now() - startTime) / 1000; // segundos
    const transferred = (totalSize * progress) / 100;
    return transferred / elapsed; // bytes per second
  };

  const calculateTimeRemaining = (startTime, totalSize, progress) => {
    if (progress === 0) return Infinity;
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = (elapsed * (100 - progress)) / progress;
    return Math.round(remaining);
  };

  // ====================================
  // ESTATÍSTICAS
  // ====================================
  const getStats = useCallback(() => {
    const activeUploads = uploads.filter(u => u.status === 'uploading').length;
    const completedUploads = uploads.filter(u => u.status === 'completed').length;
    const failedUploads = uploads.filter(u => u.status === 'error').length;
    const totalSize = uploads.reduce((sum, u) => sum + u.size, 0);
    const uploadedSize = uploads
      .filter(u => u.status === 'completed')
      .reduce((sum, u) => sum + u.size, 0);
    
    return {
      total: uploads.length,
      active: activeUploads,
      completed: completedUploads,
      failed: failedUploads,
      totalSize: formatFileSize(totalSize),
      uploadedSize: formatFileSize(uploadedSize),
      averageProgress: uploads.length > 0 
        ? Math.round(uploads.reduce((sum, u) => sum + u.progress, 0) / uploads.length)
        : 0
    };
  }, [uploads]);

  // ====================================
  // RETORNO DO HOOK
  // ====================================
  return {
    // Estados principais
    uploads,
    queue,
    errors,
    isUploading,
    totalProgress,
    completedFiles,
    
    // Ações de upload
    uploadFile,
    uploadMultiple,
    cancelUpload,
    removeUpload,
    clearAll,
    
    // Seleção de arquivos
    selectFiles,
    handleFileSelect,
    fileInputRef,
    
    // Drag & Drop
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    
    // Utilitários
    validateFile,
    getFileCategory,
    formatFileSize,
    getStats,
    
    // Configuração
    config: finalConfig
  };
};