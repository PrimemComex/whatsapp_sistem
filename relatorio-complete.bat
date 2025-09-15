@echo off
echo ========================================
echo RELATORIO COMPLETO - SISTEMA WHATSAPP
echo PRIMEM COMEX v5.0
echo ========================================
echo.
echo Data: %date% %time%
echo Usuario: %username%
echo Computador: %computername%
echo ========================================
echo.

echo [1/10] VERSAO DO WINDOWS:
ver
echo.

echo [2/10] VERSAO DO NODE:
node --version
echo.

echo [3/10] VERSAO DO NPM:
npm --version
echo.

echo [4/10] PASTA ATUAL:
cd
echo.

echo [5/10] ESTRUTURA DE PASTAS:
echo.
echo === Pasta Principal ===
dir /b
echo.
echo === Pasta server ===
dir /b server
echo.
echo === Pasta server\services ===
dir /b server\services
echo.
echo === Pasta client ===
dir /b client
echo.
echo === Pasta uploads ===
dir /b uploads 2>nul
echo.

echo [6/10] CONTEUDO DO PACKAGE.JSON:
type package.json
echo.

echo [7/10] MODULOS INSTALADOS:
dir /b node_modules | find /c /v ""
echo modulos encontrados em node_modules
echo.

echo [8/10] VERIFICANDO PUPPETEER:
dir node_modules | findstr puppeteer
echo.

echo [9/10] VERIFICANDO WHATSAPP-WEB.JS:
dir node_modules | findstr whatsapp
echo.

echo [10/10] PROCESSOS USANDO PORTAS:
netstat -ano | findstr :3000
netstat -ano | findstr :3001
echo.

echo ========================================
echo COLETANDO LOGS DE ERRO...
echo ========================================
echo.

echo TESTANDO CONEXAO SIMPLES:
node -e "console.log('Node funcionando OK')"
echo.

echo TESTANDO PUPPETEER:
node -e "try { require('puppeteer'); console.log('Puppeteer OK'); } catch(e) { console.log('Puppeteer ERRO:', e.message); }"
echo.

echo TESTANDO WHATSAPP-WEB.JS:
node -e "try { require('whatsapp-web.js'); console.log('WhatsApp-web.js OK'); } catch(e) { console.log('WhatsApp-web.js ERRO:', e.message); }"
echo.

echo ========================================
echo INFORMACOES DE CACHE:
echo ========================================
if exist .wwebjs_cache (
    echo CACHE .wwebjs_cache EXISTE
    dir .wwebjs_cache
) else (
    echo CACHE .wwebjs_cache NAO EXISTE
)
echo.

if exist .wwebjs_auth (
    echo CACHE .wwebjs_auth EXISTE
    dir .wwebjs_auth
) else (
    echo CACHE .wwebjs_auth NAO EXISTE
)
echo.

if exist sessions (
    echo PASTA sessions EXISTE
    dir sessions
) else (
    echo PASTA sessions NAO EXISTE
)
echo.

echo ========================================
echo FIM DO RELATORIO
echo ========================================
pause