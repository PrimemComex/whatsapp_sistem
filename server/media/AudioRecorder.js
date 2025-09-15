// client/src/components/media/AudioRecorder.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE AUDIO RECORDER
// Extraído do App.js v8.1 - Gravação de áudios modulares
// =====================================

import React, { useState, useRef, useEffect } from 'react';

const AudioRecorder = ({ 
  onAudioRecorded, 
  onCancel,
  maxDuration = 300, // 5 minutos
  className = ''
}) => {
  // ====================================
  // ESTADOS DO GRAVADOR
  // ====================================
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [audioURL, setAudioURL] = useState('');

  // ====================================
  // REFS
  // ====================================
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const chunksRef = useRef([]);

  // ====================================
  // TIMER DA GRAVAÇÃO
  // ====================================
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused, maxDuration]);

  // ====================================
  // INICIAR GRAVAÇÃO
  // ====================================
  const startRecording = async () => {
    try {
      setError('');
      
      // Solicitar permissão de microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;

      // Configurar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        
        // Parar stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      // Iniciar gravação
      mediaRecorder.start(1000); // Chunk a cada 1 segundo
      setIsRecording(true);
      setRecordingTime(0);
      
      console.log('🎤 Gravação iniciada');

    } catch (err) {
      console.error('❌ Erro ao iniciar gravação:', err);
      setError('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  // ====================================
  // PAUSAR/RETOMAR GRAVAÇÃO
  // ====================================
  const togglePause = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      console.log('🎤 Gravação retomada');
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      console.log('⏸️ Gravação pausada');
    }
  };

  // ====================================
  // PARAR GRAVAÇÃO
  // ====================================
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      console.log('🎤 Gravação finalizada');
    }
  };

  // ====================================
  // REPRODUZIR PRÉVIA
  // ====================================
  const togglePlayback = () => {
    if (!audioRef.current || !audioURL) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // ====================================
  // CANCELAR GRAVAÇÃO
  // ====================================
  const handleCancel = () => {
    // Parar gravação se ativa
    if (isRecording) {
      stopRecording();
    }

    // Limpar dados
    setAudioBlob(null);
    setAudioURL('');
    setRecordingTime(0);
    setError('');
    setIsPlaying(false);

    // Parar stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (onCancel) {
      onCancel();
    }
  };

  // ====================================
  // ENVIAR ÁUDIO
  // ====================================
  const handleSend = () => {
    if (!audioBlob) return;

    const audioData = {
      blob: audioBlob,
      duration: recordingTime,
      url: audioURL,
      size: audioBlob.size,
      type: audioBlob.type
    };

    if (onAudioRecorded) {
      onAudioRecorded(audioData);
    }

    // Limpar após envio
    setAudioBlob(null);
    setAudioURL('');
    setRecordingTime(0);
    setError('');
    setIsPlaying(false);
  };

  // ====================================
  // FORMATAÇÃO DE TEMPO
  // ====================================
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ====================================
  // RENDER PRINCIPAL
  // ====================================
  return (
    <div style={styles.container} className={className}>
      
      {/* TÍTULO */}
      <div style={styles.header}>
        <h3 style={styles.title}>🎤 Gravador de Áudio</h3>
        <button onClick={handleCancel} style={styles.closeButton}>✕</button>
      </div>

      {/* ERRO */}
      {error && (
        <div style={styles.errorContainer}>
          <span style={styles.errorIcon}>⚠️</span>
          <span style={styles.errorText}>{error}</span>
        </div>
      )}

      {/* ÁREA DE GRAVAÇÃO */}
      <div style={styles.recordingArea}>
        
        {/* INDICADOR VISUAL */}
        <div style={{
          ...styles.indicator,
          ...(isRecording ? styles.indicatorRecording : {}),
          ...(isPaused ? styles.indicatorPaused : {})
        }}>
          {!isRecording && !audioBlob && '🎤'}
          {isRecording && !isPaused && '🔴'}
          {isPaused && '⏸️'}
          {audioBlob && !isRecording && '✅'}
        </div>

        {/* TIMER */}
        <div style={styles.timer}>
          {formatTime(recordingTime)}
          {maxDuration && (
            <span style={styles.maxTime}> / {formatTime(maxDuration)}</span>
          )}
        </div>

        {/* STATUS */}
        <div style={styles.status}>
          {!isRecording && !audioBlob && 'Pronto para gravar'}
          {isRecording && !isPaused && 'Gravando...'}
          {isPaused && 'Pausado'}
          {audioBlob && !isRecording && 'Gravação concluída'}
        </div>
      </div>

      {/* CONTROLES DE GRAVAÇÃO */}
      {!audioBlob && (
        <div style={styles.recordControls}>
          {!isRecording ? (
            <button 
              onClick={startRecording} 
              style={styles.startButton}
              disabled={!!error}
            >
              🎤 Iniciar Gravação
            </button>
          ) : (
            <div style={styles.activeControls}>
              <button 
                onClick={togglePause} 
                style={styles.pauseButton}
              >
                {isPaused ? '▶️ Continuar' : '⏸️ Pausar'}
              </button>
              <button 
                onClick={stopRecording} 
                style={styles.stopButton}
              >
                ⏹️ Finalizar
              </button>
            </div>
          )}
        </div>
      )}

      {/* PRÉVIA DO ÁUDIO */}
      {audioBlob && (
        <div style={styles.previewArea}>
          <audio 
            ref={audioRef}
            src={audioURL}
            onEnded={() => setIsPlaying(false)}
            style={{ display: 'none' }}
          />
          
          <div style={styles.previewInfo}>
            <span style={styles.previewLabel}>Prévia:</span>
            <span style={styles.previewDuration}>{formatTime(recordingTime)}</span>
            <span style={styles.previewSize}>
              {(audioBlob.size / 1024).toFixed(1)} KB
            </span>
          </div>

          <div style={styles.previewControls}>
            <button 
              onClick={togglePlayback}
              style={styles.playButton}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button 
              onClick={handleCancel}
              style={styles.discardButton}
            >
              🗑️ Descartar
            </button>
            <button 
              onClick={handleSend}
              style={styles.sendButton}
            >
              📤 Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ====================================
// ESTILOS PRIMEM
// ====================================
const styles = {
  container: {
    backgroundColor: 'white',
    border: '1px solid #e1e5f2',
    borderRadius: '12px',
    padding: '20px',
    minWidth: '320px',
    maxWidth: '400px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },

  title: {
    margin: 0,
    color: '#2B4C7E', // Azul PRIMEM
    fontSize: '16px',
    fontWeight: '600'
  },

  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#64748b',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    marginBottom: '16px'
  },

  errorIcon: {
    fontSize: '16px'
  },

  errorText: {
    color: '#dc2626',
    fontSize: '14px'
  },

  recordingArea: {
    textAlign: 'center',
    padding: '24px',
    marginBottom: '20px'
  },

  indicator: {
    fontSize: '48px',
    marginBottom: '12px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  indicatorRecording: {
    animation: 'pulse 1s infinite'
  },

  indicatorPaused: {
    opacity: 0.6
  },

  timer: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#2B4C7E', // Azul PRIMEM
    marginBottom: '8px'
  },

  maxTime: {
    fontSize: '16px',
    color: '#64748b',
    fontWeight: '400'
  },

  status: {
    fontSize: '14px',
    color: '#64748b'
  },

  recordControls: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px'
  },

  startButton: {
    padding: '12px 24px',
    backgroundColor: '#2B4C7E', // Azul PRIMEM
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },

  activeControls: {
    display: 'flex',
    gap: '12px'
  },

  pauseButton: {
    padding: '10px 20px',
    backgroundColor: '#C5793B', // Laranja PRIMEM
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  },

  stopButton: {
    padding: '10px 20px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  },

  previewArea: {
    backgroundColor: '#f8f9ff',
    borderRadius: '8px',
    padding: '16px'
  },

  previewInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '12px',
    color: '#64748b'
  },

  previewLabel: {
    fontWeight: '600'
  },

  previewDuration: {
    color: '#2B4C7E' // Azul PRIMEM
  },

  previewSize: {
    color: '#64748b'
  },

  previewControls: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center'
  },

  playButton: {
    padding: '8px 16px',
    backgroundColor: '#2B4C7E', // Azul PRIMEM
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },

  discardButton: {
    padding: '8px 16px',
    backgroundColor: '#64748b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },

  sendButton: {
    padding: '8px 16px',
    backgroundColor: '#C5793B', // Laranja PRIMEM
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  }
};

export default AudioRecorder;