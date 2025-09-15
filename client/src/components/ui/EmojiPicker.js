// client/src/components/ui/EmojiPicker.js
import React, { useState, useRef, useEffect } from 'react';

const EmojiPicker = ({ onEmojiSelect, onClose, isVisible }) => {
  // Estados
  const [activeCategory, setActiveCategory] = useState('smileys');
  const [recentEmojis, setRecentEmojis] = useState(() => {
    const saved = localStorage.getItem('primem_recent_emojis');
    return saved ? JSON.parse(saved) : [];
  });

  // Ref para container
  const containerRef = useRef(null);

  // Categorias de emojis
  const emojiCategories = {
    recent: {
      name: '🕐 Recentes',
      emojis: recentEmojis
    },
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
      name: '👥 Pessoas',
      emojis: [
        '👶', '🧒', '👦', '👧', '🧑', '👨', '👩', '🧓', '👴', '👵',
        '👱', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦲', '👩‍🦲', '👨‍🦳', '👩‍🦳', '🧔',
        '👲', '👳', '👮', '👷', '💂', '🕵️', '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾',
        '👩‍🍳', '👨‍🍳', '👩‍🎓', '👨‍🎓', '👩‍🎤', '👨‍🎤', '👩‍🏫', '👨‍🏫', '👩‍🏭', '👨‍🏭',
        '👩‍💻', '👨‍💻', '👩‍💼', '👨‍💼', '👩‍🔧', '👨‍🔧', '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨'
      ]
    },
    nature: {
      name: '🌱 Natureza',
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
      name: '💖 Símbolos',
      emojis: [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
        '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
        '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
        '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳'
      ]
    },
    flags: {
      name: '🏁 Bandeiras',
      emojis: [
        '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇫', '🇦🇱',
        '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼',
        '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿',
        '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇮🇴', '🇻🇬', '🇧🇳'
      ]
    }
  };

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  // Salvar emojis recentes
  useEffect(() => {
    localStorage.setItem('primem_recent_emojis', JSON.stringify(recentEmojis));
  }, [recentEmojis]);

  // Selecionar emoji
  const handleEmojiSelect = (emoji) => {
    // Adicionar aos recentes (máximo 20)
    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e !== emoji);
      return [emoji, ...filtered].slice(0, 20);
    });

    // Callback para o componente pai
    if (onEmojiSelect) {
      onEmojiSelect(emoji);
    }
  };

  // Não renderizar se não visível
  if (!isVisible) return null;

  return (
    <div style={styles.overlay}>
      <div ref={containerRef} style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.title}>😀 Escolher Emoji</span>
          <button style={styles.closeButton} onClick={onClose}>
            ✖️
          </button>
        </div>

        {/* Categorias */}
        <div style={styles.categories}>
          {Object.entries(emojiCategories).map(([key, category]) => (
            <button
              key={key}
              style={{
                ...styles.categoryButton,
                ...(activeCategory === key ? styles.activeCategoryButton : {})
              }}
              onClick={() => setActiveCategory(key)}
              title={category.name}
            >
              {category.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Grid de emojis */}
        <div style={styles.emojiGrid}>
          {emojiCategories[activeCategory]?.emojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              style={styles.emojiButton}
              onClick={() => handleEmojiSelect(emoji)}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
          
          {/* Mensagem para categoria vazia */}
          {emojiCategories[activeCategory]?.emojis.length === 0 && (
            <div style={styles.emptyCategory}>
              <span>📭 Nenhum emoji recente</span>
              <small>Use emojis para vê-los aqui</small>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <small>💡 Clique no emoji para inserir</small>
        </div>
      </div>
    </div>
  );
};

// Estilos do componente
const styles = {
  overlay: {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    zIndex: 1000
  },

  container: {
    width: '320px',
    height: '400px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    border: '1px solid #e1e5e9',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #e1e5e9',
    backgroundColor: '#f8f9fa',
    flexShrink: 0
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

  categories: {
    display: 'flex',
    padding: '8px',
    gap: '4px',
    borderBottom: '1px solid #e1e5e9',
    backgroundColor: '#fafbfc',
    flexShrink: 0,
    overflowX: 'auto',
    scrollbarWidth: 'none'
  },

  categoryButton: {
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'all 0.2s',
    flexShrink: 0,
    minWidth: '40px'
  },

  activeCategoryButton: {
    backgroundColor: '#667eea',
    transform: 'scale(1.1)'
  },

  emojiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '4px',
    padding: '12px',
    overflowY: 'auto',
    flex: 1,
    scrollbarWidth: 'thin'
  },

  emojiButton: {
    width: '32px',
    height: '32px',
    background: 'none',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },

  emptyCategory: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '20px',
    color: '#7f8c8d',
    textAlign: 'center'
  },

  footer: {
    padding: '8px 16px',
    borderTop: '1px solid #e1e5e9',
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
    color: '#7f8c8d',
    flexShrink: 0
  }
};

// CSS adicional para scrollbar e hover
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  /* Scrollbar customizada */
  .emoji-grid::-webkit-scrollbar {
    width: 6px;
  }
  
  .emoji-grid::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .emoji-grid::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  .emoji-grid::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* Hover effects */
  .emoji-button:hover {
    background-color: #f0f2f5 !important;
    transform: scale(1.2);
  }
  
  .category-button:hover {
    background-color: #e9ecef !important;
  }
  
  .close-button:hover {
    background-color: #e9ecef !important;
  }
`;
document.head.appendChild(styleSheet);

// PropTypes
EmojiPicker.defaultProps = {
  onEmojiSelect: () => {},
  onClose: () => {},
  isVisible: false
};

export default EmojiPicker;