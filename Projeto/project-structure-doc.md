# 📋 DOCUMENTO 1: Estrutura do Projeto e Configuração Inicial

## 🎯 Objetivo
Criar um sistema WhatsApp Web robusto com autenticação via QR Code, capaz de enviar/receber mensagens e arquivos com redundância.

## 📁 Estrutura de Pastas

```
primem-whatsapp-v4/
├── server/
│   ├── config/
│   │   └── whatsapp.config.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── whatsapp.controller.js
│   │   └── message.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── services/
│   │   ├── whatsapp.service.js
│   │   └── storage.service.js
│   ├── utils/
│   │   └── logger.js
│   ├── sessions/           # Pasta para arquivos de sessão
│   ├── media/             # Pasta para arquivos recebidos
│   └── server.js
│
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login/
│   │   │   │   ├── Login.js
│   │   │   │   └── Login.css
│   │   │   ├── QRCode/
│   │   │   │   ├── QRCode.js
│   │   │   │   └── QRCode.css
│   │   │   ├── Chat/
│   │   │   │   ├── Chat.js
│   │   │   │   └── Chat.css
│   │   │   └── Dashboard/
│   │   │       ├── Dashboard.js
│   │   │       └── Dashboard.css
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── socket.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   │
├── package.json
├── .env
├── .gitignore
└── README.md
```

## 🛠️ Stack Tecnológica

### Backend
- **Node.js**: v18+
- **Express**: Framework web
- **whatsapp-web.js**: Biblioteca principal para WhatsApp
- **Socket.io**: Comunicação em tempo real
- **Multer**: Upload de arquivos
- **Winston**: Sistema de logs
- **Dotenv**: Variáveis de ambiente
- **Cors**: Configuração de CORS
- **Helmet**: Segurança
- **Express-rate-limit**: Limite de requisições

### Frontend
- **React**: Framework UI
- **Socket.io-client**: Cliente WebSocket
- **Axios**: Requisições HTTP
- **React Router**: Navegação
- **Material-UI**: Componentes UI
- **QRCode.react**: Renderização de QR Code

## 📦 Package.json Principal (Raiz)

```json
{
  "name": "primem-whatsapp-v4",
  "version": "4.0.0",
  "description": "Sistema WhatsApp Web Primem Comex",
  "main": "server/server.js",
  "scripts": {
    "start": "concurrently \"npm run server\" \"npm run client\"",
    "server": "nodemon server/server.js",
    "client": "cd client && npm start",
    "dev": "npm start",
    "install-all": "npm install && cd client && npm install",
    "build": "cd client && npm run build",
    "production": "NODE_ENV=production node server/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "whatsapp-web.js": "^1.23.0",
    "qrcode-terminal": "^0.12.0",
    "socket.io": "^4.6.1",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.7.0",
    "multer": "^1.4.5-lts.1",
    "winston": "^3.8.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "concurrently": "^8.0.1"
  }
}
```

## 📦 Package.json do Cliente

```json
{
  "name": "primem-whatsapp-client",
  "version": "4.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.10.0",
    "socket.io-client": "^4.6.1",
    "axios": "^1.3.4",
    "@mui/material": "^5.12.0",
    "@emotion/react": "^11.10.6",
    "@emotion/styled": "^11.10.6",
    "qrcode.react": "^3.1.0",
    "react-toastify": "^9.1.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  }
}
```

## 🔧 Arquivo .env

```env
# Servidor
PORT=3001
NODE_ENV=development

# Cliente
CLIENT_URL=http://localhost:3000

# WhatsApp
WHATSAPP_SESSION_NAME=primem-session
WHATSAPP_PUPPETEER_HEADLESS=true
WHATSAPP_PUPPETEER_EXECUTABLE_PATH=

# Autenticação
JWT_SECRET=sua_chave_secreta_super_segura_123
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# Logs
LOG_LEVEL=debug
LOG_DIR=./logs
```

## 🚀 Comandos de Instalação

```bash
# 1. Criar o projeto
mkdir primem-whatsapp-v4
cd primem-whatsapp-v4

# 2. Inicializar NPM
npm init -y

# 3. Criar estrutura de pastas
mkdir -p server/{config,controllers,middleware,services,utils,sessions,media}
mkdir -p client/src/{components/{Login,QRCode,Chat,Dashboard},services,utils}
mkdir -p client/public

# 4. Instalar dependências
npm install express whatsapp-web.js qrcode-terminal socket.io cors dotenv helmet express-rate-limit multer winston bcryptjs jsonwebtoken
npm install -D nodemon concurrently

# 5. Criar cliente React
npx create-react-app client --template minimal
cd client
npm install socket.io-client axios react-router-dom @mui/material @emotion/react @emotion/styled qrcode.react react-toastify
cd ..

# 6. Copiar arquivo .env
echo "PORT=3001" > .env
```

## 🔍 Verificação Inicial

### Checklist de Configuração
- [ ] Node.js v18+ instalado
- [ ] NPM v9+ instalado
- [ ] Chromium/Chrome instalado (para Puppeteer)
- [ ] Estrutura de pastas criada
- [ ] Dependências instaladas
- [ ] Arquivo .env configurado
- [ ] Portas 3000 e 3001 disponíveis

## 💡 Solução de Problemas Conhecidos

### 1. Erro do Puppeteer
```bash
# Windows
npm install puppeteer --save

# Linux/Mac
sudo npm install puppeteer --unsafe-perm=true --allow-root
```

### 2. Erro de Sessão
- Sempre limpar a pasta `sessions/` ao reiniciar
- Verificar permissões de escrita na pasta

### 3. Erro de CORS
- Verificar CLIENT_URL no .env
- Confirmar que o cliente está na porta 3000

## 📝 Próximos Documentos
- **Documento 2**: Implementação do Servidor Base
- **Documento 3**: Sistema de Login
- **Documento 4**: Conexão QR Code
- **Documento 5**: Envio/Recebimento de Mensagens
- **Documento 6**: Envio/Recebimento de Arquivos