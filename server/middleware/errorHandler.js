// ====================================
// 🚨 MIDDLEWARE DE TRATAMENTO DE ERROS - v16.0
// 🎯 Capturar, logar e formatar erros de forma centralizada
// ====================================

const fs = require('fs').promises;
const path = require('path');

// ====================================
// CONFIGURAÇÕES DE LOG
// ====================================
const LOG_CONFIG = {
  logDirectory: './logs',
  maxLogSize: 10 * 1024 * 1024, // 10MB
  maxLogFiles: 5,
  logLevels: ['error', 'warn', 'info', 'debug'],
  enableConsole: process.env.NODE_ENV === 'development',
  enableFile: true,
  dateFormat: 'DD/MM/YYYY HH:mm:ss'
};

// ====================================
// TIPOS DE ERRO CUSTOMIZADOS
// ====================================
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Não autorizado') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Acesso negado') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} não encontrado`, 404, 'NOT_FOUND');
  }
}

class WhatsAppError extends AppError {
  constructor(message, originalError = null) {
    super(`WhatsApp: ${message}`, 500, 'WHATSAPP_ERROR');
    this.originalError = originalError;
  }
}

class FileUploadError extends AppError {
  constructor(message) {
    super(`Upload: ${message}`, 400, 'FILE_UPLOAD_ERROR');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Muitas requisições') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

// ====================================
// SISTEMA DE LOGGING
// ====================================
class Logger {
  constructor() {
    this.ensureLogDirectory();
  }

  async ensureLogDirectory() {
    try {
      await fs.mkdir(LOG_CONFIG.logDirectory, { recursive: true });
    } catch (error) {
      console.error('❌ Erro ao criar diretório de logs:', error.message);
    }
  }

  formatTimestamp() {
    const now = new Date();
    return now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
  }

  async log(level, message, data = null) {
    const timestamp = this.formatTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      pid: process.pid,
      memory: process.memoryUsage()
    };

    // Console log (desenvolvimento)
    if (LOG_CONFIG.enableConsole) {
      const colors = {
        error: '\x1b[31m', // Vermelho
        warn: '\x1b[33m',  // Amarelo
        info: '\x1b[36m',  // Ciano
        debug: '\x1b[90m'  // Cinza
      };
      
      const resetColor = '\x1b[0m';
      const color = colors[level] || '';
      
      console.log(`${color}[${timestamp}] ${level.toUpperCase()}: ${message}${resetColor}`);
      if (data) {
        console.log(`${color}${JSON.stringify(data, null, 2)}${resetColor}`);
      }
    }

    // File log
    if (LOG_CONFIG.enableFile) {
      try {
        const logFile = path.join(LOG_CONFIG.logDirectory, `${level}.log`);
        const logLine = JSON.stringify(logEntry) + '\n';
        
        await fs.appendFile(logFile, logLine);
        await this.rotateLogIfNeeded(logFile);
      } catch (error) {
        console.error('❌ Erro ao escrever log:', error.message);
      }
    }
  }

  async rotateLogIfNeeded(logFile) {
    try {
      const stats = await fs.stat(logFile);
      
      if (stats.size > LOG_CONFIG.maxLogSize) {
        const ext = path.extname(logFile);
        const base = path.basename(logFile, ext);
        const dir = path.dirname(logFile);
        
        // Rotacionar arquivos existentes
        for (let i = LOG_CONFIG.maxLogFiles - 1; i > 0; i--) {
          const oldFile = path.join(dir, `${base}.${i}${ext}`);
          const newFile = path.join(dir, `${base}.${i + 1}${ext}`);
          
          try {
            await fs.rename(oldFile, newFile);
          } catch (error) {
            // Arquivo não existe, continuar
          }
        }
        
        // Mover arquivo atual para .1
        const rotatedFile = path.join(dir, `${base}.1${ext}`);
        await fs.rename(logFile, rotatedFile);
      }
    } catch (error) {
      console.error('❌ Erro na rotação de logs:', error.message);
    }
  }

  error(message, data = null) {
    return this.log('error', message, data);
  }

  warn(message, data = null) {
    return this.log('warn', message, data);
  }

  info(message, data = null) {
    return this.log('info', message, data);
  }

  debug(message, data = null) {
    return this.log('debug', message, data);
  }
}

const logger = new Logger();

// ====================================
// FORMATADORES DE ERRO
// ====================================
function formatError(error, req = null) {
  const errorInfo = {
    message: error.message,
    code: error.code || 'UNKNOWN_ERROR',
    statusCode: error.statusCode || 500,
    timestamp: error.timestamp || new Date().toISOString(),
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };

  // Informações da requisição
  if (req) {
    errorInfo.request = {
      method: req.method,
      url: req.originalUrl || req.url,
      headers: sanitizeHeaders(req.headers),
      body: sanitizeBody(req.body),
      query: req.query,
      params: req.params,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    // Informações do usuário (se autenticado)
    if (req.user) {
      errorInfo.user = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      };
    }
  }

  // Informações específicas por tipo de erro
  if (error.field) errorInfo.field = error.field;
  if (error.originalError) errorInfo.originalError = error.originalError.message;

  return errorInfo;
}

function sanitizeHeaders(headers) {
  const sanitized = { ...headers };
  
  // Remover headers sensíveis
  delete sanitized.authorization;
  delete sanitized.cookie;
  delete sanitized['x-api-key'];
  
  return sanitized;
}

function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  
  // Remover campos sensíveis
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.apiKey;
  delete sanitized.secret;
  
  return sanitized;
}

// ====================================
// MIDDLEWARE DE CAPTURA DE ERROS
// ====================================
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ====================================
// MIDDLEWARE PRINCIPAL DE TRATAMENTO
// ====================================
const errorHandler = (error, req, res, next) => {
  let err = { ...error };
  err.message = error.message;

  // Log do erro
  const errorInfo = formatError(err, req);
  logger.error('Erro capturado:', errorInfo);

  // Tratamento específico por tipo de erro
  
  // Erro de validação do Mongoose
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(val => val.message).join(', ');
    err = new ValidationError(message);
  }

  // Erro de cast do Mongoose (ID inválido)
  if (error.name === 'CastError') {
    const message = 'Recurso não encontrado';
    err = new NotFoundError(message);
  }

  // Erro de chave duplicada
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const message = `${field} já existe`;
    err = new ValidationError(message, field);
  }

  // Erro de JSON malformado
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    err = new ValidationError('JSON inválido na requisição');
  }

  // Erro de token JWT
  if (error.name === 'JsonWebTokenError') {
    err = new AuthenticationError('Token inválido');
  }

  if (error.name === 'TokenExpiredError') {
    err = new AuthenticationError('Token expirado');
  }

  // Erro do Multer (upload)
  if (error.code === 'LIMIT_FILE_SIZE') {
    err = new FileUploadError('Arquivo muito grande');
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    err = new FileUploadError('Campo de arquivo inesperado');
  }

  // Erro do WhatsApp Web
  if (error.message && error.message.includes('WhatsApp')) {
    err = new WhatsAppError(error.message, error);
  }

  // Preparar resposta
  const response = {
    success: false,
    error: err.message || 'Erro interno do servidor',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  };

  // Informações adicionais em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = errorInfo;
  }

  // Status code
  const statusCode = err.statusCode || 500;

  // Enviar resposta
  res.status(statusCode).json(response);

  // Notificar sistema de monitoramento em produção
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    // Aqui você pode integrar com Sentry, New Relic, etc.
    console.error('🚨 ERRO CRÍTICO EM PRODUÇÃO:', errorInfo);
  }
};

// ====================================
// MIDDLEWARE PARA 404
// ====================================
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Rota ${req.method} ${req.originalUrl}`);
  next(error);
};

// ====================================
// MIDDLEWARE PARA CAPTURA DE PROMESSAS REJEITADAS
// ====================================
const unhandledPromiseHandler = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection:', {
      reason: reason.message || reason,
      stack: reason.stack,
      promise
    });
    
    // Em produção, pode ser necessário fechar o servidor graciosamente
    if (process.env.NODE_ENV === 'production') {
      console.log('🚨 Fechando servidor devido a promise rejeitada...');
      process.exit(1);
    }
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', {
      message: error.message,
      stack: error.stack
    });
    
    console.log('🚨 Fechando servidor devido a exceção não capturada...');
    process.exit(1);
  });
};

// ====================================
// MIDDLEWARE PARA HEALTH CHECK
// ====================================
const healthCheck = (req, res) => {
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development'
  };

  res.json({
    success: true,
    data: healthInfo
  });
};

// ====================================
// EXPORTAÇÕES
// ====================================
module.exports = {
  // Classes de erro
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  WhatsAppError,
  FileUploadError,
  RateLimitError,

  // Middlewares
  errorHandler,
  notFoundHandler,
  asyncHandler,
  healthCheck,

  // Utilitários
  logger,
  formatError,
  unhandledPromiseHandler,

  // Inicialização
  init: () => {
    unhandledPromiseHandler();
    logger.info('Sistema de tratamento de erros inicializado');
  }
};
module.exports.default = module.exports.errorHandler;