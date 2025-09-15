// ====================================
// 📎 MIDDLEWARE DE UPLOAD DE ARQUIVOS - v16.0
// 🎯 Configuração completa para upload seguro e otimizado
// ====================================

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// ====================================
// CONFIGURAÇÕES DE UPLOAD
// ====================================
const UPLOAD_CONFIG = {
  // Diretórios
  baseUploadDir: './uploads',
  tempDir: './temp',
  thumbnailDir: './uploads/thumbnails',
  
  // Limites gerais
  maxFileSize: 16 * 1024 * 1024, // 16MB
  maxFiles: 10, // Máximo de arquivos por upload
  
  // Limites por tipo de arquivo
  limits: {
    image: {
      maxSize: 10 * 1024 * 1024, // 10MB
      maxWidth: 4096,
      maxHeight: 4096,
      allowedFormats: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'bmp']
    },
    video: {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxDuration: 300, // 5 minutos em segundos
      allowedFormats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
    },
    audio: {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxDuration: 600, // 10 minutos
      allowedFormats: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'opus']
    },
    document: {
      maxSize: 25 * 1024 * 1024, // 25MB
      allowedFormats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf']
    }
  },
  
  // Configurações de segurança
  security: {
    scanForVirus: false, // Implementar se necessário
    validateMimeType: true,
    sanitizeFilename: true,
    preventExecutable: true
  },
  
  // Otimizações
  optimization: {
    compressImages: true,
    generateThumbnails: true,
    convertToWebP: false, // Para economizar espaço
    resizeImages: true
  }
};

// ====================================
// TIPOS MIME PERMITIDOS
// ====================================
const ALLOWED_MIME_TYPES = {
  // Imagens
  'image/jpeg': { category: 'image', extension: 'jpg' },
  'image/jpg': { category: 'image', extension: 'jpg' },
  'image/png': { category: 'image', extension: 'png' },
  'image/gif': { category: 'image', extension: 'gif' },
  'image/webp': { category: 'image', extension: 'webp' },
  'image/bmp': { category: 'image', extension: 'bmp' },
  
  // Vídeos
  'video/mp4': { category: 'video', extension: 'mp4' },
  'video/avi': { category: 'video', extension: 'avi' },
  'video/quicktime': { category: 'video', extension: 'mov' },
  'video/x-msvideo': { category: 'video', extension: 'avi' },
  'video/webm': { category: 'video', extension: 'webm' },
  
  // Áudios
  'audio/mpeg': { category: 'audio', extension: 'mp3' },
  'audio/wav': { category: 'audio', extension: 'wav' },
  'audio/ogg': { category: 'audio', extension: 'ogg' },
  'audio/aac': { category: 'audio', extension: 'aac' },
  'audio/mp4': { category: 'audio', extension: 'm4a' },
  'audio/opus': { category: 'audio', extension: 'opus' },
  
  // Documentos
  'application/pdf': { category: 'document', extension: 'pdf' },
  'application/msword': { category: 'document', extension: 'doc' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { category: 'document', extension: 'docx' },
  'application/vnd.ms-excel': { category: 'document', extension: 'xls' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { category: 'document', extension: 'xlsx' },
  'application/vnd.ms-powerpoint': { category: 'document', extension: 'ppt' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { category: 'document', extension: 'pptx' },
  'text/plain': { category: 'document', extension: 'txt' },
  'application/rtf': { category: 'document', extension: 'rtf' }
};

// ====================================
// FUNÇÕES AUXILIARES
// ====================================

// Criar diretórios necessários
async function ensureDirectories() {
  const dirs = [
    UPLOAD_CONFIG.baseUploadDir,
    UPLOAD_CONFIG.tempDir,
    UPLOAD_CONFIG.thumbnailDir,
    path.join(UPLOAD_CONFIG.baseUploadDir, 'images'),
    path.join(UPLOAD_CONFIG.baseUploadDir, 'videos'),
    path.join(UPLOAD_CONFIG.baseUploadDir, 'audios'),
    path.join(UPLOAD_CONFIG.baseUploadDir, 'documents')
  ];

  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error(`❌ Erro ao criar diretório ${dir}:`, error.message);
    }
  }
}

// Gerar nome único para arquivo
function generateUniqueFilename(originalName, mimeType) {
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(8).toString('hex');
  const fileInfo = ALLOWED_MIME_TYPES[mimeType];
  const extension = fileInfo ? fileInfo.extension : path.extname(originalName).slice(1);
  
  return `${timestamp}-${randomHash}.${extension}`;
}

// Sanitizar nome do arquivo
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Substituir caracteres especiais
    .replace(/_{2,}/g, '_') // Múltiplos underscores viram um
    .replace(/^_+|_+$/g, '') // Remover underscores do início/fim
    .substring(0, 100); // Limitar tamanho
}

// Validar tipo de arquivo
function validateFileType(mimeType, filename) {
  // Verificar MIME type
  if (!ALLOWED_MIME_TYPES[mimeType]) {
    throw new Error(`Tipo de arquivo não permitido: ${mimeType}`);
  }

  // Verificar extensão
  const extension = path.extname(filename).slice(1).toLowerCase();
  const expectedExtension = ALLOWED_MIME_TYPES[mimeType].extension;
  
  if (extension !== expectedExtension) {
    console.warn(`⚠️ Extensão não confere: ${extension} vs ${expectedExtension}`);
  }

  return ALLOWED_MIME_TYPES[mimeType];
}

// Validar arquivo executável
function isExecutableFile(filename, mimeType) {
  const dangerousExtensions = [
    'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
    'ps1', 'sh', 'php', 'asp', 'aspx', 'jsp'
  ];
  
  const extension = path.extname(filename).slice(1).toLowerCase();
  return dangerousExtensions.includes(extension) || 
         mimeType.includes('application/x-executable') ||
         mimeType.includes('application/x-msdownload');
}

// ====================================
// CONFIGURAÇÃO DO MULTER
// ====================================

// Storage customizado
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await ensureDirectories();
      
      const fileInfo = validateFileType(file.mimetype, file.originalname);
      const categoryDir = path.join(UPLOAD_CONFIG.baseUploadDir, fileInfo.category + 's');
      
      cb(null, categoryDir);
    } catch (error) {
      cb(error);
    }
  },
  
  filename: (req, file, cb) => {
    try {
      // Validações de segurança
      if (UPLOAD_CONFIG.security.preventExecutable && isExecutableFile(file.originalname, file.mimetype)) {
        return cb(new Error('Arquivos executáveis não são permitidos'));
      }
      
      const sanitizedName = UPLOAD_CONFIG.security.sanitizeFilename 
        ? sanitizeFilename(file.originalname)
        : file.originalname;
        
      const uniqueName = generateUniqueFilename(sanitizedName, file.mimetype);
      
      // Armazenar informações do arquivo no request
      if (!req.fileInfo) req.fileInfo = [];
      req.fileInfo.push({
        originalName: file.originalname,
        sanitizedName: sanitizedName,
        uniqueName: uniqueName,
        mimetype: file.mimetype,
        category: ALLOWED_MIME_TYPES[file.mimetype].category
      });
      
      cb(null, uniqueName);
    } catch (error) {
      cb(error);
    }
  }
});

// Filtro de arquivo
const fileFilter = (req, file, cb) => {
  try {
    // Verificar tipo MIME
    if (!ALLOWED_MIME_TYPES[file.mimetype]) {
      return cb(new Error(`Tipo de arquivo não suportado: ${file.mimetype}`), false);
    }
    
    // Verificar limite de arquivos por usuário
    const userRole = req.user?.role;
    if (userRole === 'viewer') {
      return cb(new Error('Usuários visualizadores não podem fazer upload'), false);
    }
    
    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

// ====================================
// CONFIGURAÇÕES DE UPLOAD POR CONTEXTO
// ====================================

// Upload geral (WhatsApp)
const whatsappUpload = multer({
  storage: storage,
  limits: {
    fileSize: UPLOAD_CONFIG.maxFileSize,
    files: UPLOAD_CONFIG.maxFiles
  },
  fileFilter: fileFilter
});

// Upload de avatar/logo
const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: path.join(UPLOAD_CONFIG.baseUploadDir, 'avatars'),
    filename: (req, file, cb) => {
      const uniqueName = `avatar_${req.user?.id || 'temp'}_${Date.now()}.jpg`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB para avatars
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas para avatar'), false);
    }
  }
});

// ====================================
// MIDDLEWARE DE PÓS-PROCESSAMENTO
// ====================================
const processUploadedFiles = async (req, res, next) => {
  try {
    if (!req.files && !req.file) {
      return next();
    }
    
    const files = req.files || [req.file];
    const processedFiles = [];
    
    for (const file of files) {
      const fileInfo = req.fileInfo?.find(info => info.uniqueName === file.filename) || {};
      const category = fileInfo.category || 'document';
      
      let processedFile = {
        ...file,
        originalName: fileInfo.originalName || file.originalname,
        category: category,
        url: `/uploads/${category}s/${file.filename}`,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: req.user?.id
      };
      
      processedFiles.push(processedFile);
    }
    
    // Adicionar arquivos processados ao request
    req.processedFiles = processedFiles;
    
    console.log(`✅ ${processedFiles.length} arquivo(s) processado(s) com sucesso`);
    next();
    
  } catch (error) {
    console.error('❌ Erro no pós-processamento:', error.message);
    next(error);
  }
};

// ====================================
// MIDDLEWARE DE LIMPEZA
// ====================================
const cleanupTempFiles = async (req, res, next) => {
  try {
    // Executar após resposta
    res.on('finish', async () => {
      if (req.files || req.file) {
        const files = req.files || [req.file];
        
        // Remover arquivos temporários se houve erro
        if (res.statusCode >= 400) {
          for (const file of files) {
            try {
              await fs.unlink(file.path);
              console.log(`🗑️ Arquivo temporário removido: ${file.filename}`);
            } catch (error) {
              console.warn(`⚠️ Erro ao remover arquivo temporário: ${error.message}`);
            }
          }
        }
      }
    });
    
    next();
  } catch (error) {
    next(error);
  }
};

// ====================================
// EXPORTAÇÕES
// ====================================
module.exports = {
  // Configurações de upload
  whatsappUpload: [
    whatsappUpload.array('files', UPLOAD_CONFIG.maxFiles),
    processUploadedFiles,
    cleanupTempFiles
  ],
  
  singleFileUpload: [
    whatsappUpload.single('file'),
    processUploadedFiles,
    cleanupTempFiles
  ],
  
  avatarUpload: [
    avatarUpload.single('avatar'),
    processUploadedFiles
  ],
  
  // Middlewares individuais
  processUploadedFiles,
  cleanupTempFiles,
  
  // Utilitários
  ensureDirectories,
  validateFileType,
  
  // Configurações
  UPLOAD_CONFIG,
  ALLOWED_MIME_TYPES,
  
  // Inicialização
  init: async () => {
    await ensureDirectories();
    console.log('✅ Sistema de upload inicializado');
  }
};
module.exports.default = module.exports.singleFileUpload;