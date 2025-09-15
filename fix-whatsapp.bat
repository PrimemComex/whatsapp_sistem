@echo off
echo =====================================
echo   CORRECAO DO WHATSAPP WEB
echo =====================================
echo.

cd C:\Users\david\Desktop\whatsapp_sistem

echo [1/5] Parando o servidor...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo [2/5] Limpando sessoes antigas...
rmdir /s /q sessions 2>nul
rmdir /s /q .wwebjs_auth 2>nul
rmdir /s /q .wwebjs_cache 2>nul
mkdir sessions 2>nul
echo Sessoes limpas!

echo [3/5] Instalando Puppeteer (pode demorar 2-5 minutos)...
echo Isso vai baixar o Chromium (~170MB)
npm install puppeteer --save

echo [4/5] Verificando outras dependencias...
npm install whatsapp-web.js@1.23.0 --save
npm install qrcode@1.5.3 --save
npm install qrcode-terminal@0.12.0 --save

echo [5/5] Listando dependencias instaladas...
npm list puppeteer whatsapp-web.js qrcode

echo.
echo =====================================
echo   INSTALACAO CONCLUIDA!
echo =====================================
echo.
echo PROXIMO PASSO:
echo 1. Substitua o arquivo whatsapp.service.js pelo codigo com debug
echo 2. Execute: npm run server
echo 3. Conecte o WhatsApp no navegador
echo.
pause