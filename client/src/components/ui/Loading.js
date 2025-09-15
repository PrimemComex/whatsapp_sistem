// =====================================
// COMPONENTE DE LOADING - PRIMEM WHATSAPP
// Arquivo: client/src/components/ui/Loading.js
// =====================================

import React from 'react';

const Loading = ({ 
  message = "Carregando...", 
  size = "medium",
  color = "#2B4C8C" // Cor principal PRIMEM
}) => {
  // ====================================
  // ESTILOS INLINE
  // ====================================
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    gap: '15px'
  };

  const spinnerStyle = {
    width: size === 'large' ? '50px' : size === 'small' ? '20px' : '30px',
    height: size === 'large' ? '50px' : size === 'small' ? '20px' : '30px',
    border: `3px solid #f3f3f3`,
    borderTop: `3px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const textStyle = {
    color: color,
    fontSize: size === 'large' ? '16px' : size === 'small' ? '12px' : '14px',
    margin: 0,
    fontFamily: 'Arial, sans-serif'
  };

  // ====================================
  // CSS ANIMATION
  // ====================================
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // ====================================
  // RENDER
  // ====================================
  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      <p style={textStyle}>{message}</p>
    </div>
  );
};

// ====================================
// VARIAÇÕES PRÉ-DEFINIDAS
// ====================================
Loading.Auth = (props) => (
  <Loading 
    message="Verificando autenticação..." 
    color="#2B4C8C" 
    {...props} 
  />
);

Loading.WhatsApp = (props) => (
  <Loading 
    message="Conectando ao WhatsApp..." 
    color="#25D366" 
    {...props} 
  />
);

Loading.Chat = (props) => (
  <Loading 
    message="Carregando conversa..." 
    color="#2B4C8C" 
    {...props} 
  />
);

Loading.Upload = (props) => (
  <Loading 
    message="Enviando arquivo..." 
    color="#C97A4A" 
    {...props} 
  />
);

export default Loading;
export { Loading }; // ← ADICIONAR ESTA LINHA