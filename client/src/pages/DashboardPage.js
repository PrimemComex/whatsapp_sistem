// ARQUIVO: client/src/pages/DashboardPage.js - VERSÃO MÍNIMA
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './DashboardPage.css';

const DashboardPage = ({ 
  onNavigateToChat, 
  onNavigateToConnection, 
  onNavigateToSettings 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados simulados (substitua quando os hooks estiverem funcionando)
  const [isConnected, setIsConnected] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalConversations: 0,
    unreadMessages: 0,
    todayMessages: 0,
    onlineTime: '0h 0m',
    avgResponseTime: '0s',
    systemStatus: 'disconnected'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [sessionStartTime] = useState(new Date());

  // Simular dados (remover quando hooks funcionarem)
  useEffect(() => {
    const calculateStats = () => {
      const onlineTime = calculateOnlineTime();

      setDashboardStats({
        totalConversations: 5, // Simulado
        unreadMessages: 2, // Simulado
        todayMessages: 15, // Simulado
        onlineTime: onlineTime,
        avgResponseTime: '12s', // Simulado
        systemStatus: isConnected ? 'connected' : 'disconnected'
      });
    };

    calculateStats();
    const interval = setInterval(calculateStats, 30000);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calcular tempo online
  const calculateOnlineTime = () => {
    const now = new Date();
    const diffMs = now - sessionStartTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Handlers de navegação
  const handleConnectWhatsApp = () => {
    console.log('🔗 Redirecionando para conexão...');
    if (onNavigateToConnection) {
      onNavigateToConnection();
    } else {
      navigate('/connection');
    }
  };

  const handleGoToChat = () => {
    console.log('💬 Redirecionando para chat...');
    if (onNavigateToChat) {
      onNavigateToChat();
    } else {
      navigate('/chat');
    }
  };

  const handleGoToSettings = () => {
    console.log('⚙️ Redirecionando para configurações...');
    if (onNavigateToSettings) {
      onNavigateToSettings();
    } else {
      navigate('/settings');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Simular conexão WhatsApp (para teste)
  const handleToggleConnection = () => {
    setIsConnected(!isConnected);
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="loading-dashboard">
            <div className="loading-spinner"></div>
            <p>Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        {/* Header do Dashboard */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Dashboard</h1>
            <p>Visão geral e estatísticas • {user?.name || user?.email || 'Usuário'}</p>
          </div>
          <div className="header-right">
            <button className="update-button" onClick={handleRefresh}>
              🔄 Atualizar
            </button>
            {/* Botão para simular conexão (REMOVER em produção) */}
            <button className="update-button" onClick={handleToggleConnection}>
              {isConnected ? '🔌 Desconectar' : '🔌 Simular Conexão'}
            </button>
          </div>
        </header>

        {/* Alerta WhatsApp Desconectado */}
        {!isConnected && (
          <div className="whatsapp-alert">
            <div className="whatsapp-alert-content">
              <h4>WhatsApp Desconectado</h4>
              <p>Conecte seu WhatsApp para receber mensagens</p>
            </div>
            <button className="connect-button" onClick={handleConnectWhatsApp}>
              Conectar
            </button>
          </div>
        )}

        {/* Grid de Estatísticas - 6 Cards */}
        <div className="stats-grid">
          
          {/* Card 1: Status WhatsApp */}
          <div className={`stat-card ${dashboardStats.systemStatus === 'connected' ? 'status-connected' : 'status-disconnected'}`}>
            <div className="stat-card-header">
              <span className="stat-label">Status WhatsApp</span>
              <span className="stat-icon">{isConnected ? '✅' : '❌'}</span>
            </div>
            <div className="stat-content">
              <span className="stat-number">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
              <p className="stat-description">
                {isConnected ? 'WhatsApp ativo' : 'Clique para conectar'}
              </p>
            </div>
          </div>

          {/* Card 2: Conversas */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Conversas</span>
              <span className="stat-icon">💬</span>
            </div>
            <div className="stat-content">
              <span className="stat-number">{dashboardStats.totalConversations}</span>
              <p className="stat-description">
                {dashboardStats.unreadMessages > 0 
                  ? `${dashboardStats.unreadMessages} não lidas`
                  : 'Todas lidas'
                }
              </p>
            </div>
          </div>

          {/* Card 3: Mensagens Hoje */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Mensagens Hoje</span>
              <span className="stat-icon">📊</span>
            </div>
            <div className="stat-content">
              <span className="stat-number">{dashboardStats.todayMessages}</span>
              <p className="stat-description">Esta semana: {dashboardStats.todayMessages * 7}</p>
            </div>
          </div>

          {/* Card 4: Tempo Online */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Tempo Online</span>
              <span className="stat-icon">⏱️</span>
            </div>
            <div className="stat-content">
              <span className="stat-number">{dashboardStats.onlineTime}</span>
              <p className="stat-description">Sessão atual</p>
            </div>
          </div>

          {/* Card 5: Resposta Média */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Resp. Média</span>
              <span className="stat-icon">⚡</span>
            </div>
            <div className="stat-content">
              <span className="stat-number">{dashboardStats.avgResponseTime}</span>
              <p className="stat-description">Tempo de resposta</p>
            </div>
          </div>

          {/* Card 6: Sistema */}
          <div className={`stat-card status-${dashboardStats.systemStatus === 'connected' ? 'connected' : 'warning'}`}>
            <div className="stat-card-header">
              <span className="stat-label">Sistema</span>
              <span className="stat-icon">💾</span>
            </div>
            <div className="stat-content">
              <span className="stat-number">
                {dashboardStats.systemStatus === 'connected' ? 'Operacional' : 'Atenção'}
              </span>
              <p className="stat-description">Status geral</p>
            </div>
          </div>

        </div>

        {/* Seção Ações Rápidas */}
        <section className="quick-actions-section">
          <div className="quick-actions-header">
            <h3>🚀 Ações Rápidas</h3>
          </div>
          <div className="quick-actions-grid">
            
            <button 
              className="quick-action-button"
              onClick={handleConnectWhatsApp}
            >
              <span className="icon">🔗</span>
              {isConnected ? 'Gerenciar Conexão' : 'Conectar WhatsApp'}
            </button>

            <button 
              className="quick-action-button secondary"
              onClick={handleGoToChat}
            >
              <span className="icon">💬</span>
              Acessar Conversas
            </button>

            <button 
              className="quick-action-button outline"
              onClick={handleGoToSettings}
            >
              <span className="icon">⚙️</span>
              Configurações
            </button>

          </div>
        </section>

      </div>
    </div>
  );
};

export default DashboardPage;