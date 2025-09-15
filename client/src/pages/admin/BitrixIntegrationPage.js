// ====================================
// 🔗 PÁGINA DE INTEGRAÇÃO BITRIX24 - v16.0 CORRIGIDA
// 🔐 Apenas para Administradores
// 📡 Usando APENAS componentes existentes do projeto
// ====================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

// === COMPONENTES EXISTENTES DO PROJETO ===
import { PrimaryButton, SecondaryButton, DangerButton, SuccessButton, GhostButton } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';

// ====================================
// 🔗 COMPONENTE PRINCIPAL
// ====================================
const BitrixIntegrationPage = () => {
  const { user } = useAuth();
  
  // === ESTADOS PRINCIPAIS ===
  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // === ESTADOS DO FORMULÁRIO ===
  const [formData, setFormData] = useState({
    bitrixDomain: '',
    webhookUrl: '',
    apiKey: '',
    webhookSecret: ''
  });
  
  // === TEMPLATES DE EXEMPLO ===
  const [templates, setTemplates] = useState([
    {
      id: '1',
      name: 'Boas-vindas - Novo Deal',
      event: 'ONCRMDEALADD',
      conditions: 'Estágio = "Novo" AND Valor > R$ 1.000',
      message: 'Olá {contactName}! 👋\n\nRecebemos sua solicitação "{dealTitle}" no valor de {dealAmount}.\n\nEm breve nossa equipe entrará em contato.\n\nAtenciosamente,\nPRIMEM COMEX',
      isActive: true,
      createdAt: '2025-09-13T10:00:00Z'
    },
    {
      id: '2',
      name: 'Follow-up Inatividade',
      event: 'CUSTOM_AUTOMATION',
      conditions: 'Dias sem atividade >= 7',
      message: '📞 Follow-up\n\nOlá {contactName}!\n\nO deal "{dealTitle}" está sem atividade há {daysInactive} dias.\n\nPodemos ajudar com alguma coisa?\n\nResponda esta mensagem ou ligue: +55 11 4002-8900',
      isActive: false,
      createdAt: '2025-09-12T15:30:00Z'
    },
    {
      id: '3',
      name: 'Lembrete de Pagamento',
      event: 'CUSTOM_AUTOMATION',
      conditions: 'Deal com pagamento vencendo em 3 dias',
      message: '💰 Lembrete de Pagamento\n\nOlá {contactName},\n\nO pagamento do deal "{dealTitle}" vence em {daysUntilDue} dias.\n\nValor: {dealAmount}\nVencimento: {dueDate}\n\nPor favor, providencie o pagamento.',
      isActive: true,
      createdAt: '2025-09-11T09:15:00Z'
    }
  ]);

  // === EFEITOS ===
  useEffect(() => {
    loadIntegration();
  }, []);

  // === FUNÇÕES PRINCIPAIS ===
  const loadIntegration = async () => {
    try {
      setLoading(true);
      // Simulação de carregamento - substituir por API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados simulados - substituir por API real
      const mockIntegration = {
        id: '1',
        bitrixDomain: 'primem.bitrix24.com.br',
        webhookUrl: 'https://primem.bitrix24.com.br/rest/123/abc123def456/',
        isActive: true,
        createdAt: '2025-09-10T08:00:00Z',
        stats: {
          webhooksReceived: 156,
          messagesProcessed: 143,
          messagesSent: 138,
          failureRate: 3.5
        }
      };
      
      setIntegration(mockIntegration);
    } catch (error) {
      console.error('Erro ao carregar integração:', error);
      setIntegration(null);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!integration) return;
    
    try {
      setTesting(true);
      // Simulação de teste - substituir por API real
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso
      alert('✅ Conexão com Bitrix24 estabelecida com sucesso!\n\nTodos os webhooks estão configurados corretamente.');
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      alert('❌ Falha na conexão: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  const saveIntegration = async () => {
    try {
      // Validações
      if (!formData.bitrixDomain.trim()) {
        alert('❌ Domínio Bitrix é obrigatório');
        return;
      }
      
      if (!formData.webhookUrl.trim()) {
        alert('❌ URL do webhook é obrigatória');
        return;
      }

      // Simulação de salvamento - substituir por API real
      const newIntegration = {
        id: integration?.id || Date.now().toString(),
        bitrixDomain: formData.bitrixDomain,
        webhookUrl: formData.webhookUrl,
        isActive: true,
        createdAt: integration?.createdAt || new Date().toISOString(),
        stats: integration?.stats || {
          webhooksReceived: 0,
          messagesProcessed: 0,
          messagesSent: 0,
          failureRate: 0
        }
      };
      
      setIntegration(newIntegration);
      setShowSetupModal(false);
      alert('✅ Integração configurada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar integração:', error);
      alert('❌ Erro ao salvar integração: ' + error.message);
    }
  };

  const toggleTemplate = (templateId) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isActive: !template.isActive }
        : template
    ));
  };

  // === VERIFICAÇÃO DE PERMISSÃO ===
  if (user?.role !== 'admin') {
    return (
      <div style={styles.noAccess}>
        <div style={styles.noAccessContent}>
          <div style={styles.noAccessIcon}>🔒</div>
          <h2 style={styles.noAccessTitle}>Acesso Restrito</h2>
          <p style={styles.noAccessDescription}>
            Apenas administradores podem configurar a integração com Bitrix24.
          </p>
          <div style={styles.noAccessInfo}>
            <p><strong>Seu perfil:</strong> {user?.role || 'Não identificado'}</p>
            <p><strong>Perfil necessário:</strong> Admin</p>
          </div>
        </div>
      </div>
    );
  }

  // === ESTADO DE CARREGAMENTO ===
  if (loading) {
    return (
      <div style={styles.loading}>
        <Loading />
        <p>Carregando configurações da integração...</p>
      </div>
    );
  }

  // === RENDER PRINCIPAL ===
  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>🔗 Integração Bitrix24</h1>
            <p style={styles.subtitle}>
              Configure a integração para receber automações do Bitrix24
            </p>
          </div>
          {integration && (
            <div style={{
              ...styles.statusBadge,
              backgroundColor: integration.isActive ? '#10b981' : '#ef4444',
              color: 'white'
            }}>
              {integration.isActive ? '✅ Ativa' : '❌ Inativa'}
            </div>
          )}
        </div>
      </header>

      {/* CONTEÚDO */}
      {!integration ? (
        // SETUP INICIAL
        <div style={styles.setupSection}>
          <div style={styles.setupCard}>
            <div style={styles.setupIcon}>🚀</div>
            <h2 style={styles.setupTitle}>Configurar Integração</h2>
            <p style={styles.setupDescription}>
              Configure a integração com Bitrix24 para enviar mensagens automáticas via WhatsApp.
            </p>
            
            <div style={styles.featuresList}>
              <div style={styles.feature}>✅ Mensagens automáticas quando deal é criado</div>
              <div style={styles.feature}>✅ Follow-up automático após período de inatividade</div>
              <div style={styles.feature}>✅ Lembretes de pagamento</div>
              <div style={styles.feature}>✅ Notificações de mudança de status</div>
              <div style={styles.feature}>✅ Templates personalizáveis</div>
              <div style={styles.feature}>✅ Processamento assíncrono de alta performance</div>
            </div>
            
            <PrimaryButton 
              onClick={() => setShowSetupModal(true)}
              style={styles.setupButton}
            >
              ➕ Configurar Integração
            </PrimaryButton>
          </div>
        </div>
      ) : (
        // INTERFACE PRINCIPAL
        <div style={styles.mainContent}>
          {/* NAVEGAÇÃO POR TABS */}
          <nav style={styles.tabNavigation}>
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === 'overview' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('overview')}
            >
              📊 Visão Geral
            </button>
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === 'templates' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('templates')}
            >
              📝 Templates
            </button>
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === 'logs' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('logs')}
            >
              📋 Logs
            </button>
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === 'settings' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Configurações
            </button>
          </nav>

          {/* CONTEÚDO DAS TABS */}
          <div style={styles.tabContent}>
            {/* TAB: VISÃO GERAL */}
            {activeTab === 'overview' && (
              <div style={styles.overviewTab}>
                {/* INFORMAÇÕES DA INTEGRAÇÃO */}
                <div style={styles.integrationInfo}>
                  <h3 style={styles.sectionTitle}>Informações da Integração</h3>
                  <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Domínio Bitrix:</span>
                      <span style={styles.infoValue}>{integration.bitrixDomain}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>URL do Webhook:</span>
                      <code style={styles.webhookUrl}>
                        {window.location.origin}/api/bitrix/webhook
                      </code>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Configurado em:</span>
                      <span style={styles.infoValue}>
                        {new Date(integration.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  <div style={styles.actions}>
                    <GhostButton
                      onClick={testConnection}
                      disabled={!integration || testing}
                    >
                      {testing ? '⏳ Testando...' : '🔍 Testar Conexão'}
                    </GhostButton>
                    <SecondaryButton
                      onClick={() => setShowSetupModal(true)}
                    >
                      ✏️ Editar Configurações
                    </SecondaryButton>
                  </div>
                </div>

                {/* ESTATÍSTICAS */}
                <div style={styles.statsSection}>
                  <h3 style={styles.sectionTitle}>Estatísticas</h3>
                  <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>📥</div>
                      <div style={styles.statContent}>
                        <div style={styles.statNumber}>{integration.stats.webhooksReceived}</div>
                        <div style={styles.statLabel}>Webhooks Recebidos</div>
                      </div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>⚙️</div>
                      <div style={styles.statContent}>
                        <div style={styles.statNumber}>{integration.stats.messagesProcessed}</div>
                        <div style={styles.statLabel}>Mensagens Processadas</div>
                      </div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>📤</div>
                      <div style={styles.statContent}>
                        <div style={styles.statNumber}>{integration.stats.messagesSent}</div>
                        <div style={styles.statLabel}>Mensagens Enviadas</div>
                      </div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>📊</div>
                      <div style={styles.statContent}>
                        <div style={styles.statNumber}>{integration.stats.failureRate}%</div>
                        <div style={styles.statLabel}>Taxa de Erro</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TEMPLATES */}
            {activeTab === 'templates' && (
              <div style={styles.templatesTab}>
                <div style={styles.templatesHeader}>
                  <h3 style={styles.sectionTitle}>Templates de Mensagem</h3>
                  <PrimaryButton style={styles.addButton}>
                    ➕ Novo Template
                  </PrimaryButton>
                </div>
                
                <div style={styles.templatesList}>
                  {templates.map(template => (
                    <div key={template.id} style={styles.templateCard}>
                      <div style={styles.templateHeader}>
                        <div>
                          <h4 style={styles.templateName}>{template.name}</h4>
                          <div style={styles.templateMeta}>
                            <span style={styles.templateEvent}>{template.event}</span>
                            <span style={styles.templateDate}>
                              {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <div style={styles.templateActions}>
                          <button
                            style={{
                              ...styles.toggleButton,
                              backgroundColor: template.isActive ? '#10b981' : '#ef4444'
                            }}
                            onClick={() => toggleTemplate(template.id)}
                          >
                            {template.isActive ? '✅' : '❌'}
                          </button>
                        </div>
                      </div>
                      
                      <div style={styles.templateConditions}>
                        <strong>Condições:</strong> {template.conditions}
                      </div>
                      
                      <div style={styles.templateMessage}>
                        <strong>Mensagem:</strong>
                        <pre style={styles.messagePreview}>
                          {template.message}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: LOGS */}
            {activeTab === 'logs' && (
              <div style={styles.logsTab}>
                <h3 style={styles.sectionTitle}>Logs de Atividade</h3>
                <p style={styles.comingSoon}>
                  📋 Logs detalhados de webhooks e atividades estarão disponíveis em breve.
                </p>
              </div>
            )}

            {/* TAB: CONFIGURAÇÕES */}
            {activeTab === 'settings' && (
              <div style={styles.settingsTab}>
                <h3 style={styles.sectionTitle}>Configurações Avançadas</h3>
                <p style={styles.comingSoon}>
                  ⚙️ Configurações avançadas da integração estarão disponíveis em breve.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CONFIGURAÇÃO */}
      {showSetupModal && (
        <Modal onClose={() => setShowSetupModal(false)}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>
              {integration ? '✏️ Editar Integração' : '➕ Configurar Integração'}
            </h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Domínio Bitrix24:</label>
              <Input 
                type="text"
                placeholder="primem.bitrix24.com.br"
                value={formData.bitrixDomain}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  bitrixDomain: e.target.value 
                }))}
                style={styles.input}
              />
              <small style={styles.hint}>
                Digite apenas o domínio, ex: empresa.bitrix24.com.br
              </small>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>URL do Webhook de Entrada:</label>
              <Input 
                type="text"
                placeholder="https://primem.bitrix24.com.br/rest/123/abc123def456/"
                value={formData.webhookUrl}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  webhookUrl: e.target.value 
                }))}
                style={styles.input}
              />
              <small style={styles.hint}>
                URL gerada no Bitrix24 em Configurações > Desenvolvedor > Webhooks
              </small>
            </div>
            
            <div style={styles.modalActions}>
              <SecondaryButton 
                onClick={() => setShowSetupModal(false)}
              >
                ❌ Cancelar
              </SecondaryButton>
              <PrimaryButton 
                onClick={saveIntegration}
              >
                {integration ? '✅ Salvar' : '➕ Configurar'}
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// === ESTILOS ===
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '20px'
  },
  
  // ESTADOS ESPECIAIS
  noAccess: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    backgroundColor: '#f8fafc'
  },
  noAccessContent: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px'
  },
  noAccessIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  noAccessTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px'
  },
  noAccessDescription: {
    color: '#6b7280',
    fontSize: '16px',
    marginBottom: '20px'
  },
  noAccessInfo: {
    backgroundColor: '#f3f4f6',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'left'
  },
  
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '16px'
  },

  // HEADER
  header: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0
  },
  statusBadge: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },

  // SETUP INICIAL
  setupSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '500px'
  },
  setupCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '48px',
    textAlign: 'center',
    maxWidth: '600px',
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
  },
  setupIcon: {
    fontSize: '72px',
    marginBottom: '24px'
  },
  setupTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px'
  },
  setupDescription: {
    fontSize: '18px',
    color: '#6b7280',
    marginBottom: '32px',
    lineHeight: '1.6'
  },
  featuresList: {
    textAlign: 'left',
    marginBottom: '40px'
  },
  feature: {
    padding: '8px 0',
    fontSize: '16px',
    color: '#374151'
  },
  setupButton: {
    fontSize: '18px',
    padding: '16px 32px'
  },

  // CONTEÚDO PRINCIPAL
  mainContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },

  // NAVEGAÇÃO
  tabNavigation: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb'
  },
  tab: {
    padding: '16px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s'
  },
  activeTab: {
    color: '#2563eb',
    borderBottom: '2px solid #2563eb',
    backgroundColor: '#eff6ff'
  },

  // CONTEÚDO DAS TABS
  tabContent: {
    padding: '24px'
  },

  // VISÃO GERAL
  overviewTab: {
    display: 'grid',
    gap: '24px'
  },
  integrationInfo: {
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px'
  },
  infoGrid: {
    display: 'grid',
    gap: '12px',
    marginBottom: '20px'
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: '14px'
  },
  infoValue: {
    fontWeight: '600',
    color: '#1f2937'
  },
  webhookUrl: {
    backgroundColor: '#f3f4f6',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace'
  },
  actions: {
    display: 'flex',
    gap: '12px'
  },

  // ESTATÍSTICAS
  statsSection: {
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  statIcon: {
    fontSize: '32px'
  },
  statContent: {
    flex: 1
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280'
  },

  // TEMPLATES
  templatesTab: {
    display: 'grid',
    gap: '20px'
  },
  templatesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  addButton: {
    fontSize: '14px'
  },
  templatesList: {
    display: 'grid',
    gap: '16px'
  },
  templateCard: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px'
  },
  templateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  templateName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },
  templateMeta: {
    display: 'flex',
    gap: '12px',
    fontSize: '12px',
    color: '#6b7280'
  },
  templateEvent: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  templateDate: {
    color: '#6b7280'
  },
  templateActions: {
    display: 'flex',
    gap: '8px'
  },
  toggleButton: {
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px'
  },
  templateConditions: {
    fontSize: '14px',
    color: '#374151',
    marginBottom: '12px'
  },
  templateMessage: {
    fontSize: '14px',
    color: '#374151'
  },
  messagePreview: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    padding: '12px',
    fontSize: '13px',
    fontFamily: 'monospace',
    margin: '8px 0 0 0',
    whiteSpace: 'pre-wrap'
  },

  // OUTRAS TABS
  logsTab: {
    textAlign: 'center',
    padding: '40px'
  },
  settingsTab: {
    textAlign: 'center',
    padding: '40px'
  },
  comingSoon: {
    fontSize: '16px',
    color: '#6b7280'
  },

  // MODAL
  modalContent: {
    padding: '24px',
    minWidth: '500px'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '24px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    marginBottom: '6px'
  },
  hint: {
    fontSize: '12px',
    color: '#6b7280'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px'
  }
};

export default BitrixIntegrationPage;