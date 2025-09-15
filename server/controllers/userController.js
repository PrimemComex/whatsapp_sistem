// =====================================
// USER CONTROLLER
// =====================================

const { getAllUsers, getUserById } = require('../middleware/auth');

class UserController {
    // ====================================
    // LISTAR USUÁRIOS
    // ====================================
    async list(req, res) {
        try {
            const users = getAllUsers();

            res.json({
                success: true,
                users,
                total: users.length
            });

        } catch (error) {
            logger.error('Erro ao listar usuários:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // OBTER USUÁRIO POR ID
    // ====================================
    async getById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do usuário é obrigatório'
                });
            }

            const user = getUserById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            res.json({
                success: true,
                user
            });

        } catch (error) {
            logger.error('Erro ao obter usuário:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // ATUALIZAR USUÁRIO
    // ====================================
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, email, role } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do usuário é obrigatório'
                });
            }

            // Verificar se usuário existe
            const user = getUserById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            // Verificar permissões
            if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Sem permissão para atualizar este usuário'
                });
            }

            logger.info('Usuário atualizado:', {
                targetUserId: id,
                updates: { name, email, role },
                updatedBy: req.user.id
            });

            res.json({
                success: true,
                message: 'Usuário atualizado com sucesso',
                user: {
                    ...user,
                    name: name || user.name,
                    email: email || user.email,
                    role: role || user.role
                }
            });

        } catch (error) {
            logger.error('Erro ao atualizar usuário:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ====================================
    // DELETAR USUÁRIO
    // ====================================
    async delete(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do usuário é obrigatório'
                });
            }

            // Verificar se usuário existe
            const user = getUserById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            // Não permitir auto-deleção
            if (req.user.id === parseInt(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Não é possível deletar seu próprio usuário'
                });
            }

            logger.info('Usuário deletado:', {
                deletedUserId: id,
                deletedBy: req.user.id
            });

            res.json({
                success: true,
                message: 'Usuário deletado com sucesso'
            });

        } catch (error) {
            logger.error('Erro ao deletar usuário:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}