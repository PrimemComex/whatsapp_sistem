// client/src/App.js
// =====================================
// PRIMEM WHATSAPP v7.1 - CORRIGIDO COM ENVIO DE ARQUIVOS
// Integração do Socket.IO corrigida + Correção do envio de arquivos na conversa correta
// =====================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import useWhatsAppFixed from './hooks/useWhatsAppFixed';

// ====================================
// AUDIOPLAYER COM VELOCIDADE (Mantido da v7.0)
// ====================================
const AudioPlayer = React.memo(({ url, filename }) => {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedMenuRef = useRef(null);
  
  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: '1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' }
  ];

  const audioUrl = React.useMemo(() => {
    if (!url) return '';
    
    const invalidUrls = ['uploading...', 'uploading', 'processing', 'undefined', 'null', '', null, undefined];
    const containsInvalidKeywords = url && (
      url.includes('uploading') || 
      url.includes('processing') || 
      url.includes('undefined') || 
      url.includes('null') ||
      url.includes('temp') ||
      url.includes('blob:') ||
      url.length < 5
    );
    
    if (!url || invalidUrls.includes(url) || containsInvalidKeywords) {
      return '';
    }
    
    let finalUrl = url;
    if (!url.startsWith('http')) {
      finalUrl = url.startsWith('/') 
        ? `http://localhost:3001${url}` 
        : `http://localhost:3001/${url}`;
    }
    
    return finalUrl;
  }, [url]);

  if (!audioUrl || audioUrl === '') {
    return (
      <div style={audioPlayerStyles.container}>
        <div style={{
          ...audioPlayerStyles.fallback,
          backgroundColor: 'rgba(255,193,7,0.1)',
          color: '#856404',
          textAlign: 'center',
          padding: '15px'
        }}>
          Processando áudio...
        </div>
      </div>
    );
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target)) {
        setShowSpeedMenu(false);
      }
    };
    
    if (showSpeedMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSpeedMenu]);

  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    const audio = audioRef.current;
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
      setError(false);
      audio.playbackRate = playbackRate;
    };

    const handleCanPlay = () => {
      setIsLoaded(true);
      setError(false);
      audio.playbackRate = playbackRate;
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e) => {
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
  }, [audioUrl, playbackRate]);

  useEffect(() => {
    if (audioRef.current && isLoaded) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, isLoaded]);

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
      setError(true);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeSpeed = (newSpeed) => {
    setPlaybackRate(newSpeed);
    setShowSpeedMenu(false);
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div style={audioPlayerStyles.container}>
        <div style={audioPlayerStyles.fallback}>
          <span>Audio {filename || 'Áudio'}</span>
          <audio controls style={{ width: '100%', marginTop: '8px' }}>
            <source src={audioUrl} type="audio/ogg; codecs=opus" />
            <source src={audioUrl} type="audio/ogg" />
            <source src={audioUrl} type="audio/mpeg" />
            <source src={audioUrl} />
          </audio>
        </div>
      </div>
    );
  }

  return (
    <div style={audioPlayerStyles.container}>
      <audio 
        ref={audioRef}
        style={{ display: 'none' }}
        crossOrigin="anonymous"
      />
      
      <div style={audioPlayerStyles.player}>
        <button 
          onClick={togglePlay}
          style={audioPlayerStyles.playButton}
          disabled={!isLoaded}
        >
          {!isLoaded ? '⏳' : isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <div style={audioPlayerStyles.info}>
          <div style={audioPlayerStyles.filename}>
            🎵 {filename || 'Áudio'}
          </div>
          
          <div style={audioPlayerStyles.controls}>
            <span style={audioPlayerStyles.time}>
              {formatTime(currentTime)}
            </span>
            
            <div 
              ref={progressRef}
              style={audioPlayerStyles.progressBar}
              onClick={handleProgressClick}
            >
              <div 
                style={{
                  ...audioPlayerStyles.progress,
                  width: duration ? `${(currentTime / duration) * 100}%` : '0%'
                }}
              />
            </div>
            
            <span style={audioPlayerStyles.time}>
              {formatTime(duration)}
            </span>
          </div>
        </div>
        
        <div style={audioPlayerStyles.speedControl} ref={speedMenuRef}>
          <button
            style={audioPlayerStyles.speedButton}
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            title="Velocidade de reprodução"
            disabled={!isLoaded}
          >
            {playbackRate}x
          </button>
          
          {showSpeedMenu && (
            <div style={audioPlayerStyles.speedMenu}>
              {speedOptions.map(option => (
                <button
                  key={option.value}
                  style={{
                    ...audioPlayerStyles.speedOption,
                    ...(playbackRate === option.value ? audioPlayerStyles.speedOptionActive : {})
                  }}
                  onClick={() => changeSpeed(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <a
          href={audioUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={audioPlayerStyles.downloadLink}
        >
          💾
        </a>
      </div>
    </div>
  );
});

const audioPlayerStyles = {
  container: {
    padding: '10px',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: '10px',
    minWidth: '280px',
    maxWidth: '400px'
  },
  player: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  playButton: {
    background: '#25D366',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  info: {
    flex: 1,
    minWidth: 0
  },
  filename: {
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  time: {
    fontSize: '11px',
    color: '#666',
    minWidth: '35px'
  },
  progressBar: {
    flex: 1,
    height: '4px',
    backgroundColor: '#ddd',
    borderRadius: '2px',
    cursor: 'pointer',
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
    padding: '4px'
  },
  fallback: {
    textAlign: 'center',
    padding: '10px'
  }
};

// ====================================
// COMPONENTE DE GRAVAÇÃO DE ÁUDIO (Mantido da v7.0)
// ====================================
const AudioRecorder = ({ onRecordingComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= 300) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      alert('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const playRecording = () => {
    if (recordedBlob && audioRef.current) {
      const url = URL.createObjectURL(recordedBlob);
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
    }
  };
  
  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };
  
  const sendRecording = () => {
    if (recordedBlob) {
      const audioFile = new File([recordedBlob], `audio-${Date.now()}.webm`, {
        type: 'audio/webm;codecs=opus'
      });
      
      onRecordingComplete(audioFile);
    }
  };
  
  const cancelRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setRecordedBlob(null);
    setRecordingTime(0);
    onCancel();
  };
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div style={recorderStyles.container}>
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {!recordedBlob ? (
        <div style={recorderStyles.recordingInterface}>
          <div style={recorderStyles.header}>
            <span style={recorderStyles.title}>🎤 Gravar Áudio</span>
            <button style={recorderStyles.closeBtn} onClick={cancelRecording}>❌</button>
          </div>
          
          <div style={recorderStyles.recordingArea}>
            {isRecording ? (
              <div style={recorderStyles.recordingActive}>
                <div style={recorderStyles.recordingIndicator}>
                  <div style={recorderStyles.pulsingDot}></div>
                  <span style={recorderStyles.recordingText}>Gravando...</span>
                </div>
                <div style={recorderStyles.timer}>{formatTime(recordingTime)}</div>
                <button style={recorderStyles.stopBtn} onClick={stopRecording}>
                  ⏹️ Parar
                </button>
              </div>
            ) : (
              <div style={recorderStyles.recordingInactive}>
                <button style={recorderStyles.startBtn} onClick={startRecording}>
                  🎙️ Iniciar Gravação
                </button>
                <small style={recorderStyles.hint}>
                  Clique para gravar sua mensagem de voz
                </small>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={recorderStyles.previewInterface}>
          <div style={recorderStyles.header}>
            <span style={recorderStyles.title}>🎵 Áudio Gravado</span>
            <button style={recorderStyles.closeBtn} onClick={cancelRecording}>❌</button>
          </div>
          
          <div style={recorderStyles.previewArea}>
            <div style={recorderStyles.audioInfo}>
              <span style={recorderStyles.duration}>⏱️ Tempo: {formatTime(recordingTime)}</span>
              <span style={recorderStyles.size}>
                📏 Tamanho: {(recordedBlob.size / 1024).toFixed(1)} KB
              </span>
            </div>
            
            <div style={recorderStyles.previewControls}>
              <button 
                style={recorderStyles.playBtn} 
                onClick={isPlaying ? stopPlaying : playRecording}
              >
                {isPlaying ? '⏹️ Parar' : '▶️ Ouvir'}
              </button>
            </div>
            
            <div style={recorderStyles.actionButtons}>
              <button style={recorderStyles.discardBtn} onClick={cancelRecording}>
                🗑️ Descartar
              </button>
              <button style={recorderStyles.sendBtn} onClick={sendRecording}>
                📤 Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const recorderStyles = {
  container: {
    position: 'absolute',
    bottom: '70px',
    left: '10px',
    right: '10px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    border: '1px solid #ddd',
    zIndex: 100
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid #eee'
  },
  title: {
    fontWeight: 'bold',
    color: '#2B4C8C',
    fontSize: '16px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#666',
    padding: '5px'
  },
  recordingInterface: {
    padding: '0'
  },
  recordingArea: {
    padding: '20px',
    textAlign: 'center'
  },
  recordingActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },
  recordingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  pulsingDot: {
    width: '12px',
    height: '12px',
    backgroundColor: '#dc3545',
    borderRadius: '50%',
    animation: 'pulse 1s infinite'
  },
  recordingText: {
    color: '#dc3545',
    fontWeight: 'bold'
  },
  timer: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2B4C8C',
    fontFamily: 'monospace'
  },
  stopBtn: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  recordingInactive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  startBtn: {
    padding: '15px 30px',
    backgroundColor: '#2B4C8C',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  hint: {
    color: '#666',
    fontSize: '12px'
  },
  previewInterface: {
    padding: '0'
  },
  previewArea: {
    padding: '20px'
  },
  audioInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  duration: {
    color: '#2B4C8C'
  },
  size: {
    color: '#666'
  },
  previewControls: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  playBtn: {
    padding: '10px 20px',
    backgroundColor: '#25D366',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  discardBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  sendBtn: {
    padding: '10px 20px',
    backgroundColor: '#2B4C8C',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  }
};

// Animação CSS para o pulso
const pulseAnimation = `
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

// ====================================
// EMOJI PICKER EXPANDIDO (Mantido da v7.0)
// ====================================
const EmojiPicker = ({ isOpen, onEmojiSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('smileys');
  
  const emojiCategories = {
    smileys: {
      name: '😀 Rostos',
      emojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
        '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚',
        '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭',
        '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄',
        '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢',
        '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸'
      ]
    },
    people: {
      name: '👤 Pessoas',
      emojis: [
        '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👱‍♂️', '👨‍🦰',
        '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩', '👱‍♀️', '👩‍🦰', '👩‍🦱', '👩‍🦳', '👩‍🦲', '🧓',
        '👴', '👵', '🙍', '🙍‍♂️', '🙍‍♀️', '🙎', '🙎‍♂️', '🙎‍♀️', '🙅', '🙅‍♂️',
        '🙅‍♀️', '🙆', '🙆‍♂️', '🙆‍♀️', '💁', '💁‍♂️', '💁‍♀️', '🙋', '🙋‍♂️', '🙋‍♀️',
        '🧏', '🧏‍♂️', '🧏‍♀️', '🙇', '🙇‍♂️', '🙇‍♀️', '🤦', '🤦‍♂️', '🤦‍♀️', '🤷'
      ]
    },
    nature: {
      name: '🌿 Natureza',
      emojis: [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
        '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
        '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
        '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
        '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕'
      ]
    },
    food: {
      name: '🍕 Comida',
      emojis: [
        '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
        '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
        '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔',
        '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈',
        '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟',
        '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕'
      ]
    },
    activities: {
      name: '⚽ Atividades',
      emojis: [
        '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
        '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🪁', '🏹',
        '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿',
        '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️',
        '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆'
      ]
    },
    travel: {
      name: '🚗 Viagem',
      emojis: [
        '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
        '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵',
        '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟',
        '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇',
        '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸'
      ]
    },
    objects: {
      name: '📱 Objetos',
      emojis: [
        '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
        '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥',
        '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️',
        '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋',
        '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴'
      ]
    },
    symbols: {
      name: '❤️ Símbolos',
      emojis: [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
        '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
        '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
        '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '🔴', '🔳'
      ]
    },
    flags: {
      name: '🏳️ Bandeiras',
      emojis: [
        '🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇫', '🇦🇽', '🇦🇱',
        '🇧🇷', '🇺🇸', '🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇵🇹', '🇯🇵', '🇰🇷',
        '🇨🇳', '🇮🇳', '🇷🇺', '🇨🇦', '🇦🇺', '🇦🇷', '🇲🇽', '🇨🇱', '🇨🇴', '🇵🇪',
        '🇺🇾', '🇵🇾', '🇧🇴', '🇪🇨', '🇻🇪', '🇬🇾', '🇸🇷', '🇫🇰', '🇬🇫', '🇧🇻'
      ]
    }
  };

  if (!isOpen) return null;

  return (
    <div style={emojiPickerStyles.overlay} onClick={onClose}>
      <div style={emojiPickerStyles.container} onClick={(e) => e.stopPropagation()}>
        <div style={emojiPickerStyles.header}>
          <h3 style={emojiPickerStyles.title}>😊 Emojis</h3>
          <button style={emojiPickerStyles.closeBtn} onClick={onClose}>❌</button>
        </div>

        <div style={emojiPickerStyles.categories}>
          {Object.entries(emojiCategories).map(([key, category]) => (
            <button
              key={key}
              style={{
                ...emojiPickerStyles.categoryBtn,
                ...(activeCategory === key ? emojiPickerStyles.categoryBtnActive : {})
              }}
              onClick={() => setActiveCategory(key)}
            >
              {category.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <div style={emojiPickerStyles.emojiGrid}>
          {emojiCategories[activeCategory].emojis.map((emoji, index) => (
            <button
              key={index}
              style={emojiPickerStyles.emojiBtn}
              onClick={() => {
                onEmojiSelect(emoji);
                onClose();
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const emojiPickerStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  container: {
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    width: '480px',
    maxWidth: '90vw',
    maxHeight: '600px',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f8f9fa'
  },
  title: {
    margin: 0,
    color: '#2B4C8C',
    fontSize: '18px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '5px'
  },
  categories: {
    display: 'flex',
    overflowX: 'auto',
    padding: '10px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f8f9fa'
  },
  categoryBtn: {
    background: 'none',
    border: 'none',
    padding: '8px 12px',
    fontSize: '14px',
    cursor: 'pointer',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    color: '#666'
  },
  categoryBtnActive: {
    backgroundColor: '#2B4C8C',
    color: 'white'
  },
  emojiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '5px',
    padding: '15px',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  emojiBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s',
    aspectRatio: '1'
  }
};

// ====================================
// MODAL PARA EDITAR NOME COMPLETO (Mantido)
// ====================================
const EditNameModal = ({ isOpen, onClose, currentName, onSave }) => {
  const [newName, setNewName] = useState(currentName || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    setNewName(currentName || '');
  }, [currentName]);

  const handleSave = () => {
    if (newName.trim()) {
      onSave(newName.trim());
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>✏️ Editar Nome do Contato</h3>
          <button style={modalStyles.closeBtn} onClick={onClose}>❌</button>
        </div>
        
        <div style={modalStyles.body}>
          <label style={modalStyles.label}>Novo nome:</label>
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={handleKeyPress}
            style={modalStyles.input}
            placeholder="Digite o nome do contato..."
            maxLength={50}
          />
          <small style={modalStyles.hint}>
            Este nome será exibido apenas para você
          </small>
        </div>
        
        <div style={modalStyles.footer}>
          <button style={modalStyles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button 
            style={modalStyles.saveBtn} 
            onClick={handleSave}
            disabled={!newName.trim()}
          >
            💾 Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos do Modal expandidos
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
    maxWidth: '500px',
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
  inputError: {
    borderColor: '#dc3545'
  },
  hint: {
    display: 'block',
    marginTop: '5px',
    color: '#666',
    fontSize: '12px'
  },
  error: {
    display: 'block',
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '5px'
  },
  separator: {
    margin: '25px 0',
    paddingTop: '15px',
    borderTop: '1px solid #eee'
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    color: '#2B4C8C',
    fontSize: '16px'
  },
  passwordContainer: {
    position: 'relative'
  },
  passwordToggle: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#666'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '20px',
    borderTop: '1px solid #eee',
    marginTop: '20px'
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  saveBtn: {
    padding: '10px 20px',
    backgroundColor: '#2B4C8C',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
};

// ====================================
// CONFIGURAÇÃO DE TEMA PRIMEM v7.1
// ====================================
const PRIMEM_THEME = {
  colors: {
    primary: '#2B4C8C',
    secondary: '#C97A4A', 
    accent: '#8B9DC3',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    light: '#f8f9fa',
    dark: '#343a40',
    white: '#ffffff',
    background: '#f0f2f5',
    text: '#333333',
    border: '#dee2e6'
  }
};

// ====================================
// COMPONENTE PRINCIPAL v7.1 COM CORREÇÃO DE ENVIO DE ARQUIVOS
// ====================================
export default function PrimemWhatsApp() {
  // Hook do WhatsApp
  const {
    // Estados do WhatsApp
    isConnected,
    isConnecting,
    qrCode,
    whatsappInfo,
    conversations,
    messages,
    selectedChat,
    error: whatsappError,
    
    // Ações do WhatsApp
    connectWhatsApp,
    disconnectWhatsApp,
    sendMessage: sendWhatsAppMessage,
    loadChats,
    
    // Setters
    setSelectedChat,
    setConversations,
    setMessages
  } = useWhatsAppFixed();

  // Estados - Autenticação
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('teste@teste.com');
  const [password, setPassword] = useState('123');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Estados - Interface
  const [activeTab, setActiveTab] = useState('chats');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Estados - Modal
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  
  // Estados - Gravação de Áudio
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  
  // Estados - Assinatura
  const [signatureEnabled, setSignatureEnabled] = useState(true);
  
  // Estados - Chat
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  
  // Referências
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  
  const API_URL = 'http://localhost:3001';

  // Debug logs temporários
  useEffect(() => {
    console.log('🔍 Frontend Debug:', {
      conversas: conversations.length,
      mensagens: Object.keys(messages).length,
      chatSelecionado: selectedChat?.name,
      conectado: isConnected
    });
  }, [conversations, messages, selectedChat, isConnected]);

  // CARREGAR CONFIGURAÇÕES
  useEffect(() => {
    const savedSignature = localStorage.getItem('primem_signature_enabled');
    if (savedSignature !== null) {
      setSignatureEnabled(JSON.parse(savedSignature));
    }
  }, []);

  // TOGGLE ASSINATURA
  const toggleSignature = () => {
    const newSignatureState = !signatureEnabled;
    setSignatureEnabled(newSignatureState);
    localStorage.setItem('primem_signature_enabled', JSON.stringify(newSignatureState));
  };

  // Auto scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  // Auto resize do textarea
  const adjustTextareaHeight = useCallback(() => {
    if (messageInputRef.current) {
      const textarea = messageInputRef.current;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200;
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage, adjustTextareaHeight]);

  // ====================================
  // FUNÇÕES - AUTENTICAÇÃO (Mantidas)
  // ====================================
  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Login bem-sucedido:', data.user);
        
        const userData = data.user;
        if (!userData.displayName) {
          userData.displayName = userData.name;
        }
        
        setCurrentUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('primem_current_user', JSON.stringify(userData));
        
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      alert('Erro ao fazer login. Verifique se o servidor está rodando.');
    }
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedChat(null);
    console.log('🚪 Logout realizado');
  };

  // ====================================
  // FUNÇÃO DE ENVIO - CORRIGIDA PARA ARQUIVOS
  // ====================================
  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    if (!selectedChat) {
      alert('Selecione uma conversa antes de enviar');
      return;
    }
    
    const senderName = signatureEnabled ? (currentUser?.displayName || currentUser?.name || 'Você') : '';
    
    // Preparar mensagem com resposta
    let messageForWhatsApp = newMessage.trim();
    
    if (replyTo && replyTo.body) {
      const originalText = replyTo.body.length > 50 ? 
        replyTo.body.substring(0, 50) + '...' : 
        replyTo.body;
      messageForWhatsApp = `📝 Respondendo: "${originalText}"\n\n${messageForWhatsApp}`;
    }
    
    if (messageForWhatsApp && signatureEnabled && senderName) {
      messageForWhatsApp = `*${senderName}:*\n${messageForWhatsApp}`;
    }
    
    if (!selectedFile) {
      // ==========================================
      // ENVIO DE MENSAGEM DE TEXTO (Mantido igual)
      // ==========================================
      const result = await sendWhatsAppMessage(selectedChat.id, messageForWhatsApp);
      
      if (result.success) {
        setNewMessage('');
        setReplyTo(null);
        console.log('✅ Mensagem de texto enviada');
        
        if (messageInputRef.current) {
          messageInputRef.current.style.height = 'auto';
        }
      } else {
        console.error('❌ Erro ao enviar mensagem:', result.error);
        alert('Erro ao enviar mensagem');
      }
    } else {
      // ==========================================
      // ENVIO DE ARQUIVO - CORREÇÃO APLICADA
      // ==========================================
      try {
        console.log('📎 INICIANDO ENVIO DE ARQUIVO');
        console.log('📋 Chat selecionado:', {
          id: selectedChat.id,
          name: selectedChat.name,
          number: selectedChat.number
        });
        
        // 🔧 CORREÇÃO 1: Melhor extração do número de telefone
        let phoneNumber = selectedChat.id;
        
        // Remove sufixos do WhatsApp (@c.us, @g.us, etc)
        if (phoneNumber.includes('@')) {
          phoneNumber = phoneNumber.split('@')[0];
        }
        
        // Remove caracteres especiais, mantém apenas números
        phoneNumber = phoneNumber.replace(/[^\d]/g, '');
        
        // Validação do número
        if (!phoneNumber || phoneNumber.length < 10) {
          throw new Error(`Número de telefone inválido: ${phoneNumber}`);
        }
        
        console.log('📱 Número extraído:', phoneNumber);
        
        // 🔧 CORREÇÃO 2: FormData com dados corretos
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('number', phoneNumber);
        formData.append('to', phoneNumber);
        formData.append('chatId', selectedChat.id); // ID original para mapeamento
        formData.append('caption', messageForWhatsApp || '');
        
        console.log('📤 Enviando arquivo com dados:', {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          phoneNumber: phoneNumber,
          chatId: selectedChat.id,
          caption: messageForWhatsApp || 'Sem legenda'
        });
        
        setIsUploading(true);
        
        // 🔧 CORREÇÃO 3: Envio com melhor tratamento de erro
        const response = await fetch(`${API_URL}/api/whatsapp/send-media`, {
          method: 'POST',
          body: formData
        });
        
        console.log('📡 Resposta do servidor:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ Resposta completa:', data);
        
        if (data.success) {
          console.log('🎉 ARQUIVO ENVIADO COM SUCESSO!');
          console.log('📁 Detalhes do arquivo:', data.file);
          
          // 🔧 CORREÇÃO 4: Adicionar mensagem local imediatamente para feedback visual
          const localMessage = {
            id: `local-${Date.now()}`,
            body: messageForWhatsApp || `📎 ${selectedFile.name}`,
            timestamp: new Date(),
            fromMe: true,
            type: 'sent',
            status: 'sending',
            media: {
              filename: selectedFile.name,
              mimetype: selectedFile.type,
              size: selectedFile.size,
              url: 'uploading...', // Temporário
              type: selectedFile.type.split('/')[0]
            }
          };
          
          // Adicionar mensagem local
          setMessages(prev => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), localMessage]
          }));
          
          // Limpar campos
          setNewMessage('');
          setSelectedFile(null);
          setReplyTo(null);
          
          console.log('🧹 Campos limpos');
          
          if (messageInputRef.current) {
            messageInputRef.current.style.height = 'auto';
          }
          
        } else {
          throw new Error(data.message || 'Servidor retornou erro desconhecido');
        }
        
      } catch (error) {
        console.error('❌ ERRO NO ENVIO DE ARQUIVO:', error);
        console.error('📋 Detalhes do erro:', {
          message: error.message,
          stack: error.stack,
          selectedChat: selectedChat?.id,
          fileName: selectedFile?.name
        });
        
        alert(`Erro ao enviar arquivo: ${error.message}`);
      } finally {
        setUploadProgress(0);
        setIsUploading(false);
      }
    }
  };

  // FUNÇÃO ADICIONAL: DEBUG DO CHAT SELECIONADO
  const debugSelectedChat = () => {
    if (selectedChat) {
      console.log('🔍 DEBUG CHAT SELECIONADO:', {
        id: selectedChat.id,
        name: selectedChat.name,
        number: selectedChat.number,
        // Mostrar todos os campos disponíveis
        allFields: Object.keys(selectedChat)
      });
    } else {
      console.log('❌ Nenhum chat selecionado');
    }
  };

  // HANDLER para teclas especiais no textarea
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        sendMessage();
      }
    }
  };

  // ====================================
  // FUNÇÕES DE AÇÕES DO CHAT (Mantidas)
  // ====================================
  const handleEditName = (newName) => {
    if (!selectedChat || !newName.trim()) return;
    
    setSelectedChat(prev => ({
      ...prev,
      name: newName.trim(),
      customName: newName.trim()
    }));
    
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedChat.id 
          ? { ...conv, name: newName.trim(), customName: newName.trim() }
          : conv
      )
    );
    
    setShowEditNameModal(false);
  };

  const handleBlockContact = () => {
    if (!selectedChat) return;
    
    const confirmBlock = window.confirm(`Tem certeza que deseja bloquear ${selectedChat.name}?`);
    
    if (confirmBlock) {
      alert(`${selectedChat.name} foi bloqueado! (Funcionalidade em desenvolvimento)`);
    }
  };

  // ====================================
  // FUNÇÕES - GRAVAÇÃO DE ÁUDIO (Mantidas)
  // ====================================
  const handleStartRecording = () => {
    setShowAudioRecorder(true);
  };
  
  const handleRecordingComplete = async (audioFile) => {
    if (!audioFile || !selectedChat || audioFile.size === 0) {
      alert('Erro: Dados de áudio inválidos');
      return;
    }
    
    setShowAudioRecorder(false);
    
    try {
      let phoneNumber = selectedChat.id;
      
      if (phoneNumber && phoneNumber.includes('@')) {
        phoneNumber = phoneNumber.split('@')[0];
      }
      
      // Remove caracteres especiais, mantém apenas números
      phoneNumber = phoneNumber.replace(/[^\d]/g, '');
      
      if (!phoneNumber || phoneNumber === 'undefined' || phoneNumber === 'null') {
        alert('Erro: Número do chat inválido');
        return;
      }
      
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('number', phoneNumber);
      formData.append('to', phoneNumber);
      formData.append('chatId', selectedChat.id);
      formData.append('caption', '');
      
      setIsUploading(true);
      
      const response = await fetch(`${API_URL}/api/whatsapp/send-media`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.file || !data.file.url) {
        throw new Error(data.message || 'Servidor não retornou informações do arquivo');
      }
      
      console.log('✅ Áudio enviado com sucesso');
      setIsUploading(false);
      
    } catch (error) {
      console.error('❌ Erro ao enviar áudio:', error);
      setIsUploading(false);
      alert(`Erro ao enviar áudio: ${error.message}`);
    }
  };
  
  const handleCancelRecording = () => {
    setShowAudioRecorder(false);
  };

  // ====================================
  // FUNÇÕES - UTILIDADES (Mantidas)
  // ====================================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }
    
    return date.toLocaleDateString('pt-BR');
  };
  
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 16 * 1024 * 1024) {
        alert('Arquivo muito grande! Máximo: 16MB');
        return;
      }
      setSelectedFile(file);
    }
  };
  
  const selectChat = (chat) => {
    setSelectedChat(chat);
    
    setConversations(prev =>
      prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c)
    );
  };
  
  const deleteMessage = (messageId) => {
    if (!selectedChat) return;
    
    const confirmDelete = window.confirm('Remover esta mensagem do histórico local?');
    if (!confirmDelete) return;
    
    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: prev[selectedChat.id].filter(m => m.id !== messageId)
    }));
  };
  
  const toggleFavorite = (chatId) => {
    setConversations(prev =>
      prev.map(c => c.id === chatId ? { ...c, favorite: !c.favorite } : c)
    );
  };

  // ====================================
  // RENDERIZAÇÃO DE MÍDIA (Mantida)
  // ====================================
  const renderMessageContent = (msg) => {
    if (msg.isDeleted) {
      return (
        <div style={{
          ...styles.messageText,
          fontStyle: 'italic',
          color: '#666',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          padding: '8px',
          borderRadius: '5px',
          border: '1px dashed #dc3545'
        }}>
          {msg.body}
          {msg.deletedAt && (
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
              Apagada em {formatTime(msg.deletedAt)}
            </div>
          )}
        </div>
      );
    }

    if (msg.media) {
      const { mimetype, url, filename } = msg.media;
      
      const invalidUrls = ['uploading...', 'uploading', 'processing', 'undefined', 'null', '', null, undefined];
      const containsInvalidKeywords = url && (
        url.includes('uploading') || 
        url.includes('processing') || 
        url.includes('undefined') || 
        url.includes('null') ||
        url.includes('temp') ||
        url.includes('blob:') ||
        url.length < 5
      );

      if (!url || invalidUrls.includes(url) || containsInvalidKeywords) {
        const mediaType = mimetype?.startsWith('audio/') ? 'áudio' : 
                         mimetype?.startsWith('image/') ? 'imagem' : 
                         mimetype?.startsWith('video/') ? 'vídeo' : 'arquivo';
        
        return (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderRadius: '8px',
            border: '1px dashed #ffc107',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '200px'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#ffc107',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              ⏳
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#856404', fontWeight: '500' }}>
                Processando {mediaType}...
              </div>
              <div style={{ fontSize: '12px', color: '#856404', opacity: 0.8 }}>
                Aguarde o upload completar
              </div>
            </div>
          </div>
        );
      }
      
      let fullUrl = url;
      if (!url.startsWith('http')) {
        fullUrl = url.startsWith('/') 
          ? `http://localhost:3001${url}` 
          : `http://localhost:3001/${url}`;
      }
      
      // IMAGENS
      if (mimetype?.startsWith('image/')) {
        return (
          <div style={styles.mediaContainer}>
            <img
              src={fullUrl}
              alt="📷 Imagem"
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'block',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onClick={() => window.open(fullUrl, '_blank')}
              onError={(e) => {
                console.error('Erro ao carregar imagem:', fullUrl);
              }}
              onLoad={() => {
                console.log('Imagem carregada:', fullUrl);
              }}
            />
            {msg.body && <div style={styles.caption}>{msg.body}</div>}
          </div>
        );
      }
      
      // VÍDEOS
      if (mimetype?.startsWith('video/')) {
        return (
          <div style={styles.mediaContainer}>
            <video
              controls
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onError={() => {
                console.error('Erro ao carregar vídeo:', fullUrl);
              }}
            >
              <source src={fullUrl} type={mimetype} />
              Seu navegador não suporta vídeos
            </video>
            {msg.body && <div style={styles.caption}>{msg.body}</div>}
          </div>
        );
      }
      
      // ÁUDIOS
      if (mimetype?.startsWith('audio/') ||
          mimetype?.includes('ogg') ||
          mimetype?.includes('webm') ||
          filename?.endsWith('.ogg') ||
          filename?.endsWith('.opus') ||
          filename?.endsWith('.mp3') ||
          filename?.endsWith('.wav') ||
          filename?.endsWith('.webm')) {
        
        return (
          <div style={styles.mediaContainer}>
            <AudioPlayer url={url} filename={filename} />
            {msg.body && <div style={styles.caption}>{msg.body}</div>}
          </div>
        );
      }
      
      // DOCUMENTOS
      return (
        <div style={styles.documentContainer}>
          <div style={styles.documentIcon}>
            {mimetype?.includes('pdf') ? '📄' :
             mimetype?.includes('word') ? '📝' :
             mimetype?.includes('excel') ? '📊' : '📎'}
          </div>
          <div style={styles.documentInfo}>
            <div style={styles.documentName}>{filename || 'Documento'}</div>
            <div style={styles.documentActions}>
              {mimetype?.includes('pdf') && (
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.viewButton}
                >
                  👁️ Visualizar
                </a>
              )}
              <a
                href={fullUrl}
                download={filename}
                style={styles.downloadButton}
              >
                💾 Baixar
              </a>
            </div>
          </div>
        </div>
      );
    }
    
    return <div style={styles.messageText}>{msg.body}</div>;
  };
  
  const renderMessageStatus = (status) => {
    switch(status) {
      case 'sending': return '⏳';
      case 'sent': return '✅';
      case 'delivered': return '✅✅';
      case 'read': return <span style={{color: '#4FC3F7'}}>👁️</span>;
      case 'error': return <span style={{color: '#dc3545'}}>❌</span>;
      default: return '⏳';
    }
  };

  // ====================================
  // FILTROS (Mantidos)
  // ====================================
  const filteredConversations = conversations
    .filter(conv => 
      conv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });

  // ====================================
  // RENDERIZAÇÃO - LOGIN
  // ====================================
  if (!isLoggedIn) {
    return (
      <div style={{
        ...styles.loginContainer,
        background: `linear-gradient(135deg, ${PRIMEM_THEME.colors.primary} 0%, ${PRIMEM_THEME.colors.secondary} 100%)`
      }}>
        <div style={styles.loginBox}>
          <div style={styles.logoContainer}>
            <div style={styles.logoWrapper}>
              <span style={styles.logoIcon}>💬</span>
              <div style={styles.logoText}>
                <span style={{...styles.logoP, color: PRIMEM_THEME.colors.primary}}>P</span>
                <span style={{...styles.logoRimem, color: PRIMEM_THEME.colors.secondary}}>RIMEM COMEX</span>
              </div>
            </div>
            <h1 style={{...styles.title, color: PRIMEM_THEME.colors.primary}}>WHATSAPP BUSINESS</h1>
            <p style={{...styles.subtitle, color: PRIMEM_THEME.colors.accent}}>
              Sistema v7.1 - CORRIGIDO - Envio de Arquivos Fixado
            </p>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>📧 E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{...styles.input, borderColor: PRIMEM_THEME.colors.border}}
              placeholder="seu@email.com"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>🔒 Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{...styles.input, borderColor: PRIMEM_THEME.colors.border}}
              placeholder="••••••••"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <button 
            onClick={handleLogin} 
            style={{
              ...styles.loginButton,
              backgroundColor: PRIMEM_THEME.colors.primary
            }}
          >
            ENTRAR NO SISTEMA
          </button>
          
          <div style={styles.loginFooter}>
            <small style={styles.footerText}>
              Use: teste@teste.com / 123
            </small>
            <small style={{...styles.footerBrand, color: PRIMEM_THEME.colors.accent}}>
              © 2025 PRIMEM COMEX - Sistema v7.1 Envio de Arquivos Corrigido
            </small>
          </div>
        </div>
      </div>
    );
  }

  // ====================================
  // RENDERIZAÇÃO - PRINCIPAL
  // ====================================
  return (
    <div style={{...styles.container, backgroundColor: PRIMEM_THEME.colors.background}}>
      {/* MODALS */}
      <EditNameModal
        isOpen={showEditNameModal}
        onClose={() => setShowEditNameModal(false)}
        currentName={selectedChat?.name || ''}
        onSave={handleEditName}
      />

      <EmojiPicker
        isOpen={showEmojiPicker}
        onEmojiSelect={(emoji) => {
          setNewMessage(prev => prev + emoji);
          setShowEmojiPicker(false);
        }}
        onClose={() => setShowEmojiPicker(false)}
      />

      {/* HEADER */}
      <div style={{...styles.header, backgroundColor: PRIMEM_THEME.colors.primary}}>
        <div style={styles.headerLeft}>
          <div style={styles.headerLogo}>
            <span style={styles.headerLogoIcon}>💬</span>
            <div>
              <h1 style={styles.headerTitle}>PRIMEM COMEX WHATSAPP</h1>
              <span style={styles.userInfo}>
                👤 {currentUser?.name} | v7.1 CORRIGIDO | Debug: {conversations.length} conversas
              </span>
            </div>
          </div>
        </div>
        
        <div style={styles.headerRight}>
          {isConnected ? (
            <>
              <span style={styles.statusBadgeConnected}>
                ✅ WhatsApp Conectado
                {whatsappInfo && <small> ({whatsappInfo.pushname || whatsappInfo.name})</small>}
              </span>
              <button onClick={disconnectWhatsApp} style={styles.disconnectBtn}>
                🔌 Desconectar
              </button>
            </>
          ) : isConnecting ? (
            <span style={styles.statusBadgeConnecting}>🔄 Conectando...</span>
          ) : (
            <span style={styles.statusBadgeDisconnected}>❌ Desconectado</span>
          )}
          
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={styles.themeBtn}
            title={darkMode ? "Modo Claro" : "Modo Escuro"}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          <button onClick={handleLogout} style={{...styles.logoutBtn, backgroundColor: PRIMEM_THEME.colors.secondary}}>
            🚪 Sair
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div style={styles.mainContent}>
        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          {/* TABS */}
          <div style={styles.tabs}>
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === 'chats' ? {...styles.tabActive, color: PRIMEM_THEME.colors.primary, borderBottomColor: PRIMEM_THEME.colors.primary} : {})
              }}
              onClick={() => setActiveTab('chats')}
            >
              💬 Chats ({conversations.length})
            </button>
            <button 
              style={{
                ...styles.tab,
                ...(activeTab === 'connection' ? {...styles.tabActive, color: PRIMEM_THEME.colors.primary, borderBottomColor: PRIMEM_THEME.colors.primary} : {})
              }}
              onClick={() => setActiveTab('connection')}
            >
              🔌 Conexão
            </button>
          </div>

          {/* CONTEÚDO DAS TABS */}
          {activeTab === 'chats' && (
            <>
              {/* BUSCA */}
              <div style={styles.searchBox}>
                <input
                  type="text"
                  placeholder="🔍 Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{...styles.searchInput, borderColor: PRIMEM_THEME.colors.border}}
                />
              </div>

              {/* LISTA DE CONVERSAS */}
              <div style={styles.conversationsList}>
                {filteredConversations.length > 0 ? (
                  filteredConversations.map(conv => (
                    <div
                      key={conv.id}
                      style={{
                        ...styles.conversationItem,
                        ...(selectedChat?.id === conv.id ? {...styles.conversationActive, backgroundColor: `${PRIMEM_THEME.colors.primary}10`, borderLeftColor: PRIMEM_THEME.colors.primary} : {})
                      }}
                      onClick={() => selectChat(conv)}
                    >
                      <div style={{...styles.conversationAvatar, backgroundColor: PRIMEM_THEME.colors.primary}}>
                        {conv.avatar ? (
                          <img src={conv.avatar} alt="" style={styles.avatarImage} />
                        ) : (
                          <span>{conv.name?.charAt(0)?.toUpperCase() || '?'}</span>
                        )}
                      </div>
                      
                      <div style={styles.conversationInfo}>
                        <div style={styles.conversationHeader}>
                          <span style={styles.conversationName}>
                            {conv.favorite && '⭐ '}
                            {conv.name}
                          </span>
                          <span style={styles.conversationTime}>
                            {formatTime(conv.timestamp)}
                          </span>
                        </div>
                        <div style={styles.conversationPreview}>
                          {conv.lastMessage?.substring(0, 50)}
                          {conv.lastMessage?.length > 50 && '...'}
                        </div>
                      </div>
                      
                      {conv.unread > 0 && (
                        <div style={{...styles.unreadBadge, backgroundColor: PRIMEM_THEME.colors.secondary}}>
                          {conv.unread}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyState}>
                    <p>🔭 Nenhuma conversa encontrada</p>
                    <small>Conecte o WhatsApp para ver suas conversas</small>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'connection' && (
            <div style={styles.connectionTab}>
              {!isConnected ? (
                <>
                  {qrCode ? (
                    <div style={styles.qrContainer}>
                      <img src={qrCode} alt="QR Code" style={styles.qrCode} />
                      <p style={styles.qrText}>
                        📱 Escaneie o QR Code com seu WhatsApp
                      </p>
                    </div>
                  ) : (
                    <div style={styles.connectContainer}>
                      <button 
                        onClick={connectWhatsApp}
                        style={{...styles.connectButton, backgroundColor: PRIMEM_THEME.colors.secondary}}
                        disabled={isConnecting}
                      >
                        {isConnecting ? '🔄 Conectando...' : '📱 Conectar WhatsApp'}
                      </button>
                      <p style={styles.connectInfo}>
                        Clique para gerar o QR Code
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div style={styles.connectedInfo}>
                  <div style={styles.successIcon}>✅</div>
                  <h3>WhatsApp Conectado!</h3>
                  {whatsappInfo && (
                    <div style={styles.whatsappDetails}>
                      <p><strong>👤 Nome:</strong> {whatsappInfo.pushname || whatsappInfo.name}</p>
                      <p><strong>📱 Número:</strong> {whatsappInfo.wid?.user || whatsappInfo.number}</p>
                    </div>
                  )}
                  <button 
                    onClick={disconnectWhatsApp}
                    style={styles.disconnectButton}
                  >
                    🔌 Desconectar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ÁREA DE CHAT */}
        <div style={styles.chatArea}>
          {selectedChat ? (
            <>
              {/* HEADER DO CHAT */}
              <div style={styles.chatHeader}>
                <div style={styles.chatHeaderLeft}>
                  <div style={{...styles.chatAvatar, backgroundColor: PRIMEM_THEME.colors.primary}}>
                    {selectedChat.avatar ? (
                      <img src={selectedChat.avatar} alt="" style={styles.avatarImage} />
                    ) : (
                      <span>{selectedChat.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <div style={styles.chatHeaderInfo}>
                    <h3 style={{...styles.chatName, color: PRIMEM_THEME.colors.primary}}>{selectedChat.name}</h3>
                    <span style={styles.chatStatus}>🟢 Online</span>
                  </div>
                </div>
                
                <div style={styles.chatHeaderActions}>
                  <button 
                    style={styles.headerActionBtn}
                    onClick={() => toggleFavorite(selectedChat.id)}
                    title="Favoritar"
                  >
                    {selectedChat.favorite ? '⭐' : '☆'}
                  </button>
                  <button 
                    style={{...styles.editNameBtn, backgroundColor: PRIMEM_THEME.colors.primary}}
                    onClick={() => setShowEditNameModal(true)}
                    title="Editar nome do contato"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    style={styles.blockBtn}
                    onClick={handleBlockContact}
                    title="Bloquear contato"
                  >
                    🚫 Block
                  </button>
                  {/* Botão de Debug Temporário */}
                  <button 
                    onClick={debugSelectedChat} 
                    style={{
                      padding: '5px 10px', 
                      fontSize: '12px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    title="Debug - Ver dados do chat no console"
                  >
                    🔍 Debug
                  </button>
                </div>
              </div>

              {/* MENSAGENS */}
              <div style={styles.messagesContainer}>
                {messages[selectedChat.id]?.map((msg, index) => {
                  const prevMsg = messages[selectedChat.id][index - 1];
                  const showDate = !prevMsg || formatDate(msg.timestamp) !== formatDate(prevMsg.timestamp);
                  
                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div style={styles.dateDivider}>
                          <span>📅 {formatDate(msg.timestamp)}</span>
                        </div>
                      )}
                      
                      <div 
                        style={{
                          ...styles.messageWrapper,
                          justifyContent: msg.fromMe ? 'flex-end' : 'flex-start'
                        }}
                        onMouseEnter={(e) => {
                          const actions = e.currentTarget.querySelector('.message-actions');
                          if (actions) actions.style.display = 'flex';
                        }}
                        onMouseLeave={(e) => {
                          const actions = e.currentTarget.querySelector('.message-actions');
                          if (actions) actions.style.display = 'none';
                        }}
                      >
                        <div style={{
                          ...styles.messageBubble,
                          ...(msg.fromMe ? styles.messageSent : styles.messageReceived)
                        }}>
                          {replyTo?.id === msg.id && (
                            <div style={styles.replyIndicator}>
                              💬 Respondendo a esta mensagem...
                            </div>
                          )}
                          
                          {!msg.fromMe && (
                            <div style={styles.senderName}>👤 {msg.from}</div>
                          )}
                          
                          {msg.fromMe && msg.senderName && signatureEnabled && (
                            <div style={{
                              ...styles.senderName,
                              backgroundColor: 'rgba(43, 76, 140, 0.1)',
                              color: '#2B4C8C',
                              border: '1px solid rgba(43, 76, 140, 0.2)'
                            }}>
                              ✏️ {msg.senderName}
                            </div>
                          )}
                          
                          {msg.replyTo && (
                            <div style={styles.replyPreviewInMessage}>
                              📝 Respondendo: "{msg.replyTo.body?.substring(0, 30)}..."
                            </div>
                          )}
                          
                          {renderMessageContent(msg)}
                          
                          <div style={styles.messageFooter}>
                            <span style={styles.messageTime}>
                              🕐 {formatTime(msg.timestamp)}
                            </span>
                            {msg.fromMe && (
                              <span style={styles.messageStatus}>
                                {renderMessageStatus(msg.status)}
                              </span>
                            )}
                          </div>
                          
                          <div className="message-actions" style={styles.messageActions}>
                            <button 
                              style={styles.actionBtn}
                              onClick={() => setReplyTo(msg)}
                              title="Responder (inclui texto original)"
                            >
                              💬
                            </button>
                            {msg.fromMe && !msg.isDeleted && (
                              <button 
                                style={styles.actionBtn}
                                onClick={() => deleteMessage(msg.id)}
                                title="Remover (apenas local)"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* INTERFACE DE GRAVAÇÃO DE ÁUDIO */}
              {showAudioRecorder && (
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  onCancel={handleCancelRecording}
                />
              )}

              {/* INPUT DE MENSAGEM */}
              <div style={styles.inputContainer}>
                {selectedFile && (
                  <div style={styles.filePreview}>
                    <span>📎 {selectedFile.name}</span>
                    <button 
                      onClick={() => setSelectedFile(null)}
                      style={styles.removeFileBtn}
                    >
                      ❌
                    </button>
                  </div>
                )}
                
                {replyTo && (
                  <div style={styles.replyPreview}>
                    <span>📝 Respondendo: "{replyTo.body?.substring(0, 50)}{replyTo.body?.length > 50 ? '...' : ''}"</span>
                    <button 
                      onClick={() => setReplyTo(null)}
                      style={styles.cancelReplyBtn}
                    >
                      ❌
                    </button>
                  </div>
                )}
                
                <div style={styles.inputRow}>
                  <button 
                    style={styles.attachBtn}
                    onClick={() => fileInputRef.current?.click()}
                    title="Anexar arquivo"
                  >
                    📎
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                  />
                  
                  <button 
                    style={styles.audioBtn}
                    onClick={handleStartRecording}
                    title="Gravar áudio"
                    disabled={showAudioRecorder}
                  >
                    🎤
                  </button>
                  
                  <button 
                    style={styles.emojiBtn}
                    onClick={() => setShowEmojiPicker(true)}
                    title="Emojis"
                  >
                    😀
                  </button>
                  
                  <button
                    style={{
                      ...styles.signatureToggleBtn,
                      backgroundColor: signatureEnabled ? PRIMEM_THEME.colors.primary : '#6c757d',
                      color: 'white'
                    }}
                    onClick={toggleSignature}
                    title={signatureEnabled ? 'Assinatura ATIVA - Clique para desativar' : 'Assinatura INATIVA - Clique para ativar'}
                  >
                    ✏️
                  </button>
                  
                  <textarea
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedFile ? "📝 Adicione uma legenda... (Shift+Enter para nova linha)" : "💬 Digite uma mensagem... (Shift+Enter para nova linha)"}
                    style={{...styles.messageTextarea, borderColor: PRIMEM_THEME.colors.border}}
                    disabled={isUploading || showAudioRecorder}
                    rows={1}
                  />
                  
                  <button 
                    onClick={sendMessage}
                    style={{
                      ...styles.sendButton,
                      backgroundColor: PRIMEM_THEME.colors.primary
                    }}
                    disabled={(!newMessage.trim() && !selectedFile) || isUploading || showAudioRecorder}
                    title="Enviar"
                  >
                    {isUploading ? '⏳' : selectedFile ? '📤 Arquivo' : '📤'}
                  </button>
                </div>
                
                <div style={styles.inputHint}>
                  <small>
                    💡 Shift+Enter para nova linha | Enter para enviar | 
                    Assinatura: {signatureEnabled ? 
                      <span style={{color: PRIMEM_THEME.colors.primary, fontWeight: 'bold'}}>✅ ATIVA</span> : 
                      <span style={{color: '#6c757d', fontWeight: 'bold'}}>❌ INATIVA</span>
                    }
                  </small>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.noChatSelected}>
              <div style={styles.emptyIcon}>💬</div>
              <h2 style={{color: PRIMEM_THEME.colors.primary}}>Selecione uma conversa</h2>
              <p>Escolha um chat para começar a conversar</p>
              {!isConnected && (
                <button 
                  onClick={() => setActiveTab('connection')}
                  style={{...styles.connectPromptBtn, backgroundColor: PRIMEM_THEME.colors.primary}}
                >
                  🔌 Conectar WhatsApp
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ====================================
// ESTILOS COMPLETOS
// ====================================
const styles = {
  // Container Principal
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  
  // Login
  loginContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh'
  },
  
  loginBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '450px',
    maxWidth: '90%'
  },
  
  logoContainer: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '20px'
  },
  
  logoIcon: {
    fontSize: '50px'
  },
  
  logoText: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '36px',
    fontWeight: 'bold'
  },
  
  logoP: {
    marginRight: '2px'
  },
  
  logoRimem: {
    // cor será aplicada dinamicamente
  },
  
  title: {
    margin: '10px 0',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  
  subtitle: {
    fontSize: '14px',
    margin: '5px 0'
  },
  
  formGroup: {
    marginBottom: '20px'
  },
  
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontWeight: '500',
    fontSize: '14px'
  },
  
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #ddd',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box'
  },
  
  loginButton: {
    width: '100%',
    padding: '14px',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '10px'
  },
  
  loginFooter: {
    textAlign: 'center',
    marginTop: '20px'
  },
  
  footerText: {
    color: '#999',
    fontSize: '12px',
    display: 'block',
    marginBottom: '5px'
  },
  
  footerBrand: {
    fontSize: '11px',
    display: 'block',
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #eee'
  },
  
  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    padding: '12px 20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  
  headerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  headerLogoIcon: {
    fontSize: '32px'
  },
  
  headerTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
    letterSpacing: '0.5px'
  },
  
  userInfo: {
    fontSize: '13px',
    opacity: 0.9
  },
  
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  
  statusBadgeConnected: {
    padding: '6px 12px',
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
    color: '#28a745',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  statusBadgeConnecting: {
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    color: '#ffc107',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  statusBadgeDisconnected: {
    padding: '6px 12px',
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    color: '#dc3545',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  disconnectBtn: {
    padding: '6px 12px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  
  themeBtn: {
    padding: '6px 10px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    transition: 'transform 0.3s'
  },
  
  logoutBtn: {
    padding: '6px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s'
  },
  
  // Layout Principal
  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  
  // Sidebar
  sidebar: {
    width: '380px',
    backgroundColor: 'white',
    borderRight: '1px solid #dee2e6',
    display: 'flex',
    flexDirection: 'column'
  },
  
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #dee2e6'
  },
  
  tab: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#666',
    transition: 'all 0.3s',
    borderBottom: '2px solid transparent'
  },
  
  tabActive: {
    borderBottom: '2px solid',
    fontWeight: 'bold'
  },
  
  searchBox: {
    padding: '10px',
    borderBottom: '1px solid #dee2e6'
  },
  
  searchInput: {
    width: '100%',
    padding: '10px 15px',
    border: '1px solid #dee2e6',
    borderRadius: '20px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'all 0.3s'
  },
  
  conversationsList: {
    flex: 1,
    overflowY: 'auto'
  },
  
  conversationItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    position: 'relative',
    borderBottom: '1px solid #dee2e6'
  },
  
  conversationActive: {
    borderLeft: '3px solid'
  },
  
  conversationAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    marginRight: '12px',
    flexShrink: 0
  },
  
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  
  conversationInfo: {
    flex: 1,
    minWidth: 0
  },
  
  conversationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px'
  },
  
  conversationName: {
    fontWeight: '500',
    fontSize: '16px',
    color: '#333'
  },
  
  conversationTime: {
    fontSize: '12px',
    color: '#999'
  },
  
  conversationPreview: {
    fontSize: '14px',
    color: '#666',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  
  unreadBadge: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'white',
    borderRadius: '10px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  
  // Área de Chat
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#e5ddd5',
    position: 'relative'
  },
  
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: 'white',
    borderBottom: '1px solid #dee2e6'
  },
  
  chatHeaderLeft: {
    display: 'flex',
    alignItems: 'center'
  },
  
  chatAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px'
  },
  
  chatHeaderInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  
  chatName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '500'
  },
  
  chatStatus: {
    fontSize: '13px',
    color: '#666'
  },
  
  chatHeaderActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  
  headerActionBtn: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#666',
    transition: 'color 0.2s'
  },

  editNameBtn: {
    padding: '8px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  
  blockBtn: {
    padding: '8px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  
  // Mensagens
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"%3E%3Ccircle cx="50" cy="50" r="1" fill="%23ccc" opacity="0.3"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23pattern)"/%3E%3C/svg%3E")'
  },
  
  dateDivider: {
    textAlign: 'center',
    margin: '20px 0',
    position: 'relative'
  },
  
  messageWrapper: {
    display: 'flex',
    marginBottom: '10px',
    position: 'relative'
  },
  
  messageBubble: {
    maxWidth: '65%',
    padding: '8px 12px',
    borderRadius: '7px',
    position: 'relative',
    wordWrap: 'break-word'
  },
  
  messageReceived: {
    backgroundColor: 'white',
    borderTopLeftRadius: 0
  },
  
  messageSent: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 0
  },
  
  senderName: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '4px',
    padding: '3px 6px',
    borderRadius: '4px',
    display: 'inline-block'
  },
  
  messageText: {
    fontSize: '14px',
    lineHeight: '1.4',
    whiteSpace: 'pre-wrap'
  },
  
  messageFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '4px',
    marginTop: '4px'
  },
  
  messageTime: {
    fontSize: '11px',
    color: '#999'
  },
  
  messageStatus: {
    fontSize: '14px'
  },
  
  messageActions: {
    position: 'absolute',
    top: '-20px',
    right: '0',
    display: 'none',
    gap: '5px',
    backgroundColor: 'white',
    padding: '2px 5px',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  
  actionBtn: {
    padding: '2px 6px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    borderRadius: '3px',
    transition: 'background-color 0.2s'
  },
  
  replyIndicator: {
    padding: '4px 8px',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderLeft: '3px solid #667eea',
    marginBottom: '8px',
    fontSize: '12px',
    color: '#667eea'
  },
  
  replyPreviewInMessage: {
    padding: '6px 8px',
    backgroundColor: 'rgba(43, 76, 140, 0.1)',
    borderLeft: '3px solid #2B4C8C',
    marginBottom: '8px',
    fontSize: '12px',
    color: '#2B4C8C',
    fontStyle: 'italic'
  },
  
  replyPreview: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    backgroundColor: '#DCF8C6',
    borderRadius: '5px',
    marginBottom: '10px',
    fontSize: '14px'
  },
  
  cancelReplyBtn: {
    padding: '4px 8px',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer'
  },
  
  // Mídia
  mediaContainer: {
    marginTop: '5px'
  },
  
  documentContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: '5px',
    marginTop: '5px',
    minWidth: '250px'
  },
  
  documentIcon: {
    fontSize: '30px',
    marginRight: '10px'
  },
  
  documentInfo: {
    flex: 1
  },
  
  documentName: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '6px',
    wordBreak: 'break-word'
  },
  
  documentActions: {
    display: 'flex',
    gap: '10px'
  },
  
  downloadButton: {
    fontSize: '12px',
    color: '#667eea',
    textDecoration: 'none',
    padding: '2px 6px',
    borderRadius: '3px',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    display: 'inline-block',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  
  viewButton: {
    fontSize: '12px',
    color: '#25D366',
    textDecoration: 'none',
    padding: '2px 6px',
    borderRadius: '3px',
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    display: 'inline-block',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  
  caption: {
    marginTop: '5px',
    fontSize: '14px'
  },
  
  // Input
  inputContainer: {
    backgroundColor: 'white',
    borderTop: '1px solid #dee2e6',
    padding: '10px',
    position: 'relative'
  },
  
  filePreview: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    backgroundColor: '#f0f2f5',
    borderRadius: '5px',
    marginBottom: '10px'
  },
  
  removeFileBtn: {
    padding: '4px 8px',
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer'
  },
  
  inputRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px'
  },
  
  attachBtn: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '24px'
  },
  
  audioBtn: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '24px',
    transition: 'all 0.3s'
  },
  
  emojiBtn: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '24px'
  },
  
  signatureToggleBtn: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    minWidth: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  messageTextarea: {
    flex: 1,
    padding: '10px',
    border: '1px solid #dee2e6',
    borderRadius: '20px',
    fontSize: '14px',
    outline: 'none',
    resize: 'none',
    minHeight: '40px',
    maxHeight: '200px',
    lineHeight: '1.4',
    fontFamily: 'inherit'
  },
  
  sendButton: {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    minHeight: '40px'
  },
  
  inputHint: {
    textAlign: 'center',
    marginTop: '5px',
    color: '#666'
  },
  
  // Estados Vazios
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#999'
  },
  
  noChatSelected: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#999'
  },
  
  emptyIcon: {
    fontSize: '80px',
    marginBottom: '20px',
    opacity: 0.5
  },
  
  connectPromptBtn: {
    marginTop: '20px',
    padding: '10px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  
  // Tabs de Conexão
  connectionTab: {
    padding: '20px',
    textAlign: 'center'
  },
  
  qrContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px'
  },
  
  qrCode: {
    width: '280px',
    height: '280px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  
  qrText: {
    marginTop: '20px',
    color: '#666',
    fontSize: '14px'
  },
  
  connectContainer: {
    padding: '40px 20px'
  },
  
  connectButton: {
    padding: '15px 30px',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  
  connectInfo: {
    marginTop: '15px',
    color: '#666',
    fontSize: '14px'
  },
  
  connectedInfo: {
    padding: '20px',
    textAlign: 'center'
  },
  
  successIcon: {
    fontSize: '60px',
    marginBottom: '20px'
  },
  
  whatsappDetails: {
    textAlign: 'left',
    backgroundColor: '#f0f2f5',
    padding: '15px',
    borderRadius: '10px',
    margin: '20px 0'
  },
  
  disconnectButton: {
    padding: '10px 20px',
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px'
  }
};