// ===================================
// CORREÇÃO PARA server/routes/users.js
// ===================================
// Substitua TODO o conteúdo do arquivo por este código:

const express = require('express');
const router = express.Router();

// ===================================
// MIDDLEWARE DE AUTORIZAÇÃO (MOCK)
// ===================================

const requireAdmin = (req, res, next) => {
  // TODO: Implementar verificação real de token/role
  console.log('🔐 Verificando permissão de admin...');
  
  // Por enquanto, sempre permitir (MOCK)
  req.user = {
    id: 'admin_user',
    email: 'admin@primem.com',
    role: 'admin',
    name: 'Admin PRIMEM'
  };
  
  next();
};

const requireAuth = (req, res, next) => {
  // TODO: Implementar verificação real de autenticação
  console.log('🔐 Verificando autenticação...');
  
  // Por enquanto, sempre permitir (MOCK)
  req.user = req.user || {
    id: 'authenticated_user',
    email: 'user@primem.com',
    role: 'agent',
    name: 'User PRIMEM'
  };
  
  next();
};

// ===================================
// USER CONTROLLER INLINE
// ===================================

const UserController = {
  // Listar todos os usuários
  list: async (req, res) => {
    try {
      console.log('👥 Listando usuários...');
      
      // Usuários mock
      const users = [
        {
          id: '1',
          email: 'admin@primem.com',
          name: 'Admin PRIMEM',
          role: 'admin',
          department: 'TI',
          isActive: true,
          lastLogin: new Date(Date.now() - 3600000), // 1 hora atrás
          createdAt: new Date('2024-01-01')
        },
        {
          id: '2', 
          email: 'teste@teste.com',
          name: 'Teste Agent',
          role: 'agent',
          department: 'Atendimento',
          isActive: true,
          lastLogin: new Date(Date.now() - 1800000), // 30 min atrás
          createdAt: new Date('2024-01-15')
        },
        {
          id: '3',
          email: 'manager@primem.com', 
          name: 'Manager PRIMEM',
          role: 'manager',
          department: 'Comercial',
          isActive: true,
          lastLogin: new Date(Date.now() - 7200000), // 2 horas atrás
          createdAt: new Date('2024-02-01')
        },
        {
          id: '4',
          email: 'viewer@primem.com',
          name: 'Viewer PRIMEM', 
          role: 'viewer',
          department: 'Operacional',
          isActive: true,
          lastLogin: new Date(Date.now() - 86400000), // 1 dia atrás
          createdAt: new Date('2024-02-15')
        }
      ];

      res.json({
        success: true,
        users: users,
        count: users.length,
        requestedBy: req.user.email
      });

    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar usuários'
      });
    }
  },

  // Obter perfil do usuário atual
  profile: async (req, res) => {
    try {
      console.log('👤 Obtendo perfil de:', req.user.email);

      const profile = {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        department: 'TI',
        isActive: true,
        lastLogin: new Date(),
        settings: {
          notifications: true,
          theme: 'light',
          language: 'pt-BR'
        },
        permissions: [
          'view_chats',
          'send_messages',
          req.user.role === 'admin' ? 'admin_access' : null
        ].filter(Boolean),
        statistics: {
          messagesThisWeek: 127,
          chatsHandled: 23,
          avgResponseTime: '2.3 minutos'
        }
      };

      res.json({
        success: true,
        profile: profile
      });

    } catch (error) {
      console.error('❌ Erro ao obter perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao obter perfil'
      });
    }
  },

  // Atualizar perfil
  update: async (req, res) => {
    try {
      const { name, settings } = req.body;
      console.log('✏️ Atualizando perfil de:', req.user.email, { name, settings });

      // TODO: Implementar atualização real no banco
      
      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        updatedFields: Object.keys(req.body),
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar perfil'
      });
    }
  },

  // Criar novo usuário (admin only)
  create: async (req, res) => {
    try {
      const { email, name, role, department } = req.body;
      console.log('➕ Criando usuário:', { email, name, role, department });

      // Validação básica
      if (!email || !name || !role) {
        return res.status(400).json({
          success: false,
          error: 'Email, nome e role são obrigatórios'
        });
      }

      // TODO: Implementar criação real no banco
      const newUser = {
        id: 'user_' + Date.now(),
        email,
        name,
        role,
        department,
        isActive: true,
        createdAt: new Date(),
        createdBy: req.user.id
      };

      res.json({
        success: true,
        message: 'Usuário criado com sucesso',
        user: newUser
      });

    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar usuário'
      });
    }
  },

  // Deletar usuário (admin only)
  delete: async (req, res) => {
    try {
      const { userId } = req.params;
      console.log('🗑️ Deletando usuário:', userId);

      // Não permitir auto-deleção
      if (userId === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Não é possível deletar sua própria conta'
        });
      }

      // TODO: Implementar deleção real no banco
      
      res.json({
        success: true,
        message: 'Usuário deletado com sucesso',
        deletedUserId: userId,
        deletedBy: req.user.id
      });

    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar usuário'
      });
    }
  },

  // Alternar status ativo/inativo
  toggleStatus: async (req, res) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      console.log('🔄 Alterando status do usuário:', userId, 'para:', isActive);

      // TODO: Implementar no banco
      
      res.json({
        success: true,
        message: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso`,
        userId: userId,
        newStatus: isActive
      });

    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao alterar status do usuário'
      });
    }
  }
};

// ===================================
// ROTAS
// ===================================

// GET /api/users - Listar usuários (admin only)
router.get('/', requireAdmin, UserController.list.bind(UserController));

// GET /api/users/profile - Perfil do usuário logado
router.get('/profile', requireAuth, UserController.profile.bind(UserController));

// PUT /api/users/update - Atualizar perfil próprio
router.put('/update', requireAuth, UserController.update.bind(UserController));

// POST /api/users - Criar usuário (admin only)
router.post('/', requireAdmin, UserController.create.bind(UserController));

// DELETE /api/users/:userId - Deletar usuário (admin only)
router.delete('/:userId', requireAdmin, UserController.delete.bind(UserController));

// PUT /api/users/:userId/toggle-status - Ativar/desativar usuário (admin only)
router.put('/:userId/toggle-status', requireAdmin, UserController.toggleStatus.bind(UserController));

// ===================================
// MIDDLEWARE DE ERRO
// ===================================

router.use((error, req, res, next) => {
  console.error('❌ Erro no middleware de usuários:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

module.exports = router;