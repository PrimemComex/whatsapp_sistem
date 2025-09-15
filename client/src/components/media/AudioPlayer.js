// client/src/components/media/AudioPlayer.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE AUDIO PLAYER
// Extraído do App.js v8.0 - Componente modular reutilizável
// =====================================

import React, { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({ url, filename }) => {
  // Estados do player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Refs
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Configuração inicial do áudio
  useEffect(() => {
    if (!url) return;

    const audio = new Audio();
    audioRef.current = audio;

    const audioUrl = url.startsWith('http') 
      ? url 
      : `http://localhost:3001${url}`;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setCurrentTime(0);
    };

    const handleCanPlay = () => {
      setIsLoaded(true);
      setError(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      console.error('Erro ao carregar áudio:', audioUrl);
      setError(true);
      setIsLoaded(false);
    };

    const handleLoadStart = () => {
      setError(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    audio.crossOrigin = "anonymous";
    audio.preload = "metadata";
    audio.src = audioUrl;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [url, playbackRate]);

  // Configurar velocidade de reprodução
  useEffect(() => {
    if (audioRef.current && isLoaded) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, isLoaded]);

  // Função para play/pause
  const togglePlay = async () => {
    if (!audioRef.current || !isLoaded) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      setError(true);
    }
  };

  // Função para controlar progresso
  const handleProgressClick = (e) => {
    if (!audioRef.current || !progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Função para alterar velocidade
  const changeSpeed = (rate) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  // Formatação de tempo
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calcular progresso
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  // Renderização de erro
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.fallback}>
          <span>❌ Erro ao carregar áudio</span>
          <a 
            href={url.startsWith('http') ? url : `http://localhost:3001${url}`} 
            style={styles.downloadLink}
            download={filename}
          >
            📥 Download
          </a>
        </div>
      </div>
    );
  }

  // Renderização principal
  return (
    <div style={styles.container}>
      {/* Botão Play/Pause */}
      <button
        onClick={togglePlay}
        style={{
          ...styles.playButton,
          cursor: isLoaded ? 'pointer' : 'not-allowed',
          opacity: isLoaded ? 1 : 0.5
        }}
        disabled={!isLoaded}
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>

      {/* Informações do áudio */}
      <div style={styles.audioInfo}>
        <div style={styles.filename}>
          🎵 {filename || 'Áudio'}
        </div>
        <div style={styles.timeInfo}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Progress Bar */}
      <div 
        style={styles.progressContainer}
        onClick={handleProgressClick}
        ref={progressRef}
      >
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progress,
              width: `${progressPercent}%`
            }}
          />
        </div>
      </div>

      {/* Controle de Velocidade */}
      <div style={styles.speedControl}>
        <button
          style={styles.speedButton}
          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
        >
          {playbackRate}x
        </button>
        
        {showSpeedMenu && (
          <div style={styles.speedMenu}>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
              <button
                key={rate}
                style={{
                  ...styles.speedOption,
                  ...(playbackRate === rate ? styles.speedOptionActive : {})
                }}
                onClick={() => changeSpeed(rate)}
              >
                {rate}x
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Link de Download */}
      <a 
        href={url.startsWith('http') ? url : `http://localhost:3001${url}`} 
        style={styles.downloadLink}
        download={filename}
        title="Download do áudio"
      >
        📥
      </a>
    </div>
  );
};

// Estilos do componente
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
    maxWidth: '400px',
    fontSize: '14px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  
  playButton: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#25D366',
    color: 'white',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0
  },
  
  audioInfo: {
    flex: 1,
    minWidth: 0
  },
  
  filename: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  
  timeInfo: {
    fontSize: '11px',
    color: '#666'
  },
  
  progressContainer: {
    flex: 2,
    cursor: 'pointer',
    padding: '4px 0'
  },
  
  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#ddd',
    borderRadius: '2px',
    overflow: 'hidden',
    position: 'relative'
  },
  
  progress: {
    height: '100%',
    backgroundColor: '#25D366',
    borderRadius: '2px',
    transition: 'width 0.1s ease'
  },
  
  speedControl: {
    position: 'relative'
  },
  
  speedButton: {
    background: '#667eea',
    border: 'none',
    borderRadius: '15px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '11px',
    color: 'white',
    fontWeight: 'bold',
    minWidth: '35px',
    transition: 'all 0.2s'
  },
  
  speedMenu: {
    position: 'absolute',
    bottom: '30px',
    right: '0',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 100,
    minWidth: '60px'
  },
  
  speedOption: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    textAlign: 'left',
    transition: 'background-color 0.2s'
  },
  
  speedOptionActive: {
    backgroundColor: '#667eea',
    color: 'white'
  },
  
  downloadLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '4px',
    transition: 'color 0.2s'
  },
  
  fallback: {
    textAlign: 'center',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center'
  }
};

// PropTypes (opcional - para desenvolvimento)
AudioPlayer.defaultProps = {
  url: '',
  filename: 'Áudio'
};

export default AudioPlayer;