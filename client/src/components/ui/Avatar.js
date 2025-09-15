// client/src/components/ui/Avatar.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE AVATAR
// Componente básico reutilizável para avatares de usuários
// =====================================

import React, { useState } from 'react';

const Avatar = ({ 
  src = null,
  alt = 'Avatar',
  name = '',
  size = 'medium', // tiny, small, medium, large, xl
  shape = 'circle', // circle, square, rounded
  status = null, // online, offline, away, busy
  showStatus = false,
  fallbackIcon = '👤',
  backgroundColor = null,
  color = null,
  onClick,
  className = '',
  style = {},
  ...props 
}) => {
  // ====================================
  // ESTADOS LOCAIS
  // ====================================
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // ====================================
  // GERAR COR BASEADA NO NOME
  // ====================================
  const generateColorFromName = (name) => {
    if (!name) return '#64748b';
    
    const colors = [
      '#2B4C7E', // Azul PRIMEM
      '#C5793B', // Laranja PRIMEM
      '#059669', // Verde
      '#7c3aed', // Roxo
      '#dc2626', // Vermelho
      '#0891b2', // Cyan
      '#ea580c', // Laranja escuro
      '#16a34a', // Verde claro
      '#9333ea', // Roxo claro
      '#0f766e'  // Teal
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // ====================================
  // OBTER INICIAIS DO NOME
  // ====================================
  const getInitials = (name) => {
    if (!name) return fallbackIcon;
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // ====================================
  // MANIPULAR ERRO DA IMAGEM
  // ====================================
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // ====================================
  // MANIPULAR CARREGAMENTO DA IMAGEM
  // ====================================
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // ====================================
  // MANIPULAR CLIQUE
  // ====================================
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  // ====================================
  // ESTILOS DINÂMICOS
  // ====================================
  const getAvatarStyle = () => {
    const generatedColor = generateColorFromName(name);
    
    const baseStyle = {
      ...avatarStyles.base,
      ...avatarStyles.sizes[size],
      ...avatarStyles.shapes[shape],
      backgroundColor: backgroundColor || generatedColor,
      color: color || '#ffffff',
      cursor: onClick ? 'pointer' : 'default'
    };

    return {
      ...baseStyle,
      ...style
    };
  };

  const getStatusStyle = () => {
    return {
      ...avatarStyles.status,
      ...avatarStyles.statusSizes[size],
      ...avatarStyles.statusColors[status]
    };
  };

  // ====================================
  // CLASSES CSS DINÂMICAS
  // ====================================
  const getAvatarClass = () => {
    const baseClass = 'primem-avatar';
    const sizeClass = `primem-avatar--${size}`;
    const shapeClass = `primem-avatar--${shape}`;
    const stateClasses = [
      onClick && 'primem-avatar--clickable',
      showStatus && 'primem-avatar--with-status'
    ].filter(Boolean).join(' ');
    
    return `${baseClass} ${sizeClass} ${shapeClass} ${stateClasses} ${className}`.trim();
  };

  // ====================================
  // RENDERIZAR CONTEÚDO DO AVATAR
  // ====================================
  const renderAvatarContent = () => {
    // Se tem imagem válida e carregou
    if (src && !imageError && imageLoaded) {
      return null; // A imagem será renderizada no img
    }

    // Se tem imagem mas ainda não carregou
    if (src && !imageError && !imageLoaded) {
      return (
        <span style={avatarStyles.loading}>
          ⏳
        </span>
      );
    }

    // Fallback: mostrar iniciais ou ícone
    return (
      <span style={avatarStyles.fallback}>
        {name ? getInitials(name) : fallbackIcon}
      </span>
    );
  };

  // ====================================
  // RENDER PRINCIPAL
  // ====================================
  return (
    <div 
      className={getAvatarClass()}
      style={getAvatarStyle()}
      onClick={handleClick}
      title={alt || name}
      {...props}
    >
      {/* IMAGEM DO AVATAR */}
      {src && !imageError && (
        <img
          src={src}
          alt={alt}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{
            ...avatarStyles.image,
            display: imageLoaded ? 'block' : 'none'
          }}
        />
      )}

      {/* CONTEÚDO FALLBACK */}
      {renderAvatarContent()}

      {/* INDICADOR DE STATUS */}
      {showStatus && status && (
        <div 
          style={getStatusStyle()}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};

// ====================================
// ESTILOS PRIMEM
// ====================================
const avatarStyles = {
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: '600',
    overflow: 'hidden',
    flexShrink: 0,
    userSelect: 'none',
    transition: 'all 0.2s ease'
  },

  // TAMANHOS
  sizes: {
    tiny: {
      width: '20px',
      height: '20px',
      fontSize: '8px'
    },
    small: {
      width: '32px',
      height: '32px',
      fontSize: '12px'
    },
    medium: {
      width: '40px',
      height: '40px',
      fontSize: '14px'
    },
    large: {
      width: '56px',
      height: '56px',
      fontSize: '18px'
    },
    xl: {
      width: '80px',
      height: '80px',
      fontSize: '24px'
    }
  },

  // FORMAS
  shapes: {
    circle: {
      borderRadius: '50%'
    },
    square: {
      borderRadius: '0'
    },
    rounded: {
      borderRadius: '8px'
    }
  },

  // IMAGEM
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    border: 'none'
  },

  // FALLBACK
  fallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },

  // LOADING
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    fontSize: '12px'
  },

  // STATUS INDICATOR
  status: {
    position: 'absolute',
    borderRadius: '50%',
    border: '2px solid white',
    bottom: 0,
    right: 0
  },

  // TAMANHOS DO STATUS
  statusSizes: {
    tiny: {
      width: '6px',
      height: '6px',
      bottom: '-1px',
      right: '-1px'
    },
    small: {
      width: '8px',
      height: '8px',
      bottom: '0',
      right: '0'
    },
    medium: {
      width: '10px',
      height: '10px',
      bottom: '0',
      right: '0'
    },
    large: {
      width: '14px',
      height: '14px',
      bottom: '2px',
      right: '2px'
    },
    xl: {
      width: '18px',
      height: '18px',
      bottom: '4px',
      right: '4px'
    }
  },

  // CORES DO STATUS
  statusColors: {
    online: {
      backgroundColor: '#059669' // Verde
    },
    offline: {
      backgroundColor: '#64748b' // Cinza
    },
    away: {
      backgroundColor: '#C5793B' // Laranja PRIMEM
    },
    busy: {
      backgroundColor: '#dc2626' // Vermelho
    }
  }
};

// ====================================
// COMPONENTES ESPECIALIZADOS
// ====================================

// Avatar pequeno
export const SmallAvatar = (props) => (
  <Avatar {...props} size="small" />
);

// Avatar grande
export const LargeAvatar = (props) => (
  <Avatar {...props} size="large" />
);

// Avatar com status online
export const OnlineAvatar = (props) => (
  <Avatar {...props} status="online" showStatus={true} />
);

// Avatar quadrado
export const SquareAvatar = (props) => (
  <Avatar {...props} shape="square" />
);

// Avatar clicável
export const ClickableAvatar = (props) => (
  <Avatar 
    {...props} 
    style={{
      ...props.style,
      ':hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
      }
    }}
  />
);

// ====================================
// COMPONENTE DE GRUPO DE AVATARES
// ====================================
export const AvatarGroup = ({ 
  avatars = [], 
  maxVisible = 3,
  size = 'medium',
  spacing = 'normal', // tight, normal, loose
  showMore = true,
  onMoreClick,
  className = '',
  style = {},
  ...props
}) => {
  const visibleAvatars = avatars.slice(0, maxVisible);
  const remainingCount = Math.max(0, avatars.length - maxVisible);

  const getGroupStyle = () => {
    const spacingValues = {
      tight: '-8px',
      normal: '-4px',
      loose: '0px'
    };

    return {
      display: 'flex',
      alignItems: 'center',
      ...style
    };
  };

  const getAvatarStyle = (index) => {
    const spacingValues = {
      tight: -8,
      normal: -4,
      loose: 0
    };

    return {
      marginLeft: index > 0 ? `${spacingValues[spacing]}px` : '0',
      border: '2px solid white',
      zIndex: avatars.length - index
    };
  };

  const getMoreStyle = () => {
    const spacingValues = {
      tight: -8,
      normal: -4,
      loose: 0
    };

    return {
      marginLeft: visibleAvatars.length > 0 ? `${spacingValues[spacing]}px` : '0',
      border: '2px solid white',
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      cursor: onMoreClick ? 'pointer' : 'default'
    };
  };

  return (
    <div 
      className={`primem-avatar-group ${className}`}
      style={getGroupStyle()}
      {...props}
    >
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          style={getAvatarStyle(index)}
        />
      ))}
      
      {showMore && remainingCount > 0 && (
        <Avatar
          size={size}
          name={`+${remainingCount}`}
          onClick={onMoreClick}
          style={getMoreStyle()}
          title={`${remainingCount} mais`}
        />
      )}
    </div>
  );
};

// ====================================
// EXPORTAÇÃO PADRÃO
// ====================================
export default Avatar;