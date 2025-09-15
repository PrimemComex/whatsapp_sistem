// server/services/whatsapp.service.js
// VERSÃO 5.4 FINAL - TODAS SOLUÇÕES + ENVIO DE ÁUDIOS OTIMIZADO
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const os = require('os');

class WhatsAppService {
    constructor(io, logger) {
        this.client = null;
        this.io = io;
        this.logger = logger;
        this.isReady = false;
        this.qrCode = null;
        this.sessionName = 'primem-session-v5';
        this.messageHistory = {};
        this.initializationError = null;
        this.debugMode = true; // ATIVAR DEBUG COMPLETO
        this.initStartTime = null;
        this.initSteps = [];
        
        // LOGS DE INICIALIZAÇÃO - CONFIRMAÇÃO DE MÉTODOS
        console.log('✅ WhatsAppService v5.4 inicializado com métodos:');
        console.log('  - sendMessage:', typeof this.sendMessage === 'function');
        console.log('  - sendMedia:', typeof this.sendMedia === 'function');
        console.log('  - sendFile:', typeof this.sendFile === 'function');
        console.log('  - sendAudio:', typeof this.sendAudio === 'function');
        console.log('  - getChats:', typeof this.getChats === 'function');
        console.log('  - getChatMessages:', typeof this.getChatMessages === 'function');
        console.log('  - getDebugInfo:', typeof this.getDebugInfo === 'function');
        console.log('🎯 PROBLEMA availableMethods RESOLVIDO!');
    }

    // Função auxiliar para logging detalhado
    logStep(step, data = {}) {
        const elapsed = this.initStartTime ? Date.now() - this.initStartTime : 0;
        const logEntry = {
            step,
            elapsed: `${elapsed}ms`,
            timestamp: new Date().toISOString(),
            ...data
        };
        
        this.initSteps.push(logEntry);
        
        if (this.debugMode) {
            console.log(`\n📊 [DEBUG ${elapsed}ms] ${step}`);
            if (Object.keys(data).length > 0) {
                console.log('   📁 Detalhes:', JSON.stringify(data, null, 2));
            }
        }
    }

    async checkEnvironment() {
        this.logger.info('📁 DIAGNÓSTICO DO AMBIENTE...');
        
        const diagnostics = {
            node: process.version,
            platform: process.platform,
            arch: process.arch,
            memory: `${Math.round(os.freemem() / 1024 / 1024)}MB livres de ${Math.round(os.totalmem() / 1024 / 1024)}MB`,
            cpus: os.cpus().length,
            uptime: os.uptime()
        };
        
        this.logger.info('📊 Sistema:', diagnostics);
        
        // Verificar Puppeteer
        try {
            const puppeteer = require('puppeteer');
            const browser = await puppeteer.launch({ 
                headless: true,
                args: ['--no-sandbox']
            });
            const version = await browser.version();
            await browser.close();
            this.logger.success(`✅ Puppeteer OK - Chrome: ${version}`);
            diagnostics.chrome = version;
        } catch (e) {
            this.logger.error('❌ Problema com Puppeteer:', e.message);
            diagnostics.puppeteerError = e.message;
        }
        
        // Verificar pasta de sessão
        const sessionPath = path.join(__dirname, '../../sessions');
        const wwebjsCache = path.join(__dirname, '../../.wwebjs_cache');
        const wwebjsAuth = path.join(__dirname, '../../.wwebjs_auth');
        
        diagnostics.paths = {
            session: fs.existsSync(sessionPath),
            cache: fs.existsSync(wwebjsCache),
            auth: fs.existsSync(wwebjsAuth)
        };
        
        this.logger.info('📁 Pastas:', diagnostics.paths);
        
        return diagnostics;
    }

    async clearAllSessions() {
        this.logger.warning('🧹 Limpando TODAS as sessões e caches...');
        
        const pathsToClean = [
            path.join(__dirname, '../../sessions'),
            path.join(__dirname, '../../.wwebjs_cache'),
            path.join(__dirname, '../../.wwebjs_auth'),
            path.join(__dirname, '../../wwebjs_auth'),
            path.join(__dirname, '../../wwebjs_cache')
        ];
        
        for (const dirPath of pathsToClean) {
            if (fs.existsSync(dirPath)) {
                try {
                    fs.rmSync(dirPath, { recursive: true, force: true });
                    this.logger.info(`🗑️ Removido: ${path.basename(dirPath)}`);
                } catch (e) {
                    this.logger.error(`❌ Erro ao remover ${dirPath}:`, e.message);
                }
            }
        }
        
        // Recriar pasta sessions
        const sessionPath = path.join(__dirname, '../../sessions');
        fs.mkdirSync(sessionPath, { recursive: true });
        this.logger.success('✅ Pastas limpas e recriadas');
    }

    async initialize() {
        try {
            this.initStartTime = Date.now();
            this.logger.info('🚀 INICIANDO WHATSAPP v5.4 COM DIAGNÓSTICO...');
            
            // PASSO 1: Diagnóstico do ambiente
            this.logStep('1. Verificando ambiente');
            const diagnostics = await this.checkEnvironment();
            
            // PASSO 2: Limpar sessões antigas (força nova conexão)
            this.logStep('2. Limpando sessões antigas');
            await this.clearAllSessions();
            
            // PASSO 3: Configurar Puppeteer
            this.logStep('3. Configurando Puppeteer');
            const puppeteerConfig = {
                headless: true, // Mude para false se quiser ver o navegador
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process', // Adicionar para Windows
                    '--disable-gpu',
                    '--disable-extensions',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=site-per-process', // Importante para Windows
                    '--window-size=1920,1080'
                ]
            };
            
            // Para Windows, não especificar executablePath (deixa Puppeteer encontrar)
            if (process.platform !== 'win32') {
                puppeteerConfig.executablePath = '/usr/bin/chromium-browser';
            }
            
            this.logger.info('🔧 Configuração Puppeteer:', {
                headless: puppeteerConfig.headless,
                args: puppeteerConfig.args.length + ' argumentos'
            });
            
            // PASSO 4: Criar cliente WhatsApp
            this.logStep('4. Criando cliente WhatsApp');
            
            this.client = new Client({
                authStrategy: new LocalAuth({
                    clientId: this.sessionName,
                    dataPath: path.join(__dirname, '../../sessions')
                }),
                puppeteer: puppeteerConfig,
                // Remover webVersionCache temporariamente para teste
                // webVersionCache: {
                //     type: 'remote',
                //     remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
                // }
            });
            
            // PASSO 5: Configurar eventos
            this.logStep('5. Configurando eventos');
            this.setupEventHandlers();
            
            // PASSO 6: Adicionar eventos de debug
            this.logStep('6. Adicionando eventos de debug');
            
            // Evento de carregamento
            this.client.on('loading_screen', (percent, message) => {
                this.logStep(`Loading: ${percent}%`, { message });
            });
            
            // Evento de mudança de estado
            this.client.on('change_state', (state) => {
                this.logStep(`Estado mudou para: ${state}`);
            });
            
            // PASSO 7: Inicializar com timeout maior
            this.logStep('7. Inicializando cliente (timeout: 120s)');
            
            const initTimeout = setTimeout(() => {
                this.logger.error('❌ TIMEOUT ESTENDIDO (120 segundos)');
                this.logger.error('📊 Passos completados:', this.initSteps);
                
                // Emitir diagnóstico completo
                this.io.emit('whatsapp:error', { 
                    error: 'Timeout na inicialização - Verifique o diagnóstico',
                    diagnostics: diagnostics,
                    steps: this.initSteps
                });
                
                // Sugestões de solução
                this.logger.warning('💡 POSSÍVEIS SOLUÇÕES:');
                this.logger.warning('1. Desative antivírus temporariamente');
                this.logger.warning('2. Execute como Administrador');
                this.logger.warning('3. Verifique firewall/proxy');
                this.logger.warning('4. Tente com headless: false para ver o navegador');
                this.logger.warning('5. Reinstale o Puppeteer: npm uninstall puppeteer && npm install puppeteer@21.11.0');
            }, 120000); // 120 segundos
            
            // Tentar inicializar
            await this.client.initialize();
            
            clearTimeout(initTimeout);
            this.logStep('8. Cliente inicializado com sucesso!');
            this.logger.success('✅ WhatsApp Web.js inicializado!');
            
            // Salvar log de sucesso
            this.saveDebugLog('success');
            
        } catch (error) {
            this.logStep('ERRO NA INICIALIZAÇÃO', {
                message: error.message,
                stack: error.stack
            });
            
            this.logger.error('❌ ERRO CRÍTICO:', error);
            this.logger.error('📊 Passos antes do erro:', this.initSteps);
            
            // Salvar log de erro
            this.saveDebugLog('error', error);
            
            // Sugestões baseadas no erro
            if (error.message.includes('Failed to launch')) {
                this.logger.warning('💡 Chrome não conseguiu iniciar. Tente:');
                this.logger.warning('npm uninstall puppeteer');
                this.logger.warning('npm install puppeteer@21.11.0');
            }
            
            if (error.message.includes('Protocol error')) {
                this.logger.warning('💡 Erro de protocolo. Limpe o cache:');
                this.logger.warning('rmdir /s /q .wwebjs_cache');
                this.logger.warning('rmdir /s /q sessions');
            }
            
            this.initializationError = error.message;
            
            this.io.emit('whatsapp:error', { 
                error: error.message,
                details: error.stack,
                steps: this.initSteps
            });
            
            throw error;
        }
    }

    saveDebugLog(status, error = null) {
        const logDir = path.join(__dirname, '../../logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logFile = path.join(logDir, `whatsapp-init-${status}-${timestamp}.json`);
        
        const logData = {
            status,
            timestamp: new Date().toISOString(),
            duration: Date.now() - this.initStartTime,
            steps: this.initSteps,
            error: error ? {
                message: error.message,
                stack: error.stack
            } : null,
            environment: {
                node: process.version,
                platform: process.platform,
                arch: process.arch
            }
        };
        
        fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
        this.logger.info(`📁 Log salvo em: ${logFile}`);
    }

    setupEventHandlers() {
        // QR Code
        this.client.on('qr', async (qr) => {
            try {
                this.logStep('QR Code gerado!');
                this.logger.success('📱 QR CODE GERADO! Escaneie com seu WhatsApp');
                
                console.log('\n' + '='.repeat(50));
                console.log('📱 QR CODE DISPONÍVEL!');
                console.log('1. Abra o WhatsApp no celular');
                console.log('2. Vá em Configurações > Aparelhos conectados');
                console.log('3. Clique em "Conectar um aparelho"');
                console.log('4. Escaneie o QR Code');
                console.log('='.repeat(50) + '\n');
                
                // Gerar QR Code base64
                const qrCodeBase64 = await qrcode.toDataURL(qr, {
                    width: 256,
                    margin: 2
                });
                
                this.qrCode = qrCodeBase64;
                
                // Emitir para o frontend
                this.io.emit('whatsapp:qr', { 
                    qrCode: qrCodeBase64 
                });
                
                // Imprimir no terminal
                const qrcodeTerminal = require('qrcode-terminal');
                qrcodeTerminal.generate(qr, { small: true });
                
            } catch (error) {
                this.logger.error('Erro ao gerar QR Code:', error);
            }
        });

        // Autenticado
        this.client.on('authenticated', () => {
            this.logStep('Autenticado com sucesso!');
            this.logger.success('🔐 WhatsApp autenticado!');
            this.io.emit('whatsapp:authenticated');
        });

        // Falha na autenticação
        this.client.on('auth_failure', (msg) => {
            this.logStep('Falha na autenticação', { message: msg });
            this.logger.error('❌ Falha na autenticação:', msg);
            this.io.emit('whatsapp:auth_failure', { message: msg });
            
            // Limpar sessão corrompida
            this.clearSession();
        });

        // Pronto
        this.client.on('ready', async () => {
            this.isReady = true;
            this.qrCode = null;
            
            this.logStep('WhatsApp pronto!');
            this.logger.success('✅ WhatsApp conectado e pronto!');
            
            // Obter informações do usuário
            let userInfo = {
                number: 'connected',
                name: 'WhatsApp User',
                pushname: 'User'
            };
            
            try {
                const info = this.client.info;
                if (info) {
                    userInfo = {
                        number: info.wid ? info.wid.user : 'connected',
                        name: info.pushname || 'WhatsApp User',
                        pushname: info.pushname || 'User',
                        wid: info.wid
                    };
                    this.logger.info(`📱 Conectado como: ${userInfo.pushname} (${userInfo.number})`);
                }
            } catch (e) {
                this.logger.info('WhatsApp conectado (sem detalhes do usuário)');
            }
            
            this.io.emit('whatsapp:ready', {
                info: userInfo,
                timestamp: new Date()
            });
        });

        // Desconectado
        this.client.on('disconnected', (reason) => {
            this.isReady = false;
            this.logStep('Desconectado', { reason });
            this.logger.warning('🔵 WhatsApp desconectado:', reason);
            this.io.emit('whatsapp:disconnected', { reason });
        });

        // Mensagem recebida - COM TRATAMENTO OTIMIZADO DE MÍDIA
        this.client.on('message', async (message) => {
            try {
                const contact = await message.getContact();
                
                const messageData = {
                    id: message.id._serialized,
                    from: message.from,
                    body: message.body || '',
                    timestamp: message.timestamp * 1000,
                    fromMe: message.fromMe,
                    hasMedia: message.hasMedia,
                    type: message.type, // Importante para identificar áudios
                    contact: {
                        name: contact.name || contact.pushname || contact.number,
                        number: contact.number,
                        pushname: contact.pushname
                    }
                };
                
                // Processar mídia se existir - TRATAMENTO ESPECIAL PARA ÁUDIOS
                if (message.hasMedia) {
                    this.logger.info(`📎 Processando mídia recebida: ${message.type}`);
                    try {
                        const media = await message.downloadMedia();
                        if (media && media.data) {
                            const mediaInfo = await this.saveMediaFile(media, message.id.id, message.type);
                            if (mediaInfo) {
                                messageData.media = mediaInfo;
                                
                                // Log específico para áudios
                                if (message.type === 'ptt' || message.type === 'audio') {
                                    this.logger.success(`🎤 Áudio salvo: ${mediaInfo.filename} (${mediaInfo.sizeFormatted})`);
                                } else {
                                    this.logger.success(`✅ Mídia salva: ${mediaInfo.filename} (${mediaInfo.sizeFormatted})`);
                                }
                            }
                        }
                    } catch (mediaError) {
                        this.logger.error('Erro ao processar mídia:', mediaError);
                    }
                }
                
                // Log diferenciado por tipo
                let logMessage = `📩 Mensagem de ${messageData.contact.name}:`;
                if (message.type === 'ptt') {
                    logMessage += ' [ÁUDIO]';
                } else if (message.type === 'audio') {
                    logMessage += ' [MÚSICA]';
                } else if (message.hasMedia) {
                    logMessage += ' [MÍDIA]';
                } else {
                    logMessage += ` ${message.body?.substring(0, 50) || ''}`;
                }
                
                this.logger.whatsapp(logMessage);
                
                // Emitir mensagem
                this.io.emit('whatsapp:message_received', messageData);
                
            } catch (error) {
                this.logger.error('Erro ao processar mensagem:', error);
            }
        });

        // Erro geral
        this.client.on('error', (error) => {
            this.logStep('Erro no WhatsApp', { 
                message: error.message,
                code: error.code 
            });
            this.logger.error('❌ Erro no WhatsApp:', error);
            this.io.emit('whatsapp:error', { error: error.message });
        });
    }

    async saveMediaFile(media, messageId, messageType = null) {
        try {
            const uploadsDir = path.join(__dirname, '../../uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Determinar extensão - TRATAMENTO ESPECIAL PARA ÁUDIOS
            let ext = 'bin';
            if (media.mimetype) {
                const parts = media.mimetype.split('/');
                if (parts[1]) {
                    ext = parts[1].split(';')[0];
                }
            }
            
            // Corrigir extensões comuns + ÁUDIOS WHATSAPP
            if (ext === 'jpeg') ext = 'jpg';
            if (ext === 'quicktime') ext = 'mov';
            if (ext === 'ogg' && messageType === 'ptt') ext = 'ogg'; // Áudio WhatsApp
            if (ext === 'opus' && messageType === 'ptt') ext = 'ogg'; // Converter opus para ogg
            if (messageType === 'ptt' && !ext.includes('ogg')) ext = 'ogg'; // Forçar .ogg para áudios WhatsApp
            
            const filename = `${Date.now()}_${messageId}.${ext}`;
            const filepath = path.join(uploadsDir, filename);
            
            // Salvar arquivo
            const buffer = Buffer.from(media.data, 'base64');
            fs.writeFileSync(filepath, buffer);
            
            // Determinar tipo de mídia
            let mediaType = 'file';
            if (messageType === 'ptt') {
                mediaType = 'audio';
            } else if (media.mimetype) {
                mediaType = media.mimetype.split('/')[0];
            }
            
            return {
                filename: filename,
                mimetype: media.mimetype || 'application/octet-stream',
                size: buffer.length,
                sizeFormatted: `${(buffer.length / 1024).toFixed(2)} KB`,
                url: `/uploads/${filename}`,
                type: mediaType,
                messageType: messageType, // Manter tipo original da mensagem
                isAudio: messageType === 'ptt' || messageType === 'audio'
            };
            
        } catch (error) {
            this.logger.error('Erro ao salvar arquivo:', error);
            return null;
        }
    }

    // ====================================
    // MÉTODO PRINCIPAL: sendMessage (texto)
    // ====================================
    async sendMessage(number, message, media = null) {
        console.log('📤 ====== SENDMESSAGE CHAMADO ======');
        console.log('📞 Número:', number);
        console.log('📝 Mensagem:', message);
        console.log('📁 Mídia:', media);

        if (!this.isReady) {
            throw new Error('WhatsApp não está conectado');
        }

        try {
            // Formatar número
            let chatId = number;
            if (!chatId.includes('@')) {
                chatId = chatId.replace(/\D/g, '');
                if (!chatId.startsWith('55')) {
                    chatId = '55' + chatId;
                }
                chatId = chatId + '@c.us';
            }
            
            let sentMessage;
            
            if (media) {
                // Enviar com mídia (método antigo mantido para compatibilidade)
                const mediaMessage = MessageMedia.fromFilePath(media);
                sentMessage = await this.client.sendMessage(chatId, mediaMessage, { 
                    caption: message || '' 
                });
                this.logger.success(`✅ Arquivo enviado para ${number}`);
            } else {
                // Enviar apenas texto
                sentMessage = await this.client.sendMessage(chatId, message);
                this.logger.success(`✅ Mensagem enviada para ${number}`);
            }
            
            return {
                success: true,
                messageId: sentMessage.id._serialized,
                to: chatId
            };
            
        } catch (error) {
            this.logger.error('Erro ao enviar mensagem:', error);
            throw error;
        }
    }

    // ====================================
    // MÉTODO OTIMIZADO: sendMedia (arquivos/áudios)
    // ====================================
    async sendMedia(number, filePath, caption = '') {
        console.log('📤 ====== SENDMEDIA CHAMADO ======');
        console.log('📞 Número:', number);
        console.log('📁 Arquivo:', filePath);
        console.log('📝 Legenda:', caption);
        
        if (!this.isReady) {
            throw new Error('WhatsApp não está conectado');
        }

        try {
            // Verificar se arquivo existe
            if (!fs.existsSync(filePath)) {
                throw new Error(`Arquivo não encontrado: ${filePath}`);
            }

            // Verificar tipo de arquivo - TRATAMENTO ESPECIAL PARA ÁUDIOS
            const ext = path.extname(filePath).toLowerCase();
            const isAudio = ['.mp3', '.ogg', '.opus', '.wav', '.m4a', '.aac'].includes(ext);
            
            if (isAudio) {
                console.log('🎤 DETECTADO: Arquivo de áudio');
            }

            // Formatar número (mesmo código do sendMessage)
            let chatId = number;
            if (!chatId.includes('@')) {
                chatId = chatId.replace(/\D/g, '');
                if (!chatId.startsWith('55')) {
                    chatId = '55' + chatId;
                }
                chatId = chatId + '@c.us';
            }

            console.log('📱 Chat ID formatado:', chatId);

            // Criar MessageMedia
            const media = MessageMedia.fromFilePath(filePath);
            console.log('📦 Mídia criada:', {
                mimetype: media.mimetype,
                filename: media.filename,
                isAudio: isAudio
            });

            // OPÇÕES ESPECÍFICAS PARA ÁUDIOS
            let sendOptions = {};
            
            if (caption && caption.trim()) {
                sendOptions.caption = caption;
            }
            
            // Para áudios, pode adicionar sendAudioAsVoice se quiser que apareça como voice note
            if (isAudio && ext === '.ogg') {
                sendOptions.sendAudioAsVoice = true;
            }

            // Enviar mensagem
            const sentMessage = await this.client.sendMessage(chatId, media, sendOptions);

            console.log('✅ Mensagem enviada:', sentMessage.id._serialized);

            if (isAudio) {
                this.logger.success(`🎤 Áudio enviado para ${number}: ${path.basename(filePath)}`);
            } else {
                this.logger.success(`📎 Arquivo enviado para ${number}: ${path.basename(filePath)}`);
            }

            return {
                success: true,
                messageId: sentMessage.id._serialized,
                to: chatId,
                timestamp: sentMessage.timestamp,
                fileType: isAudio ? 'audio' : 'file'
            };

        } catch (error) {
            console.error('❌ Erro no sendMedia:', error);
            this.logger.error('Erro ao enviar arquivo:', error);
            throw error;
        }
    }

    // ====================================
    // MÉTODO ESPECÍFICO: sendAudio (otimizado para áudios)
    // ====================================
    async sendAudio(number, audioPath, caption = '') {
        console.log('🎤 ====== SENDAUDIO CHAMADO ======');
        console.log('📞 Número:', number);
        console.log('🎵 Áudio:', audioPath);
        console.log('📝 Legenda:', caption);
        
        if (!this.isReady) {
            throw new Error('WhatsApp não está conectado');
        }

        try {
            // Verificar se arquivo de áudio existe
            if (!fs.existsSync(audioPath)) {
                throw new Error(`Arquivo de áudio não encontrado: ${audioPath}`);
            }

            const ext = path.extname(audioPath).toLowerCase();
            const audioExtensions = ['.mp3', '.ogg', '.opus', '.wav', '.m4a', '.aac'];
            
            if (!audioExtensions.includes(ext)) {
                throw new Error(`Formato de áudio não suportado: ${ext}. Use: ${audioExtensions.join(', ')}`);
            }

            // Formatar número
            let chatId = number;
            if (!chatId.includes('@')) {
                chatId = chatId.replace(/\D/g, '');
                if (!chatId.startsWith('55')) {
                    chatId = '55' + chatId;
                }
                chatId = chatId + '@c.us';
            }

            // Criar MessageMedia com configuração otimizada para áudio
            const media = MessageMedia.fromFilePath(audioPath);
            
            // Forçar mimetype para áudio se necessário
            if (!media.mimetype || !media.mimetype.startsWith('audio/')) {
                if (ext === '.mp3') media.mimetype = 'audio/mpeg';
                if (ext === '.ogg') media.mimetype = 'audio/ogg';
                if (ext === '.wav') media.mimetype = 'audio/wav';
                if (ext === '.m4a') media.mimetype = 'audio/mp4';
                if (ext === '.aac') media.mimetype = 'audio/aac';
            }

            console.log('🎵 Mídia de áudio criada:', {
                mimetype: media.mimetype,
                filename: media.filename,
                extension: ext
            });

            // Opções para envio de áudio
            const audioOptions = {
                sendAudioAsVoice: ext === '.ogg', // .ogg como voice note
            };

            if (caption && caption.trim()) {
                audioOptions.caption = caption;
            }

            // Enviar áudio
            const sentMessage = await this.client.sendMessage(chatId, media, audioOptions);

            console.log('✅ Áudio enviado:', sentMessage.id._serialized);
            this.logger.success(`🎤 Áudio enviado para ${number}: ${path.basename(audioPath)}`);

            return {
                success: true,
                messageId: sentMessage.id._serialized,
                to: chatId,
                timestamp: sentMessage.timestamp,
                fileType: 'audio',
                extension: ext
            };

        } catch (error) {
            console.error('❌ Erro no sendAudio:', error);
            this.logger.error('Erro ao enviar áudio:', error);
            throw error;
        }
    }

    // ====================================
    // MÉTODO ALIAS: sendFile (compatibilidade)
    // ====================================
    async sendFile(number, filePath, caption = '') {
        // Alias para sendMedia para manter compatibilidade
        console.log('📎 sendFile redirecionando para sendMedia...');
        return await this.sendMedia(number, filePath, caption);
    }

    // ====================================
    // MÉTODO DE DEBUG: getDebugInfo
    // ====================================
    getDebugInfo() {
        const methods = {
            sendMessage: typeof this.sendMessage === 'function',
            sendMedia: typeof this.sendMedia === 'function',
            sendFile: typeof this.sendFile === 'function',
            sendAudio: typeof this.sendAudio === 'function',
            getChats: typeof this.getChats === 'function',
            getChatMessages: typeof this.getChatMessages === 'function'
        };

        return {
            isReady: this.isReady,
            hasClient: !!this.client,
            clientState: this.client?.info?.wid || 'no_wid',
            availableMethods: Object.keys(methods).filter(key => methods[key]),
            methodsStatus: methods,
            sessionName: this.sessionName,
            debugMode: this.debugMode,
            hasQrCode: !!this.qrCode,
            initSteps: this.initSteps?.length || 0,
            version: '5.4-final'
        };
    }

    // ====================================
    // MÉTODOS DE GESTÃO
    // ====================================
    
    async getChats() {
        if (!this.isReady) {
            return [];
        }
        
        try {
            const chats = await this.client.getChats();
            return chats.slice(0, 50).map(chat => ({
                id: chat.id._serialized,
                name: chat.name || 'Sem nome',
                isGroup: chat.isGroup,
                unreadCount: chat.unreadCount || 0,
                timestamp: chat.timestamp,
                lastMessage: chat.lastMessage?.body || ''
            }));
        } catch (error) {
            this.logger.error('Erro ao obter chats:', error);
            return [];
        }
    }

    async getChatMessages(chatId) {
        if (!this.isReady) {
            return [];
        }
        
        try {
            const chat = await this.client.getChatById(chatId);
            const messages = await chat.fetchMessages({ limit: 50 });
            
            return messages.map(msg => ({
                id: msg.id._serialized,
                body: msg.body,
                from: msg.from,
                to: msg.to,
                timestamp: msg.timestamp * 1000,
                fromMe: msg.fromMe,
                hasMedia: msg.hasMedia,
                type: msg.type
            }));
        } catch (error) {
            this.logger.error('Erro ao obter mensagens:', error);
            return [];
        }
    }

    clearSession() {
        const sessionPath = path.join(__dirname, '../../sessions');
        if (fs.existsSync(sessionPath)) {
            try {
                fs.rmSync(sessionPath, { recursive: true, force: true });
                fs.mkdirSync(sessionPath, { recursive: true });
                this.logger.info('🗑️ Sessão limpa com sucesso');
            } catch (error) {
                this.logger.error('Erro ao limpar sessão:', error);
            }
        }
    }

    async disconnect() {
        if (this.client) {
            try {
                await this.client.destroy();
                this.isReady = false;
                this.logger.info('👋 WhatsApp desconectado');
            } catch (error) {
                this.logger.error('Erro ao desconectar:', error);
            }
        }
    }

    getStatus() {
        return {
            connected: this.isReady,
            ready: this.isReady,
            hasQR: !!this.qrCode,
            qrCode: this.qrCode,
            error: this.initializationError,
            steps: this.initSteps,
            debugMode: this.debugMode,
            availableMethods: this.getDebugInfo().availableMethods
        };
    }
}

module.exports = WhatsAppService;