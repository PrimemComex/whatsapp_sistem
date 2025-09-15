// client/src/components/MessageStatus.js
import React from 'react';

const MessageStatus = ({ status, fromMe }) => {
  if (!fromMe) return null;
  
  const getStatusIcon = () => {
    switch(status) {
      case 'pending':
        return '🕐'; // Relógio
      case 'sent':
        return '✓'; // Um check cinza
      case 'delivered':
        return '✓✓'; // Dois checks cinza
      case 'read':
        return <span style={{ color: '#4FC3F7' }}>✓✓</span>; // Dois checks azuis
      case 'error':
        return <span style={{ color: '#f44336' }}>⚠️</span>; // Erro vermelho
      default:
        return '🕐';
    }
  };
  
  const getStatusText = () => {
    switch(status) {
      case 'pending': return 'Enviando...';
      case 'sent': return 'Enviada';
      case 'delivered': return 'Entregue';
      case 'read': return 'Lida';
      case 'error': return 'Erro no envio';
      default: return '';
    }
  };
  
  return (
    <span 
      className="message-status" 
      title={getStatusText()}
      style={{
        fontSize: '14px',
        marginLeft: '4px',
        userSelect: 'none'
      }}
    >
      {getStatusIcon()}
    </span>
  );
};

export default MessageStatus;