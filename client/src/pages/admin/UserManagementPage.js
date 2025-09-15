// ====================================
// 👥 PÁGINA DE GERENCIAMENTO DE USUÁRIOS - v16.0 SIMPLIFICADA
// 🔐 Apenas para Administradores
// Usando APENAS componentes existentes do projeto
// ====================================

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

// === COMPONENTES EXISTENTES DO PROJETO ===
import { PrimaryButton, DangerButton, SuccessButton } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  
  // === USUÁRIOS EXEMPLO ===
  const [users, setUsers] = useState([
    {
      id: 'admin001',
      name: 'Administrador PRIMEM',
      email: 'admin@primem.com',
      role: 'admin',
      department: 'Administração',
      isActive: true
    },
    {
      id: 'manager001',
      name: 'João Silva',
      email: 'joao@primem.com',
      role: 'manager',
      department: 'Comercial',
      isActive: true
    },
    {
      id: 'agent001',
      name: 'Maria Santos',
      email: 'maria@primem.com',
      role: 'agent',
      department: 'Comercial',
      isActive: true
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'agent',
    department: 'Comercial'
  });

  // === NOVO USUÁRIO ===
  const handleNewUser = () => {
    setFormData({ name: '', email: '', role: 'agent', department: 'Comercial' });
    setEditingUser(null);
    setShowModal(true);
  };

  // === EDITAR USUÁRIO ===
  const handleEditUser = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    });
    setEditingUser(user);
    setShowModal(true);
  };

  // === SALVAR USUÁRIO ===
  const handleSaveUser = () => {
    if (!formData.name || !formData.email) {
      alert('Nome e email são obrigatórios');
      return;
    }

    if (editingUser) {
      // Editar existente
      const updatedUsers = users.map(u =>
        u.id === editingUser.id ? { ...u, ...formData } : u
      );
      setUsers(updatedUsers);
      alert('Usuário atualizado com sucesso!');
    } else {
      // Criar novo
      const newUser = {
        id: `user_${Date.now()}`,
        ...formData,
        isActive: true
      };
      setUsers([...users, newUser]);
      alert('Usuário criado com sucesso!');
    }
    
    setShowModal(false);
  };

  // === ALTERNAR STATUS ===
  const toggleUserStatus = (userId) => {
    if (userId === currentUser?.id) {
      alert('Você não pode desativar seu próprio usuário');
      return;
    }

    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    );
    setUsers(updatedUsers);
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
          <PrimaryButton onClick={handleNewUser}>
            ➕ Novo Usuário
          </PrimaryButton>
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
          gridTemplateColumns: '200px 200px 120px 150px 100px 120px',
          backgroundColor: '#f9fafb',
          padding: '16px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#6b7280',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>NOME</div>
          <div>EMAIL</div>
          <div>ROLE</div>
          <div>DEPARTAMENTO</div>
          <div>STATUS</div>
          <div>AÇÕES</div>
        </div>

        {/* Lista de Usuários */}
        {users.map(user => (
          <div
            key={user.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 200px 120px 150px 100px 120px',
              padding: '16px',
              fontSize: '14px',
              borderBottom: '1px solid #f3f4f6',
              alignItems: 'center'
            }}
          >
            <div style={{ fontWeight: '600', color: '#1f2937' }}>
              {user.name}
              {user.id === currentUser?.id && (
                <div style={{ fontSize: '11px', color: '#6b7280' }}>(Você)</div>
              )}
            </div>
            
            <div style={{ color: '#6b7280', fontSize: '13px' }}>
              {user.email}
            </div>
            
            <div>
              <span style={{
                backgroundColor: user.role === 'admin' ? '#ef4444' : '#10b981',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                {user.role.toUpperCase()}
              </span>
            </div>
            
            <div style={{ color: '#6b7280' }}>
              {user.department}
            </div>
            
            <div>
              <span style={{
                backgroundColor: user.isActive ? '#10b981' : '#ef4444',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                {user.isActive ? 'ATIVO' : 'INATIVO'}
              </span>
            </div>
            
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
              >
                {user.isActive ? '🔒' : '🔓'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* === MODAL DE USUÁRIO === */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <Input
                type="text"
                placeholder="Nome Completo"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <Input
                type="email"
                placeholder="email@primem.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px'
                }}
              >
                <option value="admin">👑 Admin</option>
                <option value="manager">👔 Manager</option>
                <option value="agent">👤 Agent</option>
                <option value="viewer">👁️ Viewer</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px'
                }}
              >
                <option value="Administração">Administração</option>
                <option value="Comercial">Comercial</option>
                <option value="Operacional">Operacional</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Suporte">Suporte</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <DangerButton onClick={() => setShowModal(false)}>
                ❌ Cancelar
              </DangerButton>
              <SuccessButton onClick={handleSaveUser}>
                ✅ {editingUser ? 'Salvar' : 'Criar'}
              </SuccessButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserManagementPage;
export { UserManagementPage };