// client/src/components/media/AudioRecorder.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE AUDIO RECORDER
// Extraído do App.js v8.0 - Componente modular reutilizável
// =====================================

import React, { useState, useRef, useEffect } from 'react';

const AudioRecorder = ({ onRecordingComplete, onCancel }) => {
  // Estados do gravador
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Refs
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  // Inicialização e pedido de permissão
  useEffect(() => {
    requestMicrophonePermission();
    
    return () => {
      // Cleanup ao desmontar
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Solicitar permissão do microfone
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      setHasPermission(true);
      setIsInitializing(false);
      
      // Configurar MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = () => {
        // Processamento será feito no handleStopRecording
      };
      
      setMediaRecorder(recorder);
      
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      setHasPermission(false);
      setIsInitializing(false);
    }
  };

  // Iniciar gravação
  const startRecording = () => {
    if (!mediaRecorder || !hasPermission) return;
    
    setAudioChunks([]);
    setRecordingTime(0);
    setIsRecording(true);
    
    mediaRecorder.start();
    
    // Timer da gravação
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  // Parar gravação
  const stopRecording = () => {
    if (!mediaRecorder || !isRecording) return;
    
    setIsRecording(false);
    mediaRecorder.stop();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Processar gravação finalizada
  const handleStopRecording = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
    const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, { 
      type: 'audio/webm;codecs=opus' 
    });
    
    if (onRecordingComplete) {
      onRecordingComplete(audioFile);
    }
  };

  // Cancelar gravação
  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    
    setAudioChunks([]);
    setRecordingTime(0);
    
    if (onCancel) {
      onCancel();
    }
  };

  // Processar quando audioChunks atualizar
  useEffect(() => {
    if (!isRecording && audioChunks.length > 0) {
      handleStopRecording();
    }
  }, [audioChunks, isRecording]);

  // Formatação do tempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Renderização baseada no estado
  if (isInitializing) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.loadingSpinner}></div>
          <span>Inicializando gravador...</span>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <span>❌ Permissão de microfone negada</span>
          <button 
            style={styles.retryButton}
            onClick={requestMicrophonePermission}
          >
            🔄 Tentar novamente
          </button>
          <button 
            style={styles.cancelButton}
            onClick={handleCancel}
          >
            ❌ Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>🎤 Gravar Áudio</span>
        <button 
          style={styles.closeButton}
          onClick={handleCancel}
          title="Fechar"
        >
          ✖️
        </button>
      </div>

      <div style={styles.recordingArea}>
        {/* Indicador de gravação */}
        <div style={styles.recordingIndicator}>
          {isRecording && (
            <div style={styles.pulsingDot}></div>
          )}
          <span style={styles.status}>
            {isRecording ? 'Gravando...' : 'Pronto para gravar'}
          </span>
        </div>

        {/* Timer */}
        <div style={styles.timer}>
          {formatTime(recordingTime)}
        </div>

        {/* Botões de controle */}
        <div style={styles.controls}>
          {!isRecording ? (
            <button 
              style={styles.recordButton}
              onClick={startRecording}
            >
              ⏺️ Gravar
            </button>
          ) : (
            <button 
              style={styles.stopButton}
              onClick={stopRecording}
            >
              ⏹️ Parar
            </button>
          )}
          
          <button 
            style={styles.cancelButton}
            onClick={handleCancel}
          >
            ❌ Cancelar
          </button>
        </div>

        {/* Dica de uso */}
        {!isRecording && recordingTime === 0 && (
          <div style={styles.hint}>
            💡 Clique em "Gravar" e fale próximo ao microfone
          </div>
        )}
      </div>
    </div>
  );
};

// Estilos do componente
const styles = {
  container: {
    position: 'fixed',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    border: '1px solid #e1e5e9',
    zIndex: 1000,
    minWidth: '320px',
    maxWidth: '400px'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #e1e5e9',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px 12px 0 0'
  },

  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2c3e50'
  },

  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },

  recordingArea: {
    padding: '20px',
    textAlign: 'center'
  },

  recordingIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '16px'
  },

  pulsingDot: {
    width: '12px',
    height: '12px',
    backgroundColor: '#e74c3c',
    borderRadius: '50%',
    animation: 'pulse 1.5s infinite'
  },

  status: {
    fontSize: '14px',
    color: '#7f8c8d',
    fontWeight: '500'
  },

  timer: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '20px',
    fontFamily: 'monospace'
  },

  controls: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '16px'
  },

  recordButton: {
    padding: '12px 24px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    minWidth: '100px'
  },

  stopButton: {
    padding: '12px 24px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    minWidth: '100px'
  },

  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#bdc3c7',
    color: '#2c3e50',
    border: 'none',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    minWidth: '100px'
  },

  hint: {
    fontSize: '13px',
    color: '#7f8c8d',
    fontStyle: 'italic',
    padding: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e1e5e9'
  },

  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '20px'
  },

  loadingSpinner: {
    width: '24px',
    height: '24px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  error: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '20px',
    textAlign: 'center'
  },

  retryButton: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

// Adicionar keyframes para animações (caso necessário)
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

// PropTypes (opcional)
AudioRecorder.defaultProps = {
  onRecordingComplete: () => {},
  onCancel: () => {}
};

export default AudioRecorder;