// components/modals/KnowledgeModal.js
import React, { useState, useEffect } from 'react';

const KnowledgeModal = ({ isOpen, onClose, onSelectMessage }) => {
  // ================================
  // ESTADOS
  // ================================
  
  const [activeCategory, setActiveCategory] = useState('saudacoes');
  const [searchTerm, setSearchTerm] = useState('');
  const [customMessages, setCustomMessages] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMessage, setNewMessage] = useState({ 
    title: '', 
    content: '', 
    category: 'saudacoes' 
  });

  // ================================
  // BASE DE CONHECIMENTO PADRÃO
  // ================================
  
  const defaultKnowledge = {
    saudacoes: {
      name: '👋 Saudações',
      messages: [
        { 
          id: 1, 
          title: 'Bom dia profissional', 
          content: 'Bom dia! Como posso ajudá-lo hoje?' 
        },
        { 
          id: 2, 
          title: 'Boa tarde', 
          content: 'Boa tarde! Em que posso ser útil?' 
        },
        { 
          id: 3, 
          title: 'Primeira conversa', 
          content: 'Olá! Seja bem-vindo(a)! Sou da equipe de atendimento da PRIMEM COMEX. Como posso ajudá-lo?' 
        },
        { 
          id: 4, 
          title: 'Retorno de contato', 
          content: 'Olá novamente! Espero que esteja tudo bem. Vamos continuar nossa conversa?' 
        }
      ]
    },
    despedidas: {
      name: '👋 Despedidas',  
      messages: [
        { 
          id: 5, 
          title: 'Encerramento padrão', 
          content: 'Foi um prazer atendê-lo! Tenha um excelente dia!' 
        },
        { 
          id: 6, 
          title: 'Até logo', 
          content: 'Até logo! Qualquer dúvida, estarei aqui para ajudar.' 
        },
        { 
          id: 7, 
          title: 'Finalização com follow-up', 
          content: 'Obrigado pelo contato! Entraremos em contato em breve com mais informações.' 
        }
      ]
    },
    comercial: {
      name: '💼 Comercial',
      messages: [
        { 
          id: 8, 
          title: 'Apresentação da empresa', 
          content: 'A PRIMEM COMEX é especializada em comércio exterior, oferecendo soluções completas para importação e exportação.' 
        },
        { 
          id: 9, 
          title: 'Solicitar informações', 
          content: 'Para elaborarmos a melhor proposta, preciso de algumas informações. Poderia me fornecer os detalhes do produto?' 
        },
        { 
          id: 10, 
          title: 'Valores e condições', 
          content: 'Nossos valores são competitivos e personalizados. Vou preparar uma cotação especial para você!' 
        }
      ]
    },
    suporte: {
      name: '🛠️ Suporte',
      messages: [
        { 
          id: 11, 
          title: 'Identificar problema', 
          content: 'Entendo sua situação. Vou ajudá-lo a resolver isso. Pode me descrever com mais detalhes o que está acontecendo?' 
        },
        { 
          id: 12, 
          title: 'Aguardar análise', 
          content: 'Já recebi sua solicitação! Nossa equipe técnica está analisando e retornará em até 24 horas.' 
        },
        { 
          id: 13, 
          title: 'Acompanhamento', 
          content: 'Como anda o andamento da sua solicitação? Precisa de algum esclarecimento adicional?' 
        }
      ]
    },
    documentos: {
      name: '📄 Documentos',
      messages: [
        { 
          id: 14, 
          title: 'Lista de documentos', 
          content: 'Para prosseguirmos, precisaremos dos seguintes documentos: \n• RG/CPF\n• Comprovante de endereço\n• CNPJ da empresa' 
        },
        { 
          id: 15, 
          title: 'Envio de documentos', 
          content: 'Por favor, envie os documentos preferencialmente em PDF. Você pode enviar aqui mesmo pelo WhatsApp!' 
        },
        { 
          id: 16, 
          title: 'Documentos recebidos', 
          content: 'Documentos recebidos com sucesso! Vou analisar e retorno em breve.' 
        }
      ]
    },
    agendamento: {
      name: '📅 Agendamento',
      messages: [
        { 
          id: 17, 
          title: 'Agendar reunião', 
          content: 'Vamos agendar uma reunião? Tenho disponibilidade: \n• Segunda: 14h às 17h\n• Terça: 9h às 12h\n• Quarta: 14h às 18h' 
        },
        { 
          id: 18, 
          title: 'Confirmar agendamento', 
          content: 'Reunião confirmada para [DATA] às [HORA]. Enviarei o link da videochamada em breve!' 
        },
        { 
          id: 19, 
          title: 'Lembrete de reunião', 
          content: 'Lembrete: temos reunião hoje às [HORA]. O link é: [LINK]' 
        }
      ]
    }
  };

  // ================================
  // EFEITOS
  // ================================
  
  useEffect(() => {
    // Carregar mensagens personalizadas do localStorage
    const saved = localStorage.getItem('primem_custom_knowledge');
    if (saved) {
      try {
        setCustomMessages(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar conhecimento personalizado:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Limpar busca e formulário ao abrir
    if (isOpen) {
      setSearchTerm('');
      setShowAddForm(false);
      setNewMessage({ title: '', content: '', category: 'saudacoes' });
    }
  }, [isOpen]);

  // ================================
  // FUNÇÕES
  // ================================
  
  const saveCustomMessage = () => {
    if (!newMessage.title.trim() || !newMessage.content.trim()) {
      alert('Preencha título e conteúdo');
      return;
    }

    const message = {
      id: Date.now(),
      title: newMessage.title.trim(),
      content: newMessage.content.trim(),
      category: newMessage.category,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    const updated = [...customMessages, message];
    setCustomMessages(updated);
    localStorage.setItem('primem_custom_knowledge', JSON.stringify(updated));
    
    // Limpar formulário
    setNewMessage({ title: '', content: '', category: 'saudacoes' });
    setShowAddForm(false);
    
    alert('Mensagem personalizada salva com sucesso!');
  };

  const deleteCustomMessage = (messageId) => {
    if (window.confirm('Deseja realmente excluir esta mensagem personalizada?')) {
      const updated = customMessages.filter(msg => msg.id !== messageId);
      setCustomMessages(updated);
      localStorage.setItem('primem_custom_knowledge', JSON.stringify(updated));
      
      alert('Mensagem excluída com sucesso!');
    }
  };

  const getAllMessages = () => {
    const defaultMsgs = defaultKnowledge[activeCategory]?.messages || [];
    const customMsgs = customMessages.filter(msg => msg.category === activeCategory);
    return [...defaultMsgs, ...customMsgs];
  };

  const filteredMessages = getAllMessages().filter(msg =>
    msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalStats = () => {
    const totalDefault = Object.values(defaultKnowledge).reduce(
      (total, category) => total + category.messages.length, 0
    );
    const totalCustom = customMessages.length;
    return {
      total: totalDefault + totalCustom,
      default: totalDefault,
      custom: totalCustom
    };
  };

  const getCategoryStats = (categoryKey) => {
    const defaultCount = defaultKnowledge[categoryKey]?.messages.length || 0;
    const customCount = customMessages.filter(msg => msg.category === categoryKey).length;
    return {
      default: defaultCount,
      custom: customCount,
      total: defaultCount + customCount
    };
  };

  const handleUseMessage = (content) => {
    if (onSelectMessage) {
      onSelectMessage(content);
    }
    onClose();
  };

  // ================================
  // RENDERIZAÇÃO
  // ================================
  
  if (!isOpen) return null;

  const stats = getTotalStats();

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{...modalStyles.modal, minWidth: '700px', maxHeight: '85vh'}} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>📚 Base de Conhecimento</h3>
          <button style={modalStyles.closeBtn} onClick={onClose}>✖</button>
        </div>
        
        <div style={modalStyles.body}>
          {/* ESTATÍSTICAS GERAIS */}
          <div style={knowledgeStyles.statsBar}>
            <div style={knowledgeStyles.statsItem}>
              📊 <strong>{stats.total}</strong> mensagens total
            </div>
            <div style={knowledgeStyles.statsItem}>
              🏠 <strong>{stats.default}</strong> padrão
            </div>
            <div style={knowledgeStyles.statsItem}>
              ⭐ <strong>{stats.custom}</strong> personalizadas
            </div>
          </div>

          {/* BUSCA E ADICIONAR */}
          <div style={knowledgeStyles.searchContainer}>
            <input
              type="text"
              placeholder="🔍 Buscar mensagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={knowledgeStyles.searchInput}
            />
            <button 
              style={knowledgeStyles.addBtn}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? '❌ Cancelar' : '➕ Nova'}
            </button>
          </div>

          {/* FORMULÁRIO DE NOVA MENSAGEM */}
          {showAddForm && (
            <div style={knowledgeStyles.addForm}>
              <h4 style={{color: '#2B4C8C', marginBottom: '15px'}}>➕ Adicionar Nova Mensagem</h4>
              
              <div style={knowledgeStyles.formRow}>
                <input
                  type="text"
                  placeholder="Título da mensagem..."
                  value={newMessage.title}
                  onChange={(e) => setNewMessage(prev => ({...prev, title: e.target.value}))}
                  style={{...modalStyles.input, flex: 2}}
                  maxLength={100}
                />
                <select
                  value={newMessage.category}
                  onChange={(e) => setNewMessage(prev => ({...prev, category: e.target.value}))}
                  style={{...modalStyles.input, flex: 1}}
                >
                  {Object.entries(defaultKnowledge).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <textarea
                placeholder="Conteúdo da mensagem..."
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({...prev, content: e.target.value}))}
                style={{...modalStyles.input, minHeight: '80px', width: '100%', resize: 'vertical'}}
                maxLength={1000}
              />
              
              <div style={knowledgeStyles.formActions}>
                <small style={{color: '#666', flex: 1}}>
                  {newMessage.content.length}/1000 caracteres
                </small>
                <button 
                  style={modalStyles.cancelBtn} 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </button>
                <button 
                  style={modalStyles.saveBtn} 
                  onClick={saveCustomMessage}
                  disabled={!newMessage.title.trim() || !newMessage.content.trim()}
                >
                  💾 Salvar
                </button>
              </div>
            </div>
          )}

          {/* CATEGORIAS */}
          <div style={knowledgeStyles.categories}>
            {Object.entries(defaultKnowledge).map(([key, category]) => {
              const categoryStats = getCategoryStats(key);
              return (
                <button
                  key={key}
                  style={{
                    ...knowledgeStyles.categoryBtn,
                    ...(activeCategory === key ? knowledgeStyles.categoryBtnActive : {})
                  }}
                  onClick={() => setActiveCategory(key)}
                  title={`${categoryStats.total} mensagens (${categoryStats.default} padrão + ${categoryStats.custom} personalizadas)`}
                >
                  {category.name}
                  <span style={knowledgeStyles.categoryCount}>
                    {categoryStats.total}
                  </span>
                </button>
              );
            })}
          </div>

          {/* LISTA DE MENSAGENS */}
          <div style={knowledgeStyles.messagesList}>
            {filteredMessages.length > 0 ? (
              filteredMessages.map(msg => (
                <div key={msg.id} style={knowledgeStyles.messageItem}>
                  <div style={knowledgeStyles.messageHeader}>
                    <h5 style={knowledgeStyles.messageTitle}>
                      {msg.title}
                      {msg.isCustom && (
                        <span style={knowledgeStyles.customBadge}>PERSONALIZADA</span>
                      )}
                    </h5>
                    <div style={knowledgeStyles.messageActions}>
                      <button
                        style={knowledgeStyles.useBtn}
                        onClick={() => handleUseMessage(msg.content)}
                        title="Usar esta mensagem"
                      >
                        ✅ Usar
                      </button>
                      {msg.isCustom && (
                        <button
                          style={knowledgeStyles.deleteBtn}
                          onClick={() => deleteCustomMessage(msg.id)}
                          title="Excluir mensagem personalizada"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={knowledgeStyles.messageContent}>
                    {msg.content}
                  </div>
                </div>
              ))
            ) : (
              <div style={knowledgeStyles.emptyState}>
                {searchTerm ? (
                  <>
                    🔍 Nenhuma mensagem encontrada para "{searchTerm}"
                    <br />
                    <small>Tente buscar por outros termos</small>
                  </>
                ) : (
                  <>
                    📝 Nenhuma mensagem nesta categoria
                    <br />
                    <small>Adicione uma nova mensagem personalizada</small>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* FOOTER */}
        <div style={modalStyles.footer}>
          <div style={knowledgeStyles.footerStats}>
            <span>
              📊 Categoria: <strong>{defaultKnowledge[activeCategory]?.name}</strong> | 
              Mensagens: <strong>{filteredMessages.length}</strong>
              {searchTerm && <span> (filtradas de {getAllMessages().length})</span>}
            </span>
          </div>
          <button style={modalStyles.cancelBtn} onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

// ================================
// ESTILOS
// ================================

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    minWidth: '400px',
    maxWidth: '900px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 0 20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px',
    marginBottom: '20px'
  },
  title: {
    margin: 0,
    color: '#2B4C8C',
    fontSize: '18px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666',
    padding: '5px'
  },
  body: {
    padding: '0 20px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    padding: '15px 20px 20px 20px',
    borderTop: '1px solid #eee',
    marginTop: '20px'
  },
  cancelBtn: {
    padding: '10px 20px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    backgroundColor: 'white',
    color: '#666',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  saveBtn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#2B4C8C',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box'
  }
};

const knowledgeStyles = {
  statsBar: {
    display: 'flex',
    gap: '20px',
    padding: '10px 15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  statsItem: {
    color: '#666'
  },
  searchContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px'
  },
  searchInput: {
    flex: 1,
    padding: '10px 15px',
    border: '2px solid #ddd',
    borderRadius: '25px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  addBtn: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap'
  },
  addForm: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '2px solid #e9ecef'
  },
  formRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px'
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: '15px'
  },
  categories: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
    borderBottom: '2px solid #eee',
    paddingBottom: '15px'
  },
  categoryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 15px',
    border: '2px solid #ddd',
    backgroundColor: 'white',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.3s',
    position: 'relative'
  },
  categoryBtnActive: {
    backgroundColor: '#2B4C8C',
    color: 'white',
    borderColor: '#2B4C8C'
  },
  categoryCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '2px 6px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  messagesList: {
    maxHeight: '400px',
    overflowY: 'auto',
    paddingRight: '5px'
  },
  messageItem: {
    border: '2px solid #e9ecef',
    borderRadius: '10px',
    marginBottom: '12px',
    backgroundColor: 'white',
    transition: 'all 0.3s',
    '&:hover': {
      borderColor: '#2B4C8C',
      boxShadow: '0 2px 8px rgba(43,76,140,0.1)'
    }
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 15px 10px 15px',
    borderBottom: '1px solid #f0f0f0'
  },
  messageTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#2B4C8C',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  customBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: '#ffc107',
    color: '#000',
    borderRadius: '10px',
    fontWeight: 'bold'
  },
  messageActions: {
    display: 'flex',
    gap: '8px'
  },
  useBtn: {
    padding: '6px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '15px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.3s'
  },
  deleteBtn: {
    padding: '6px 8px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '15px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.3s'
  },
  messageContent: {
    padding: '10px 15px 15px 15px',
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#333',
    whiteSpace: 'pre-line'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666',
    fontStyle: 'italic',
    lineHeight: '1.6'
  },
  footerStats: {
    fontSize: '12px',
    color: '#666',
    flex: 1
  }
};

export default KnowledgeModal;