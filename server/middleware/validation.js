// ====================================
// ✅ MIDDLEWARE DE VALIDAÇÃO - v16.0
// 🎯 Validação robusta de dados de entrada
// ====================================

const Joi = require('joi');
const validator = require('validator');

// ====================================
// CONFIGURAÇÕES DE VALIDAÇÃO
// ====================================
const VALIDATION_CONFIG = {
  // Configurações gerais
  abortEarly: false, // Retornar todos os erros, não apenas o primeiro
  allowUnknown: false, // Não permitir campos desconhecidos
  stripUnknown: true, // Remover campos desconhecidos
  
  // Configurações de sanitização
  sanitization: {
    enabled: true,
    trimStrings: true,
    escapeHtml: false, // Para WhatsApp, não queremos escapar HTML
    removeXSS: true
  },
  
  // Limites personalizados
  limits: {
    maxStringLength: 10000,
    maxArrayLength: 1000,
    maxObjectKeys: 100,
    phoneNumberLength: { min: 10, max: 15 },
    passwordLength: { min: 3, max: 128 }
  },

  // Patterns de validação
  patterns: {
    phoneNumber: /^[\+]?[1-9][\d]{0,15}$/,
    whatsappId: /^[\d]{10,15}@[a-z]\.us$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
  }
};

// ====================================
// EXTENSÕES PERSONALIZADAS DO JOI
// ====================================
const customJoi = Joi.extend({
  type: 'phoneNumber',
  base: Joi.string(),
  messages: {
    'phoneNumber.base': 'Número de telefone deve ser uma string',
    'phoneNumber.invalid': 'Formato de telefone inválido'
  },
  validate(value, helpers) {
    if (!VALIDATION_CONFIG.patterns.phoneNumber.test(value)) {
      return { value, errors: helpers.error('phoneNumber.invalid') };
    }
    return { value };
  }
});

// ====================================
// ESQUEMAS PRINCIPAIS
// ====================================

// Esquema de autenticação
const authSchemas = {
  login: Joi.object({
    email: Joi.string()
      .email()
      .max(255)
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório'
      }),
    password: Joi.string()
      .min(VALIDATION_CONFIG.limits.passwordLength.min)
      .max(VALIDATION_CONFIG.limits.passwordLength.max)
      .required()
      .messages({
        'string.min': `Senha deve ter pelo menos ${VALIDATION_CONFIG.limits.passwordLength.min} caracteres`,
        'any.required': 'Senha é obrigatória'
      }),
    rememberMe: Joi.boolean().default(false)
  }),

  register: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Nome deve conter apenas letras e espaços'
      }),
    email: Joi.string()
      .email()
      .max(255)
      .required(),
    password: Joi.string()
      .min(8)
      .pattern(VALIDATION_CONFIG.patterns.strongPassword)
      .required()
      .messages({
        'string.pattern.base': 'Senha deve conter pelo menos: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial'
      }),
    confirmPassword: Joi.any()
      .equal(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Confirmação de senha deve ser igual à senha'
      }),
    role: Joi.string()
      .valid('admin', 'manager', 'agent', 'viewer')
      .default('agent'),
    department: Joi.string()
      .max(50)
      .default('geral')
  })
};

// Esquema WhatsApp
const whatsappSchemas = {
  sendMessage: Joi.object({
    to: customJoi.phoneNumber()
      .required()
      .messages({
        'any.required': 'Número de destino é obrigatório'
      }),
    message: Joi.string()
      .min(1)
      .max(4096)
      .required()
      .messages({
        'string.min': 'Mensagem não pode estar vazia',
        'string.max': 'Mensagem muito longa (máximo 4096 caracteres)'
      }),
    quotedMessageId: Joi.string().optional(),
    mentions: Joi.array()
      .items(customJoi.phoneNumber())
      .max(50)
      .optional()
  }),

  sendMedia: Joi.object({
    to: customJoi.phoneNumber().required(),
    caption: Joi.string()
      .max(1024)
      .optional()
      .allow(''),
    quotedMessageId: Joi.string().optional()
  }),

  bulkMessage: Joi.object({
    contacts: Joi.array()
      .items(customJoi.phoneNumber())
      .min(1)
      .max(100)
      .required()
      .messages({
        'array.min': 'Pelo menos um contato é necessário',
        'array.max': 'Máximo 100 contatos por envio'
      }),
    message: Joi.string()
      .min(1)
      .max(4096)
      .required(),
    delay: Joi.number()
      .integer()
      .min(1)
      .max(300)
      .default(5)
      .messages({
        'number.min': 'Delay mínimo é 1 segundo',
        'number.max': 'Delay máximo é 5 minutos'
      })
  })
};

// Esquema de usuários
const userSchemas = {
  updateProfile: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .optional(),
    email: Joi.string()
      .email()
      .max(255)
      .optional(),
    department: Joi.string()
      .max(50)
      .optional(),
    notifications: Joi.object({
      email: Joi.boolean().default(true),
      push: Joi.boolean().default(true),
      sound: Joi.boolean().default(true)
    }).optional(),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark').default('light'),
      language: Joi.string().valid('pt-BR', 'en-US', 'es-ES').default('pt-BR'),
      timezone: Joi.string().default('America/Sao_Paulo')
    }).optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(VALIDATION_CONFIG.patterns.strongPassword)
      .required(),
    confirmPassword: Joi.any()
      .equal(Joi.ref('newPassword'))
      .required()
  })
};

// Esquema de configurações
const configSchemas = {
  textConfig: Joi.object({
    key: Joi.string()
      .max(100)
      .pattern(/^[a-zA-Z0-9_.]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Chave deve conter apenas letras, números, pontos e underscores'
      }),
    value: Joi.string()
      .max(4096)
      .required(),
    category: Joi.string()
      .max(50)
      .required(),
    variables: Joi.array()
      .items(Joi.string().max(50))
      .optional(),
    adminOnly: Joi.boolean().default(false)
  }),

  systemSettings: Joi.object({
    companyName: Joi.string().max(100).required(),
    companyPhone: customJoi.phoneNumber().required(),
    companyEmail: Joi.string().email().required(),
    workingHours: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      timezone: Joi.string().default('America/Sao_Paulo')
    }).required(),
    theme: Joi.object({
      primaryColor: Joi.string().pattern(VALIDATION_CONFIG.patterns.hexColor).required(),
      secondaryColor: Joi.string().pattern(VALIDATION_CONFIG.patterns.hexColor).required(),
      logo: Joi.string().uri().optional()
    }).optional()
  })
};

// Esquema Bitrix
const bitrixSchemas = {
  integration: Joi.object({
    bitrixDomain: Joi.string()
      .pattern(/^[a-zA-Z0-9-]+\.bitrix24\.(com|com\.br|ru)$/)
      .required()
      .messages({
        'string.pattern.base': 'Domínio Bitrix inválido'
      }),
    webhookUrl: Joi.string()
      .uri()
      .required(),
    apiKey: Joi.string()
      .min(32)
      .required(),
    isActive: Joi.boolean().default(true)
  }),

  template: Joi.object({
    name: Joi.string()
      .min(3)
      .max(100)
      .required(),
    bitrixEvent: Joi.string()
      .valid('ONCRMDEALADD', 'ONCRMDEALUPDATE', 'ONCRMLEADADD', 'ONCRMCONTACTADD')
      .required(),
    content: Joi.object({
      text: Joi.string()
        .min(1)
        .max(4096)
        .required(),
      variables: Joi.array()
        .items(Joi.string())
        .optional()
    }).required(),
    conditions: Joi.object().optional(),
    priority: Joi.string()
      .valid('high', 'normal', 'low')
      .default('normal'),
    isActive: Joi.boolean().default(true)
  })
};

// ====================================
// FUNÇÕES DE SANITIZAÇÃO
// ====================================

// Sanitizar string
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  let sanitized = str;
  
  if (VALIDATION_CONFIG.sanitization.trimStrings) {
    sanitized = sanitized.trim();
  }
  
  // Para WhatsApp, não queremos remover caracteres especiais ou emojis
  if (VALIDATION_CONFIG.sanitization.removeXSS) {
    // Remover apenas scripts perigosos, manter emojis e caracteres especiais
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  }
  
  return sanitized;
}

// Sanitizar objeto recursivamente
function sanitizeObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  
  return sanitized;
}

// ====================================
// MIDDLEWARE DE VALIDAÇÃO
// ====================================

// Criar middleware de validação
function createValidator(schema, target = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = req[target];
      
      // Sanitizar dados antes da validação
      let sanitizedData = dataToValidate;
      if (VALIDATION_CONFIG.sanitization.enabled) {
        sanitizedData = sanitizeObject(dataToValidate);
      }
      
      // Validar com Joi
      const { error, value } = schema.validate(sanitizedData, {
        abortEarly: VALIDATION_CONFIG.abortEarly,
        allowUnknown: VALIDATION_CONFIG.allowUnknown,
        stripUnknown: VALIDATION_CONFIG.stripUnknown
      });
      
      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type,
          value: detail.context?.value
        }));
        
        return res.status(400).json({
          success: false,
          error: 'Dados de entrada inválidos',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        });
      }
      
      // Substituir dados originais pelos validados/sanitizados
      req[target] = value;
      
      // Log de validação (desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Validação bem-sucedida: ${req.method} ${req.path}`);
      }
      
      next();
      
    } catch (validationError) {
      console.error('❌ Erro na validação:', validationError.message);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno na validação',
        code: 'VALIDATION_SYSTEM_ERROR'
      });
    }
  };
}

// ====================================
// VALIDADORES ESPECÍFICOS
// ====================================

// Autenticação
const validateLogin = createValidator(authSchemas.login);
const validateRegister = createValidator(authSchemas.register);

// WhatsApp
const validateSendMessage = createValidator(whatsappSchemas.sendMessage);
const validateSendMedia = createValidator(whatsappSchemas.sendMedia);
const validateBulkMessage = createValidator(whatsappSchemas.bulkMessage);

// Usuários
const validateUpdateProfile = createValidator(userSchemas.updateProfile);
const validateChangePassword = createValidator(userSchemas.changePassword);

// Configurações
const validateTextConfig = createValidator(configSchemas.textConfig);
const validateSystemSettings = createValidator(configSchemas.systemSettings);

// Bitrix
const validateBitrixIntegration = createValidator(bitrixSchemas.integration);
const validateBitrixTemplate = createValidator(bitrixSchemas.template);

// ====================================
// VALIDADORES DE PARÂMETROS
// ====================================

// Validar parâmetros da URL
const validateParams = (schema) => {
  return createValidator(schema, 'params');
};

// Validar query parameters
const validateQuery = (schema) => {
  return createValidator(schema, 'query');
};

// Esquemas comuns para parâmetros
const paramSchemas = {
  id: Joi.object({
    id: Joi.string()
      .pattern(/^[a-zA-Z0-9-_]+$/)
      .required()
      .messages({
        'string.pattern.base': 'ID deve conter apenas letras, números, hífens e underscores'
      })
  }),
  
  phoneNumber: Joi.object({
    phoneNumber: customJoi.phoneNumber().required()
  }),
  
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('asc', 'desc').default('desc'),
    sortBy: Joi.string().default('createdAt')
  })
};

// ====================================
// MIDDLEWARE DE VALIDAÇÃO CONDICIONAL
// ====================================
const conditionalValidation = (condition, schema, target = 'body') => {
  return (req, res, next) => {
    if (typeof condition === 'function' ? condition(req) : condition) {
      return createValidator(schema, target)(req, res, next);
    }
    next();
  };
};

// ====================================
// EXPORTAÇÕES
// ====================================
module.exports = {
  // Validadores de autenticação
  validateLogin,
  validateRegister,
  
  // Validadores WhatsApp
  validateSendMessage,
  validateSendMedia,
  validateBulkMessage,
  
  // Validadores de usuário
  validateUpdateProfile,
  validateChangePassword,
  
  // Validadores de configuração
  validateTextConfig,
  validateSystemSettings,
  
  // Validadores Bitrix
  validateBitrixIntegration,
  validateBitrixTemplate,
  
  // Validadores de parâmetros
  validateParams,
  validateQuery,
  
  // Esquemas de parâmetros
  paramSchemas,
  
  // Utilitários
  createValidator,
  conditionalValidation,
  sanitizeString,
  sanitizeObject,
  
  // Joi personalizado
  customJoi,
  
  // Configurações
  VALIDATION_CONFIG,
  
  // Inicialização
  init: () => {
    console.log('✅ Sistema de validação inicializado');
  }
};
module.exports.default = module.exports.validateLogin;