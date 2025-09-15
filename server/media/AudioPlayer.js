// client/src/components/media/AudioPlayer.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE AUDIO PLAYER
// Extraído do App.js v8.1 - Componente modular reutilizável
// Resolve problema de interrupção de áudios durante re-renders
// =====================================

import React, { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({ 
  url, 
  filename = 'Áudio', 
  className = '',
  showDownload = true,
  autoLoad = true 
}) => {
  // ====================================
  // ESTADOS DO PLAYER
  // ====================================
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ====================================
  // REFS (REFERÊNCIA ESTÁVEL - CRÍTICO!)
  // ====================================
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const speedMenuRef = useRef(null);

  // ====================================
  // CONFIGURAÇÃO INICIAL DO ÁUDIO
  // ====================================
  useEffect(() => {
    if (!url) return;

    // Criar elemento de áudio
    const audio = new Audio();
    audioRef.current = audio;

    // Construir URL completa
    const audioUrl = url.startsWith('http') 
      ? url 
      : `http://localhost:3001${url.startsWith('/') ? url : '/' + url}`;

    console.log('🎵 AudioPlayer inicializando:', { filename, url: audioUrl });

    // ====================================
    // EVENT LISTENERS DO ÁUDIO
    // ====================================
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setCurrentTime(0);
      setIsLoading(false);
      console.log('🎵 Metadata carregada:', audio.duration);
    };

    const handleCanPlay = () => {
      setIsLoaded(true);
      setError(false);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      console.log('🎵 Áudio finalizado');
    };

    const handleError = (e) => {
      console.error('❌ Erro ao carregar áudio:', audioUrl, e);
      setError(true);
      setIsLoaded(false);
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setError(false);
      setIsLoading(true);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    // Adicionar listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Carregar áudio
    audio.src = audioUrl;
    if (autoLoad) {
      audio.preload = 'metadata';
    }

    // Cleanup function
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      
      // Pausar e limpar
      if (!audio.paused) {
        audio.pause();
      }
      audio.src = '';
    };
  }, [url, autoLoad]);

  // ====================================
  // FUNÇÕES DE CONTROLE
  // ====================================
  const togglePlay = () => {
    if (!audioRef.current || !isLoaded) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('❌ Erro ao reproduzir:', err);
        setError(true);
      });
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeSpeed = (speed) => {
    if (!audioRef.current) return;
    
    audioRef.current.playbackRate = speed;
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
    console.log('🎵 Velocidade alterada para:', speed);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!duration || duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  // ====================================
  // COMPONENTE DE ERRO
  // ====================================
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>❌</div>
        <div style={styles.errorText}>
          <div>Erro ao carregar áudio</div>
          <div style={styles.errorSubtext}>{filename}</div>
        </div>
        {showDownload && (
          <a 
            href={url.startsWith('http') ? url : `http://localhost:3001${url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.downloadButton}
            title="Baixar áudio"
          >
            ⬇️
          </a>
        )}
      </div>
    );
  }

  // ====================================
  // RENDER PRINCIPAL
  // ====================================
  return (
    <div style={{...styles.container, ...styles}} className={className}>
      {/* CABEÇALHO */}
      <div style={styles.header}>
        <div style={styles.audioIcon}>🎵</div>
        <div style={styles.audioInfo}>
          <div style={styles.filename}>{filename}</div>
          <div style={styles.duration}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        {showDownload && (
          <a 
            href={url.startsWith('http') ? url : `http://localhost:3001${url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.downloadButton}
            title="Baixar áudio"
          >
            ⬇️
          </a>
        )}
      </div>

      {/* CONTROLES PRINCIPAIS */}
      <div style={styles.controls}>
        {/* BOTÃO PLAY/PAUSE */}
        <button
          onClick={togglePlay}
          disabled={!isLoaded || isLoading}
          style={{
            ...styles.playButton,
            ...((!isLoaded || isLoading) ? styles.playButtonDisabled : {})
          }}
        >
          {isLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
        </button>

        {/* BARRA DE PROGRESSO */}
        <div 
          ref={progressRef}
          style={styles.progressContainer}
          onClick={handleProgressClick}
        >
          <div style={styles.progressBackground}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${getProgressPercentage()}%`
              }}
            />
          </div>
        </div>

        {/* CONTROLE DE VELOCIDADE */}
        <div style={styles.speedContainer}>
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            style={styles.speedButton}
            title="Velocidade de reprodução"
          >
            {playbackRate}x
          </button>
          
          {showSpeedMenu && (
            <div ref={speedMenuRef} style={styles.speedMenu}>
              {[0.75, 1, 1.25, 1.5, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => changeSpeed(speed)}
                  style={{
                    ...styles.speedOption,
                    ...(speed === playbackRate ? styles.speedOptionActive : {})
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ====================================
// ESTILOS PRIMEM (AZUL ESCURO + LARANJA)
// ====================================
const styles = {
  container: {
    backgroundColor: '#f8f9ff',
    border: '1px solid #e1e5f2',
    borderRadius: '12px',
    padding: '12px',
    minWidth: '280px',
    maxWidth: '400px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    position: 'relative'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    gap: '10px'
  },

  audioIcon: {
    fontSize: '20px',
    color: '#2B4C7E', // Azul PRIMEM
    padding: '8px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e1e5f2'
  },

  audioInfo: {
    flex: 1,
    minWidth: 0
  },

  filename: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2B4C7E', // Azul PRIMEM
    marginBottom: '2px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  duration: {
    fontSize: '12px',
    color: '#64748b'
  },

  downloadButton: {
    padding: '6px',
    color: '#C5793B', // Laranja PRIMEM
    textDecoration: 'none',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
    fontSize: '16px'
  },

  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  playButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#2B4C7E', // Azul PRIMEM
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    flexShrink: 0
  },

  playButtonDisabled: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed'
  },

  progressContainer: {
    flex: 1,
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },

  progressBackground: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '3px',
    position: 'relative',
    overflow: 'hidden'
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#C5793B', // Laranja PRIMEM
    borderRadius: '3px',
    transition: 'width 0.1s ease'
  },

  speedContainer: {
    position: 'relative',
    flexShrink: 0
  },

  speedButton: {
    padding: '8px 12px',
    border: '1px solid #e1e5f2',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#2B4C7E', // Azul PRIMEM
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },

  speedMenu: {
    position: 'absolute',
    bottom: '100%',
    right: '0',
    backgroundColor: 'white',
    border: '1px solid #e1e5f2',
    borderRadius: '8px',
    padding: '4px',
    marginBottom: '4px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 10
  },

  speedOption: {
    display: 'block',
    width: '100%',
    padding: '8px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#2B4C7E',
    fontSize: '12px',
    cursor: 'pointer',
    borderRadius: '4px',
    textAlign: 'left',
    transition: 'background-color 0.2s'
  },

  speedOptionActive: {
    backgroundColor: '#C5793B', // Laranja PRIMEM
    color: 'white'
  },

  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    minWidth: '250px'
  },

  errorIcon: {
    fontSize: '20px'
  },

  errorText: {
    flex: 1
  },

  errorSubtext: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px'
  }
};

export default AudioPlayer;