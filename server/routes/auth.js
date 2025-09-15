// server/routes/auth.js
// =====================================
// ROTAS DE AUTENTICAÇÃO - VERSÃO COMPLETA
// =====================================

const express = require('express');
const router = express.Router();

// Importar o AuthController
const AuthController = require('../controllers/authController');
const authController = new AuthController();

// ====================================
// ROTAS PÚBLICAS (SEM AUTENTICAÇÃO)
// ====================================

/**
 * POST /api/auth/login
 * Realizar login no sistema
 * Body: { email, password, rememberMe? }
 */
router.post('/login', async (req, res) => {
    try {
        await authController.login(req, res);
    } catch (error) {
        console.error('Erro na rota de login:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/auth/logout
 * Realizar logout do sistema
 * Headers: Authorization: Bearer <token>
 */
router.post('/logout', async (req, res) => {
    try {
        await authController.logout(req, res);
    } catch (error) {
        console.error('Erro na rota de logout:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * GET /api/auth/check
 * Verificar se sessão é válida
 * Headers: Authorization: Bearer <token>
 */
router.get('/check', async (req, res) => {
    try {
        await authController.checkSession(req, res);
    } catch (error) {
        console.error('Erro na verificação de sessão:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * GET /api/auth/test
 * Rota de teste para verificar se as rotas estão funcionando
 */
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Rotas de autenticação funcionando',
        timestamp: new Date().toISOString(),
        availableRoutes: [
            'POST /api/auth/login',
            'POST /api/auth/logout', 
            'GET /api/auth/check',
            'GET /api/auth/profile',
            'POST /api/auth/change-password',
            'GET /api/auth/users (admin)',
            'GET /api/auth/sessions (admin)'
        ]
    });
});

// ====================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ====================================
// Aplicar autenticação para todas as rotas abaixo
router.use(async (req, res, next) => {
    try {
        await authController.authenticateToken(req, res, next);
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        res.status(500).json({
            success: false,
            error: 'Erro na autenticação'
        });
    }
});

// ====================================
// ROTAS PROTEGIDAS (REQUEREM AUTENTICAÇÃO)
// ====================================

/**
 * GET /api/auth/profile
 * Obter dados do perfil do usuário logado
 */
router.get('/profile', (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user,
            message: 'Perfil obtido com sucesso'
        });
    } catch (error) {
        console.error('Erro ao obter perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/auth/change-password
 * Alterar senha do usuário
 * Body: { currentPassword, newPassword }
 */
router.post('/change-password', async (req, res) => {
    try {
        await authController.changePassword(req, res);
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * GET /api/auth/me
 * Alias para /profile (compatibilidade)
 */
router.get('/me', (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/auth/refresh
 * Renovar token de sessão
 */
router.post('/refresh', (req, res) => {
    try {
        // Em implementação mais avançada, gerar novo token
        res.json({
            success: true,
            message: 'Token ainda válido',
            user: req.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// ====================================
// ROTAS ADMINISTRATIVAS (ADMIN APENAS)
// ====================================

/**
 * GET /api/auth/users
 * Listar todos os usuários (Admin apenas)
 */
router.get('/users', authController.requireRole('admin'), async (req, res) => {
    try {
        await authController.listUsers(req, res);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * GET /api/auth/sessions
 * Obter estatísticas de sessões ativas (Admin apenas)
 */
router.get('/sessions', authController.requireRole('admin'), (req, res) => {
    try {
        const stats = authController.getSessionStats();
        res.json({
            success: true,
            stats,
            message: 'Estatísticas de sessão obtidas'
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/auth/cleanup-sessions
 * Limpar sessões expiradas (Admin apenas)
 */
router.post('/cleanup-sessions', authController.requireRole('admin'), (req, res) => {
    try {
        authController.cleanExpiredSessions();
        const stats = authController.getSessionStats();
        
        res.json({
            success: true,
            message: 'Sessões expiradas removidas com sucesso',
            stats
        });
    } catch (error) {
        console.error('Erro ao limpar sessões:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * GET /api/auth/system-info
 * Informações do sistema de autenticação (Admin apenas)
 */
router.get('/system-info', authController.requireRole('admin'), (req, res) => {
    try {
        const info = {
            totalUsers: authController.users.length,
            activeUsers: authController.users.filter(u => u.isActive).length,
            activeSessions: authController.sessions.size,
            serverTime: new Date().toISOString(),
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            availableRoles: ['admin', 'manager', 'agent', 'viewer'],
            testUsers: [
                { email: 'teste@teste.com', password: '123', role: 'agent' },
                { email: 'admin@primem.com', password: 'admin123', role: 'admin' },
                { email: 'manager@primem.com', password: 'manager123', role: 'manager' }
            ]
        };

        res.json({
            success: true,
            info,
            message: 'Informações do sistema obtidas'
        });
    } catch (error) {
        console.error('Erro ao obter informações do sistema:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// ====================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ====================================
router.use((error, req, res, next) => {
    console.error('Erro nas rotas de autenticação:', error);
    
    res.status(500).json({
        success: false,
        error: 'Erro interno nas rotas de autenticação',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

module.exports = router;