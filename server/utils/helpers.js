// =====================================
// server/utils/helpers.js
// =====================================

const path = require('path');
const fs = require('fs');

// ====================================
// CRIAR PASTAS NECESSÁRIAS
// ====================================
const createRequiredFolders = () => {
    const folders = [
        path.join(__dirname, '../../uploads'),
        path.join(__dirname, '../../sessions'),
        path.join(__dirname, '../../logs'),
        path.join(__dirname, '../../temp')
    ];
    
    folders.forEach(folder => {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
            console.log(`Pasta criada: ${folder}`);
        }
    });
};

// ====================================
// FORMATAR BYTES
// ====================================
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// ====================================
// FORMATAR NÚMERO DE TELEFONE
// ====================================
const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Remover caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Adicionar código do país se não tiver
    if (!cleaned.startsWith('55') && cleaned.length === 11) {
        cleaned = '55' + cleaned;
    }
    
    // Adicionar @c.us se não tiver
    if (!cleaned.includes('@')) {
        cleaned = cleaned + '@c.us';
    }
    
    return cleaned;
};

// ====================================
// GERAR ID ÚNICO
// ====================================
const generateId = (prefix = '') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

// ====================================
// DELAY/SLEEP
// ====================================
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// ====================================
// CAPITALIZAR PRIMEIRA LETRA
// ====================================
const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// ====================================
// TRUNCAR TEXTO
// ====================================
const truncate = (text, maxLength = 100, suffix = '...') => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
};

// ====================================
// VERIFICAR SE É URL VÁLIDA
// ====================================
const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

// ====================================
// SANITIZAR NOME DE ARQUIVO
// ====================================
const sanitizeFileName = (fileName) => {
    if (!fileName) return 'file';
    
    // Remover caracteres perigosos
    return fileName
        .replace(/[^a-z0-9.-]/gi, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
};

// ====================================
// OBTER EXTENSÃO DE ARQUIVO
// ====================================
const getFileExtension = (fileName) => {
    if (!fileName) return '';
    return path.extname(fileName).toLowerCase();
};

// ====================================
// VERIFICAR SE ARQUIVO EXISTE
// ====================================
const fileExists = (filePath) => {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        return false;
    }
};

// ====================================
// LER ARQUIVO JSON
// ====================================
const readJsonFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return null;
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler arquivo JSON:', error);
        return null;
    }
};

// ====================================
// ESCREVER ARQUIVO JSON
// ====================================
const writeJsonFile = (filePath, data) => {
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erro ao escrever arquivo JSON:', error);
        return false;
    }
};

// ====================================
// CALCULAR HASH MD5
// ====================================
const calculateMd5 = (text) => {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(text).digest('hex');
};