// server/utils/logger.js
// =====================================
// LOGGER BÁSICO ROBUSTO
// =====================================

class Logger {
    constructor() {
        this.level = process.env.LOG_LEVEL || 'info';
        this.colors = {
            info: '\x1b[36m',    // Cyan
            warn: '\x1b[33m',    // Yellow
            error: '\x1b[31m',   // Red
            debug: '\x1b[90m',   // Gray
            reset: '\x1b[0m'
        };
    }

    formatMessage(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const color = this.colors[level] || '';
        const reset = this.colors.reset;
        
        let formatted = `${color}[${timestamp}] ${level.toUpperCase()}: ${message}${reset}`;
        
        if (data && Object.keys(data).length > 0) {
            try {
                formatted += '\n' + JSON.stringify(data, null, 2);
            } catch (error) {
                formatted += '\n[Erro ao serializar dados]';
            }
        }
        
        return formatted;
    }

    info(message, data = {}) {
        try {
            console.log(this.formatMessage('info', message, data));
        } catch (error) {
            console.log('INFO:', message, data);
        }
    }
    
    warn(message, data = {}) {
        try {
            console.warn(this.formatMessage('warn', message, data));
        } catch (error) {
            console.warn('WARN:', message, data);
        }
    }
    
    error(message, error = {}) {
        try {
            let errorData = error;
            
            // Se é um objeto Error, extrair informações úteis
            if (error instanceof Error) {
                errorData = {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                };
            }
            
            console.error(this.formatMessage('error', message, errorData));
        } catch (err) {
            console.error('ERROR:', message, error);
        }
    }
    
    debug(message, data = {}) {
        if (process.env.NODE_ENV === 'development' || this.level === 'debug') {
            try {
                console.log(this.formatMessage('debug', message, data));
            } catch (error) {
                console.log('DEBUG:', message, data);
            }
        }
    }

    // Métodos adicionais para compatibilidade
    log(message, data = {}) {
        this.info(message, data);
    }

    trace(message, data = {}) {
        this.debug(message, data);
    }

    fatal(message, error = {}) {
        this.error(message, error);
        // Em produção, você poderia adicionar lógica para notificar sistemas de monitoramento
    }
}

// Criar instância única
const logger = new Logger();

// Export da instância
module.exports = logger;

// Export da classe para casos especiais
module.exports.Logger = Logger;