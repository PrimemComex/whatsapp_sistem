// ====================================
// 🔐 MIDDLEWARE DE AUTENTICAÇÃO - v16.0
// 🎯 Validar tokens JWT e permissões de usuário
// ====================================

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// ====================================
// CONFIGURAÇÕES DE SEGURANÇA
// ====================================
const AUTH_CONFIG = {
  jwtSecret: process.env.JWT_SECRET || 'primem_whatsapp_secret_2025',
  tokenExpiry: '24h',
  refreshTokenExpiry: '30d',
  cookieName: 'primem_auth_token',
  headerName: 'Authorization',
  algorithms: ['HS256']
};

// ====================================
// USUÁRIOS DE TESTE (SUBSTITUIR POR BD)
// ====================================
const TEST_USERS = [
  {
    id: '1',
    email: 'teste@teste.com',
    password: '123', // Em produção usar hash
    name: 'Usuário Teste',
    role: 'agent',
    department: 'comercial',
    isActive: true,
    permissions: ['view_assigned_chats', 'send_messages', 'upload_files']
  },
  {
    id: '2',
    email: 'admin@primem.com',
    password: 'admin123',
    name: 'Administrador PRIMEM',
    role: 'admin',
    department: 'sistema',
    isActive: true,
    permissions: ['all']
  },
  {
    id: '3',
    email: 'ana@primem.com',
    password: '123456',
    name: 'Ana Silva',
    role: 'manager',
    department: 'operacional',
    isActive: true,
    permissions: ['view_all_chats', 'manage_department', 'view_reports']
  },
  {
    id: '4',
    email: 'supervisor@primem.com',
    password: 'super123',
    name: 'Supervisor Geral',
    role: 'manager',
    department: 'geral',
    isActive: true,
    permissions: ['view_all_chats', 'manage_all_departments', 'user_management']
  }
];

// ====================================
// RATE LIMITING PARA LOGIN
// ====================================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 tentativas por IP
  message: {
    success: false,
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// ====================================
// FUNÇÕES AUXILIARES
// ====================================

// Gerar token JWT
function generateToken(user, expiresIn = AUTH_CONFIG.tokenExpiry) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    department: user.department,
    permissions: user.permissions,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, AUTH_CONFIG.jwtSecret, {
    expiresIn,
    algorithm: 'HS256'
  });
}

// Verificar token JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, AUTH_CONFIG.jwtSecret, {
      algorithms: AUTH_CONFIG.algorithms
    });
  } catch (error) {
    throw new Error(`Token inválido: ${error.message}`);
  }
}

// Encontrar usuário por ID
function findUserById(userId) {
  const user = TEST_USERS.find(u => u.id === userId && u.isActive);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}

// ====================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ====================================
const authenticateToken = (options = {}) => {
  const {
    required = true,
    roles = [],
    permissions = [],
    checkUserActive = true
  } = options;

  return async (req, res, next) => {
    try {
      // Extrair token do header ou cookie
      let token = null;

      // 1. Verificar header Authorization
      const authHeader = req.headers[AUTH_CONFIG.headerName.toLowerCase()];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      // 2. Verificar cookie (fallback)
      if (!token && req.cookies && req.cookies[AUTH_CONFIG.cookieName]) {
        token = req.cookies[AUTH_CONFIG.cookieName];
      }

      // 3. Verificar query parameter (para downloads)
      if (!token && req.query.token) {
        token = req.query.token;
      }

      // Se não é obrigatório e não tem token, continuar
      if (!required && !token) {
        req.user = null;
        req.isAuthenticated = false;
        return next();
      }

      // Se é obrigatório e não tem token, erro
      if (required && !token) {
        return res.status(401).json({
          success: false,
          error: 'Token de acesso não fornecido',
          code: 'MISSING_TOKEN'
        });
      }

      // Verificar e decodificar token
      const decoded = verifyToken(token);

      // Buscar usuário atual
      const user = findUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não encontrado ou inativo',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verificar se usuário está ativo
      if (checkUserActive && !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Conta de usuário desativada',
          code: 'USER_INACTIVE'
        });
      }

      // Verificar roles se especificado
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: `Acesso negado. Roles permitidos: ${roles.join(', ')}`,
          code: 'INSUFFICIENT_ROLE',
          required: roles,
          current: user.role
        });
      }

      // Verificar permissões se especificado
      if (permissions.length > 0) {
        const hasPermission = user.permissions.includes('all') || 
          permissions.some(perm => user.permissions.includes(perm));
        
        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            error: `Permissões insuficientes. Necessário: ${permissions.join(' ou ')}`,
            code: 'INSUFFICIENT_PERMISSIONS',
            required: permissions,
            current: user.permissions
          });
        }
      }

      // Adicionar dados do usuário à requisição
      req.user = user;
      req.isAuthenticated = true;
      req.tokenData = decoded;

      // Log de acesso para auditoria
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 Auth: ${user.email} (${user.role}) acessou ${req.method} ${req.path}`);
      }

      next();

    } catch (error) {
      console.error('❌ Erro de autenticação:', error.message);

      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

// ====================================
// MIDDLEWARE PARA ROLES ESPECÍFICOS
// ====================================

// Apenas administradores
const requireAdmin = authenticateToken({
  required: true,
  roles: ['admin']
});

// Managers ou superior
const requireManager = authenticateToken({
  required: true,
  roles: ['admin', 'manager']
});

// Agentes ou superior
const requireAgent = authenticateToken({
  required: true,
  roles: ['admin', 'manager', 'agent']
});

// Qualquer usuário autenticado
const requireAuth = authenticateToken({
  required: true
});

// Autenticação opcional
const optionalAuth = authenticateToken({
  required: false
});

// ====================================
// MIDDLEWARE PARA PERMISSÕES
// ====================================
const requirePermission = (permissions) => {
  return authenticateToken({
    required: true,
    permissions: Array.isArray(permissions) ? permissions : [permissions]
  });
};

// ====================================
// ROTA DE LOGIN
// ====================================
const handleLogin = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Buscar usuário
    const user = TEST_USERS.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password &&
      u.isActive
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Gerar tokens
    const tokenExpiry = rememberMe ? AUTH_CONFIG.refreshTokenExpiry : AUTH_CONFIG.tokenExpiry;
    const accessToken = generateToken(user, tokenExpiry);
    const refreshToken = generateToken(user, AUTH_CONFIG.refreshTokenExpiry);

    // Configurar cookie se lembrar
    if (rememberMe) {
      res.cookie(AUTH_CONFIG.cookieName, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
        sameSite: 'strict'
      });
    }

    // Resposta de sucesso
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: tokenExpiry
      }
    });

    console.log(`✅ Login: ${user.email} (${user.role})`);

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// ====================================
// ROTA DE LOGOUT
// ====================================
const handleLogout = (req, res) => {
  try {
    // Limpar cookie
    res.clearCookie(AUTH_CONFIG.cookieName);

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

    if (req.user) {
      console.log(`🚪 Logout: ${req.user.email}`);
    }

  } catch (error) {
    console.error('❌ Erro no logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer logout'
    });
  }
};

// ====================================
// VERIFICAR TOKEN
// ====================================
const handleVerifyToken = (req, res) => {
  try {
    if (!req.isAuthenticated || !req.user) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }

    res.json({
      success: true,
      data: {
        user: req.user,
        tokenData: req.tokenData
      }
    });

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar token'
    });
  }
};

// ====================================
// EXPORTAÇÕES
// ====================================
module.exports = {
  // Middlewares
  authenticateToken,
  requireAdmin,
  requireManager,
  requireAgent,
  requireAuth,
  optionalAuth,
  requirePermission,
  loginLimiter,

  // Handlers
  handleLogin,
  handleLogout,
  handleVerifyToken,

  // Utilitários
  generateToken,
  verifyToken,
  findUserById,

  // Constantes
  AUTH_CONFIG,
  TEST_USERS
};
module.exports.default = module.exports.requireAuth;
