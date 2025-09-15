// components/modals/ScheduleModal.js
import React, { useState, useEffect } from 'react';

const ScheduleModal = ({ isOpen, onClose, selectedChat, onSendMessage }) => {
  // ================================
  // ESTADOS
  // ================================
  
  const [scheduleData, setScheduleData] = useState({
    message: '',
    date: '',
    time: '',
    recurring: false,
    interval: 'daily'
  });
  
  const [pendingMessages, setPendingMessages] = useState([]);

  // ================================
  // EFEITOS
  // ================================
  
  useEffect(() => {
    if (isOpen) {
      loadPendingMessages();
      // Limpar formulário quando abrir
      setScheduleData({
        message: '',
        date: '',
        time: '',
        recurring: false,
        interval: 'daily'
      });
    }
  }, [isOpen]);

  // ================================
  // FUNÇÕES AUXILIARES
  // ================================
  
  const loadPendingMessages = () => {
    const existing = JSON.parse(localStorage.getItem('primem_scheduled_messages') || '[]');
    const pending = existing.filter(msg => 
      new Date(msg.scheduledFor) > new Date() && msg.status === 'pending'
    );
    setPendingMessages(pending);
  };

  const handleSave = () => {
    if (!scheduleData.message.trim() || !scheduleData.date || !scheduleData.time) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (!selectedChat) {
      alert('Selecione um chat primeiro');
      return;
    }

    // Criar datetime
    const scheduledDateTime = new Date(`${scheduleData.date}T${scheduleData.time}`);
    
    // Verificar se é no futuro
    if (scheduledDateTime <= new Date()) {
      alert('A data e hora devem ser no futuro');
      return;
    }

    const messageData = {
      id: Date.now(),
      chatId: selectedChat.id,
      chatName: selectedChat.name,
      message: scheduleData.message,
      scheduledFor: scheduledDateTime.toISOString(),
      recurring: scheduleData.recurring,
      interval: scheduleData.interval,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Salvar no localStorage
    const existing = JSON.parse(localStorage.getItem('primem_scheduled_messages') || '[]');
    existing.push(messageData);
    localStorage.setItem('primem_scheduled_messages', JSON.stringify(existing));

    // Agendar execução
    scheduleMessage(messageData);

    // Atualizar lista
    loadPendingMessages();

    // Limpar formulário
    setScheduleData({
      message: '',
      date: '',
      time: '',
      recurring: false,
      interval: 'daily'
    });

    alert('Mensagem agendada com sucesso!');
  };

  const scheduleMessage = (messageData) => {
    const scheduledTime = new Date(messageData.scheduledFor);
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(async () => {
        // Verificar se ainda está agendada
        const existing = JSON.parse(localStorage.getItem('primem_scheduled_messages') || '[]');
        const currentMessage = existing.find(msg => msg.id === messageData.id);
        
        if (currentMessage && currentMessage.status === 'pending') {
          // Enviar mensagem
          try {
            if (onSendMessage) {
              await onSendMessage(messageData.chatId, messageData.message);
            }
            
            console.log('📤 Mensagem agendada enviada:', messageData.message);
          } catch (error) {
            console.error('❌ Erro ao enviar mensagem agendada:', error);
          }

          // Atualizar status
          const updated = existing.map(msg => 
            msg.id === messageData.id ? 
              {...msg, status: 'sent', sentAt: new Date().toISOString()} : msg
          );
          localStorage.setItem('primem_scheduled_messages', JSON.stringify(updated));
          
          // Se for recorrente, agendar próxima
          if (messageData.recurring) {
            const nextSchedule = calculateNextSchedule(scheduledTime, messageData.interval);
            const nextMessage = {
              ...messageData,
              id: Date.now(),
              scheduledFor: nextSchedule.toISOString(),
              status: 'pending'
            };
            existing.push(nextMessage);
            localStorage.setItem('primem_scheduled_messages', JSON.stringify(existing));
            scheduleMessage(nextMessage);
          }
        }
      }, delay);
    }
  };

  const calculateNextSchedule = (currentDate, interval) => {
    const next = new Date(currentDate);
    switch(interval) {
      case 'daily': 
        next.setDate(next.getDate() + 1); 
        break;
      case 'weekly': 
        next.setDate(next.getDate() + 7); 
        break;
      case 'monthly': 
        next.setMonth(next.getMonth() + 1); 
        break;
      default: 
        next.setDate(next.getDate() + 1);
    }
    return next;
  };

  const cancelScheduledMessage = (messageId) => {
    const existing = JSON.parse(localStorage.getItem('primem_scheduled_messages') || '[]');
    const updated = existing.filter(msg => msg.id !== messageId);
    localStorage.setItem('primem_scheduled_messages', JSON.stringify(updated));
    loadPendingMessages();
    
    alert('Agendamento cancelado com sucesso!');
  };

  const formatScheduledTime = (isoString) => {
    return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIntervalText = (interval) => {
    switch(interval) {
      case 'daily': return 'Diariamente';
      case 'weekly': return 'Semanalmente';
      case 'monthly': return 'Mensalmente';
      default: return interval;
    }
  };

  // ================================
  // RENDERIZAÇÃO
  // ================================
  
  if (!isOpen) return null;

  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{...modalStyles.modal, minWidth: '600px', maxHeight: '80vh'}} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>⏰ Agendamento de Mensagens</h3>
          <button style={modalStyles.closeBtn} onClick={onClose}>✖</button>
        </div>
        
        <div style={modalStyles.body}>
          <div style={scheduleStyles.tabs}>
            <div style={scheduleStyles.tabContent}>
              <h4 style={{color: '#2B4C8C'}}>📝 Nova Mensagem Agendada</h4>
              
              {/* SELETOR DE CHAT */}
              <div style={scheduleStyles.chatInfo}>
                <strong>📱 Chat Selecionado:</strong> {selectedChat?.name || 'Nenhum chat selecionado'}
                {!selectedChat && (
                  <div style={{color: '#e74c3c', fontSize: '12px', marginTop: '5px'}}>
                    ⚠️ Selecione um chat antes de agendar uma mensagem
                  </div>
                )}
              </div>
              
              {/* CAMPO DE MENSAGEM */}
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>📋 Mensagem:</label>
                <textarea
                  value={scheduleData.message}
                  onChange={(e) => setScheduleData(prev => ({...prev, message: e.target.value}))}
                  style={{...modalStyles.input, minHeight: '80px', resize: 'vertical'}}
                  placeholder="Digite a mensagem a ser enviada..."
                  maxLength={1000}
                />
                <small style={modalStyles.hint}>
                  {scheduleData.message.length}/1000 caracteres
                </small>
              </div>

              {/* DATA E HORA */}
              <div style={scheduleStyles.dateTimeRow}>
                <div style={modalStyles.formGroup}>
                  <label style={modalStyles.label}>📅 Data:</label>
                  <input
                    type="date"
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData(prev => ({...prev, date: e.target.value}))}
                    style={modalStyles.input}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div style={modalStyles.formGroup}>
                  <label style={modalStyles.label}>🕒 Horário:</label>
                  <input
                    type="time"
                    value={scheduleData.time}
                    onChange={(e) => setScheduleData(prev => ({...prev, time: e.target.value}))}
                    style={modalStyles.input}
                  />
                </div>
              </div>

              {/* OPÇÕES DE RECORRÊNCIA */}
              <div style={scheduleStyles.optionsRow}>
                <div style={scheduleStyles.checkboxGroup}>
                  <label style={scheduleStyles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={scheduleData.recurring}
                      onChange={(e) => setScheduleData(prev => ({...prev, recurring: e.target.checked}))}
                    />
                    🔄 Repetir mensagem
                  </label>
                </div>

                {scheduleData.recurring && (
                  <select
                    value={scheduleData.interval}
                    onChange={(e) => setScheduleData(prev => ({...prev, interval: e.target.value}))}
                    style={{...modalStyles.input, width: 'auto'}}
                  >
                    <option value="daily">📅 Diariamente</option>
                    <option value="weekly">📅 Semanalmente</option>
                    <option value="monthly">📅 Mensalmente</option>
                  </select>
                )}
              </div>

              {/* PREVIEW DA MENSAGEM */}
              {scheduleData.message && scheduleData.date && scheduleData.time && (
                <div style={scheduleStyles.preview}>
                  <h5>🔍 Preview do Agendamento:</h5>
                  <div style={scheduleStyles.previewContent}>
                    <div><strong>📱 Para:</strong> {selectedChat?.name}</div>
                    <div><strong>📅 Quando:</strong> {formatScheduledTime(`${scheduleData.date}T${scheduleData.time}`)}</div>
                    <div><strong>📝 Mensagem:</strong> "{scheduleData.message}"</div>
                    {scheduleData.recurring && (
                      <div><strong>🔄 Repetição:</strong> {getIntervalText(scheduleData.interval)}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MENSAGENS PENDENTES */}
          <div style={scheduleStyles.pendingSection}>
            <h4 style={{color: '#2B4C8C'}}>📋 Mensagens Agendadas ({pendingMessages.length})</h4>
            <div style={scheduleStyles.pendingList}>
              {pendingMessages.length > 0 ? (
                pendingMessages.map(msg => (
                  <div key={msg.id} style={scheduleStyles.pendingItem}>
                    <div style={scheduleStyles.pendingInfo}>
                      <div style={scheduleStyles.pendingMessage}>
                        📝 {msg.message.substring(0, 50)}{msg.message.length > 50 ? '...' : ''}
                      </div>
                      <div style={scheduleStyles.pendingDetails}>
                        📱 {msg.chatName} | 📅 {formatScheduledTime(msg.scheduledFor)}
                        {msg.recurring && <span> | 🔄 {getIntervalText(msg.interval)}</span>}
                      </div>
                    </div>
                    <button
                      style={scheduleStyles.cancelBtn}
                      onClick={() => cancelScheduledMessage(msg.id)}
                      title="Cancelar agendamento"
                    >
                      ❌
                    </button>
                  </div>
                ))
              ) : (
                <div style={scheduleStyles.emptyPending}>
                  ℹ️ Nenhuma mensagem agendada no momento
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* FOOTER */}
        <div style={modalStyles.footer}>
          <button style={modalStyles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button 
            style={{
              ...modalStyles.saveBtn,
              ...((!scheduleData.message.trim() || !scheduleData.date || !scheduleData.time || !selectedChat) ? 
                {backgroundColor: '#ccc', cursor: 'not-allowed'} : {})
            }}
            onClick={handleSave}
            disabled={!scheduleData.message.trim() || !scheduleData.date || !scheduleData.time || !selectedChat}
          >
            ⏰ Agendar Mensagem
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
    maxWidth: '800px',
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
    justifyContent: 'flex-end',
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
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box'
  },
  hint: {
    display: 'block',
    marginTop: '5px',
    color: '#666',
    fontSize: '12px'
  }
};

const scheduleStyles = {
  tabs: {
    marginBottom: '20px'
  },
  tabContent: {
    padding: '10px 0'
  },
  dateTimeRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  optionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    flexWrap: 'wrap'
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  chatInfo: {
    padding: '12px',
    backgroundColor: '#f0f2f5',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#333',
    marginBottom: '20px',
    border: '1px solid #ddd'
  },
  preview: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#e8f4fd',
    borderRadius: '8px',
    border: '1px solid #2B4C8C'
  },
  previewContent: {
    fontSize: '13px',
    lineHeight: '1.6'
  },
  pendingSection: {
    marginTop: '25px',
    borderTop: '2px solid #eee',
    paddingTop: '20px'
  },
  pendingList: {
    maxHeight: '250px',
    overflowY: 'auto',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa'
  },
  pendingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderBottom: '1px solid #eee',
    '&:last-child': {
      borderBottom: 'none'
    }
  },
  pendingInfo: {
    flex: 1
  },
  pendingMessage: {
    fontWeight: '500',
    fontSize: '14px',
    marginBottom: '5px',
    color: '#2B4C8C'
  },
  pendingDetails: {
    fontSize: '12px',
    color: '#666'
  },
  cancelBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#e74c3c',
    padding: '5px',
    borderRadius: '3px',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#ffe6e6'
    }
  },
  emptyPending: {
    padding: '20px',
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic'
  }
};

export default ScheduleModal;