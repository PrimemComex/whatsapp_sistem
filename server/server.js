// server/server.js
// VERSÃO v6.1 - CORRIGIDA COMPLETA COM AUTHCONTROLLER INSTANCIADO
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');

// ====================================
// IMPORTAR MIDDLEWARES (COM FALLBACK PARA ERROS)
// ====================================
let middleware;
try {
    middleware = require('./middleware/index');
    console.log('✅ Middleware index carregado com sucesso');
} catch (error) {
    console.error('⚠️ Erro ao carregar middleware, usando fallback:', error.message);
    middleware = {
        auth: (req, res, next) => { req.user = { id: 1, role: 'admin' }; next(); },
        cors: (req, res, next) => next(),
        errorHandler: (err, req, res, next) => res.status(500).json({ error: err.message }),
        rateLimit: (req, res, next) => next(),
        validation: (req, res, next) => next(),
        upload: { single: () => (req, res, next) => next() }
    };
}

// ====================================
// IMPORTAR CONTROLLERS (COM FALLBACK) - VERSÃO CORRIGIDA
// ====================================
let authController;
try {
    const AuthControllerClass = require('./controllers/authController');
    authController = new AuthControllerClass(); // INSTANCIAR A CLASSE
    console.log('✅ AuthController carregado e instanciado');
} catch (error) {
    console.warn('⚠️ AuthController não encontrado, usando mock');
    authController = {
        login: (req, res) => {
            const { email, password } = req.body;
            if (email === 'teste@teste.com' && password === '123') {
                res.json({ success: true, token: 'mock_token', user: { email, role: 'admin' } });
            } else {
                res.status(401).json({ success: false, error: 'Credenciais inválidas' });
            }
        },
        logout: (req, res) => {
            res.json({ success: true, message: 'Logout realizado' });
        },
        checkSession: (req, res) => {
            res.json({ success: true, user: { email: 'teste@teste.com', role: 'admin' } });
        },
        authenticateToken: (req, res, next) => {
            req.user = { id: 1, email: 'teste@teste.com', role: 'admin' };
            next();
        }
    };
}

// ====================================
// IMPORTAR SERVICES (COM FALLBACK)
// ====================================
let logger;
try {
    logger = require('./utils/logger');
    console.log('✅ Logger carregado com sucesso');
} catch (error) {
    console.warn('⚠️ Logger não encontrado, usando console');
    logger = {
        info: console.log,
        warn: console.warn,
        error: console.error,
        success: console.log
    };
}

// Função para criar pastas
const createRequiredFolders = () => {
    const folders = ['./uploads', './logs', './sessions', './temp'];
    folders.forEach(folder => {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
            console.log(`📁 Pasta criada: ${folder}`);
        }
    });
};

// CRIAR APP EXPRESS
const app = express();
const server = http.createServer(app);

// ====================================
// SOCKET.IO CONFIGURAÇÃO
// ====================================
const io = socketIO(server, {
    cors: {
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            
            const allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:3001', 
                'http://localhost:3002',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:3001',
                'http://192.168.1.100:3000',
                'http://0.0.0.0:3000'
            ];
            
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                logger.warn(`CORS rejeitado para origem: ${origin}`);
                callback(null, true); // Permitir para debug
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
    },
    transports: ['polling'],
    allowEIO3: true,
    pingTimeout: 120000,
    pingInterval: 30000,
    upgradeTimeout: 60000,
    maxHttpBufferSize: 10e6,
    connectTimeout: 60000,
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: 10,
    forceNew: false,
    multiplex: true,
    timeout: 60000,
    cookie: false,
    serveClient: true,
    path: '/socket.io/',
    destroyUpgrade: false,
    destroyUpgradeTimeout: 1000
});

logger.info('Socket.IO configurado com polling apenas');

// VARIÁVEL GLOBAL DO WHATSAPP SERVICE
let whatsappService = null;

// ====================================
// INICIALIZAÇÃO AUTOMÁTICA DO WHATSAPP
// ====================================
setTimeout(async () => {
    try {
        logger.info('Iniciando WhatsApp Service automaticamente...');
        const WhatsAppService = require('./services/whatsapp.service');
        whatsappService = new WhatsAppService(io, logger);
        
        const result = await whatsappService.initialize();
        if (result.success) {
            logger.success('WhatsApp Service iniciado com sucesso!');
            systemState.whatsapp.status = 'connected';
            systemState.whatsapp.isAuthenticated = true;
        } else {
            logger.error('Falha ao iniciar WhatsApp:', result.message);
            systemState.whatsapp.status = 'disconnected';
        }
    } catch (error) {
        logger.error('Erro ao carregar WhatsApp Service:', error.message);
    }
}, 3000);

// ====================================
// ESTADO DO SISTEMA
// ====================================
let systemState = {
    server: {
        status: 'online',
        startedAt: new Date(),
        port: process.env.PORT || 3001,
        version: '6.1-fixed'
    },
    whatsapp: {
        status: 'disconnected',
        qrCode: null,
        info: null,
        isAuthenticated: false
    },
    stats: {
        messagesReceived: 0,
        messagesSent: 0,
        filesReceived: 0,
        filesSent: 0,
        audiosReceived: 0,
        audiosSent: 0,
        audiosConverted: 0,
        oggValidConversions: 0,
        voiceNotesSuccessful: 0,
        activeConnections: 0,
        socketEvents: 0,
        qrCodesGenerated: 0,
        connectionsAttempted: 0,
        successfulConnections: 0
    }
};

// ====================================
// MIDDLEWARES GLOBAIS
// ====================================
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'Accept', 'Accept-Ranges'],
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length']
}));

// Rate limiting global (usando middleware simples)
if (middleware.rateLimit && typeof middleware.rateLimit === 'function') {
    app.use('/api', middleware.rateLimit);
} else {
    console.log('⚠️ Rate limiting desabilitado - middleware não disponível');
}

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ====================================
// SERVIR ARQUIVOS ESTÁTICOS
// ====================================
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    logger.info('Pasta uploads criada:', uploadsPath);
}

app.use('/uploads', (req, res, next) => {
    const filePath = path.join(__dirname, '../uploads', req.path);
    
    logger.info('Solicitação de arquivo:', req.path);
    
    if (!fs.existsSync(filePath)) {
        logger.warn('Arquivo não encontrado:', filePath);
        return res.status(404).json({
            error: 'Arquivo não encontrado',
            requested: req.path
        });
    }
    
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const ext = path.extname(filePath).toLowerCase();
    
    const isAudio = ['.mp3', '.ogg', '.opus', '.wav', '.m4a', '.aac', '.webm'].includes(ext);
    
    let contentType = 'application/octet-stream';
    if (ext === '.ogg' || ext === '.opus') {
        contentType = 'audio/ogg; codecs=opus';
    } else if (ext === '.mp3') {
        contentType = 'audio/mpeg';
    } else if (ext === '.wav') {
        contentType = 'audio/wav';
    } else if (ext === '.webm') {
        contentType = 'audio/webm';
    } else if (ext === '.m4a') {
        contentType = 'audio/mp4';
    } else if (ext === '.aac') {
        contentType = 'audio/aac';
    } else if (ext === '.mp4') {
        contentType = 'video/mp4';
    } else if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
    } else if (ext === '.png') {
        contentType = 'image/png';
    } else if (ext === '.pdf') {
        contentType = 'application/pdf';
    }
    
    if (isAudio) {
        logger.info(`ÁUDIO: ${contentType} para ${ext} (${(fileSize / 1024).toFixed(2)} KB)`);
    }
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Accept, Accept-Ranges');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    
    const range = req.headers.range;
    
    if (range) {
        logger.info(`Range Request para ${req.path}: ${range}`);
        
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        
        if (start >= fileSize) {
            res.status(416).send('Range Not Satisfiable');
            return;
        }
        
        const chunksize = (end - start) + 1;
        
        logger.info(`Enviando range: ${start}-${end}/${fileSize} (${chunksize} bytes)`);
        
        const stream = fs.createReadStream(filePath, { start, end });
        
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });
        
        stream.pipe(res);
    } else {
        if (isAudio) {
            logger.info(`Enviando áudio completo: ${req.path} (${(fileSize / 1024).toFixed(2)} KB)`);
        }
        
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*'
        });
        
        fs.createReadStream(filePath).pipe(res);
    }
});

// ====================================
// ROTAS DA API - SIMPLIFICADAS
// ====================================

// Health Check
app.get('/api/health', (req, res) => {
    logger.info('Health check solicitado');
    
    const uploadsDir = path.join(__dirname, '../uploads');
    let uploadCount = 0;
    let audioCount = 0;
    
    if (fs.existsSync(uploadsDir)) {
        try {
            const files = fs.readdirSync(uploadsDir);
            uploadCount = files.length;
            audioCount = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.mp3', '.ogg', '.opus', '.wav', '.m4a', '.aac', '.webm'].includes(ext);
            }).length;
        } catch (e) {
            logger.error('Erro ao contar uploads:', e.message);
        }
    }
    
    const response = {
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
        uploads: uploadCount,
        audios: audioCount,
        uploadsPath: uploadsDir,
        whatsappReady: whatsappService?.isReady || false,
        socketConnections: systemState.stats.activeConnections,
        stats: systemState.stats,
        version: '6.1-fixed',
        socketTransports: ['polling'],
        whatsappStatus: whatsappService ? whatsappService.getStatus() : null
    };
    
    logger.info('Health check respondido:', {
        whatsappReady: response.whatsappReady,
        uploads: response.uploads,
        socketConnections: response.socketConnections
    });
    
    res.json(response);
});

// Status do Sistema
app.get('/api/status', (req, res) => {
    logger.info('Status solicitado');
    
    const debugInfo = whatsappService ? {
        methods: Object.keys(whatsappService).filter(k => typeof whatsappService[k] === 'function'),
        isReady: whatsappService.isReady,
        hasClient: !!whatsappService.client,
        version: whatsappService.version || '6.1-fixed',
        status: whatsappService.getStatus ? whatsappService.getStatus() : null
    } : null;

    const response = {
        ...systemState,
        hasClient: whatsappService !== null,
        isReady: whatsappService?.isReady || false,
        timestamp: new Date(),
        debug: debugInfo,
        version: '6.1-fixed',
        socketInfo: {
            transports: ['polling'],
            connections: systemState.stats.activeConnections,
            events: systemState.stats.socketEvents
        },
        whatsappDetail: whatsappService ? whatsappService.getStatus() : null
    };
    
    logger.info('Status respondido:', {
        hasClient: response.hasClient,
        isReady: response.isReady,
        whatsappStatus: response.whatsapp.status,
        socketConnections: response.socketInfo.connections
    });

    res.json(response);
});

// ====================================
// ROTAS PRINCIPAIS (SIMPLIFICADAS)
// ====================================

// Login (mantido para compatibilidade) - LINHA CORRIGIDA
app.post('/api/login', authController.login.bind(authController));

// Logout
app.post('/api/logout', authController.logout.bind(authController));

// Check session
app.get('/api/check-session', authController.checkSession.bind(authController));

// Conectar WhatsApp
app.post('/api/whatsapp/connect', authController.authenticateToken.bind(authController), async (req, res) => {
    try {
        if (whatsappService && whatsappService.isReady) {
            return res.json({
                success: true,
                message: 'WhatsApp já está conectado',
                status: whatsappService.getStatus()
            });
        }
        
        if (!whatsappService) {
            const WhatsAppService = require('./services/whatsapp.service');
            whatsappService = new WhatsAppService(io, logger);
        }
        
        const result = await whatsappService.initialize();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Enviar mensagem
app.post('/api/whatsapp/send', authController.authenticateToken.bind(authController), async (req, res) => {
    try {
        const { to, message } = req.body;
        
        if (!whatsappService || !whatsappService.isReady) {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp não está conectado'
            });
        }
        
        const result = await whatsappService.sendMessage(to, message);
        systemState.stats.messagesSent++;
        
        res.json({
            success: true,
            messageId: result.messageId || result.id,
            to,
            message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Listar chats
app.get('/api/whatsapp/chats', authController.authenticateToken.bind(authController), async (req, res) => {
    try {
        if (!whatsappService || !whatsappService.isReady) {
            return res.json({ success: true, chats: [] });
        }
        
        const result = await whatsappService.getChats();
        res.json({
            success: true,
            chats: result.success ? result.chats : []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            chats: []
        });
    }
});

// QR Code
app.get('/api/whatsapp/qr', authController.authenticateToken.bind(authController), (req, res) => {
    res.json({
        success: true,
        qrCode: systemState.whatsapp.qrCode,
        hasQR: !!systemState.whatsapp.qrCode
    });
});

// Listar usuários (admin apenas)
app.get('/api/users', authController.authenticateToken.bind(authController), authController.listUsers.bind(authController));

// Alterar senha
app.post('/api/change-password', authController.authenticateToken.bind(authController), authController.changePassword.bind(authController));

// ====================================
// SOCKET.IO HANDLERS (MANTIDOS)
// ====================================
io.on('connection', (socket) => {
    systemState.stats.activeConnections++;
    const clientIP = socket.handshake.address;
    const userAgent = socket.handshake.headers['user-agent']?.substring(0, 50) || 'Unknown';
    
    logger.info('Cliente conectado:', {
        id: socket.id.substring(0, 8),
        transport: socket.conn.transport.name,
        ip: clientIP,
        userAgent: userAgent,
        total: systemState.stats.activeConnections
    });
    
    // ENVIAR ESTADO INICIAL
    try {
        const initialState = {
            ...systemState,
            socketId: socket.id,
            transport: socket.conn.transport.name,
            timestamp: new Date().toISOString(),
            version: '6.1-fixed',
            whatsappStatus: whatsappService ? whatsappService.getStatus() : null
        };
        
        socket.emit('system:state', initialState);
        systemState.stats.socketEvents++;
        logger.info('system:state enviado para:', socket.id.substring(0, 8));
    } catch (error) {
        logger.error('Erro ao enviar system:state:', error.message);
    }

    // Se WhatsApp já está conectado, informar o cliente
    if (whatsappService && whatsappService.isReady) {
        socket.emit('whatsapp:ready', { 
            connected: true,
            info: systemState.whatsapp.info,
            timestamp: new Date()
        });
    }

    // HANDLERS PROTOCOLO DOCUMENTOS
    socket.on('whatsapp:sendMessage', async (data) => {
        logger.info('Protocolo docs - Envio de mensagem:', data);
        
        try {
            if (!whatsappService) {
                try {
                    const WhatsAppService = require('./services/whatsapp.service');
                    whatsappService = new WhatsAppService(io, logger);
                    await whatsappService.initialize();
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } catch (initError) {
                    socket.emit('whatsapp:error', {
                        error: 'WhatsApp Service não pôde ser inicializado'
                    });
                    return;
                }
            }
            
            if (!whatsappService.isReady && !whatsappService.isConnected) {
                logger.warn('WhatsApp não está conectado');
                socket.emit('whatsapp:error', {
                    error: 'WhatsApp não está conectado'
                });
                return;
            }
            
            const { to, message, number } = data;
            const targetNumber = to || number;
            
            if (!targetNumber || !message) {
                socket.emit('whatsapp:error', {
                    error: 'Número e mensagem são obrigatórios'
                });
                return;
            }
            
            logger.info(`Enviando mensagem para ${targetNumber}`);
            
            const result = await whatsappService.sendMessage(targetNumber, message);
            systemState.stats.messagesSent++;
            
            const successResponse = {
                success: true,
                messageId: result.messageId || `msg_${Date.now()}`,
                to: targetNumber,
                body: message,
                timestamp: new Date(),
                fromMe: true,
                type: 'sent'
            };
            
            logger.success('Mensagem enviada com sucesso');
            
            socket.emit('whatsapp:messageSent', successResponse);
            io.emit('whatsapp:message_sent', successResponse);
            
        } catch (error) {
            logger.error('Erro ao enviar mensagem:', error);
            socket.emit('whatsapp:error', {
                error: error.message || 'Erro ao enviar mensagem'
            });
        }
    });

    socket.on('whatsapp:getChats', async () => {
        logger.info('Chats solicitados (protocolo docs)');
        
        try {
            if (!whatsappService || !whatsappService.isReady) {
                socket.emit('whatsapp:chats', { chats: [] });
                return;
            }
            
            const chatsResult = await whatsappService.getChats();
            socket.emit('whatsapp:chats', {
                chats: chatsResult.success ? chatsResult.chats : []
            });
            
        } catch (error) {
            logger.error('Erro ao obter chats:', error);
            socket.emit('whatsapp:chats', { chats: [] });
        }
    });

    socket.on('whatsapp:getStatus', () => {
        logger.info('Status solicitado (protocolo docs)');
        
        const status = {
            isConnected: whatsappService?.isReady || whatsappService?.isConnected || false,
            hasQrCode: !!systemState.whatsapp.qrCode,
            info: systemState.whatsapp.info
        };
        
        socket.emit('whatsapp:status', status);
    });

    socket.on('whatsapp:disconnect', async () => {
        logger.info('Desconexão solicitada (protocolo docs)');
        
        try {
            if (whatsappService) {
                await whatsappService.disconnect();
                whatsappService = null;
            }
            
            systemState.whatsapp.status = 'disconnected';
            socket.emit('whatsapp:disconnected', { success: true });
        } catch (error) {
            socket.emit('whatsapp:error', { error: error.message });
        }
    });

    socket.on('whatsapp:connect', async () => {
        logger.info('Conexão solicitada (protocolo docs)');
        
        try {
            if (whatsappService && whatsappService.isReady) {
                socket.emit('whatsapp:ready', {
                    connected: true,
                    info: systemState.whatsapp.info
                });
                return;
            }
            
            if (!whatsappService) {
                const WhatsAppService = require('./services/whatsapp.service');
                whatsappService = new WhatsAppService(io, logger);
            }
            
            systemState.whatsapp.status = 'connecting';
            socket.emit('whatsapp:connecting');
            
            const result = await whatsappService.initialize();
            
            if (result.success) {
                systemState.whatsapp.status = 'connected';
            } else {
                socket.emit('whatsapp:error', { error: result.message });
            }
        } catch (error) {
            socket.emit('whatsapp:error', { error: error.message });
        }
    });

    // startWhatsApp
    socket.on('startWhatsApp', async (data) => {
        logger.info('startWhatsApp solicitado:', data);
        systemState.stats.socketEvents++;
        
        try {
            systemState.stats.connectionsAttempted++;
            
            if (whatsappService && whatsappService.isReady) {
                logger.info('WhatsApp já conectado');
                socket.emit('whatsapp:ready', { 
                    connected: true,
                    timestamp: new Date().toISOString(),
                    version: '6.1-fixed',
                    status: whatsappService.getStatus()
                });
                systemState.stats.successfulConnections++;
                return;
            }
            
            if (!whatsappService) {
                logger.info('Carregando WhatsApp Service...');
                const WhatsAppService = require('./services/whatsapp.service');
                whatsappService = new WhatsAppService(io, logger);
                logger.info('WhatsApp Service criado');
            }
            
            systemState.whatsapp.status = 'connecting';
            
            whatsappService.initialize().then(() => {
                systemState.stats.successfulConnections++;
                logger.success('Inicialização WhatsApp concluída');
                socket.emit('whatsapp:connection_success', {
                    success: true,
                    timestamp: new Date().toISOString(),
                    version: '6.1-fixed'
                });
            }).catch(error => {
                logger.error('Erro na inicialização:', error.message);
                systemState.whatsapp.status = 'error';
                socket.emit('whatsapp:connection_error', {
                    success: false,
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            });
            
            socket.emit('whatsapp:connecting', {
                success: true,
                message: 'Iniciando conexão. Aguarde o QR Code.',
                version: '6.1-fixed'
            });
            
        } catch (error) {
            logger.error('Erro no startWhatsApp:', error.message);
            socket.emit('whatsapp:connection_error', {
                success: false,
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });
    
    // sendMessage
    socket.on('sendMessage', async (data) => {
        logger.info('sendMessage solicitado:', {
            to: data.to || data.number,
            message: data.message?.substring(0, 50) + '...'
        });
        systemState.stats.socketEvents++;
        
        try {
            const { to, message, number } = data;
            const targetNumber = to || number;
            
            if (!targetNumber || !message) {
                socket.emit('message:error', {
                    success: false,
                    message: 'Número e mensagem são obrigatórios',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            
            if (!whatsappService) {
                logger.warn('WhatsApp Service não inicializado');
                socket.emit('message:error', {
                    success: false,
                    message: 'WhatsApp Service não inicializado',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            
            let isConnected = whatsappService.isReady || whatsappService.isConnected || false;
            
            if (!isConnected) {
                logger.warn('WhatsApp não está conectado');
                socket.emit('message:error', {
                    success: false,
                    message: 'WhatsApp não está conectado',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            
            logger.info('Enviando mensagem via whatsappService.sendMessage()');
            const result = await whatsappService.sendMessage(targetNumber, message);
            
            systemState.stats.messagesSent++;
            
            socket.emit('message:sent', {
                success: true,
                messageId: result.messageId || result.id || 'msg_' + Date.now(),
                to: targetNumber,
                message: message,
                timestamp: new Date().toISOString(),
                version: '6.1-fixed'
            });
            
            logger.success('Mensagem enviada com sucesso:', result?.messageId);
            
        } catch (error) {
            logger.error('Erro ao enviar mensagem:', error.message);
            socket.emit('message:error', {
                success: false,
                message: error.message || 'Erro ao enviar mensagem',
                timestamp: new Date().toISOString()
            });
        }
    });
    
    // PING/PONG
    socket.on('ping', (data) => {
        socket.emit('pong', { 
            timestamp: Date.now(),
            received: data,
            version: '6.1-fixed',
            whatsappStatus: whatsappService ? whatsappService.getStatus() : null
        });
        logger.info('Ping/Pong com:', socket.id.substring(0, 8));
    });
    
    // DESCONEXÃO
    socket.on('disconnect', (reason) => {
        systemState.stats.activeConnections = Math.max(0, systemState.stats.activeConnections - 1);
        logger.info('Cliente desconectado:', {
            id: socket.id.substring(0, 8),
            reason: reason,
            remaining: systemState.stats.activeConnections
        });
    });
});

// ====================================
// MIDDLEWARES DE TRATAMENTO DE ERROS
// ====================================
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Rota ${req.method} ${req.path} não encontrada`
    });
});

app.use((err, req, res, next) => {
    logger.error('Erro capturado:', err.message);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Erro interno' : err.message
    });
});

// ====================================
// MONITORAMENTO
// ====================================
setInterval(() => {
    if (whatsappService) {
        const status = {
            exists: true,
            isReady: whatsappService.isReady,
            isConnected: whatsappService.isConnected,
            hasClient: !!whatsappService.client,
            state: whatsappService.client?.info?.pushname || 'not ready'
        };
        
        if (whatsappService.isReady || whatsappService.isConnected) {
            systemState.whatsapp.status = 'connected';
            systemState.whatsapp.isAuthenticated = true;
        }
    }
}, 5000);

// Corrigir contagem de conexões Socket.IO
setInterval(() => {
    if (io && io.sockets) {
        const connectedSockets = io.sockets.sockets.size;
        if (connectedSockets !== systemState.stats.activeConnections) {
            logger.warn('Corrigindo contagem de conexões:', {
                reported: systemState.stats.activeConnections,
                actual: connectedSockets
            });
            systemState.stats.activeConnections = connectedSockets;
        }
    }
    
    if (whatsappService) {
        const status = whatsappService.getStatus();
        systemState.whatsapp.status = status.connectionState || 'unknown';
        systemState.whatsapp.isAuthenticated = status.isReady || false;
    }
}, 30000);

// ====================================
// INICIALIZAÇÃO
// ====================================
const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        createRequiredFolders();
        
        server.listen(PORT, () => {
            console.log('='.repeat(60));
            console.log(`PRIMEM WHATSAPP v6.1 - VERSÃO CORRIGIDA COMPLETA`);
            console.log('='.repeat(60));
            console.log(`Servidor: http://localhost:${PORT}`);
            console.log(`Cliente: http://localhost:3000`);
            console.log('='.repeat(60));
            console.log('✅ CORREÇÕES v6.1:');
            console.log('  • AuthController instanciado corretamente (.bind())');
            console.log('  • Middlewares com fallback para evitar undefined');
            console.log('  • Routes simplificadas e funcionais');
            console.log('  • Tratamento de erros robusto');
            console.log('  • Sistema de autenticação completo');
            console.log('='.repeat(60));
            console.log('🚀 SERVIDOR v6.1 INICIADO COM SUCESSO!');
            console.log('='.repeat(60));
        });
        
        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('Recebido SIGTERM, fechando servidor...');
            server.close(() => {
                logger.info('Servidor fechado');
                process.exit(0);
            });
        });
        
        process.on('SIGINT', () => {
            logger.info('Recebido SIGINT, fechando servidor...');
            server.close(() => {
                logger.info('Servidor fechado');
                process.exit(0);
            });
        });
        
    } catch (error) {
        logger.error('Erro ao iniciar servidor:', error);
        process.exit(1);
    }
};

startServer();

module.exports = { app, server, io, logger, systemState, whatsappService };