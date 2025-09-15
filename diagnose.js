// diagnose.js - Script de Diagnóstico para WhatsApp Web.js
// Salve este arquivo na raiz do projeto e execute: node diagnose.js

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔍 DIAGNÓSTICO DO SISTEMA WHATSAPP - PRIMEM COMEX v5.0');
console.log('='.repeat(60));

async function diagnose() {
    const results = {
        timestamp: new Date().toISOString(),
        tests: []
    };

    // 1. INFORMAÇÕES DO SISTEMA
    console.log('\n1️⃣ INFORMAÇÕES DO SISTEMA:');
    const systemInfo = {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        memory: `${Math.round(os.freemem() / 1024 / 1024)}MB livres de ${Math.round(os.totalmem() / 1024 / 1024)}MB`,
        cpus: os.cpus().length,
        uptime: `${Math.round(os.uptime() / 60)} minutos`
    };
    
    Object.entries(systemInfo).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
    });
    
    results.system = systemInfo;

    // 2. VERIFICAR DEPENDÊNCIAS
    console.log('\n2️⃣ VERIFICANDO DEPENDÊNCIAS:');
    const dependencies = [
        'express',
        'socket.io',
        'whatsapp-web.js',
        'puppeteer',
        'qrcode',
        'multer'
    ];

    for (const dep of dependencies) {
        try {
            const pkg = require(`${dep}/package.json`);
            console.log(`   ✅ ${dep}: v${pkg.version}`);
            results.tests.push({ test: `Dependência ${dep}`, status: 'OK', version: pkg.version });
        } catch (e) {
            console.log(`   ❌ ${dep}: NÃO INSTALADO`);
            results.tests.push({ test: `Dependência ${dep}`, status: 'ERRO', error: 'Não instalado' });
        }
    }

    // 3. VERIFICAR PUPPETEER E CHROME
    console.log('\n3️⃣ TESTANDO PUPPETEER E CHROME:');
    try {
        const puppeteer = require('puppeteer');
        console.log('   🔄 Iniciando navegador de teste...');
        
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process',
                '--disable-gpu'
            ],
            timeout: 30000
        });
        
        const version = await browser.version();
        console.log(`   ✅ Chrome/Chromium: ${version}`);
        
        const page = await browser.newPage();
        await page.goto('https://web.whatsapp.com', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        const title = await page.title();
        console.log(`   ✅ WhatsApp Web acessível: ${title}`);
        
        await browser.close();
        
        results.tests.push({ 
            test: 'Puppeteer e Chrome', 
            status: 'OK', 
            chrome: version,
            whatsappWeb: 'Acessível'
        });
        
    } catch (e) {
        console.log(`   ❌ Erro no Puppeteer: ${e.message}`);
        results.tests.push({ 
            test: 'Puppeteer e Chrome', 
            status: 'ERRO', 
            error: e.message 
        });
        
        // Sugestões baseadas no erro
        if (e.message.includes('Failed to launch')) {
            console.log('\n   💡 SOLUÇÃO SUGERIDA:');
            console.log('   1. Reinstale o Puppeteer:');
            console.log('      npm uninstall puppeteer');
            console.log('      npm install puppeteer@21.11.0');
            console.log('   2. Se persistir, instale o Chrome manualmente');
        }
    }

    // 4. VERIFICAR ESTRUTURA DE PASTAS
    console.log('\n4️⃣ VERIFICANDO ESTRUTURA DE PASTAS:');
    const requiredDirs = [
        'uploads',
        'logs',
        'sessions',
        'client/src',
        'client/public',
        'server',
        'server/services'
    ];

    for (const dir of requiredDirs) {
        const fullPath = path.join(__dirname, dir);
        if (fs.existsSync(fullPath)) {
            console.log(`   ✅ ${dir}`);
            results.tests.push({ test: `Pasta ${dir}`, status: 'OK' });
        } else {
            console.log(`   ❌ ${dir} - NÃO ENCONTRADA`);
            results.tests.push({ test: `Pasta ${dir}`, status: 'ERRO' });
            
            // Criar pasta se não existir
            fs.mkdirSync(fullPath, { recursive: true });
            console.log(`      📁 Pasta criada: ${dir}`);
        }
    }

    // 5. VERIFICAR CACHES E SESSÕES ANTIGAS
    console.log('\n5️⃣ VERIFICANDO CACHES E SESSÕES:');
    const cacheDirs = [
        '.wwebjs_cache',
        '.wwebjs_auth',
        'wwebjs_auth',
        'wwebjs_cache'
    ];

    let cacheFound = false;
    for (const cache of cacheDirs) {
        const cachePath = path.join(__dirname, cache);
        if (fs.existsSync(cachePath)) {
            console.log(`   ⚠️ Cache encontrado: ${cache}`);
            const stats = fs.statSync(cachePath);
            console.log(`      Tamanho: ${Math.round(stats.size / 1024)}KB`);
            console.log(`      Modificado: ${stats.mtime}`);
            cacheFound = true;
        }
    }

    if (cacheFound) {
        console.log('\n   💡 RECOMENDAÇÃO: Limpar caches antigos pode resolver problemas');
        console.log('   Execute: node diagnose.js --clean');
    } else {
        console.log('   ✅ Nenhum cache antigo encontrado');
    }

    // 6. VERIFICAR PORTAS
    console.log('\n6️⃣ VERIFICANDO PORTAS:');
    const net = require('net');
    
    const checkPort = (port) => {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.once('error', () => resolve(false));
            server.once('listening', () => {
                server.close();
                resolve(true);
            });
            server.listen(port);
        });
    };

    const port3000 = await checkPort(3000);
    const port3001 = await checkPort(3001);

    console.log(`   Porta 3000 (Frontend): ${port3000 ? '✅ Livre' : '❌ Em uso'}`);
    console.log(`   Porta 3001 (Backend): ${port3001 ? '✅ Livre' : '❌ Em uso'}`);

    if (!port3000 || !port3001) {
        console.log('\n   💡 Para liberar portas no Windows:');
        console.log('   netstat -ano | findstr :3000');
        console.log('   netstat -ano | findstr :3001');
        console.log('   taskkill /PID [numero_do_pid] /F');
    }

    // 7. TESTE DE WHATSAPP-WEB.JS
    console.log('\n7️⃣ TESTANDO WHATSAPP-WEB.JS:');
    try {
        const { Client, LocalAuth } = require('whatsapp-web.js');
        console.log('   ✅ whatsapp-web.js importado com sucesso');
        
        // Tentar criar cliente (sem inicializar)
        const testClient = new Client({
            authStrategy: new LocalAuth({
                clientId: 'test-client'
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox']
            }
        });
        
        console.log('   ✅ Cliente WhatsApp criado (não inicializado)');
        results.tests.push({ test: 'WhatsApp Web.js', status: 'OK' });
        
    } catch (e) {
        console.log(`   ❌ Erro no whatsapp-web.js: ${e.message}`);
        results.tests.push({ test: 'WhatsApp Web.js', status: 'ERRO', error: e.message });
    }

    // SALVAR RELATÓRIO
    console.log('\n📊 SALVANDO RELATÓRIO DE DIAGNÓSTICO...');
    const reportPath = path.join(__dirname, 'logs', `diagnostico-${Date.now()}.json`);
    
    if (!fs.existsSync(path.join(__dirname, 'logs'))) {
        fs.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`   📝 Relatório salvo em: ${reportPath}`);

    // RESUMO FINAL
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMO DO DIAGNÓSTICO:');
    
    const errors = results.tests.filter(t => t.status === 'ERRO');
    const warnings = results.tests.filter(t => t.status === 'AVISO');
    const success = results.tests.filter(t => t.status === 'OK');
    
    console.log(`   ✅ Testes OK: ${success.length}`);
    console.log(`   ⚠️ Avisos: ${warnings.length}`);
    console.log(`   ❌ Erros: ${errors.length}`);

    if (errors.length > 0) {
        console.log('\n🔧 AÇÕES RECOMENDADAS:');
        console.log('1. Execute: npm install');
        console.log('2. Limpe caches: node diagnose.js --clean');
        console.log('3. Reinstale Puppeteer: npm uninstall puppeteer && npm install puppeteer@21.11.0');
        console.log('4. Execute como Administrador');
        console.log('5. Desative temporariamente o antivírus');
    } else {
        console.log('\n✅ Sistema parece estar OK! Tente conectar o WhatsApp novamente.');
    }

    console.log('='.repeat(60));
}

// Função para limpar caches
async function cleanCaches() {
    console.log('\n🧹 LIMPANDO CACHES E SESSÕES...');
    
    const toDelete = [
        '.wwebjs_cache',
        '.wwebjs_auth',
        'wwebjs_auth',
        'wwebjs_cache',
        'sessions'
    ];

    for (const dir of toDelete) {
        const fullPath = path.join(__dirname, dir);
        if (fs.existsSync(fullPath)) {
            try {
                fs.rmSync(fullPath, { recursive: true, force: true });
                console.log(`   ✅ Removido: ${dir}`);
            } catch (e) {
                console.log(`   ❌ Erro ao remover ${dir}: ${e.message}`);
            }
        }
    }

    // Recriar pasta sessions
    fs.mkdirSync(path.join(__dirname, 'sessions'), { recursive: true });
    console.log('   📁 Pasta sessions recriada');
    console.log('\n✅ Limpeza concluída! Tente conectar novamente.');
}

// Executar
if (process.argv.includes('--clean')) {
    cleanCaches();
} else {
    diagnose().catch(console.error);
}