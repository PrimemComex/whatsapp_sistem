// server/controllers/fileController.js
// =====================================
// CONTROLLER DE ARQUIVOS
// =====================================

const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const { validateFileType, validateFileSize } = require('../utils/validators');

class FileController {
    // ====================================
    // UPLOAD DE ARQUIVO
    // ====================================
    async uploadFile(req, res) {
        try {
            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'Nenhum arquivo foi enviado'
                });
            }

            // Validar tipo de arquivo
            if (!validateFileType(file.mimetype)) {
                // Remover arquivo inválido
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }

                return res.status(400).json({
                    success: false,
                    message: 'Tipo de arquivo não permitido'
                });
            }

            // Validar tamanho
            if (!validateFileSize(file.size)) {
                // Remover arquivo muito grande
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }

                return res.status(400).json({
                    success: false,
                    message: 'Arquivo muito grande. Limite: 16MB'
                });
            }

            const fileInfo = {
                id: Date.now().toString(),
                originalName: file.originalname,
                filename: file.filename,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path,
                url: `/uploads/${file.filename}`,
                uploadedBy: req.user.id,
                uploadedAt: new Date().toISOString()
            };

            logger.success('Arquivo enviado com sucesso:', {
                filename: fileInfo.filename,
                size: fileInfo.size,
                userId: req.user.id
            });

            res.json({
                success: true,
                message: 'Arquivo enviado com sucesso',
                file: fileInfo
            });

        } catch (error) {
            logger.error('Erro no upload:', error);

            // Remover arquivo em caso de erro
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // DOWNLOAD DE ARQUIVO
    // ====================================
    async downloadFile(req, res) {
        try {
            const { filename } = req.params;

            if (!filename) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome do arquivo é obrigatório'
                });
            }

            const filePath = path.join(__dirname, '../../uploads', filename);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Arquivo não encontrado'
                });
            }

            const stat = fs.statSync(filePath);
            const ext = path.extname(filename).toLowerCase();

            // Determinar content-type
            let contentType = 'application/octet-stream';
            if (ext === '.pdf') contentType = 'application/pdf';
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else if (ext === '.png') contentType = 'image/png';
            else if (ext === '.gif') contentType = 'image/gif';
            else if (ext === '.mp4') contentType = 'video/mp4';
            else if (ext === '.mp3') contentType = 'audio/mpeg';
            else if (ext === '.ogg') contentType = 'audio/ogg';
            else if (ext === '.wav') contentType = 'audio/wav';
            else if (ext === '.webm') contentType = 'audio/webm';

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            const readStream = fs.createReadStream(filePath);
            readStream.pipe(res);

            logger.info('Arquivo baixado:', {
                filename,
                size: stat.size,
                userId: req.user.id
            });

        } catch (error) {
            logger.error('Erro no download:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // LISTAR ARQUIVOS
    // ====================================
    async listFiles(req, res) {
        try {
            const { page = 1, limit = 20, type, search } = req.query;
            const uploadsDir = path.join(__dirname, '../../uploads');

            if (!fs.existsSync(uploadsDir)) {
                return res.json({
                    success: true,
                    files: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        totalPages: 0
                    }
                });
            }

            let files = fs.readdirSync(uploadsDir).map(filename => {
                const filePath = path.join(uploadsDir, filename);
                const stat = fs.statSync(filePath);
                const ext = path.extname(filename).toLowerCase();

                // Determinar tipo de arquivo
                let fileType = 'document';
                if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
                    fileType = 'image';
                } else if (['.mp4', '.avi', '.mov', '.wmv', '.webm'].includes(ext)) {
                    fileType = 'video';
                } else if (['.mp3', '.wav', '.ogg', '.aac', '.m4a'].includes(ext)) {
                    fileType = 'audio';
                }

                return {
                    filename,
                    originalName: filename, // Em produção, buscar do banco
                    size: stat.size,
                    type: fileType,
                    mimetype: this.getMimeType(ext),
                    url: `/uploads/${filename}`,
                    createdAt: stat.birthtime,
                    modifiedAt: stat.mtime
                };
            });

            // Filtrar por tipo se especificado
            if (type) {
                files = files.filter(file => file.type === type);
            }

            // Filtrar por busca se especificado
            if (search) {
                const searchLower = search.toLowerCase();
                files = files.filter(file => 
                    file.filename.toLowerCase().includes(searchLower) ||
                    file.originalName.toLowerCase().includes(searchLower)
                );
            }

            // Ordenar por data de modificação (mais recente primeiro)
            files.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));

            // Paginação
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedFiles = files.slice(startIndex, endIndex);

            res.json({
                success: true,
                files: paginatedFiles,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: files.length,
                    totalPages: Math.ceil(files.length / limit)
                }
            });

        } catch (error) {
            logger.error('Erro ao listar arquivos:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // DELETAR ARQUIVO
    // ====================================
    async deleteFile(req, res) {
        try {
            const { filename } = req.params;

            if (!filename) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome do arquivo é obrigatório'
                });
            }

            const filePath = path.join(__dirname, '../../uploads', filename);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Arquivo não encontrado'
                });
            }

            // Verificar permissões (apenas admin ou dono do arquivo)
            if (req.user.role !== 'admin') {
                // Em produção, verificar se o usuário é dono do arquivo
                logger.warn('Tentativa de deletar arquivo sem permissão:', {
                    filename,
                    userId: req.user.id,
                    role: req.user.role
                });
            }

            fs.unlinkSync(filePath);

            logger.info('Arquivo deletado:', {
                filename,
                userId: req.user.id
            });

            res.json({
                success: true,
                message: 'Arquivo deletado com sucesso'
            });

        } catch (error) {
            logger.error('Erro ao deletar arquivo:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // INFORMAÇÕES DO ARQUIVO
    // ====================================
    async getFileInfo(req, res) {
        try {
            const { filename } = req.params;

            if (!filename) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome do arquivo é obrigatório'
                });
            }

            const filePath = path.join(__dirname, '../../uploads', filename);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Arquivo não encontrado'
                });
            }

            const stat = fs.statSync(filePath);
            const ext = path.extname(filename).toLowerCase();

            const fileInfo = {
                filename,
                originalName: filename, // Em produção, buscar do banco
                size: stat.size,
                mimetype: this.getMimeType(ext),
                extension: ext,
                url: `/uploads/${filename}`,
                createdAt: stat.birthtime,
                modifiedAt: stat.mtime,
                isReadable: true,
                isWritable: true
            };

            res.json({
                success: true,
                file: fileInfo
            });

        } catch (error) {
            logger.error('Erro ao obter info do arquivo:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // LIMPAR ARQUIVOS ANTIGOS
    // ====================================
    async cleanupOldFiles(req, res) {
        try {
            const { days = 30 } = req.query;
            const uploadsDir = path.join(__dirname, '../../uploads');

            if (!fs.existsSync(uploadsDir)) {
                return res.json({
                    success: true,
                    message: 'Pasta de uploads não existe',
                    deletedFiles: 0
                });
            }

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

            const files = fs.readdirSync(uploadsDir);
            let deletedCount = 0;

            for (const filename of files) {
                const filePath = path.join(uploadsDir, filename);
                const stat = fs.statSync(filePath);

                if (stat.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                    logger.info('Arquivo antigo removido:', { filename });
                }
            }

            logger.info('Limpeza de arquivos concluída:', {
                deletedCount,
                days: parseInt(days),
                userId: req.user.id
            });

            res.json({
                success: true,
                message: `Limpeza concluída. ${deletedCount} arquivos removidos.`,
                deletedFiles: deletedCount,
                cutoffDate: cutoffDate.toISOString()
            });

        } catch (error) {
            logger.error('Erro na limpeza de arquivos:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // HELPER: OBTER MIME TYPE
    // ====================================
    getMimeType(ext) {
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.mp4': 'video/mp4',
            '.avi': 'video/avi',
            '.mov': 'video/quicktime',
            '.wmv': 'video/x-ms-wmv',
            '.webm': 'video/webm',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
            '.aac': 'audio/aac',
            '.m4a': 'audio/mp4',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.txt': 'text/plain'
        };

        return mimeTypes[ext] || 'application/octet-stream';
    }
}

module.exports = new FileController();