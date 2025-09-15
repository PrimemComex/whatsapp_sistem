// ====================================
// 🚦 MIDDLEWARE DE RATE LIMITING - v16.0
// 🎯 Controle de tráfego e proteção contra abuso
// ====================================

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// ====================================
// CONFIGURAÇÕES GERAIS
// ====================================
const RATE_LIMIT_CONFIG = {
  // Configurações de janela
  defaultWindow: 15 * 60 * 1000, // 15 minutos
  
  // Headers customizados
  headers: {
    limit: 'X-RateLimit-Limit',
    remaining: 'X-RateLimit-Remaining',
    reset: 'X-RateLimit-Reset',
    retryAfter: 'Retry-After'
  },
  
  // Configurações por endpoint
  endpoints: {
    // Autenticação
    login: {
      window: 15 * 60 * 1000, // 15 minutos
      max: 5, // 5 tentativas por IP
      skipSuccessfulRequests: true,
      skipFailedRequests: false
    },
    
    // API geral
    api: {
      window: 15 * 60 * 1000, // 15 minutos
      max: 1000, // 1000 requests por IP
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    },
    
    // WhatsApp WebHooks
    webhook: {
      window: 1 * 60 * 1000, // 1 minuto
      max: 100, // 100 webhooks por minuto
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    },
    
    // Upload de arquivos
    upload: {
      window: 60 * 60 * 1000, // 1 hora
      max: 50, // 50 uploads por hora
      skipSuccessfulRequests: false,
      skipFailedRequests: true
    },
    
    // Envio de mensagens
    sendMessage: {
      window: 1 * 60 * 1000, // 1 minuto
      max: 30, // 30 mensagens por minuto
      skipSuccessfulRequests: false,
      skipFailedRequests: true
    },
    
    // Busca/pesquisa
    search: {
      window: 1 * 60 * 1000, // 1 minuto
      max: 60, // 60 buscas por minuto
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    }
  },
  
  // Configurações por perfil de usuário
  userLimits: {
    admin: {
      multiplier: 10, // 10x mais requests
      bypass: ['login', 'webhook'] // Bypass em certos endpoints
    },
    manager: {
      multiplier: 5, // 5x mais requests
      bypass: ['webhook']
    },
    agent: {
      multiplier: 2, // 2x mais requests
      bypass: []
    },
    viewer: {
      multiplier: 0.5, // Metade dos requests
      bypass: []
    }
  }
};

// ====================================
// FUNÇÕES AUXILIARES
// ====================================

// Criar chave única por usuário
function createKeyGenerator(prefix = '') {
  return (req) => {
    const baseKey = req.ip || 'unknown';
    const userKey = req.user?.id ? `user_${req.user.id}` : baseKey;
    return `${prefix}${userKey}`;
  };
}

// Aplicar multiplicador baseado no perfil do usuário
function applyUserMultiplier(baseLimit, userRole) {
  const userConfig = RATE_LIMIT_CONFIG.userLimits[userRole];
  if (!userConfig) return baseLimit;
  
  return Math.floor(baseLimit * userConfig.multiplier);
}

// Verificar se usuário pode bypass
function canBypassLimit(endpoint, userRole) {
  const userConfig = RATE_LIMIT_CONFIG.userLimits[userRole];
  return userConfig?.bypass?.includes(endpoint) || false;
}

// Handler customizado para quando o limite é atingido
function createLimitHandler(endpointName) {
  return (req, res) => {
    const resetTime = new Date(Date.now() + req.rateLimit.resetTime);
    
    console.log(`🚦 Rate limit atingido: ${endpointName} - IP: ${req.ip} - User: ${req.user?.email || 'anonymous'}`);
    
    res.status(429).json({
      success: false,
      error: 'Muitas requisições',
      code: 'RATE_LIMIT_EXCEEDED',
      details: {
        endpoint: endpointName,
        limit: req.rateLimit.limit,
        remaining: req.rateLimit.remaining,
        resetTime: resetTime.toISOString(),
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
      },
      message: `Você atingiu o limite de ${req.rateLimit.limit} requisições. Tente novamente em ${Math.ceil(req.rateLimit.resetTime / 1000)} segundos.`
    });
  };
}

// Skip function customizada
function createSkipFunction(endpointName) {
  return (req) => {
    // Verificar se o usuário pode fazer bypass
    if (req.user?.role && canBypassLimit(endpointName, req.user.role)) {
      console.log(`⚡ Rate limit bypass: ${req.user.email} (${req.user.role}) em ${endpointName}`);
      return true;
    }
    
    // Verificar whitelist de IPs (desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      const devIPs = ['127.0.0.1', '::1', 'localhost'];
      if (devIPs.includes(req.ip)) {
        return true;
      }
    }
    
    return false;
  };
}

// ====================================
// CONFIGURADORES DE RATE LIMIT
// ====================================

// Rate limiter dinâmico baseado no usuário
function createDynamicRateLimit(endpointName, config) {
  const baseConfig = {
    windowMs: config.window,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: createKeyGenerator(`${endpointName}:`),
    handler: createLimitHandler(endpointName),
    skip: createSkipFunction(endpointName),
    skipSuccessfulRequests: config.skipSuccessfulRequests,
    skipFailedRequests: config.skipFailedRequests,
    
    // Função dinâmica para calcular limite
    max: (req) => {
      const baseLimit = config.max;
      
      // Aplicar multiplicador baseado no perfil
      if (req.user?.role) {
        const dynamicLimit = applyUserMultiplier(baseLimit, req.user.role);
        console.log(`🎯 Limite dinâmico para ${req.user.email}: ${dynamicLimit} (base: ${baseLimit})`);
        return dynamicLimit;
      }
      
      return baseLimit;
    },
    
    // Mensagem customizada
    message: {
      success: false,
      error: `Rate limit excedido para ${endpointName}`,
      code: 'RATE_LIMIT_EXCEEDED'
    }
  };

  return rateLimit(baseConfig);
}

// ====================================
// RATE LIMITERS ESPECÍFICOS
// ====================================

// Login (mais restritivo)
const loginRateLimit = createDynamicRateLimit('login', RATE_LIMIT_CONFIG.endpoints.login);

// API geral
const apiRateLimit = createDynamicRateLimit('api', RATE_LIMIT_CONFIG.endpoints.api);

// Webhooks
const webhookRateLimit = createDynamicRateLimit('webhook', RATE_LIMIT_CONFIG.endpoints.webhook);

// Upload de arquivos
const uploadRateLimit = createDynamicRateLimit('upload', RATE_LIMIT_CONFIG.endpoints.upload);

// Envio de mensagens
const messageRateLimit = createDynamicRateLimit('sendMessage', RATE_LIMIT_CONFIG.endpoints.sendMessage);

// Busca/pesquisa
const searchRateLimit = createDynamicRateLimit('search', RATE_LIMIT_CONFIG.endpoints.search);

// ====================================
// SLOW DOWN MIDDLEWARE
// ====================================

// Slow down para requisições sucessivas (adiciona delay)
const slowDownMiddleware = slowDown({
  windowMs: 1 * 60 * 1000, // 1 minuto
  delayAfter: 50, // Permitir 50 requests normais
  delayMs: 100, // Adicionar 100ms de delay após o limite
  maxDelayMs: 2000, // Máximo 2 segundos de delay
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
  keyGenerator: createKeyGenerator('slowdown:'),
  
  onLimitReached: (req, res, options) => {
    console.log(`🐌 Slow down ativado para IP: ${req.ip} - User: ${req.user?.email || 'anonymous'}`);
  }
});

// ====================================
// MIDDLEWARE PERSONALIZADO POR ROTA
// ====================================

// Rate limit inteligente que escolhe a configuração baseada na rota
const smartRateLimit = (req, res, next) => {
  const path = req.path.toLowerCase();
  const method = req.method;

  // Determinar qual rate limit aplicar
  if (path.includes('/login') || path.includes('/auth')) {
    return loginRateLimit(req, res, next);
  }
  
  if (path.includes('/webhook')) {
    return webhookRateLimit(req, res, next);
  }
  
  if (path.includes('/upload') || method === 'POST' && path.includes('/files')) {
    return uploadRateLimit(req, res, next);
  }
  
  if (path.includes('/send') && method === 'POST') {
    return messageRateLimit(req, res, next);
  }
  
  if (path.includes('/search') || path.includes('/find')) {
    return searchRateLimit(req, res, next);
  }
  
  // Rate limit geral para outras rotas
  return apiRateLimit(req, res, next);
};

// ====================================
// MIDDLEWARE DE MONITORAMENTO
// ====================================
const rateLimitMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Interceptar resposta para logging
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - startTime;
    
    // Log detalhado em desenvolvimento
    if (process.env.NODE_ENV === 'development' && req.rateLimit) {
      console.log(`📊 Rate Limit Info:`, {
        ip: req.ip,
        user: req.user?.email || 'anonymous',
        path: req.path,
        method: req.method,
        limit: req.rateLimit.limit,
        remaining: req.rateLimit.remaining,
        resetTime: req.rateLimit.resetTime,
        duration: `${duration}ms`,
        status: res.statusCode
      });
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

// ====================================
// MIDDLEWARE GLOBAL BÁSICO
// ====================================
const basicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por janela
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente mais tarde.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  skip: (req) => {
    // Skip para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }
});

// ====================================
// EXPORTAÇÕES
// ====================================
module.exports = {
  // Rate limiters específicos
  loginRateLimit,
  apiRateLimit,
  webhookRateLimit,
  uploadRateLimit,
  messageRateLimit,
  searchRateLimit,
  basicRateLimit,
  
  // Middlewares inteligentes
  smartRateLimit,
  slowDownMiddleware,
  rateLimitMonitor,
  
  // Utilitários
  createDynamicRateLimit,
  createKeyGenerator,
  applyUserMultiplier,
  canBypassLimit,
  
  // Configurações
  RATE_LIMIT_CONFIG,
  
  // Inicialização
  init: () => {
    console.log('✅ Sistema de rate limiting inicializado');
  }
};
module.exports.default = module.exports.basicRateLimit;