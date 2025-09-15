// =====================================
// server/utils/encryption.js
// =====================================

const crypto = require('crypto');

// Configurações de criptografia
const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'primem_secret_key_2025_very_long_string';
const IV_LENGTH = 16; // Para AES, este é sempre 16

// ====================================
// GERAR CHAVE DERIVADA
// ====================================
const getKey = (password = SECRET_KEY) => {
    return crypto.scryptSync(password, 'salt', 32);
};

// ====================================
// CRIPTOGRAFAR TEXTO
// ====================================
const encrypt = (text) => {
    try {
        if (!text) return null;
        
        const iv = crypto.randomBytes(IV_LENGTH);
        const key = getKey();
        const cipher = crypto.createCipher(ALGORITHM, key);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            encryptedData: encrypted
        };
    } catch (error) {
        console.error('Erro na criptografia:', error);
        return null;
    }
};

// ====================================
// DESCRIPTOGRAFAR TEXTO
// ====================================
const decrypt = (encryptedObj) => {
    try {
        if (!encryptedObj || !encryptedObj.encryptedData) return null;
        
        const key = getKey();
        const decipher = crypto.createDecipher(ALGORITHM, key);
        
        decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));
        
        let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Erro na descriptografia:', error);
        return null;
    }
};

// ====================================
// HASH DE SENHA
// ====================================
const hashPassword = (password) => {
    try {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        
        return {