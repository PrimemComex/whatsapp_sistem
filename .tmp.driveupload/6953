// server/controllers/authController.js
// =====================================
// CONTROLLER DE AUTENTICAÇÃO - VERSÃO COM LOGGER CORRIGIDO
// =====================================

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ====================================
// LOGGER ROBUSTO COM FALLBACK
// ====================================
let logger;
try {
    logger = require('../utils/logger');
    
    // Verificar se todas as funções existem
    if (!logger.info || !logger.error || !logger.warn || !logger.debug) {
        throw new Error('Logger incompleto');
    }
    
    console.log('✅ Logger carregado com sucesso');
} catch (error) {
    console.warn('⚠️ Logger não encontrado ou incompleto, criando logger básico');
    
    // Logger básico de emergência
    logger = {
        info: (msg, data) => {
            console.log('ℹ️ INFO:', msg);
            if (data && Object.keys(data).length > 0) {
                console.log('   📊 Dados:', JSON.stringify(data, null, 2));
            }
        },
        error: (msg, error) => {
            console.error('❌ ERROR:', msg);
            if (error) {
                if (error instanceof Error) {
                    console.error('   🐛 Stack:', error.stack);
                } else {
                    console.error('   📄 Detalhes:', error);
                }
            }
        },
        warn: (msg, data) => {
            console.warn('⚠️ WARN:', msg);
            if (data && Object.keys(data).length > 0) {
                console.warn('   📊 Dados:', JSON.stringify(data, null, 2));
            }
        },
        debug: (msg, data) => {
            if (process.env.NODE_ENV === 'development') {
                console.log('🐛 DEBUG:', msg);
                if (data && Object.keys(data).length > 0) {
                    console.log('   📊 Dados:', JSON.stringify(data, null, 2));
                }
            }
        }
    };
}

class AuthController {
    constructor() {
        try {
            console.log('🚀 Iniciando AuthController COMPLETO...');
            
            // ====================================
            // USUÁRIOS TESTE COMPLETOS
            // ====================================
            this.users = [
                {
                    id: 'admin-001',
                    name: 'Administrador PRIMEM',
                    email: 'admin@primem.com',
                    password: this.hashPassword('admin123'),
                    displayName: 'Admin PRIMEM',
                    role: 'admin',
                    department: 'TI',
                    permissions: [
                        'all', 'view_all_chats', 'manage_users', 'system_settings',
                        'text_configs', 'bitrix_integration', 'user_management',
                        'advanced_settings', 'audit_logs', 'backup_restore'
                    ],
                    settings: {
                        theme: 'light',
                        notifications: true,
                        signature: 'Administrador\nPRIMEM COMEX\n+55 11 4002-8900',
                        autoSignature: true,
                        language: 'pt-BR'
                    },
                    preferences: {
                        chatListDensity: 'comfortable',
                        messagePreview: true,
                        showTimestamps: true
                    },
                    isActive: true,
                    lastLogin: null,
                    createdAt: new Date('2025-01-01'),
                    loginCount: 0,
                    accountLocked: false
                },
                {
                    id: 'test-001',
                    name: 'Usuário Teste',
                    email: 'teste@teste.com',
                    password: this.hashPassword('123'),
                    displayName: 'Teste',
                    role: 'agent',
                    department: 'Comercial',
                    permissions: [
                        'view_assigned_chats', 'send_messages', 'upload_files'
                    ],
                    settings: {
                        theme: 'light',
                        notifications: true,
                        signature: 'Usuário Teste\nComercial',
                        autoSignature: false,
                        language: 'pt-BR'
                    },
                    preferences: {
                        chatListDensity: 'compact',
                        messagePreview: true,
                        showTimestamps: false
                    },
                    isActive: true,
                    lastLogin: null,
                    createdAt: new Date('2025-01-01'),
                    loginCount: 0,
                    accountLocked: false
                },
                {
                    id: 'manager-001',
                    name: 'Gerente PRIMEM',
                    email: 'manager@primem.com',
                    password: this.hashPassword('manager123'),
                    displayName: 'Manager',
                    role: 'manager',
                    department: 'Operacional',
                    permissions: [
                        'view_department_chats', 'manage_department_users', 'send_messages'
                    ],
                    settings: {
                        theme: 'dark',
                        notifications: true,
                        signature: 'Gerente\nOperacional - PRIMEM COMEX',
                        autoSignature: true,
                        language: 'pt-BR'
                    },
                    preferences: {
                        chatListDensity: 'comfortable',
                        messagePreview: true,
                        showTimestamps: true
                    },
                    isActive: true,
                    lastLogin: null,
                    createdAt: new Date('2025-01-01'),
                    loginCount: 0,
                    accountLocked: false
                },
                {
                    id: 'viewer-001',
                    name: 'Visualizador',
                    email: 'viewer@primem.com',
                    password: this.hashPassword('viewer123'),
                    displayName: 'Viewer',
                    role: 'viewer',
                    department: 'Suporte',
                    permissions: ['view_assigned_chats'],
                    settings: {
                        theme: 'light',
                        notifications: false,
                        signature: '',
                        autoSignature: false,
                        language: 'pt-BR'
                    },
                    preferences: {
                        chatListDensity: 'compact',
                        messagePreview: false,
                        showTimestamps: true
                    },
                    isActive: true,
                    lastLogin: null,
                    createdAt: new Date('2025-01-01'),
                    loginCount: 0,
                    accountLocked: false
                }
            ];

            // ====================================
            // CONFIGURAÇÕES E MAPS
            // ====================================
            this.sessions = new Map();
            this.loginAttempts = new Map();
            this.rateLimiter = new Map();
            this.auditLogs = [];
            this.userActivity = new Map();
            this.sessionWarnings = new Map();

            // ====================================
            // CONFIGURAÇÕES DO SISTEMA
            // ====================================
            this.config = {
                session: {
                    duration: 8 * 60 * 60 * 1000, // 8 horas
                    rememberMeDuration: 7 * 24 * 60 * 60 * 1000, // 7 dias
                    warningTime: 10 * 60 * 1000, // 10 minutos
                    cleanupInterval: 30 * 60 * 1000 // 30 minutos
                },
                security: {
                    maxLoginAttempts: 5,
                    lockoutDuration: 15 * 60 * 1000, // 15 minutos
                    passwordMinLength: 3
                },
                rateLimit: {
                    windowMs: 60 * 1000, // 1 minuto
                    maxRequests: 100
                }
            };

            // ====================================
            // DEFINIÇÕES DE ROLES
            // ====================================
            this.roleDefinitions = {
                admin: {
                    name: 'Administrador',
                    level: 100,
                    canManageUsers: true,
                    canConfigureSystem: true
                },
                manager: {
                    name: 'Gerente',
                    level: 75,
                    canManageUsers: false,
                    canConfigureSystem: false
                },
                agent: {
                    name: 'Agente',
                    level: 50,
                    canManageUsers: false,
                    canConfigureSystem: false
                },
                viewer: {
                    name: 'Visualizador',
                    level: 25,
                    canManageUsers: false,
                    canConfigureSystem: false
                }
            };

            console.log('✅ AuthController COMPLETO inicializado');
            console.log('📊 Usuarios teste disponiveis:', this.users.map(u => `${u.email} (${u.role})`));
            console.log('⚙️ Total de funcionalidades:', Object.keys(this).length);
            
            // Iniciar processos de background com logger seguro
            this.startBackgroundProcesses();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar AuthController:', error);
            throw error;
        }
    }

    // ====================================
    // MÉTODO DE HASH SEGURO
    // ====================================
    hashPassword(password, salt = null) {
        const actualSalt = salt || 'primem_advanced_salt_2025_v2';
        return crypto.createHash('sha256').update(password + actualSalt).digest('hex');
    }

    generateSessionToken() {
        const timestamp = Date.now();
        const random = crypto.randomBytes(32).toString('hex');
        return `${random}_${timestamp}_${crypto.randomBytes(8).toString('hex')}`;
    }

    // ====================================
    // LOGIN COMPLETO
    // ====================================
    async login(req, res) {
        const startTime = Date.now();
        
        try {
            const { email, password, rememberMe = false } = req.body;
            const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

            // Log seguro
            try {
                logger.info('Tentativa de login:', { email, clientIP, rememberMe });
            } catch (logError) {
                console.log('ℹ️ Tentativa de login:', email, 'IP:', clientIP);
            }

            // Validações básicas
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email e senha são obrigatórios',
                    code: 'MISSING_CREDENTIALS'
                });
            }

            // Verificar rate limiting
            if (this.isRateLimited(clientIP)) {
                try {
                    logger.warn('Rate limit excedido:', { email, clientIP });
                } catch (logError) {
                    console.warn('⚠️ Rate limit excedido:', email, clientIP);
                }
                return res.status(429).json({
                    success: false,
                    error: 'Muitas tentativas. Tente novamente em alguns minutos.',
                    code: 'RATE_LIMITED'
                });
            }

            // Buscar usuário
            const user = this.users.find(u => 
                u.email.toLowerCase() === email.toLowerCase()
            );

            if (!user) {
                this.recordFailedAttempt(clientIP, email, 'user_not_found');
                return res.status(401).json({
                    success: false,
                    error: 'Email ou senha incorretos',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Verificar se está ativo
            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    error: 'Conta inativa',
                    code: 'ACCOUNT_INACTIVE'
                });
            }

            // Verificar senha
            const hashedPassword = this.hashPassword(password);
            if (user.password !== hashedPassword) {
                this.recordFailedAttempt(clientIP, email, 'wrong_password');
                return res.status(401).json({
                    success: false,
                    error: 'Email ou senha incorretos',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Login bem-sucedido
            this.clearFailedAttempts(clientIP);

            // Gerar sessão
            const sessionToken = this.generateSessionToken();
            const expiresAt = new Date();
            const duration = rememberMe ? this.config.session.rememberMeDuration : this.config.session.duration;
            expiresAt.setTime(expiresAt.getTime() + duration);

            // Dados da sessão
            const sessionData = {
                userId: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                displayName: user.displayName,
                department: user.department,
                permissions: user.permissions,
                settings: user.settings,
                preferences: user.preferences,
                createdAt: new Date(),
                expiresAt,
                lastActivity: new Date(),
                rememberMe,
                clientIP,
                sessionId: crypto.randomUUID(),
                activityCount: 1
            };

            this.sessions.set(sessionToken, sessionData);

            // Atualizar usuário
            const userIndex = this.users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                this.users[userIndex].lastLogin = new Date();
                this.users[userIndex].lastLoginIP = clientIP;
                this.users[userIndex].loginCount = (this.users[userIndex].loginCount || 0) + 1;
            }

            // Dados para retorno
            const userData = {
                id: user.id,
                email: user.email,
                name: user.name,
                displayName: user.displayName,
                role: user.role,
                department: user.department,
                permissions: user.permissions,
                settings: user.settings,
                preferences: user.preferences,
                isActive: user.isActive
            };

            // Log de sucesso
            const processingTime = Date.now() - startTime;
            try {
                logger.info('Login realizado com sucesso:', {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    processingTime: `${processingTime}ms`
                });
            } catch (logError) {
                console.log('✅ Login realizado:', user.email, user.role, `${processingTime}ms`);
            }

            res.json({
                success: true,
                user: userData,
                token: sessionToken,
                sessionData: {
                    expiresAt: expiresAt.toISOString(),
                    duration: duration,
                    sessionId: sessionData.sessionId
                },
                message: `Bem-vindo, ${user.displayName}!`
            });

        } catch (error) {
            const processingTime = Date.now() - startTime;
            try {
                logger.error('Erro crítico no login:', {
                    error: error.message,
                    processingTime: `${processingTime}ms`
                });
            } catch (logError) {
                console.error('❌ Erro crítico no login:', error.message, `${processingTime}ms`);
            }

            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // ====================================
    // LOGOUT
    // ====================================
    async logout(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (token && this.sessions.has(token)) {
                const session = this.sessions.get(token);
                const sessionDuration = new Date() - session.createdAt;
                
                this.sessions.delete(token);
                this.sessionWarnings.delete(token);
                
                try {
                    logger.info('Logout realizado:', {
                        userId: session.userId,
                        email: session.email,
                        sessionDuration: `${Math.round(sessionDuration / 1000)}s`
                    });
                } catch (logError) {
                    console.log('✅ Logout realizado:', session.email, `${Math.round(sessionDuration / 1000)}s`);
                }
            }

            res.json({
                success: true,
                message: 'Logout realizado com sucesso',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            try {
                logger.error('Erro no logout:', error);
            } catch (logError) {
                console.error('❌ Erro no logout:', error);
            }
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // VERIFICAÇÃO DE SESSÃO
    // ====================================
    async checkSession(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: 'Token não fornecido',
                    code: 'NO_TOKEN'
                });
            }

            const session = this.sessions.get(token);
            if (!session) {
                return res.status(401).json({
                    success: false,
                    error: 'Sessão não encontrada',
                    code: 'SESSION_NOT_FOUND'
                });
            }

            // Verificar expiração
            const now = new Date();
            if (now > session.expiresAt) {
                this.sessions.delete(token);
                return res.status(401).json({
                    success: false,
                    error: 'Sessão expirada',
                    code: 'SESSION_EXPIRED'
                });
            }

            // Buscar usuário
            const user = this.users.find(u => u.id === session.userId);
            if (!user || !user.isActive) {
                this.sessions.delete(token);
                return res.status(401).json({
                    success: false,
                    error: 'Usuário inativo',
                    code: 'USER_INACTIVE'
                });
            }

            // Atualizar atividade
            session.lastActivity = now;
            session.activityCount = (session.activityCount || 0) + 1;

            // Dados do usuário
            const userData = {
                id: user.id,
                email: user.email,
                name: user.name,
                displayName: user.displayName,
                role: user.role,
                department: user.department,
                permissions: user.permissions,
                settings: user.settings,
                preferences: user.preferences,
                isActive: user.isActive
            };

            res.json({
                success: true,
                user: userData,
                session: {
                    sessionId: session.sessionId,
                    createdAt: session.createdAt.toISOString(),
                    expiresAt: session.expiresAt.toISOString(),
                    lastActivity: session.lastActivity.toISOString(),
                    activityCount: session.activityCount
                }
            });

        } catch (error) {
            try {
                logger.error('Erro ao verificar sessão:', error);
            } catch (logError) {
                console.error('❌ Erro ao verificar sessão:', error);
            }
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // MIDDLEWARE DE AUTENTICAÇÃO
    // ====================================
    async authenticateToken(req, res, next) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: 'Token de acesso requerido'
                });
            }

            const session = this.sessions.get(token);
            if (!session) {
                return res.status(401).json({
                    success: false,
                    error: 'Token inválido'
                });
            }

            if (new Date() > session.expiresAt) {
                this.sessions.delete(token);
                return res.status(401).json({
                    success: false,
                    error: 'Token expirado'
                });
            }

            const user = this.users.find(u => u.id === session.userId);
            if (!user || !user.isActive) {
                this.sessions.delete(token);
                return res.status(401).json({
                    success: false,
                    error: 'Usuário inativo'
                });
            }

            session.lastActivity = new Date();
            session.activityCount = (session.activityCount || 0) + 1;

            req.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                department: user.department,
                permissions: user.permissions
            };

            next();

        } catch (error) {
            try {
                logger.error('Erro na autenticação:', error);
            } catch (logError) {
                console.error('❌ Erro na autenticação:', error);
            }
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // MIDDLEWARE DE AUTORIZAÇÃO
    // ====================================
    requireRole(requiredRole) {
        return (req, res, next) => {
            const user = req.user;
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuário não autenticado'
                });
            }

            if (user.role === 'admin') {
                return next();
            }

            if (user.role !== requiredRole) {
                return res.status(403).json({
                    success: false,
                    error: `Acesso negado. Role necessária: ${requiredRole}`,
                    userRole: user.role,
                    requiredRole
                });
            }

            next();
        };
    }

    // ====================================
    // ALTERAR SENHA
    // ====================================
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user?.id;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Senha atual e nova senha são obrigatórias'
                });
            }

            if (newPassword.length < this.config.security.passwordMinLength) {
                return res.status(400).json({
                    success: false,
                    error: `Nova senha deve ter pelo menos ${this.config.security.passwordMinLength} caracteres`
                });
            }

            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuário não encontrado'
                });
            }

            const user = this.users[userIndex];
            const hashedCurrentPassword = this.hashPassword(currentPassword);
            if (user.password !== hashedCurrentPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Senha atual incorreta'
                });
            }

            this.users[userIndex].password = this.hashPassword(newPassword);

            try {
                logger.info('Senha alterada com sucesso:', {
                    userId: user.id,
                    email: user.email
                });
            } catch (logError) {
                console.log('✅ Senha alterada:', user.email);
            }

            res.json({
                success: true,
                message: 'Senha alterada com sucesso'
            });

        } catch (error) {
            try {
                logger.error('Erro ao alterar senha:', error);
            } catch (logError) {
                console.error('❌ Erro ao alterar senha:', error);
            }
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // LISTAR USUÁRIOS
    // ====================================
    async listUsers(req, res) {
        try {
            const { page = 1, limit = 10, search, role } = req.query;

            let filteredUsers = this.users.filter(user => user.isActive);

            if (search) {
                const searchLower = search.toLowerCase();
                filteredUsers = filteredUsers.filter(user =>
                    user.name.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower) ||
                    user.department.toLowerCase().includes(searchLower)
                );
            }

            if (role) {
                filteredUsers = filteredUsers.filter(user => user.role === role);
            }

            const users = filteredUsers.map(user => ({
                id: user.id,
                email: user.email,
                name: user.name,
                displayName: user.displayName,
                role: user.role,
                department: user.department,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                loginCount: user.loginCount
            }));

            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedUsers = users.slice(startIndex, endIndex);

            res.json({
                success: true,
                users: paginatedUsers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: users.length,
                    totalPages: Math.ceil(users.length / limit)
                }
            });

        } catch (error) {
            try {
                logger.error('Erro ao listar usuários:', error);
            } catch (logError) {
                console.error('❌ Erro ao listar usuários:', error);
            }
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // MÉTODOS AUXILIARES
    // ====================================
    isRateLimited(clientIP) {
        const now = Date.now();
        const record = this.rateLimiter.get(clientIP);

        if (!record) {
            this.rateLimiter.set(clientIP, {
                count: 1,
                resetTime: now + this.config.rateLimit.windowMs
            });
            return false;
        }

        if (now > record.resetTime) {
            this.rateLimiter.set(clientIP, {
                count: 1,
                resetTime: now + this.config.rateLimit.windowMs
            });
            return false;
        }

        if (record.count >= this.config.rateLimit.maxRequests) {
            return true;
        }

        record.count++;
        return false;
    }

    recordFailedAttempt(clientIP, email, reason) {
        const now = Date.now();
        const existing = this.loginAttempts.get(clientIP);

        if (!existing) {
            this.loginAttempts.set(clientIP, {
                count: 1,
                firstAttempt: now,
                lastAttempt: now,
                attempts: [{ email, reason, timestamp: now }]
            });
        } else {
            existing.count++;
            existing.lastAttempt = now;
            existing.attempts.push({ email, reason, timestamp: now });
        }
    }

    clearFailedAttempts(clientIP) {
        this.loginAttempts.delete(clientIP);
    }

    getSessionStats() {
        const now = new Date();
        const activeSessions = Array.from(this.sessions.values())
            .filter(session => now <= session.expiresAt);

        return {
            total: this.sessions.size,
            active: activeSessions.length,
            expired: this.sessions.size - activeSessions.length,
            totalUsers: this.users.length,
            activeUsers: this.users.filter(u => u.isActive).length
        };
    }

    cleanExpiredSessions() {
        const now = new Date();
        let cleanedCount = 0;

        for (const [token, session] of this.sessions.entries()) {
            if (now > session.expiresAt) {
                this.sessions.delete(token);
                this.sessionWarnings.delete(token);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            try {
                logger.info('Limpeza de sessões:', { 
                    cleaned: cleanedCount, 
                    remaining: this.sessions.size 
                });
            } catch (logError) {
                console.log('🧹 Limpeza de sessões:', cleanedCount, 'removidas,', this.sessions.size, 'restantes');
            }
        }

        return cleanedCount;
    }

    startBackgroundProcesses() {
        try {
            // Limpeza de sessões a cada 30 minutos
            setInterval(() => {
                this.cleanExpiredSessions();
            }, this.config.session.cleanupInterval);

            // Limpeza de rate limit a cada hora
            setInterval(() => {
                const now = Date.now();
                for (const [ip, record] of this.rateLimiter.entries()) {
                    if (now > record.resetTime) {
                        this.rateLimiter.delete(ip);
                    }
                }
            }, 60 * 60 * 1000);

            // Log seguro de inicialização
            try {
                logger.info('Processos de background iniciados');
            } catch (logError) {
                console.log('✅ Processos de background iniciados');
            }

        } catch (error) {
            console.error('❌ Erro ao iniciar processos de background:', error);
        }
    }
}

module.exports = AuthController;