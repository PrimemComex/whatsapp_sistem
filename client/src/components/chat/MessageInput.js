// client/src/components/chat/MessageInput.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE INPUT DE MENSAGEM - VERSÃO CORRIGIDA
// Input completo com texto, emojis, arquivos e áudio
// =====================================

import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

// Cores PRIMEM
const PRIMEM_COLORS = {
  primary: '#2B4C8C',
  secondary: '#C97A4A',
  accent: '#8B9DC3',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  background: '#f0f2f5',
  white: '#ffffff',
  text: '#374151'
};

const MessageInput = ({ 
  chatId,
  placeholder = 'Digite uma mensagem...',
  disabled = false,
  onSendMessage,
  onTyping,
  onFileSelect,
  maxLength = 4096,
  showEmojiPicker = true,
  showFileUpload = true,
  showAudioRecord = true,  // ✅ CORRIGIDO: era showAudioRecorder duplicado
  autoFocus = false,
  className = '',
  style = {}
}) => {
  // ====================================
  // ESTADOS LOCAIS
  // ====================================
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // ====================================
  // REFS
  // ====================================
  const textAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  // ====================================
  // HANDLERS
  // ====================================
  const handleMessageChange = useCallback((e) => {
    const value = e.target.value;
    
    if (value.length <= maxLength) {
      setMessage(value);
      
      // Notificar que está digitando
      if (!isTyping && value.length > 0) {
        setIsTyping(true);
        if (onTyping) {
          onTyping(true);
        }
      } else if (isTyping && value.length === 0) {
        setIsTyping(false);
        if (onTyping) {
          onTyping(false);
        }
      }
    }
  }, [maxLength, isTyping, onTyping]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isSending || disabled) return;

    setIsSending(true);
    
    try {
      if (onSendMessage) {
        await onSendMessage(message.trim(), chatId);
      }
      
      setMessage('');
      setShowEmojis(false);
      setIsTyping(false);
      
      // Focar no input após enviar
      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 100);
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
    }
  }, [message, isSending, disabled, onSendMessage, chatId]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleEmojiClick = () => {
    setShowEmojis(prev => !prev);
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && onFileSelect) {
      onFileSelect(files);
    }
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleRecordClick = () => {
    if (isRecording) {
      // Parar gravação
      setIsRecording(false);
    } else {
      // Iniciar gravação
      setIsRecording(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onFileSelect) {
      onFileSelect(files);
    }
  };

  // ====================================
  // ESTILOS
  // ====================================
  const styles = {
    container: {
      padding: '16px 24px',
      backgroundColor: PRIMEM_COLORS.white,
      borderTop: `1px solid ${PRIMEM_COLORS.accent}20`,
      position: 'relative',
      ...style
    },

    inputRow: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '12px'
    },

    textAreaContainer: {
      flex: 1,
      position: 'relative',
      ...(dragOver && {
        backgroundColor: `${PRIMEM_COLORS.primary}10`,
        borderRadius: '8px'
      })
    },

    textArea: {
      width: '100%',
      minHeight: '44px',
      maxHeight: '120px',
      padding: '12px 60px 12px 16px',
      border: `2px solid ${PRIMEM_COLORS.accent}40`,
      borderRadius: '22px',
      fontSize: '16px',
      fontFamily: 'inherit',
      resize: 'none',
      outline: 'none',
      backgroundColor: PRIMEM_COLORS.background,
      color: PRIMEM_COLORS.text,
      transition: 'border-color 0.3s ease',
      ...(disabled && {
        opacity: 0.6,
        cursor: 'not-allowed'
      })
    },

    textAreaFocused: {
      borderColor: PRIMEM_COLORS.primary,
      backgroundColor: PRIMEM_COLORS.white
    },

    charCount: {
      position: 'absolute',
      bottom: '4px',
      right: '70px',
      fontSize: '11px',
      color: message.length > maxLength * 0.8 ? PRIMEM_COLORS.warning : PRIMEM_COLORS.text,
      opacity: 0.6
    },

    inputActions: {
      position: 'absolute',
      right: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      gap: '4px'
    },

    actionButton: {
      width: '32px',
      height: '32px',
      border: 'none',
      borderRadius: '16px',
      backgroundColor: 'transparent',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease',
      opacity: disabled ? 0.5 : 1,
      '&:hover': !disabled && {
        backgroundColor: PRIMEM_COLORS.background
      }
    },

    actionButtonActive: {
      backgroundColor: PRIMEM_COLORS.primary,
      color: PRIMEM_COLORS.white
    },

    sendButton: {
      width: '44px',
      height: '44px',
      borderRadius: '22px',
      border: 'none',
      backgroundColor: PRIMEM_COLORS.primary,
      color: PRIMEM_COLORS.white,
      cursor: (!message.trim() || isSending || disabled) ? 'not-allowed' : 'pointer',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      opacity: (!message.trim() || disabled) ? 0.5 : 1,
      '&:hover': (message.trim() && !disabled && !isSending) && {
        backgroundColor: PRIMEM_COLORS.secondary,
        transform: 'scale(1.05)'
      }
    },

    hiddenFileInput: {
      display: 'none'
    },

    // EMOJI PICKER (placeholder)
    emojiPicker: {
      position: 'absolute',
      bottom: '100%',
      right: '24px',
      marginBottom: '8px',
      backgroundColor: PRIMEM_COLORS.white,
      border: `1px solid ${PRIMEM_COLORS.accent}40`,
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      zIndex: 1000
    },

    emojiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      gap: '8px',
      maxWidth: '280px'
    },

    emojiButton: {
      width: '32px',
      height: '32px',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: PRIMEM_COLORS.background
      }
    },

    // DRAG & DROP
    dragOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: `${PRIMEM_COLORS.primary}20`,
      border: `2px dashed ${PRIMEM_COLORS.primary}`,
      borderRadius: '22px',
      display: dragOver ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      color: PRIMEM_COLORS.primary,
      fontSize: '14px',
      fontWeight: '600',
      zIndex: 10
    }
  };

  // ====================================
  // EMOJIS SIMPLES
  // ====================================
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😊', '😍', '🤣', '😂',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤗', '🤔', '😐', '😑', '😶', '🙄', '😏', '😣',
    '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👏', '🙌', '👐', '🤝', '🙏', '✊', '👊', '🤛'
  ];

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojis(false);
    textAreaRef.current?.focus();
  };

  // ====================================
  // RENDERIZAÇÃO
  // ====================================
  return (
    <div 
      className={className} 
      style={styles.container}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div style={styles.inputRow}>
        {/* ÁREA DE TEXTO */}
        <div style={styles.textAreaContainer}>
          <textarea
            ref={textAreaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isSending}
            autoFocus={autoFocus}
            style={{
              ...styles.textArea,
              ...(textAreaRef.current === document.activeElement ? styles.textAreaFocused : {})
            }}
            rows={1}
            onInput={(e) => {
              // Auto-resize textarea
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />

          {/* CONTADOR DE CARACTERES */}
          {message.length > maxLength * 0.7 && (
            <div style={styles.charCount}>
              {message.length}/{maxLength}
            </div>
          )}

          {/* AÇÕES DO INPUT */}
          <div style={styles.inputActions}>
            {/* EMOJI PICKER */}
            {showEmojiPicker && (
              <button
                type="button"
                style={{
                  ...styles.actionButton,
                  ...(showEmojis ? styles.actionButtonActive : {})
                }}
                onClick={handleEmojiClick}
                disabled={disabled}
                title="Emojis"
              >
                😊
              </button>
            )}

            {/* FILE UPLOAD */}
            {showFileUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={styles.hiddenFileInput}
                  onChange={handleFileChange}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />
                <button
                  type="button"
                  style={styles.actionButton}
                  onClick={handleFileClick}
                  disabled={disabled}
                  title="Anexar arquivo"
                >
                  📎
                </button>
              </>
            )}

            {/* AUDIO RECORD */}
            {showAudioRecord && (
              <button
                type="button"
                style={{
                  ...styles.actionButton,
                  ...(isRecording ? styles.actionButtonActive : {})
                }}
                onClick={handleRecordClick}
                disabled={disabled}
                title={isRecording ? "Parar gravação" : "Gravar áudio"}
              >
                {isRecording ? '⏹️' : '🎤'}
              </button>
            )}
          </div>

          {/* DRAG & DROP OVERLAY */}
          <div style={styles.dragOverlay}>
            📎 Solte os arquivos aqui
          </div>
        </div>

        {/* BOTÃO ENVIAR */}
        <button
          type="button"
          style={styles.sendButton}
          onClick={handleSendMessage}
          disabled={!message.trim() || isSending || disabled}
          title="Enviar mensagem"
        >
          {isSending ? '⏳' : '📤'}
        </button>
      </div>

      {/* EMOJI PICKER */}
      {showEmojis && showEmojiPicker && (
        <div style={styles.emojiPicker}>
          <div style={styles.emojiGrid}>
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                style={styles.emojiButton}
                onClick={() => handleEmojiSelect(emoji)}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div style={{ 
            textAlign: 'center', 
            marginTop: '12px',
            fontSize: '12px',
            color: PRIMEM_COLORS.text,
            opacity: 0.7
          }}>
            Clique em um emoji para adicionar
          </div>
        </div>
      )}
    </div>
  );
};

// ====================================
// PROP TYPES
// ====================================
MessageInput.propTypes = {
  chatId: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  onSendMessage: PropTypes.func,
  onTyping: PropTypes.func,
  onFileSelect: PropTypes.func,
  maxLength: PropTypes.number,
  showEmojiPicker: PropTypes.bool,
  showFileUpload: PropTypes.bool,
  showAudioRecord: PropTypes.bool,  // ✅ CORRIGIDO
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

export default MessageInput;