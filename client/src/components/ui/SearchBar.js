// client/src/components/ui/SearchBar.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE SEARCH BAR
// Componente básico reutilizável para barras de busca
// =====================================

import React, { useState, useRef, useEffect } from 'react';

const SearchBar = ({ 
  value = '',
  placeholder = 'Buscar...',
  onSearch,
  onChange,
  onFocus,
  onBlur,
  onClear,
  disabled = false,
  loading = false,
  autoFocus = false,
  debounceMs = 300,
  showClearButton = true,
  showSearchButton = false,
  size = 'medium', // small, medium, large
  variant = 'default', // default, rounded, minimal
  suggestions = [],
  showSuggestions = false,
  onSuggestionSelect,
  maxSuggestions = 5,
  highlightMatch = true,
  icon = '🔍',
  className = '',
  style = {},
  ...props 
}) => {
  // ====================================
  // ESTADOS LOCAIS
  // ====================================
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // ====================================
  // REFS
  // ====================================
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // ====================================
  // SINCRONIZAR VALOR EXTERNO
  // ====================================
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // ====================================
  // AUTO FOCUS
  // ====================================
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // ====================================
  // DEBOUNCE PARA BUSCA
  // ====================================
  useEffect(() => {
    if (debounceMs > 0 && onSearch) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onSearch(internalValue);
      }, debounceMs);

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }
  }, [internalValue, debounceMs, onSearch]);

  // ====================================
  // FILTRAR SUGESTÕES
  // ====================================
  const filteredSuggestions = React.useMemo(() => {
    if (!showSuggestions || !internalValue.trim() || !suggestions.length) {
      return [];
    }

    const filtered = suggestions
      .filter(suggestion => {
        const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.text || suggestion.label;
        return suggestionText.toLowerCase().includes(internalValue.toLowerCase());
      })
      .slice(0, maxSuggestions);

    return filtered;
  }, [suggestions, internalValue, showSuggestions, maxSuggestions]);

  // ====================================
  // MANIPULAR MUDANÇA
  // ====================================
  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    setSelectedSuggestionIndex(-1);
    
    if (onChange) {
      onChange(e);
    }

    // Mostrar sugestões se houver valor
    if (showSuggestions && newValue.trim()) {
      setShowSuggestionsList(true);
    } else {
      setShowSuggestionsList(false);
    }
  };

  // ====================================
  // MANIPULAR FOCO
  // ====================================
  const handleFocus = (e) => {
    setIsFocused(true);
    
    if (showSuggestions && internalValue.trim()) {
      setShowSuggestionsList(true);
    }
    
    if (onFocus) {
      onFocus(e);
    }
  };

  // ====================================
  // MANIPULAR BLUR
  // ====================================
  const handleBlur = (e) => {
    // Delay para permitir clique em sugestões
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestionsList(false);
      setSelectedSuggestionIndex(-1);
    }, 150);
    
    if (onBlur) {
      onBlur(e);
    }
  };

  // ====================================
  // MANIPULAR TECLAS
  // ====================================
  const handleKeyDown = (e) => {
    if (showSuggestionsList && filteredSuggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
          break;
        
        case 'Enter':
          e.preventDefault();
          if (selectedSuggestionIndex >= 0) {
            handleSuggestionSelect(filteredSuggestions[selectedSuggestionIndex]);
          } else if (onSearch) {
            handleSearch();
          }
          break;
        
        case 'Escape':
          e.preventDefault();
          setShowSuggestionsList(false);
          setSelectedSuggestionIndex(-1);
          inputRef.current?.blur();
          break;
      }
    } else if (e.key === 'Enter' && onSearch) {
      e.preventDefault();
      handleSearch();
    }
  };

  // ====================================
  // EXECUTAR BUSCA
  // ====================================
  const handleSearch = () => {
    if (onSearch && !loading) {
      onSearch(internalValue);
      setShowSuggestionsList(false);
    }
  };

  // ====================================
  // LIMPAR BUSCA
  // ====================================
  const handleClear = () => {
    setInternalValue('');
    setShowSuggestionsList(false);
    setSelectedSuggestionIndex(-1);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    if (onClear) {
      onClear();
    }
    
    if (onChange) {
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' }
      };
      onChange(syntheticEvent);
    }
  };

  // ====================================
  // SELECIONAR SUGESTÃO
  // ====================================
  const handleSuggestionSelect = (suggestion) => {
    const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.text || suggestion.label;
    
    setInternalValue(suggestionText);
    setShowSuggestionsList(false);
    setSelectedSuggestionIndex(-1);
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    
    if (onSearch) {
      onSearch(suggestionText);
    }
  };

  // ====================================
  // HIGHLIGHT DE TEXTO
  // ====================================
  const highlightText = (text, query) => {
    if (!highlightMatch || !query.trim()) {
      return text;
    }

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={searchStyles.highlight}>
          {part}
        </span>
      ) : part
    );
  };

  // ====================================
  // ESTILOS DINÂMICOS
  // ====================================
  const getContainerStyle = () => {
    const baseStyle = {
      ...searchStyles.container,
      ...searchStyles.sizes[size],
      ...searchStyles.variants[variant]
    };

    if (isFocused) {
      baseStyle.borderColor = '#2B4C7E'; // Azul PRIMEM
      baseStyle.boxShadow = '0 0 0 3px rgba(43, 76, 126, 0.1)';
    }

    if (disabled) {
      baseStyle.backgroundColor = '#f1f5f9';
      baseStyle.borderColor = '#e2e8f0';
      baseStyle.cursor = 'not-allowed';
    }

    return {
      ...baseStyle,
      ...style
    };
  };

  const getInputStyle = () => {
    const baseStyle = {
      ...searchStyles.input
    };

    if (disabled) {
      baseStyle.cursor = 'not-allowed';
    }

    return baseStyle;
  };

  // ====================================
  // CLASSES CSS DINÂMICAS
  // ====================================
  const getContainerClass = () => {
    const baseClass = 'primem-search-bar';
    const sizeClass = `primem-search-bar--${size}`;
    const variantClass = `primem-search-bar--${variant}`;
    const stateClasses = [
      disabled && 'primem-search-bar--disabled',
      isFocused && 'primem-search-bar--focused',
      loading && 'primem-search-bar--loading'
    ].filter(Boolean).join(' ');
    
    return `${baseClass} ${sizeClass} ${variantClass} ${stateClasses} ${className}`.trim();
  };

  // ====================================
  // RENDER PRINCIPAL
  // ====================================
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      
      {/* CONTAINER DO SEARCH */}
      <div 
        className={getContainerClass()}
        style={getContainerStyle()}
      >
        
        {/* ÍCONE DE BUSCA */}
        <span style={searchStyles.searchIcon}>
          {loading ? '⏳' : icon}
        </span>

        {/* INPUT */}
        <input
          ref={inputRef}
          type="text"
          value={internalValue}
          placeholder={placeholder}
          disabled={disabled || loading}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={getInputStyle()}
          {...props}
        />

        {/* BOTÃO LIMPAR */}
        {showClearButton && internalValue && !loading && (
          <button
            type="button"
            onClick={handleClear}
            style={searchStyles.clearButton}
            title="Limpar busca"
          >
            ✕
          </button>
        )}

        {/* BOTÃO BUSCAR */}
        {showSearchButton && (
          <button
            type="button"
            onClick={handleSearch}
            disabled={disabled || loading || !internalValue.trim()}
            style={{
              ...searchStyles.searchButton,
              ...(disabled || loading || !internalValue.trim() ? searchStyles.searchButtonDisabled : {})
            }}
            title="Buscar"
          >
            {loading ? '⏳' : '🔍'}
          </button>
        )}
      </div>

      {/* LISTA DE SUGESTÕES */}
      {showSuggestionsList && filteredSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          style={searchStyles.suggestionsList}
        >
          {filteredSuggestions.map((suggestion, index) => {
            const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.text || suggestion.label;
            const isSelected = index === selectedSuggestionIndex;
            
            return (
              <div
                key={index}
                onClick={() => handleSuggestionSelect(suggestion)}
                style={{
                  ...searchStyles.suggestionItem,
                  ...(isSelected ? searchStyles.suggestionItemSelected : {})
                }}
              >
                <span style={searchStyles.suggestionIcon}>
                  {typeof suggestion === 'object' && suggestion.icon ? suggestion.icon : '🔍'}
                </span>
                <span style={searchStyles.suggestionText}>
                  {highlightText(suggestionText, internalValue)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ====================================
// ESTILOS PRIMEM
// ====================================
const searchStyles = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    border: '2px solid #e1e5f2',
    borderRadius: '8px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    transition: 'all 0.2s ease',
    width: '100%'
  },

  // TAMANHOS
  sizes: {
    small: {
      minHeight: '36px',
      fontSize: '14px'
    },
    medium: {
      minHeight: '40px',
      fontSize: '14px'
    },
    large: {
      minHeight: '48px',
      fontSize: '16px'
    }
  },

  // VARIANTES
  variants: {
    default: {
      // Estilo padrão já aplicado
    },
    rounded: {
      borderRadius: '24px'
    },
    minimal: {
      border: 'none',
      backgroundColor: '#f8f9ff',
      borderRadius: '6px'
    }
  },

  searchIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '16px',
    color: '#64748b',
    pointerEvents: 'none',
    zIndex: 1
  },

  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    padding: '0 12px 0 40px',
    fontSize: 'inherit',
    color: '#1f2937',
    fontFamily: 'inherit',
    '::placeholder': {
      color: '#9ca3af'
    }
  },

  clearButton: {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '14px',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    ':hover': {
      color: '#dc2626',
      backgroundColor: '#fef2f2'
    }
  },

  searchButton: {
    position: 'absolute',
    right: '4px',
    background: '#2B4C7E', // Azul PRIMEM
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '6px 12px',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#1e3a5f'
    }
  },

  searchButtonDisabled: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed'
  },

  // SUGESTÕES
  suggestionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #e1e5f2',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginTop: '4px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000
  },

  suggestionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s ease',
    ':last-child': {
      borderBottom: 'none'
    },
    ':hover': {
      backgroundColor: '#f8f9ff'
    }
  },

  suggestionItemSelected: {
    backgroundColor: '#f8f9ff',
    borderColor: '#2B4C7E' // Azul PRIMEM
  },

  suggestionIcon: {
    fontSize: '14px',
    color: '#64748b',
    flexShrink: 0
  },

  suggestionText: {
    flex: 1,
    fontSize: '14px',
    color: '#374151'
  },

  highlight: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontWeight: '600',
    padding: '0 2px',
    borderRadius: '2px'
  }
};

// ====================================
// COMPONENTES ESPECIALIZADOS
// ====================================

// Search bar simples
export const SimpleSearchBar = (props) => (
  <SearchBar 
    {...props} 
    variant="minimal"
    showSearchButton={false}
    showClearButton={true}
  />
);

// Search bar com botão
export const SearchBarWithButton = (props) => (
  <SearchBar 
    {...props} 
    showSearchButton={true}
    showClearButton={true}
  />
);

// Search bar arredondada
export const RoundedSearchBar = (props) => (
  <SearchBar 
    {...props} 
    variant="rounded"
    showClearButton={true}
  />
);

// Search bar para contatos
export const ContactSearchBar = (props) => (
  <SearchBar 
    {...props} 
    placeholder="Buscar contatos..."
    icon="👤"
    variant="minimal"
    debounceMs={200}
  />
);

// Search bar para mensagens
export const MessageSearchBar = (props) => (
  <SearchBar 
    {...props} 
    placeholder="Buscar mensagens..."
    icon="💬"
    variant="default"
    debounceMs={300}
  />
);

// ====================================
// EXPORTAÇÃO PADRÃO
// ====================================
export default SearchBar;