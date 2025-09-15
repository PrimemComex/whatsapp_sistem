// diagnostic.js
// Salve este arquivo na pasta raiz do projeto e execute com: node diagnostic.js

const fs = require('fs');
const path = require('path');

console.log('=====================================');
console.log('🔍 DIAGNÓSTICO DO SISTEMA WHATSAPP');
console.log('=====================================\n');

// Cores para o console
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, type = 'info') {
    const prefix = {
        success: `${colors.green}✅`,
        error: `${colors.red}❌`,
        warning: `${colors.yellow}⚠️`,
        info: `${colors.blue}📌`
    };
    console.log(`${prefix[type]} ${message}${colors.reset}`);
}

// 1. VERIFICAR ESTRUTURA DE PASTAS
console.log('1️⃣ VERIFICANDO ESTRUTURA DE PASTAS\n');

const requiredFolders = [
    'uploads',
    'uploads/images',
    'uploads/videos', 
    'uploads/audios',
    'uploads/documents',
    'server',
    'server/services',
    'client',
    'client/src',
    'sessions',
    'logs',
    'temp'
];

let foldersOk = true;
requiredFolders.forEach(folder => {
    const fullPath = path.join(__dirname, folder);
    if (fs.existsSync(fullPath)) {
        log(`Pasta ${folder} existe`, 'success');
    } else {
        log(`Pasta ${folder} NÃO existe`, 'error');
        foldersOk = false;
        // Criar pasta se não existir
        try {
            fs.mkdirSync(fullPath, { recursive: true });
            log(`  └─> Pasta criada!`, 'warning');
        } catch (e) {
            log(`  └─> Erro ao criar: ${e.message}`, 'error');
        }
    }
});

console.log('\n=====================================\n');

// 2. VERIFICAR ARQUIVOS PRINCIPAIS
console.log('2️⃣ VERIFICANDO ARQUIVOS PRINCIPAIS\n');

const requiredFiles = [
    { path: 'server/server.js', critical: true },
    { path: 'server/services/whatsapp.service.js', critical: true },
    { path: 'client/src/App.js', critical: true },
    { path: 'package.json', critical: true },
    { path: '.env', critical: false }
];

let filesOk = true;
requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, file.path);
    if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const size = (stats.size / 1024).toFixed(2);
        log(`${file.path} (${size} KB)`, 'success');
    } else {
        if (file.critical) {
            log(`${file.path} NÃO existe - CRÍTICO!`, 'error');
            filesOk = false;
        } else {
            log(`${file.path} não existe (opcional)`, 'warning');
        }
    }
});

console.log('\n=====================================\n');

// 3. VERIFICAR ARQUIVOS NA PASTA UPLOADS
console.log('3️⃣ VERIFICANDO ARQUIVOS EM UPLOADS\n');

const uploadsDir = path.join(__dirname, 'uploads');
let mediaFiles = {
    images: [],
    videos: [],
    audios: [],
    documents: [],
    outros: []
};

function scanDirectory(dir, baseDir = '') {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            scanDirectory(fullPath, path.join(baseDir, file));
        } else {
            const ext = path.extname(file).toLowerCase();
            const size = (stat.size / 1024).toFixed(2);
            const fileInfo = {
                name: file,
                path: path.join(baseDir, file),
                size: size,
                modified: stat.mtime
            };
            
            // Categorizar por tipo
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
                mediaFiles.images.push(fileInfo);
            } else if (['.mp4', '.avi', '.mov', '.webm'].includes(ext)) {
                mediaFiles.videos.push(fileInfo);
            } else if (['.mp3', '.ogg', '.opus', '.wav', '.m4a'].includes(ext)) {
                mediaFiles.audios.push(fileInfo);
            } else if (['.pdf', '.doc', '.docx', '.xls', '.xlsx'].includes(ext)) {
                mediaFiles.documents.push(fileInfo);
            } else {
                mediaFiles.outros.push(fileInfo);
            }
        }
    });
}

scanDirectory(uploadsDir);

// Mostrar estatísticas
console.log('📊 ESTATÍSTICAS DE ARQUIVOS:');
console.log(`  🖼️  Imagens: ${mediaFiles.images.length}`);
console.log(`  🎬 Vídeos: ${mediaFiles.videos.length}`);
console.log(`  🎵 Áudios: ${mediaFiles.audios.length}`);
console.log(`  📄 Documentos: ${mediaFiles.documents.length}`);
console.log(`  📁 Outros: ${mediaFiles.outros.length}`);
console.log(`  📦 TOTAL: ${mediaFiles.images.length + mediaFiles.videos.length + mediaFiles.audios.length + mediaFiles.documents.length + mediaFiles.outros.length}\n`);

// Mostrar últimos 5 arquivos de cada tipo
if (mediaFiles.audios.length > 0) {
    console.log('🎵 ÚLTIMOS ÁUDIOS:');
    mediaFiles.audios.slice(-5).forEach(audio => {
        console.log(`  - ${audio.name} (${audio.size} KB)`);
    });
    console.log('');
}

if (mediaFiles.images.length > 0) {
    console.log('🖼️ ÚLTIMAS IMAGENS:');
    mediaFiles.images.slice(-5).forEach(img => {
        console.log(`  - ${img.name} (${img.size} KB)`);
    });
    console.log('');
}

console.log('=====================================\n');

// 4. VERIFICAR DEPENDÊNCIAS
console.log('4️⃣ VERIFICANDO DEPENDÊNCIAS NPM\n');

const packageJson = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJson)) {
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    const requiredDeps = [
        'express',
        'cors',
        'socket.io',
        'whatsapp-web.js',
        'multer',
        'qrcode',
        'helmet',
        'express-rate-limit'
    ];
    
    let depsOk = true;
    requiredDeps.forEach(dep => {
        if (pkg.dependencies && pkg.dependencies[dep]) {
            log(`${dep}: ${pkg.dependencies[dep]}`, 'success');
        } else {
            log(`${dep}: NÃO INSTALADO`, 'error');
            depsOk = false;
        }
    });
    
    if (!depsOk) {
        console.log('\n⚠️ Execute: npm install');
    }
}

console.log('\n=====================================\n');

// 5. VERIFICAR WHATSAPP SERVICE
console.log('5️⃣ ANALISANDO WHATSAPP SERVICE\n');

const whatsappServicePath = path.join(__dirname, 'server/services/whatsapp.service.js');
if (fs.existsSync(whatsappServicePath)) {
    const serviceContent = fs.readFileSync(whatsappServicePath, 'utf8');
    
    // Verificar funções críticas
    const criticalFunctions = [
        { name: 'saveMediaFile', pattern: /saveMediaFile|async saveMediaFile/g },
        { name: 'message.downloadMedia', pattern: /message\.downloadMedia/g },
        { name: 'messageData.media =', pattern: /messageData\.media\s*=/g },
        { name: 'io.emit com media', pattern: /io\.emit.*message_received/g },
        { name: 'Buffer.from base64', pattern: /Buffer\.from.*base64/g }
    ];
    
    criticalFunctions.forEach(func => {
        const matches = serviceContent.match(func.pattern);
        if (matches) {
            log(`${func.name}: ${matches.length} ocorrência(s)`, 'success');
        } else {
            log(`${func.name}: NÃO ENCONTRADO`, 'error');
        }
    });
}

console.log('\n=====================================\n');

// 6. TESTE DE SERVIDOR
console.log('6️⃣ TESTE RÁPIDO DO SERVIDOR\n');

const http = require('http');

function testServer() {
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/health',
        method: 'GET'
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.status === 'ok') {
                    log('Servidor respondendo corretamente', 'success');
                    log(`Uptime: ${Math.floor(json.uptime / 60)} minutos`, 'info');
                    log(`Arquivos em uploads: ${json.uploads}`, 'info');
                } else {
                    log('Servidor com problema', 'error');
                }
            } catch (e) {
                log('Erro ao parsear resposta do servidor', 'error');
            }
            
            finalReport();
        });
    });
    
    req.on('error', (e) => {
        log(`Servidor OFFLINE: ${e.message}`, 'error');
        log('Execute: npm run server', 'warning');
        finalReport();
    });
    
    req.end();
}

// 7. RELATÓRIO FINAL
function finalReport() {
    console.log('\n=====================================');
    console.log('📋 RELATÓRIO FINAL');
    console.log('=====================================\n');
    
    const problems = [];
    
    if (!foldersOk) {
        problems.push('❌ Algumas pastas estavam faltando (foram criadas)');
    }
    
    if (!filesOk) {
        problems.push('❌ Arquivos críticos faltando');
    }
    
    if (mediaFiles.audios.length === 0 && mediaFiles.images.length === 0) {
        problems.push('⚠️ Nenhum arquivo de mídia encontrado em uploads');
    }
    
    if (problems.length === 0) {
        console.log(colors.green + '✅ SISTEMA APARENTEMENTE OK!' + colors.reset);
        console.log('\nPRÓXIMOS PASSOS:');
        console.log('1. Execute o servidor: npm run server');
        console.log('2. Execute o cliente: npm run client');
        console.log('3. Conecte o WhatsApp');
        console.log('4. Envie uma imagem/áudio');
        console.log('5. Verifique o console do servidor');
    } else {
        console.log(colors.red + '⚠️ PROBLEMAS ENCONTRADOS:' + colors.reset);
        problems.forEach(p => console.log(p));
        
        console.log('\nSOLUÇÕES:');
        console.log('1. Execute: npm install');
        console.log('2. Verifique os arquivos faltantes');
        console.log('3. Execute este diagnóstico novamente');
    }
    
    console.log('\n=====================================\n');
}

// Executar teste do servidor
testServer();