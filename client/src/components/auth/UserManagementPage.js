// ====================================
// 👥 PÁGINA DE GERENCIAMENTO DE USUÁRIOS - v16.0
// 🔐 Apenas para Administradores
// 👑 CRUD completo de usuários + controle de permissões
// ====================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

// === COMPONENTES MODULARES ===
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Loading } from '../../components/ui/Loading';

// === HOOKS PERSONALIZADOS ===
import { useNotifications } from '../../hooks/useNotifications';

// ====================================
// 👥 USUÁRIOS DE EXEMPLO
// ====================================
const INITIAL_USERS = [
  {
    id: 'admin001',
    name: 'Administrador PRIMEM',
    email: 'admin@primem.com',
    role: 'admin',
    department: 'Administração',
    isActive: true,
    lastLogin: '2025-09-13T14:30:00Z',
    createdAt: '2025-01-01T10:00:00Z'
  },
  {
    id: 'manager001',
    name: 'João Silva',
    email: 'joao@primem.com',
    role: 'manager',
    department: 'Comercial',
    isActive: true,
    lastLogin: '2025-09-13T13:15:00Z',
    createdAt: '2025-02-15T10:00:00Z'
  },
  {
    id: 'agent001',
    name: 'Maria Santos',
    email: 'maria@primem.com',
    role: 'agent',
    department: 'Comercial',
    isActive: true,
    lastLogin: '2025-09-13T12:00:00Z',
    createdAt: '2025-03-01T10:00:00Z'
  },
  {
    id: 'agent002',
    name: 'Carlos Oliveira',
    email: 'carlos@primem.com',
    role: 'agent',
    department: 'Operacional',
    isActive: false,
    lastLogin: '2025-09-10T16:30:00Z',
    createdAt: '2025-03-15T10:00:00Z'
  },
  {
    id: 'viewer001',
    name: 'Ana Costa',
    email: 'ana@primem.com',
    role: 'viewer',
    department: 'Financeiro',
    isActive: true,
    lastLogin: '2025-09-13T09:45:00Z',
    createdAt: '2025-04-01T10:00:00Z'
  }
];

// ====================================
// 🏷️ CONFIGURAÇÕES DE ROLES
// ====================================
const ROLES_CONFIG = {
  admin: {
    label: '👑 Administrador',
    color: '#ef4444',
    permissions: [
      'Acesso total ao sistema',
      'Gerenciar usuários',
      'Configurar textos',
      'Integração Bitrix24',
      'Configurações do sistema'
    ]
  },
  manager: {
    label: '👔 Gerente',
    color: '#f59e0b',
    permissions: [
      'Ver todos os chats',
      'Gerenciar departamento',
      'Ver relatórios',
      'Configurar auto-resposta'
    ]
  },
  agent: {
    label: '👤 Agente',
    color: '#10b981',
    permissions: [
      'Ver chats atribuídos',
      'Enviar mensagens',
      'Upload de arquivos',
      'Gravar áudios'
    ]
  },
  viewer: {
    label: '👁️ Visualizador',
    color: '#6b7280',
    permissions: [
      'Apenas visualização',
      'Ver chats atribuídos',
      'Sem permissões de edição'
    ]
  }
};

// ====================================
// 🏢 DEPARTAMENTOS
// ====================================
const DEPARTMENTS = [
  'Administração',
  'Comercial',
  'Operacional',
  'Financeiro',
  'Suporte',
  'Marketing'
];

// ====================================
// 👥 COMPONENTE PRINCIPAL
// ====================================
const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotifications();
  
  // === ESTADOS PRINCIPAIS ===
  const [users, setUsers] = useState(INITIAL_USERS);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  
  // === ESTADOS DO FORMULÁRIO ===
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'agent',
    department: 'Comercial',
    password: '',
    confirmPassword: '',
    isActive: true
  });
  
  // === USUÁRIOS FILTRADOS ===
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  // === RESETAR FORMULÁRIO ===
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'agent',
      department: 'Comercial',
      password: '',
      confirmPassword: '',
      isActive: true
    });
    setEditingUser(null);
  };

  // === ABRIR MODAL PARA NOVO USUÁRIO ===
  const handleNewUser = () => {
    resetForm();
    setShowModal(true);
  };

  // === ABRIR MODAL PARA EDITAR ===
  const handleEditUser = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      password: '',
      confirmPassword: '',
      isActive: user.isActive
    });
    setEditingUser(user);
    setShowModal(true);
  };

  // === SALVAR USUÁRIO ===
  const handleSaveUser = async () => {
    // Validações
    if (!formData.name || !formData.email) {
      showNotification('Nome e email são obrigatórios', { type: 'error' });
      return;
    }

    if (!editingUser && (!formData.password || formData.password !== formData.confirmPassword)) {
      showNotification('Senhas não coincidem', { type: 'error' });
      return;
    }

    // Verificar email único
    const emailExists = users.some(u => u.email === formData.email && u.id !== editingUser?.id);
    if (emailExists) {
      showNotification('Email já está em uso', { type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingUser) {
        // Editar usuário existente
        const updatedUsers = users.map(user =>
          user.id === editingUser.id
            ? { ...user, ...formData, updatedAt: new Date().toISOString() }
            : user
        );
        setUsers(updatedUsers);
        showNotification('Usuário atualizado com sucesso!', { type: 'success' });
      } else {
        // Criar novo usuário
        const newUser = {
          id: `user_${Date.now()}`,
          ...formData,
          lastLogin: null,
          createdAt: new Date().toISOString()
        };
        setUsers([...users, newUser]);
        showNotification('Usuário criado com sucesso!', { type: 'success' });
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      showNotification('Erro ao salvar usuário', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // === ALTERNAR STATUS ===
  const toggleUserStatus = async (userId) => {
    if (userId === currentUser?.id) {
      showNotification('Você não pode desativar seu próprio usuário', { type: 'warning' });
      return;
    }

    try {
      const updatedUsers = users.map(user =>
        user.id === userId
          ? { ...user, isActive: !user.isActive, updatedAt: new Date().toISOString() }
          : user
      );
      setUsers(updatedUsers);
      
      const user = users.find(u => u.id === userId);
      showNotification(
        `Usuário ${user?.isActive ? 'desativado' : 'ativado'} com sucesso!`, 
        { type: 'success' }
      );
    } catch (error) {
      showNotification('Erro ao alterar status do usuário', { type: 'error' });
    }
  };

  // === EXCLUIR USUÁRIO ===
  const deleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      showNotification('Você não pode excluir seu próprio usuário', { type: 'warning' });
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user?.name}"?`)) {
      return;
    }

    try {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      showNotification('Usuário excluído com sucesso!', { type: 'success' });
    } catch (error) {
      showNotification('Erro ao excluir usuário', { type: 'error' });
    }
  };

  // === VERIFICAR PERMISSÃO ===
  if (currentUser?.role !== 'admin') {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <h2>🔒 Acesso Restrito</h2>
        <p>Apenas administradores podem gerenciar usuários do sistema.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* === HEADER === */}
      <div style={{
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '2px solid #2B4C8C'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#2B4C8C',
              margin: '0 0 8px 0'
            }}>
              👥 Gerenciamento de Usuários
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: 0
            }}>
              Gerencie usuários, permissões e acessos do sistema
            </p>
          </div>
          <Button variant="primary" onClick={handleNewUser}>
            ➕ Novo Usuário
          </Button>
        </div>
      </div>

      {/* === FILTROS === */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '2px solid #e5e7eb'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 200px 200px',
          gap: '16px',
          alignItems: 'end'
        }}>
          <div>
            <Input
              label="🔍 Buscar usuários"
              placeholder="Nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Filtrar por Role:
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="all">Todos</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="agent">Agent</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Filtrar por Departamento:
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="all">Todos</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* === LISTA DE USUÁRIOS === */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '2px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {/* Header da Tabela */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '200px 200px 120px 150px 120px 100px 150px',
          backgroundColor: '#f9fafb',
          padding: '16px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#6b7280',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>USUÁRIO</div>
          <div>EMAIL</div>
          <div>ROLE</div>
          <div>DEPARTAMENTO</div>
          <div>STATUS</div>
          <div>ÚLTIMO LOGIN</div>
          <div>AÇÕES</div>
        </div>

        {/* Lista de Usuários */}
        {filteredUsers.map(user => (
          <div
            key={user.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 200px 120px 150px 120px 100px 150px',
              padding: '16px',
              fontSize: '14px',
              borderBottom: '1px solid #f3f4f6',
              alignItems: 'center'
            }}
          >
            {/* Nome */}
            <div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                {user.id === currentUser?.id && '(Você)'}
              </div>
            </div>
            
            {/* Email */}
            <div style={{ color: '#6b7280', fontSize: '13px' }}>
              {user.email}
            </div>
            
            {/* Role */}
            <div>
              <span style={{
                backgroundColor: ROLES_CONFIG[user.role]?.color || '#6b7280',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                {ROLES_CONFIG[user.role]?.label || user.role}
              </span>
            </div>
            
            {/* Departamento */}
            <div style={{ color: '#6b7280' }}>
              {user.department}
            </div>
            
            {/* Status */}
            <div>
              <span style={{
                backgroundColor: user.isActive ? '#10b981' : '#ef4444',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                {user.isActive ? '✅ ATIVO' : '❌ INATIVO'}
              </span>
            </div>
            
            {/* Último Login */}
            <div style={{ color: '#6b7280', fontSize: '12px' }}>
              {user.lastLogin 
                ? new Date(user.lastLogin).toLocaleDateString('pt-BR')
                : 'Nunca'
              }
            </div>
            
            {/* Ações */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => handleEditUser(user)}
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
                title="Editar"
              >
                ✏️
              </button>
              
              <button
                onClick={() => toggleUserStatus(user.id)}
                disabled={user.id === currentUser?.id}
                style={{
                  backgroundColor: user.isActive ? '#ef4444' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer',
                  opacity: user.id === currentUser?.id ? 0.5 : 1
                }}
                title={user.isActive ? 'Desativar' : 'Ativar'}
              >
                {user.isActive ? '🔒' : '🔓'}
              </button>
              
              <button
                onClick={() => deleteUser(user.id)}
                disabled={user.id === currentUser?.id}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer',
                  opacity: user.id === currentUser?.id ? 0.5 : 1
                }}
                title="Excluir"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        
        {filteredUsers.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <p>Nenhum usuário encontrado com os filtros aplicados</p>
          </div>
        )}
      </div>

      {/* === MODAL DE USUÁRIO === */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        maxWidth="600px"
      >
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <Input
              label="Nome Completo *"
              placeholder="João Silva"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            
            <Input
              label="Email *"
              type="email"
              placeholder="joao@primem.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                {Object.keys(ROLES_CONFIG).map(role => (
                  <option key={role} value={role}>
                    {ROLES_CONFIG[role].label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Departamento *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
          
          {!editingUser && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <Input
                label="Senha *"
                type="password"
                placeholder="Senha do usuário"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              
              <Input
                label="Confirmar Senha *"
                type="password"
                placeholder="Confirme a senha"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          )}
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="isActive" style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Usuário ativo no sistema
            </label>
          </div>
          
          {/* Info sobre Permissões */}
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '2px solid #0ea5e9',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>
              📋 Permissões da Role "{ROLES_CONFIG[formData.role]?.label}":
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', color: '#0c4a6e' }}>
              {ROLES_CONFIG[formData.role]?.permissions.map((permission, index) => (
                <li key={index} style={{ fontSize: '12px', marginBottom: '4px' }}>
                  {permission}
                </li>
              ))}
            </ul>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              ❌ Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveUser}
              loading={loading}
            >
              ✅ {editingUser ? 'Salvar' : 'Criar Usuário'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;