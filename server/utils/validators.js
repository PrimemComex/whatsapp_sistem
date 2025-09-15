// =====================================
// server/utils/validators.js
// =====================================

// ====================================
// VALIDAR EMAIL
// ====================================
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

// ====================================
// VALIDAR SENHA
// ====================================
const validatePassword = (password) => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 3; // Mínimo 3 caracteres para os testes
};

// ====================================
// VALIDAR TELEFONE
// ====================================
const validatePhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    
    // Remover caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Aceitar números com 10-15 dígitos
    return cleaned.length >= 10 && cleaned.length <= 15;
};

// ====================================
// VALIDAR URL
// ====================================
const validateUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
};

// ====================================
// VALIDAR TIPO DE ARQUIVO
// ====================================
const validateFileType = (mimetype) => {
    if (!mimetype) return false;
    
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/3gpp', 'video/quicktime', 'video/webm',
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/opus', 
        'audio/webm', 'audio/mp4', 'audio/m4a', 'audio/aac',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    
    return allowedTypes.includes(mimetype) || mimetype.startsWith('audio/');
};

// ====================================
// VALIDAR TAMANHO DE ARQUIVO
// ====================================
const validateFileSize = (size, maxSizeInMB = 16) => {
    if (!size || isNaN(size)) return false;
    
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return size <= maxSizeInBytes;
};

// ====================================
// VALIDAR JSON
// ====================================
const validateJson = (jsonString) => {
    try {
        JSON.parse(jsonString);
        return true;
    } catch (error) {
        return false;
    }
};

// ====================================
// VALIDAR CAMPO OBRIGATÓRIO
// ====================================
const validateRequired = (value) => {
    if (value === null || value === undefined) return false;
    
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    
    return true;
};

// ====================================
// VALIDAR COMPRIMENTO
// ====================================
const validateLength = (value, min = 0, max = Infinity) => {
    if (!value) return min === 0;
    
    const length = typeof value === 'string' ? value.length : 
                   Array.isArray(value) ? value.length : 0;
    
    return length >= min && length <= max;
};

// ====================================
// VALIDAR NÚMERO
// ====================================
const validateNumber = (value, min = -Infinity, max = Infinity) => {
    const num = Number(value);
    if (isNaN(num)) return false;
    
    return num >= min && num <= max;
};

// ====================================
// VALIDAR DATA
// ====================================
const validateDate = (dateString) => {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};