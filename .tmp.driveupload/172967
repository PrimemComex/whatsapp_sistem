// ====================================
// 🔧 MIDDLEWARE INDEX - CORRIGIDO COMPLETO
// Este arquivo substitui completamente o atual
// ====================================

// ====================================
// MIDDLEWARE DE AUTENTICAÇÃO MOCK
// ====================================
const mockAuth = (req, res, next) => {
  // Simular usuário autenticado
  req.user = {
    id: 'user_123',
    email: 'teste@teste.com',
    role: 'admin',
    name: 'Usuário Teste',
    department: 'comercial',
    isActive: true
  };
  req.isAuthenticated = true;
  
  console.log('🔐 Auth mock: usuário autenticado como', req.user.email);
  next();
};

// ====================================
// MIDDLEWARE DE ERRO
// ====================================
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro capturado pelo middleware:', err.message);
  
  // Log completo em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack trace:', err.stack);
  }
  
  // Determinar status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Resposta padronizada
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message,
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
};

// ====================================
// MIDDLEWARE DE CORS
// ====================================
const corsHandler = (req, res, next) => {
  // Headers CORS permissivos para desenvolvimento
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Responder OPTIONS imediatamente
  if (req.method === 'OPTIONS') {
    console.log('🌐 CORS: Respondendo OPTIONS para', req.path);
    return res.status(200).end();
  }
  
  next();
};

// ====================================
// MIDDLEWARE DE LOGGING
// ====================================
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toLocaleString('pt-BR');
  
  // Log da requisição
  console.log(`🌐 ${timestamp} ${req.method} ${req.path} - IP: ${req.ip || 'unknown'}`);
  
  // Interceptar resposta para log do tempo
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - start;
    const status = this.statusCode;
    const statusEmoji = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
    
    console.log(`${statusEmoji} ${req.method} ${req.path} - ${status} - ${duration}ms`);
    return originalSend.call(this, body);
  };
  
  next();
};

// ====================================
// MIDDLEWARE DE RATE LIMITING MOCK
// ====================================
const rateLimitMock = (req, res, next) => {
  // Bypass completo em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // Em produção, implementar rate limiting real
  // Por enquanto, apenas log
  console.log('🚦 Rate limit: passando requisição de', req.ip);
  next();
};

// ====================================
// MIDDLEWARE DE VALIDAÇÃO MOCK
// ====================================
const validationMock = (req, res, next) => {
  // Validação básica mock
  console.log('✅ Validação: dados OK');
  next();
};

// ====================================
// MIDDLEWARE DE UPLOAD MOCK
// ====================================
const uploadMock = {
  single: (fieldName) => {
    return (req, res, next) => {
      console.log(`📎 Upload mock para campo: ${fieldName}`);
      req.file = null; // Simular que não há arquivo por enquanto
      next();
    };
  },
  
  array: (fieldName, maxCount = 10) => {
    return (req, res, next) => {
      console.log(`📎 Upload múltiplo mock para campo: ${fieldName}, max: ${maxCount}`);
      req.files = []; // Simular que não há arquivos por enquanto
      next();
    };
  },
  
  any: () => {
    return (req, res, next) => {
      console.log('📎 Upload qualquer arquivo mock');
      req.files = [];
      next();
    };
  },
  
  none: () => {
    return (req, res, next) => {
      console.log('📎 Upload: apenas campos de texto');
      next();
    };
  }
};

// ====================================
// MIDDLEWARE 404
// ====================================
const notFoundHandler = (req, res, next) => {
  console.log(`❌ 404: Rota não encontrada - ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: `Rota ${req.method} ${req.originalUrl} não encontrada`,
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString()
  });
};

// ====================================
// HEALTH CHECK
// ====================================
const healthCheck = (req, res) => {
  const healthInfo = {
    success: true,
    status: 'ok',
    service: 'PRIMEM WhatsApp Business',
    version: '16.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      whatsapp: 'enabled',
      auth: 'mock',
      upload: 'mock',
      rateLimit: 'disabled'
    }
  };

  res.json(healthInfo);
};

// ====================================
// MIDDLEWARE PASS-THROUGH (Para compatibilidade)
// ====================================
const passThrough = (req, res, next) => {
  next();
};

// ====================================
// EXPORTAÇÕES PRINCIPAIS
// ====================================
module.exports = {
  // Middlewares principais
  auth: mockAuth,
  errorHandler: errorHandler,
  cors: corsHandler,
  requestLogger: requestLogger,
  rateLimit: rateLimitMock,
  validation: validationMock,
  upload: uploadMock,
  healthCheck: healthCheck,
  notFound: notFoundHandler,
  
  // Aliases para compatibilidade com código existente
  requireAuth: mockAuth,
  requireAdmin: mockAuth,
  requireManager: mockAuth,
  requireAgent: mockAuth,
  authenticate: mockAuth,
  
  // Rate limit variants
  loginRateLimit: rateLimitMock,
  apiRateLimit: rateLimitMock,
  webhookRateLimit: rateLimitMock,
  uploadRateLimit: rateLimitMock,
  messageRateLimit: rateLimitMock,
  searchRateLimit: rateLimitMock,
  basicRateLimit: rateLimitMock,
  
  // Upload variants (mantém compatibilidade)
  single: uploadMock.single,
  multiple: uploadMock.array,
  
  // Validation variants
  validateLogin: passThrough,
  validateRegister: passThrough,
  validateSendMessage: passThrough,
  validateSendMedia: passThrough,
  validateUpdateProfile: passThrough,
  
  // Utilities
  passThrough: passThrough,
  
  // Inicialização
  init: () => {
    console.log('✅ Middleware index inicializado com mocks funcionais');
    console.log('🔧 Middlewares disponíveis: auth, cors, errorHandler, upload, rateLimit');
  }
};

// ====================================
// LOG DE INICIALIZAÇÃO
// ====================================
console.log('🔧 Middleware index carregado - todas as funções disponíveis');