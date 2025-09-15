// =====================================
// server/routes/index.js
// =====================================

const express = require('express');
const router = express.Router();

// Importar todas as rotas
const authRoutes = require('./auth');
const whatsappRoutes = require('./whatsapp');
const filesRoutes = require('./files');
const messagesRoutes = require('./messages');
const usersRoutes = require('./users');
const bitrixRoutes = require('./bitrix');

// Middleware de log para todas as rotas
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Definir rotas principais
router.use('/auth', authRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/files', filesRoutes);
router.use('/messages', messagesRoutes);
router.use('/users', usersRoutes);
router.use('/bitrix', bitrixRoutes);

// Rota de teste
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando corretamente',
        timestamp: new Date().toISOString(),
        version: '6.0-modularized'
    });
});

// Rota padrão da API
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'PRIMEM WhatsApp API v6.0',
        version: '6.0-modularized',
        endpoints: {
            auth: '/api/auth',
            whatsapp: '/api/whatsapp',
            files: '/api/files',
            messages: '/api/messages',
            users: '/api/users',
            bitrix: '/api/bitrix'
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router;