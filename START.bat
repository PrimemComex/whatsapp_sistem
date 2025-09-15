@echo off
echo ========================================
echo     PRIMEM WHATSAPP SYSTEM v5.0
echo ========================================
echo.
echo [1] Instalando dependencias do servidor...
call npm install
echo.
echo [2] Instalando dependencias do cliente...
cd client
call npm install
cd ..
echo.
echo [3] Iniciando o sistema...
echo.
echo ========================================
echo   Servidor: http://localhost:3001
echo   Cliente:  http://localhost:3000
echo ========================================
echo.
echo Pressione CTRL+C para parar o sistema
echo.
start cmd /k "npm run server"
timeout /t 5
start cmd /k "cd client && npm start"
echo.
echo Sistema iniciado com sucesso!
pause