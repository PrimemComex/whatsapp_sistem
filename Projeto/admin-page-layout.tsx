import React, { useState, useEffect } from 'react';

// Simulação dos hooks (eles já existem no projeto)
const useAuth = () => ({
  user: { 
    role: 'admin', 
    name: 'David Fortunato',
    email: 'admin@primem.com',
    department: 'TI',
    displayName: 'David F.'
  }
});

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appearance');
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showThemePreview, setShowThemePreview] = useState(false);

  // Estados para configurações visuais
  const [visualConfig, setVisualConfig] = useState({
    // Cores do Sistema
    colors: {
      primary: '#2B4C8C',      // Azul PRIMEM
      secondary: '#C97A4A',    // Laranja PRIMEM
      accent: '#8B9DC3',       // Azul claro
      success: '#10B981',      // Verde
      warning: '#F59E0B',      // Amarelo
      error: '#EF4444',        // Vermelho
      background: '#f8fafc',   // Fundo principal
      surface: '#ffffff',      // Superfícies (cards, modais)
      text: '#1f2937',         // Texto principal
      textSecondary: '#6b7280', // Texto secundário
      border: '#e5e7eb',       // Bordas
      chatBackground: '#e5ddd5', // Fundo do chat (estilo WhatsApp)
      messagesSent: '#dcf8c6',  // Mensagens enviadas
      messagesReceived: '#ffffff', // Mensagens recebidas
      chatHeader: '#075e54',    // Cabeçalho do chat
      sidebar: '#131c21'        // Sidebar escura
    },
    // Emojis do Sistema
    emojis: {
      logo: '💬',
      admin: '🔧',
      users: '👥',
      settings: '⚙️',
      chat: '💬',
      files: '📎',
      audio: '🎵',
      video: '🎥',
      image: '🖼️',
      document: '📄',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      loading: '⏳',
      send: '📤',
      receive: '📥',
      online: '🟢',
      offline: '🔴',
      typing: '✍️',
      bot: '🤖'
    },
    // Textos dos Botões
    buttonTexts: {
      send: 'Enviar',
      attach: 'Anexar',
      record: 'Gravar',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      add: 'Adicionar',
      connect: 'Conectar',
      disconnect: 'Desconectar',
      login: 'Entrar',
      logout: 'Sair',
      back: 'Voltar',
      next: 'Próximo',
      close: 'Fechar',
      confirm: 'Confirmar'
    },
    // Configurações de Layout
    layout: {
      borderRadius: '8px',
      sidebarWidth: '320px',
      headerHeight: '64px',
      chatHeaderHeight: '60px',
      messageSpacing: '8px',
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    // Efeitos Visuais
    effects: {
      enableAnimations: true,
      shadowIntensity: 'medium', // low, medium, high
      enableGradients: true,
      compactMode: false,
      darkMode: false
    }
  });

  // Estados para usuários
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'David Fortunato',
      email: 'admin@primem.com',
      displayName: 'David F.',
      role: 'admin',
      department: 'TI',
      isActive: true,
      lastLogin: new Date('2024-09-14T10:30:00'),
      avatar: null,
      permissions: ['all']
    },
    {
      id: 2,
      name: 'Ana Silva',
      email: 'ana@primem.com',
      displayName: 'Ana S.',
      role: 'manager',
      department: 'Comercial',
      isActive: true,
      lastLogin: new Date('2024-09-14T09:15:00'),
      avatar: null,
      permissions: ['view_all_chats', 'manage_department', 'view_reports']
    },
    {
      id: 3,
      name: 'Bruno Santos',
      email: 'bruno@primem.com',
      displayName: 'Bruno S.',
      role: 'agent',
      department: 'Operacional',
      isActive: true,
      lastLogin: new Date('2024-09-13T16:45:00'),
      avatar: null,
      permissions: ['view_assigned_chats', 'send_messages', 'upload_files']
    }
  ]);

  const userRoles = {
    admin: {
      name: 'Administrador',
      permissions: ['all'],
      color: '#EF4444',
      description: 'Acesso total ao sistema'
    },
    manager: {
      name: 'Gerente',
      permissions: ['view_all_chats', 'manage_department', 'view_reports', 'manage_users'],
      color: '#F59E0B',
      description: 'Gerencia departamento e visualiza relatórios'
    },
    agent: {
      name: 'Agente',
      permissions: ['view_assigned_chats', 'send_messages', 'upload_files'],
      color: '#10B981',
      description: 'Atendimento básico de clientes'
    },
    viewer: {
      name: 'Visualizador',
      permissions: ['view_assigned_chats'],
      color: '#6B7280',
      description: 'Apenas visualização'
    }
  };

  const departments = ['Comercial', 'Operacional', 'Financeiro', 'Suporte', 'TI', 'Administrativo'];

  // Verificar permissão
  if (user?.role !== 'admin') {
    return (
      <div style={styles.noAccess}>
        <div style={styles.noAccessCard}>
          <div style={styles.noAccessIcon}>🔒</div>
          <h2>Acesso Restrito</h2>
          <p>Apenas administradores podem acessar esta área.</p>
        </div>
      </div>
    );
  }

  // Funções para gerenciar usuários
  const handleAddUser = () => {
    setEditingUser({
      id: null,
      name: '',
      email: '',
      displayName: '',
      password: '',
      role: 'agent',
      department: 'Comercial',
      isActive: true,
      permissions: userRoles.agent.permissions
    });
    setShowUserModal(true);
  };

  const handleEditUser = (userId) => {
    const userToEdit = users.find(u => u.id === userId);
    setEditingUser({ ...userToEdit, password: '' });
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    if (editingUser.id) {
      // Editar usuário existente
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { ...editingUser, permissions: userRoles[editingUser.role].permissions }
          : u
      ));
    } else {
      // Adicionar novo usuário
      const newUser = {
        ...editingUser,
        id: Math.max(...users.map(u => u.id)) + 1,
        lastLogin: null,
        permissions: userRoles[editingUser.role].permissions
      };
      setUsers(prev => [...prev, newUser]);
    }
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  // Função para atualizar configuração visual
  const updateVisualConfig = (category, key, value) => {
    setVisualConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  // Renderização das abas
  const renderAppearanceTab = () => (
    <div style={styles.tabContent}>
      <div style={styles.sectionHeader}>
        <h3>🎨 Configurações de Aparência</h3>
        <p>Personalize completamente a aparência do sistema</p>
        <button 
          style={styles.previewButton}
          onClick={() => setShowThemePreview(true)}
        >
          👁️ Visualizar Preview
        </button>
      </div>

      <div style={styles.configSections}>
        {/* Cores do Sistema */}
        <div style={styles.configSection}>
          <h4>🎨 Cores do Sistema</h4>
          <div style={styles.colorGrid}>
            {Object.entries(visualConfig.colors).map(([key, value]) => (
              <div key={key} style={styles.colorItem}>
                <label style={styles.colorLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <div style={styles.colorInputGroup}>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => updateVisualConfig('colors', key, e.target.value)}
                    style={styles.colorInput}
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateVisualConfig('colors', key, e.target.value)}
                    style={styles.colorTextInput}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emojis do Sistema */}
        <div style={styles.configSection}>
          <h4>😀 Emojis do Sistema</h4>
          <div style={styles.emojiGrid}>
            {Object.entries(visualConfig.emojis).map(([key, value]) => (
              <div key={key} style={styles.emojiItem}>
                <label style={styles.emojiLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateVisualConfig('emojis', key, e.target.value)}
                  style={styles.emojiInput}
                  maxLength={4}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Textos dos Botões */}
        <div style={styles.configSection}>
          <h4>🔘 Textos dos Botões</h4>
          <div style={styles.buttonTextGrid}>
            {Object.entries(visualConfig.buttonTexts).map(([key, value]) => (
              <div key={key} style={styles.buttonTextItem}>
                <label style={styles.buttonTextLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateVisualConfig('buttonTexts', key, e.target.value)}
                  style={styles.buttonTextInput}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Configurações de Layout */}
        <div style={styles.configSection}>
          <h4>📐 Layout e Dimensões</h4>
          <div style={styles.layoutGrid}>
            <div style={styles.layoutItem}>
              <label>Border Radius</label>
              <input
                type="text"
                value={visualConfig.layout.borderRadius}
                onChange={(e) => updateVisualConfig('layout', 'borderRadius', e.target.value)}
                style={styles.layoutInput}
              />
            </div>
            <div style={styles.layoutItem}>
              <label>Largura da Sidebar</label>
              <input
                type="text"
                value={visualConfig.layout.sidebarWidth}
                onChange={(e) => updateVisualConfig('layout', 'sidebarWidth', e.target.value)}
                style={styles.layoutInput}
              />
            </div>
            <div style={styles.layoutItem}>
              <label>Altura do Header</label>
              <input
                type="text"
                value={visualConfig.layout.headerHeight}
                onChange={(e) => updateVisualConfig('layout', 'headerHeight', e.target.value)}
                style={styles.layoutInput}
              />
            </div>
            <div style={styles.layoutItem}>
              <label>Tamanho da Fonte</label>
              <input
                type="text"
                value={visualConfig.layout.fontSize}
                onChange={(e) => updateVisualConfig('layout', 'fontSize', e.target.value)}
                style={styles.layoutInput}
              />
            </div>
            <div style={styles.layoutItem}>
              <label>Família da Fonte</label>
              <select
                value={visualConfig.layout.fontFamily}
                onChange={(e) => updateVisualConfig('layout', 'fontFamily', e.target.value)}
                style={styles.layoutInput}
              >
                <option value="system-ui, -apple-system, sans-serif">System UI</option>
                <option value="Inter, sans-serif">Inter</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="Poppins, sans-serif">Poppins</option>
                <option value="Montserrat, sans-serif">Montserrat</option>
              </select>
            </div>
          </div>
        </div>

        {/* Efeitos Visuais */}
        <div style={styles.configSection}>
          <h4>✨ Efeitos Visuais</h4>
          <div style={styles.effectsGrid}>
            <div style={styles.effectItem}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={visualConfig.effects.enableAnimations}
                  onChange={(e) => updateVisualConfig('effects', 'enableAnimations', e.target.checked)}
                />
                Habilitar Animações
              </label>
            </div>
            <div style={styles.effectItem}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={visualConfig.effects.enableGradients}
                  onChange={(e) => updateVisualConfig('effects', 'enableGradients', e.target.checked)}
                />
                Habilitar Gradientes
              </label>
            </div>
            <div style={styles.effectItem}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={visualConfig.effects.compactMode}
                  onChange={(e) => updateVisualConfig('effects', 'compactMode', e.target.checked)}
                />
                Modo Compacto
              </label>
            </div>
            <div style={styles.effectItem}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={visualConfig.effects.darkMode}
                  onChange={(e) => updateVisualConfig('effects', 'darkMode', e.target.checked)}
                />
                Modo Escuro
              </label>
            </div>
            <div style={styles.effectItem}>
              <label>Intensidade da Sombra</label>
              <select
                value={visualConfig.effects.shadowIntensity}
                onChange={(e) => updateVisualConfig('effects', 'shadowIntensity', e.target.value)}
                style={styles.layoutInput}
              >
                <option value="none">Sem Sombra</option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.saveButton}>
          💾 Salvar Configurações
        </button>
        <button style={styles.resetButton}>
          🔄 Restaurar Padrões PRIMEM
        </button>
        <button style={styles.exportButton}>
          📤 Exportar Tema
        </button>
        <button style={styles.importButton}>
          📥 Importar Tema
        </button>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div style={styles.tabContent}>
      <div style={styles.sectionHeader}>
        <h3>👥 Gerenciamento de Usuários</h3>
        <p>Gerencie usuários, perfis e permissões do sistema</p>
        <button style={styles.addButton} onClick={handleAddUser}>
          ➕ Adicionar Usuário
        </button>
      </div>

      {/* Estatísticas dos Usuários */}
      <div style={styles.userStats}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{users.length}</div>
          <div style={styles.statLabel}>Total de Usuários</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{users.filter(u => u.isActive).length}</div>
          <div style={styles.statLabel}>Usuários Ativos</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{users.filter(u => u.role === 'admin').length}</div>
          <div style={styles.statLabel}>Administradores</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{users.filter(u => u.role === 'agent').length}</div>
          <div style={styles.statLabel}>Agentes</div>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div style={styles.usersTable}>
        <div style={styles.tableHeader}>
          <div style={styles.tableHeaderCell}>Usuário</div>
          <div style={styles.tableHeaderCell}>Email</div>
          <div style={styles.tableHeaderCell}>Perfil</div>
          <div style={styles.tableHeaderCell}>Departamento</div>
          <div style={styles.tableHeaderCell}>Status</div>
          <div style={styles.tableHeaderCell}>Último Login</div>
          <div style={styles.tableHeaderCell}>Ações</div>
        </div>
        
        {users.map(user => (
          <div key={user.id} style={styles.tableRow}>
            <div style={styles.tableCell}>
              <div style={styles.userInfo}>
                <div style={styles.userAvatar}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} style={styles.avatarImage} />
                  ) : (
                    <div style={styles.avatarPlaceholder}>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div style={styles.userName}>{user.name}</div>
                  <div style={styles.userDisplayName}>Exibe como: "{user.displayName}"</div>
                </div>
              </div>
            </div>
            <div style={styles.tableCell}>{user.email}</div>
            <div style={styles.tableCell}>
              <span style={{
                ...styles.roleBadge,
                backgroundColor: userRoles[user.role].color
              }}>
                {userRoles[user.role].name}
              </span>
            </div>
            <div style={styles.tableCell}>{user.department}</div>
            <div style={styles.tableCell}>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: user.isActive ? '#10B981' : '#EF4444'
              }}>
                {user.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div style={styles.tableCell}>
              {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Nunca'}
            </div>
            <div style={styles.tableCell}>
              <div style={styles.actionButtons}>
                <button 
                  style={styles.editButton}
                  onClick={() => handleEditUser(user.id)}
                >
                  ✏️
                </button>
                <button 
                  style={styles.deleteButton}
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={user.id === 1} // Não pode deletar admin principal
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTextConfigs = () => (
    <div style={styles.tabContent}>
      <div style={styles.sectionHeader}>
        <h3>📝 Configuração de Textos</h3>
        <p>Configure mensagens automáticas e textos do sistema</p>
      </div>
      <div style={styles.comingSoon}>
        <div style={styles.comingSoonIcon}>🚧</div>
        <h4>Implementado na versão anterior</h4>
        <p>Esta funcionalidade já foi desenvolvida anteriormente</p>
      </div>
    </div>
  );

  const renderBitrixIntegration = () => (
    <div style={styles.tabContent}>
      <div style={styles.sectionHeader}>
        <h3>🔗 Integração Bitrix</h3>
        <p>Configure integração com Bitrix24</p>
      </div>
      <div style={styles.comingSoon}>
        <div style={styles.comingSoonIcon}>🚧</div>
        <h4>Implementado na versão anterior</h4>
        <p>Esta funcionalidade já foi desenvolvida anteriormente</p>
      </div>
    </div>
  );

  // Modal para edição de usuário
  const renderUserModal = () => {
    if (!showUserModal || !editingUser) return null;

    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h3>{editingUser.id ? 'Editar Usuário' : 'Adicionar Usuário'}</h3>
            <button 
              style={styles.modalCloseButton}
              onClick={() => setShowUserModal(false)}
            >
              ✕
            </button>
          </div>

          <div style={styles.modalBody}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                  style={styles.formInput}
                  placeholder="Ex: João Silva"
                />
              </div>

              <div style={styles.formGroup}>
                <label>Nome de Exibição *</label>
                <input
                  type="text"
                  value={editingUser.displayName}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, displayName: e.target.value }))}
                  style={styles.formInput}
                  placeholder="Ex: João S. (usado na assinatura)"
                />
              </div>

              <div style={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                  style={styles.formInput}
                  placeholder="Ex: joao@primem.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label>Senha {editingUser.id ? '(deixe vazio para manter)' : '*'}</label>
                <input
                  type="password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, password: e.target.value }))}
                  style={styles.formInput}
                  placeholder="Digite a senha"
                />
              </div>

              <div style={styles.formGroup}>
                <label>Perfil de Acesso *</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                  style={styles.formInput}
                >
                  {Object.entries(userRoles).map(([key, role]) => (
                    <option key={key} value={key}>{role.name}</option>
                  ))}
                </select>
                <small style={styles.helpText}>
                  {userRoles[editingUser.role]?.description}
                </small>
              </div>

              <div style={styles.formGroup}>
                <label>Departamento *</label>
                <select
                  value={editingUser.department}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, department: e.target.value }))}
                  style={styles.formInput}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={editingUser.isActive}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Usuário Ativo
                </label>
              </div>
            </div>

            {/* Permissões */}
            <div style={styles.permissionsSection}>
              <h4>🔐 Permissões do Perfil "{userRoles[editingUser.role]?.name}"</h4>
              <div style={styles.permissionsList}>
                {userRoles[editingUser.role]?.permissions.map(permission => (
                  <span key={permission} style={styles.permissionTag}>
                    {permission === 'all' ? 'Todas as permissões' : permission.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button 
              style={styles.cancelButton}
              onClick={() => setShowUserModal(false)}
            >
              Cancelar
            </button>
            <button 
              style={styles.saveButton}
              onClick={handleSaveUser}
            >
              {editingUser.id ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Preview do Tema
  const renderThemePreview = () => {
    if (!showThemePreview) return null;

    return (
      <div style={styles.modalOverlay}>
        <div style={styles.previewModal}>
          <div style={styles.modalHeader}>
            <h3>👁️ Preview do Tema</h3>
            <button 
              style={styles.modalCloseButton}
              onClick={() => setShowThemePreview(false)}
            >
              ✕
            </button>
          </div>

          <div style={styles.previewContent}>
            {/* Simulação da interface com as cores configuradas */}
            <div style={{
              ...styles.previewChatContainer,
              backgroundColor: visualConfig.colors.chatBackground,
              fontFamily: visualConfig.layout.fontFamily,
              fontSize: visualConfig.layout.fontSize
            }}>
              <div style={{
                ...styles.previewChatHeader,
                backgroundColor: visualConfig.colors.chatHeader,
                height: visualConfig.layout.chatHeaderHeight
              }}>
                <span style={{ color: 'white' }}>
                  {visualConfig.emojis.chat} Preview do Chat - PRIMEM
                </span>
              </div>

              <div style={styles.previewMessages}>
                <div style={{
                  ...styles.previewMessageReceived,
                  backgroundColor: visualConfig.colors.messagesReceived
                }}>
                  <span>Olá! Como posso ajudar? {visualConfig.emojis.bot}</span>
                </div>
                <div style={{
                  ...styles.previewMessageSent,
                  backgroundColor: visualConfig.colors.messagesSent
                }}>
                  <span>Preciso de informações sobre importação</span>
                </div>
              </div>

              <div style={styles.previewInputArea}>
                <input 
                  style={{
                    ...styles.previewInput,
                    borderRadius: visualConfig.layout.borderRadius
                  }}
                  placeholder="Digite sua mensagem..."
                  readOnly
                />
                <button style={{
                  ...styles.previewSendButton,
                  backgroundColor: visualConfig.colors.primary,
                  borderRadius: visualConfig.layout.borderRadius
                }}>
                  {visualConfig.emojis.send} {visualConfig.buttonTexts.send}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <header style={{
        ...styles.header,
        backgroundColor: visualConfig.colors.primary
      }}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <h1>{visualConfig.emojis.admin} Administração PRIMEM</h1>
            <p>Painel de controle administrativo completo</p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.userInfo}>
              <span>👨‍💼 {user.name}</span>
              <span style={styles.userRole}>{user.role}</span>
            </div>
          </div>
        </div>
      </header>

      <nav style={styles.navigation}>
        <div style={styles.navTabs}>
          <button
            style={{
              ...styles.navTab,
              ...(activeTab === 'appearance' ? styles.navTabActive : {})
            }}
            onClick={() => setActiveTab('appearance')}
          >
            🎨 Aparência
          </button>
          <button
            style={{
              ...styles.navTab,
              ...(activeTab === 'users' ? styles.navTabActive : {})
            }}
            onClick={() => setActiveTab('users')}
          >
            👥 Usuários
          </button>
          <button
            style={{
              ...styles.navTab,
              ...(activeTab === 'text-configs' ? styles.navTabActive : {})
            }}
            onClick={() => setActiveTab('text-configs')}
          >
            📝 Textos
          </button>
          <button
            style={{
              ...styles.navTab,
              ...(activeTab === 'bitrix' ? styles.navTabActive : {})
            }}
            onClick={() => setActiveTab('bitrix')}
          >
            🔗 Bitrix
          </button>
        </div>
      </nav>

      <main style={styles.main}>
        {activeTab === 'appearance' && renderAppearanceTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'text-configs' && renderTextConfigs()}
        {activeTab === 'bitrix' && renderBitrixIntegration()}
      </main>

      {renderUserModal()}
      {renderThemePreview()}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    backgroundColor: '#2B4C8C',
    color: 'white',
    padding: '20px 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flex: 1
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },
  userRole: {
    fontSize: '12px',
    backgroundColor: '#C97A4A',
    padding: '4px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  navigation: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 20px'
  },
  navTabs: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    gap: '0'
  },
  navTab: {
    background: 'none',
    border: 'none',
    padding: '16px 24px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s'
  },
  navTabActive: {
    color: '#2B4C8C',
    borderBottomColor: '#2B4C8C',
    backgroundColor: '#f8fafc'
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 20px'
  },
  tabContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionHeader: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  previewButton: {
    backgroundColor: '#8B5CF6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  configSections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  configSection: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '24px',
    backgroundColor: '#fafafa'
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  },
  colorItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  },
  colorLabel: {
    fontSize: '14px',
    fontWeight: '500',
    flex: 1
  },
  colorInputGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  colorInput: {
    width: '40px',
    height: '40px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  colorTextInput: {
    width: '80px',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace'
  },
  emojiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginTop: '16px'
  },
  emojiItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  },
  emojiLabel: {
    fontSize: '14px',
    fontWeight: '500',
    flex: 1
  },
  emojiInput: {
    width: '60px',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    textAlign: 'center',
    fontSize: '16px'
  },
  buttonTextGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '12px',
    marginTop: '16px'
  },
  buttonTextItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  },
  buttonTextLabel: {
    fontSize: '14px',
    fontWeight: '500',
    flex: 1
  },
  buttonTextInput: {
    width: '100px',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px'
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  },
  layoutItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  layoutInput: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px'
  },
  effectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  },
  effectItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  actions: {
    marginTop: '40px',
    display: 'flex',
    gap: '12px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
    flexWrap: 'wrap'
  },
  saveButton: {
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  resetButton: {
    backgroundColor: '#6B7280',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  exportButton: {
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  importButton: {
    backgroundColor: '#8B5CF6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  addButton: {
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  userStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2B4C8C',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b'
  },
  usersTable: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  tableHeaderCell: {
    padding: '16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr',
    borderBottom: '1px solid #f3f4f6',
    '&:hover': {
      backgroundColor: '#f9fafb'
    }
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2B4C8C',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  userName: {
    fontWeight: '500',
    marginBottom: '2px'
  },
  userDisplayName: {
    fontSize: '12px',
    color: '#6b7280'
  },
  roleBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white'
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  editButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#f3f4f6'
    }
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#fef2f2'
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '0',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  previewModal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '0',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalCloseButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6b7280'
  },
  modalBody: {
    padding: '24px',
    flex: 1,
    overflow: 'auto'
  },
  modalFooter: {
    padding: '20px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  formGrid: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  formInput: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px'
  },
  helpText: {
    fontSize: '12px',
    color: '#6b7280',
    fontStyle: 'italic'
  },
  permissionsSection: {
    marginTop: '24px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  permissionsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '12px'
  },
  permissionTag: {
    backgroundColor: '#2B4C8C',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  previewContent: {
    padding: '24px',
    backgroundColor: '#f8fafc'
  },
  previewChatContainer: {
    width: '100%',
    height: '400px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column'
  },
  previewChatHeader: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500'
  },
  previewMessages: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflow: 'auto'
  },
  previewMessageReceived: {
    alignSelf: 'flex-start',
    padding: '12px 16px',
    borderRadius: '18px',
    maxWidth: '70%',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  previewMessageSent: {
    alignSelf: 'flex-end',
    padding: '12px 16px',
    borderRadius: '18px',
    maxWidth: '70%',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  previewInputArea: {
    padding: '16px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  previewInput: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white'
  },
  previewSendButton: {
    padding: '12px 20px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '500'
  },
  comingSoon: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b'
  },
  comingSoonIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  noAccess: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  noAccessCard: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '400px'
  },
  noAccessIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  }
};

export default AdminPage;