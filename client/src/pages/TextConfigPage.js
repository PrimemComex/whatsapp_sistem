// ====================================
// 📝 PÁGINA DE CONFIGURAÇÃO DE TEXTOS - v16.0
// 🔐 Apenas para Administradores
// ⚙️ Controle centralizado de todas as mensagens do sistema
// ====================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

// === COMPONENTES MODULARES ===
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Loading } from '../../components/ui/Loading';

// === HOOKS PERSONALIZADOS ===
import { useSettings } from '../../hooks/useSettings';
import { useNotifications } from '../../hooks/useNotifications';

// ====================================
// 📝 CONFIGURAÇÕES DE TEXTO PADRÃO
// ====================================
const DEFAULT_CONFIGS = {
  chatbot: {
    welcome: {
      key: 'chatbot.welcome',
      label: 'Mensagem de Boas-vindas do Chatbot',
      description: 'Primeira mensagem enviada pelo assistente virtual',
      defaultValue: '🤖 Olá! Sou o assistente virtual da {companyName}.\n\nComo posso ajudá-lo?\n\n1️⃣ Comercial\n2️⃣ Operacional\n3️⃣ Financeiro\n4️⃣ Suporte Técnico\n0️⃣ Falar com Atendente\n\nDigite o número da opção desejada:',
      variables: ['{companyName}', '{currentTime}', '{contactName}']
    },
    fallback: {
      key: 'chatbot.fallback',
      label: 'Mensagem de Opção Inválida',
      description: 'Quando usuário escolhe opção inexistente',
      defaultValue: '❌ Opção inválida.\n\nPor favor, digite apenas o número da opção desejada (1, 2, 3, 4 ou 0).',
      variables: []
    },
    offHours: {
      key: 'chatbot.offHours',
      label: 'Mensagem Fora do Horário',
      description: 'Enviada fora do horário comercial',
      defaultValue: '🕒 Nosso atendimento funciona de segunda a sexta das 8h às 18h.\n\nDeixe sua mensagem que retornaremos assim que possível.',
      variables: ['{workingHours}', '{nextBusinessDay}']
    }
  },
  autoResponse: {
    firstContact: {
      key: 'autoResponse.firstContact',
      label: 'Primeira Mensagem de Contato',
      description: 'Auto-resposta para novos contatos',
      defaultValue: '👋 Olá! Obrigado por entrar em contato com a {companyName}.\n\nRecebemos sua mensagem e retornaremos em breve.',
      variables: ['{companyName}', '{contactName}', '{estimatedTime}']
    },
    businessHours: {
      key: 'autoResponse.businessHours',
      label: 'Mensagem Fora do Horário',
      description: 'Quando receber mensagem fora do expediente',
      defaultValue: '🕐 Recebemos sua mensagem fora do horário comercial.\n\nRetornaremos no próximo dia útil.\n\nHorário: Segunda a Sexta, 8h às 18h',
      variables: ['{workingHours}', '{nextBusinessDay}']
    }
  },
  bitrix: {
    newDeal: {
      key: 'bitrix.newDeal',
      label: 'Novo Deal Criado',
      description: 'Mensagem quando deal é criado no Bitrix24',
      defaultValue: 'Olá {contactName}! 👋\n\nRecebemos sua solicitação "{dealTitle}" no valor de {dealAmount}.\n\nEm breve nossa equipe entrará em contato.\n\nAtenciosamente,\n{companyName}',
      variables: ['{contactName}', '{dealTitle}', '{dealAmount}', '{companyName}', '{responsibleUser}']
    },
    followUp: {
      key: 'bitrix.followUp',
      label: 'Follow-up Automático',
      description: 'Mensagem de follow-up quando deal fica inativo',
      defaultValue: '📞 Follow-up\n\nOlá {contactName}!\n\nO deal "{dealTitle}" está sem atividade há {daysInactive} dias.\n\nPodemos ajudar com alguma coisa?\n\nResponda esta mensagem ou ligue: {companyPhone}',
      variables: ['{contactName}', '{dealTitle}', '{daysInactive}', '{companyPhone}']
    }
  },
  signatures: {
    global: {
      key: 'signatures.global',
      label: 'Assinatura Global',
      description: 'Assinatura padrão para todas as mensagens',
      defaultValue: '\n---\nAtenciosamente,\n{userName}\n{userDepartment}\n{companyName}\n{companyPhone}',
      variables: ['{userName}', '{userEmail}', '{userDepartment}', '{companyName}', '{companyPhone}']
    }
  }
};

// ====================================
// 📝 COMPONENTE PRINCIPAL
// ====================================
const TextConfigPage = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [previewValue, setPreviewValue] = useState('');
  const [activeTab, setActiveTab] = useState('chatbot');

  // === VARIÁVEIS DISPONÍVEIS ===
  const sampleVariables = {
    companyName: 'PRIMEM COMEX',
    companyPhone: '+55 11 4002-8900',
    contactName: 'João Silva',
    dealTitle: 'Importação Equipamentos',
    dealAmount: 'R$ 50.000,00',
    userName: user?.name || 'Usuário',
    userDepartment: user?.department || 'Departamento',
    currentTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    workingHours: 'Segunda a Sexta, 8h às 18h',
    nextBusinessDay: 'Segunda-feira',
    daysInactive: '7',
    estimatedTime: '2 horas'
  };

  // === CARREGAR CONFIGURAÇÕES ===
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      // Simular carregamento da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Carregar do localStorage ou usar padrões
      const saved = localStorage.getItem('primem_text_configs');
      if (saved) {
        setConfigs(JSON.parse(saved));
      } else {
        setConfigs(DEFAULT_CONFIGS);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      showNotification('Erro ao carregar configurações', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // === SALVAR CONFIGURAÇÃO ===
  const saveConfig = async () => {
    if (!selectedConfig) return;

    setSaving(true);
    try {
      // Simular salvamento na API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Atualizar configuração
      const [category, key] = selectedConfig.key.split('.');
      const newConfigs = {
        ...configs,
        [category]: {
          ...configs[category],
          [key]: {
            ...configs[category][key],
            value: editingValue
          }
        }
      };
      
      setConfigs(newConfigs);
      localStorage.setItem('primem_text_configs', JSON.stringify(newConfigs));
      
      showNotification('Configuração salva com sucesso!', { type: 'success' });
      setSelectedConfig(null);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showNotification('Erro ao salvar configuração', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // === RESETAR PARA PADRÃO ===
  const resetToDefault = () => {
    if (!selectedConfig) return;
    setEditingValue(selectedConfig.defaultValue);
    updatePreview(selectedConfig.defaultValue);
  };

  // === ATUALIZAR PREVIEW ===
  const updatePreview = (text) => {
    let preview = text;
    Object.keys(sampleVariables).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      preview = preview.replace(regex, sampleVariables[key]);
    });
    setPreviewValue(preview);
  };

  // === EDITAR CONFIGURAÇÃO ===
  const editConfig = (category, key) => {
    const config = configs[category]?.[key] || DEFAULT_CONFIGS[category][key];
    const configWithKey = { ...config, key: `${category}.${key}` };
    
    setSelectedConfig(configWithKey);
    const currentValue = config.value || config.defaultValue;
    setEditingValue(currentValue);
    updatePreview(currentValue);
  };

  // === RENDERIZAR TABS ===
  const renderTabs = () => {
    const tabs = [
      { key: 'chatbot', label: '🤖 Chatbot', icon: '🤖' },
      { key: 'autoResponse', label: '🔄 Auto-resposta', icon: '🔄' },
      { key: 'bitrix', label: '🔗 Integração Bitrix', icon: '🔗' },
      { key: 'signatures', label: '✍️ Assinaturas', icon: '✍️' }
    ];

    return (
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: activeTab === tab.key ? '#2B4C8C' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#6b7280',
              cursor: 'pointer',
              borderRadius: '8px 8px 0 0',
              fontWeight: activeTab === tab.key ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    );
  };

  // === RENDERIZAR CONFIGURAÇÕES ===
  const renderConfigs = (category) => {
    const categoryConfigs = configs[category] || DEFAULT_CONFIGS[category];
    
    return (
      <div style={{
        display: 'grid',
        gap: '16px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
      }}>
        {Object.keys(categoryConfigs).map(key => {
          const config = categoryConfigs[key];
          const currentValue = config.value || config.defaultValue;
          
          return (
            <div
              key={key}
              style={{
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: 'white',
                transition: 'border-color 0.2s'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {config.label}
                  </h3>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {config.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => editConfig(category, key)}
                >
                  ✏️ Editar
                </Button>
              </div>
              
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                border: '1px solid #e5e7eb',
                maxHeight: '100px',
                overflow: 'auto'
              }}>
                {currentValue.substring(0, 100)}
                {currentValue.length > 100 && '...'}
              </div>
              
              {config.variables && config.variables.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <small style={{ color: '#6b7280' }}>
                    <strong>Variáveis disponíveis:</strong>{' '}
                    {config.variables.join(', ')}
                  </small>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // === VERIFICAR PERMISSÃO ===
  if (user?.role !== 'admin') {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <h2>🔒 Acesso Restrito</h2>
        <p>Apenas administradores podem configurar textos do sistema.</p>
      </div>
    );
  }

  if (loading) {
    return <Loading message="Carregando configurações de texto..." />;
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* === HEADER === */}
      <div style={{
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '2px solid #2B4C8C'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#2B4C8C',
          margin: '0 0 8px 0'
        }}>
          📝 Configuração de Textos
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          margin: 0
        }}>
          Configure todas as mensagens automáticas do sistema
        </p>
      </div>

      {/* === TABS === */}
      {renderTabs()}

      {/* === CONTEÚDO === */}
      {renderConfigs(activeTab)}

      {/* === MODAL DE EDIÇÃO === */}
      <Modal
        isOpen={!!selectedConfig}
        onClose={() => setSelectedConfig(null)}
        title={`Editar: ${selectedConfig?.label}`}
        maxWidth="800px"
      >
        {selectedConfig && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Conteúdo da Mensagem:
              </label>
              <textarea
                value={editingValue}
                onChange={(e) => {
                  setEditingValue(e.target.value);
                  updatePreview(e.target.value);
                }}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
                placeholder="Digite o conteúdo da mensagem..."
              />
            </div>

            {/* VARIÁVEIS DISPONÍVEIS */}
            {selectedConfig.variables && selectedConfig.variables.length > 0 && (
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '2px solid #0ea5e9',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <strong style={{ color: '#0c4a6e' }}>Variáveis disponíveis:</strong>
                <div style={{
                  marginTop: '8px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {selectedConfig.variables.map(variable => (
                    <button
                      key={variable}
                      onClick={() => {
                        const newValue = editingValue + variable;
                        setEditingValue(newValue);
                        updatePreview(newValue);
                      }}
                      style={{
                        backgroundColor: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PREVIEW */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Preview da Mensagem:
              </label>
              <div style={{
                backgroundColor: '#dcf8c6',
                border: '2px solid #25d366',
                borderRadius: '18px',
                padding: '12px 16px',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {previewValue || 'Preview aparecerá aqui...'}
              </div>
            </div>

            {/* BOTÕES */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <Button
                variant="outline"
                onClick={resetToDefault}
              >
                🔄 Restaurar Padrão
              </Button>
              <Button
                variant="danger"
                onClick={() => setSelectedConfig(null)}
              >
                ❌ Cancelar
              </Button>
              <Button
                variant="success"
                onClick={saveConfig}
                loading={saving}
              >
                ✅ Salvar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TextConfigPage;