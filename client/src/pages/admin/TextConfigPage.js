// ====================================
// 📝 PÁGINA DE CONFIGURAÇÃO DE TEXTOS - v16.0 SIMPLIFICADA
// 🔐 Apenas para Administradores
// Usando APENAS componentes existentes do projeto
// ====================================

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

// === COMPONENTES EXISTENTES DO PROJETO ===
import { PrimaryButton, SecondaryButton, SuccessButton } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';

const TextConfigPage = () => {
  const { user } = useAuth();
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [editValue, setEditValue] = useState('');

  // === CONFIGURAÇÕES EXEMPLO ===
  const defaultConfigs = [
    {
      id: 'chatbot_welcome',
      name: 'Mensagem de Boas-vindas do Chatbot',
      description: 'Primeira mensagem enviada pelo assistente virtual',
      value: '🤖 Olá! Sou o assistente virtual da PRIMEM COMEX.\n\nComo posso ajudá-lo?\n\n1️⃣ Comercial\n2️⃣ Operacional\n3️⃣ Financeiro\n0️⃣ Falar com Atendente'
    },
    {
      id: 'auto_response_first',
      name: 'Auto-resposta Primeiro Contato',
      description: 'Resposta automática para novos contatos',
      value: '👋 Olá! Obrigado por entrar em contato com a PRIMEM COMEX.\n\nRecebemos sua mensagem e retornaremos em breve.'
    },
    {
      id: 'bitrix_new_deal',
      name: 'Novo Deal Bitrix24',
      description: 'Mensagem quando deal é criado no Bitrix24',
      value: 'Olá! 👋\n\nRecebemos sua solicitação e em breve nossa equipe entrará em contato.\n\nAtenciosamente,\nPRIMEM COMEX'
    }
  ];

  // === EDITAR CONFIGURAÇÃO ===
  const editConfig = (config) => {
    setEditingConfig(config);
    setEditValue(config.value);
    setShowModal(true);
  };

  // === SALVAR CONFIGURAÇÃO ===
  const saveConfig = () => {
    if (editingConfig) {
      setConfigs({
        ...configs,
        [editingConfig.id]: editValue
      });
      alert('Configuração salva com sucesso!');
    }
    setShowModal(false);
    setEditingConfig(null);
    setEditValue('');
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
    return <Loading />;
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

      {/* === LISTA DE CONFIGURAÇÕES === */}
      <div style={{
        display: 'grid',
        gap: '16px'
      }}>
        {defaultConfigs.map(config => {
          const currentValue = configs[config.id] || config.value;
          
          return (
            <div
              key={config.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '2px solid #e5e7eb'
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
                    {config.name}
                  </h3>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {config.description}
                  </p>
                </div>
                <PrimaryButton onClick={() => editConfig(config)}>
                  ✏️ Editar
                </PrimaryButton>
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
                {currentValue.substring(0, 150)}
                {currentValue.length > 150 && '...'}
              </div>
            </div>
          );
        })}
      </div>

      {/* === MODAL DE EDIÇÃO === */}
      {showModal && editingConfig && (
        <Modal onClose={() => setShowModal(false)}>
          <div style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>
              Editar: {editingConfig.name}
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
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

            {/* PREVIEW */}
            <div style={{ marginBottom: '24px' }}>
              <strong>Preview:</strong>
              <div style={{
                backgroundColor: '#dcf8c6',
                border: '2px solid #25d366',
                borderRadius: '18px',
                padding: '12px 16px',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                maxHeight: '150px',
                overflow: 'auto',
                marginTop: '8px'
              }}>
                {editValue || 'Preview aparecerá aqui...'}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <SecondaryButton onClick={() => setShowModal(false)}>
                ❌ Cancelar
              </SecondaryButton>
              <SuccessButton onClick={saveConfig}>
                ✅ Salvar
              </SuccessButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TextConfigPage;
export { TextConfigPage };