import React, { useState, useEffect } from 'react';

const DashboardPage = () => {
  // Estados do dashboard
  const [clientesSemResposta, setClientesSemResposta] = useState([
    {
      id: 1,
      nome: "João Silva",
      telefone: "+5511999999999",
      ultimaMensagem: "Aguardando retorno sobre o orçamento solicitado",
      tempoEspera: "2h 15min",
      refId: "ID100",
      prioridade: "alta",
      avatar: "JS"
    },
    {
      id: 2,
      nome: "Maria Santos",
      telefone: "+5511888888888",
      ultimaMensagem: "Preciso de mais informações sobre o produto",
      tempoEspera: "4h 32min",
      refId: "ID200",
      prioridade: "media",
      avatar: "MS"
    },
    {
      id: 3,
      nome: "Pedro Costa",
      telefone: "+5511777777777",
      ultimaMensagem: "Quando vocês vão me responder?",
      tempoEspera: "1d 2h",
      refId: "",
      prioridade: "alta",
      avatar: "PC"
    }
  ]);

  const [stats, setStats] = useState({
    mensagensHoje: 47,
    conversasAtivas: 12,
    idsAtivas: 23,
    tempoResposta: "2.4min"
  });

  const [whatsappStatus, setWhatsappStatus] = useState({
    conectado: true,
    sessaoAtiva: true,
    ultimaSync: "14:29",
    uptime: "99.8%"
  });

  // Função para abrir conversa
  const abrirConversa = (clienteId) => {
    alert(`Abrindo conversa com cliente ID: ${clienteId}`);
  };

  // Função para navegar
  const navigate = (path) => {
    alert(`Navegando para: ${path}`);
  };

  return (
    <div style={styles.container}>
      {/* Header do Dashboard */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>🏠 Dashboard PRIMEM</h1>
          <span style={styles.subtitle}>WhatsApp Business System</span>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <span style={styles.userName}>👤 admin@primem.com</span>
            <span style={styles.currentTime}>📅 15/09 14:30</span>
          </div>
          <div style={styles.statusBadge}>
            <span style={styles.statusIcon}>🟢</span>
            <span>WhatsApp Conectado</span>
          </div>
        </div>
      </header>

      {/* Grid Principal */}
      <div style={styles.dashboardGrid}>
        
        {/* Widget Principal - Clientes sem Resposta */}
        <div style={styles.clientesSemRespostaWidget}>
          <div style={styles.widgetHeader}>
            <div style={styles.widgetTitle}>
              <span style={styles.alertIcon}>🚨</span>
              <h2 style={styles.widgetTitleText}>CLIENTES SEM RESPOSTA</h2>
            </div>
            <div style={styles.contador}>{clientesSemResposta.length}</div>
          </div>
          
          <div style={styles.clientesLista}>
            {clientesSemResposta.slice(0, 3).map(cliente => (
              <div 
                key={cliente.id} 
                style={{
                  ...styles.clienteItem,
                  borderLeft: `4px solid ${cliente.prioridade === 'alta' ? '#dc3545' : '#ffc107'}`
                }}
                onClick={() => abrirConversa(cliente.id)}
              >
                <div style={styles.clienteHeader}>
                  <div style={styles.avatarContainer}>
                    <div style={styles.avatar}>{cliente.avatar}</div>
                    <div style={styles.clienteInfo}>
                      <span style={styles.clienteNome}>{cliente.nome}</span>
                      <span style={styles.clienteTempo}>{cliente.tempoEspera} atrás</span>
                    </div>
                  </div>
                  {cliente.refId && (
                    <span style={styles.refId}>🔴 {cliente.refId}</span>
                  )}
                </div>
                <div style={styles.ultimaMsg}>
                  "{cliente.ultimaMensagem.substring(0, 60)}..."
                </div>
              </div>
            ))}
          </div>
          
          <button 
            style={styles.verTodosBtn}
            onClick={() => navigate('/clientes-sem-resposta')}
          >
            👁️ Ver Todos ({clientesSemResposta.length} clientes)
          </button>
        </div>

        {/* Widget Status WhatsApp */}
        <div style={styles.whatsappStatusWidget}>
          <div style={styles.widgetHeader}>
            <h3 style={styles.widgetTitleSmall}>🟢 WhatsApp Status</h3>
          </div>
          <div style={styles.statusContent}>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>✅ Conectado</span>
              <span style={styles.statusValue}>Ativo</span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>📱 Sessão</span>
              <span style={styles.statusValue}>Válida</span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>🔄 Última sync</span>
              <span style={styles.statusValue}>{whatsappStatus.ultimaSync}</span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>📊 Uptime</span>
              <span style={styles.statusValue}>{whatsappStatus.uptime}</span>
            </div>
          </div>
          <button style={styles.configBtn} onClick={() => navigate('/admin/whatsapp')}>
            ⚙️ Configurações
          </button>
        </div>

        {/* Widgets de Estatísticas */}
        <div style={styles.statWidget}>
          <div style={styles.statIcon}>💬</div>
          <div style={styles.statValue}>{stats.mensagensHoje}</div>
          <div style={styles.statLabel}>mensagens hoje</div>
        </div>

        <div style={styles.statWidget}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statValue}>{stats.conversasAtivas}</div>
          <div style={styles.statLabel}>conversas ativas</div>
        </div>

        <div style={styles.statWidget}>
          <div style={styles.statIcon}>🔴</div>
          <div style={styles.statValue}>{stats.idsAtivas}</div>
          <div style={styles.statLabel}>IDs ativas</div>
        </div>

        <div style={styles.statWidget}>
          <div style={styles.statIcon}>⏱️</div>
          <div style={styles.statValue}>{stats.tempoResposta}</div>
          <div style={styles.statLabel}>tempo médio</div>
        </div>

        {/* Ações Rápidas */}
        <div style={styles.actionButton} onClick={() => navigate('/chat')}>
          <div style={styles.actionIcon}>💬</div>
          <div style={styles.actionContent}>
            <div style={styles.actionTitle}>ABRIR CHAT</div>
            <div style={styles.actionSubtitle}>Ir para conversas</div>
          </div>
        </div>

        <div style={styles.actionButtonAdmin} onClick={() => navigate('/admin')}>
          <div style={styles.actionIcon}>⚙️</div>
          <div style={styles.actionContent}>
            <div style={styles.actionTitle}>CONFIGURAR</div>
            <div style={styles.actionSubtitle}>Apenas Admin</div>
          </div>
        </div>

        <div style={styles.actionButton} onClick={() => navigate('/reports')}>
          <div style={styles.actionIcon}>📊</div>
          <div style={styles.actionContent}>
            <div style={styles.actionTitle}>RELATÓRIOS</div>
            <div style={styles.actionSubtitle}>Ver métricas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos PRIMEM
const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
    padding: '20px'
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    padding: '20px 24px',
    borderRadius: '12px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  
  headerLeft: {
    display: 'flex',
    flexDirection: 'column'
  },
  
  title: {
    margin: 0,
    color: '#2B4C8C',
    fontSize: '24px',
    fontWeight: '600'
  },
  
  subtitle: {
    color: '#666',
    fontSize: '14px',
    marginTop: '4px'
  },
  
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  
  userName: {
    fontWeight: '500',
    color: '#333'
  },
  
  currentTime: {
    fontSize: '12px',
    color: '#666',
    marginTop: '2px'
  },
  
  statusBadge: {
    background: '#10b981',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  
  statusIcon: {
    fontSize: '12px'
  },
  
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    gridTemplateAreas: `
      "clientes clientes whatsapp"
      "stat1 stat2 stat3 stat4"
      "action1 action2 action3"
    `
  },
  
  clientesSemRespostaWidget: {
    gridArea: 'clientes',
    background: 'linear-gradient(135deg, #dc3545, #c82333)',
    color: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
    gridColumn: 'span 2'
  },
  
  widgetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  
  widgetTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  alertIcon: {
    fontSize: '20px'
  },
  
  widgetTitleText: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600'
  },
  
  contador: {
    fontSize: '36px',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  clientesLista: {
    marginBottom: '20px'
  },
  
  clienteItem: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      background: 'rgba(255,255,255,0.2)',
      transform: 'translateY(-1px)'
    }
  },
  
  clienteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  
  clienteInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  
  clienteNome: {
    fontWeight: '600',
    fontSize: '16px'
  },
  
  clienteTempo: {
    fontSize: '12px',
    opacity: 0.8,
    marginTop: '2px'
  },
  
  refId: {
    background: '#fff',
    color: '#dc3545',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  
  ultimaMsg: {
    fontSize: '14px',
    opacity: 0.9,
    fontStyle: 'italic',
    lineHeight: '1.3'
  },
  
  verTodosBtn: {
    width: '100%',
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'background 0.2s ease'
  },
  
  whatsappStatusWidget: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  
  widgetTitleSmall: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    color: '#333'
  },
  
  statusContent: {
    marginBottom: '16px'
  },
  
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  
  statusLabel: {
    fontSize: '14px',
    color: '#666'
  },
  
  statusValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  
  configBtn: {
    width: '100%',
    background: '#2B4C8C',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  statWidget: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  
  statIcon: {
    fontSize: '32px',
    marginBottom: '12px'
  },
  
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2B4C8C',
    marginBottom: '8px'
  },
  
  statLabel: {
    fontSize: '14px',
    color: '#666'
  },
  
  actionButton: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
    }
  },
  
  actionButtonAdmin: {
    background: 'linear-gradient(135deg, #C97A4A, #b86938)',
    color: 'white',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(201, 122, 74, 0.3)'
  },
  
  actionIcon: {
    fontSize: '32px',
    marginBottom: '12px'
  },
  
  actionContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  
  actionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  
  actionSubtitle: {
    fontSize: '12px',
    opacity: 0.8
  }
};

export default DashboardPage;