// client/src/components/media/ImageViewer.js
// =====================================
// PRIMEM WHATSAPP - COMPONENTE IMAGE VIEWER
// Novo componente modular para visualização de imagens
// =====================================

import React, { useState, useRef, useEffect } from 'react';

const ImageViewer = ({ 
  url, 
  alt = 'Imagem', 
  filename = 'imagem',
  className = '',
  showDownload = true,
  maxWidth = '100%',
  maxHeight = '300px',
  clickToOpen = true,
  caption = ''
}) => {
  // ====================================
  // ESTADOS DO VIEWER
  // ====================================
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });

  // ====================================
  // REFS
  // ====================================
  const imageRef = useRef(null);
  const fullscreenRef = useRef(null);

  // ====================================
  // CONSTRUIR URL COMPLETA
  // ====================================
  const imageUrl = url.startsWith('http') 
    ? url 
    : `http://localhost:3001${url.startsWith('/') ? url : '/' + url}`;

  // ====================================
  // MANIPULAR CARREGAMENTO DA IMAGEM
  // ====================================
  const handleImageLoad = (e) => {
    setIsLoaded(true);
    setIsLoading(false);
    setError(false);
    
    // Capturar dimensões naturais
    const img = e.target;
    setNaturalDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });

    console.log('🖼️ Imagem carregada:', {
      filename,
      dimensions: `${img.naturalWidth}x${img.naturalHeight}`,
      url: imageUrl
    });
  };

  // ====================================
  // MANIPULAR ERRO DE CARREGAMENTO
  // ====================================
  const handleImageError = (e) => {
    setError(true);
    setIsLoading(false);
    setIsLoaded(false);
    
    console.error('❌ Erro ao carregar imagem:', imageUrl);
  };

  // ====================================
  // ABRIR FULLSCREEN
  // ====================================
  const openFullscreen = () => {
    if (clickToOpen && isLoaded) {
      setShowFullscreen(true);
      console.log('🖼️ Abrindo imagem em fullscreen');
    }
  };

  // ====================================
  // FECHAR FULLSCREEN
  // ====================================
  const closeFullscreen = () => {
    setShowFullscreen(false);
  };

  // ====================================
  // FECHAR COM ESC
  // ====================================
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showFullscreen) {
        closeFullscreen();
      }
    };

    if (showFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showFullscreen]);

  // ====================================
  // FECHAR AO CLICAR FORA
  // ====================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fullscreenRef.current && !fullscreenRef.current.contains(event.target)) {
        closeFullscreen();
      }
    };

    if (showFullscreen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFullscreen]);

  // ====================================
  // DOWNLOAD DA IMAGEM
  // ====================================
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ====================================
  // FORMATAR TAMANHO DE ARQUIVO
  // ====================================
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // ====================================
  // COMPONENTE DE ERRO
  // ====================================
  if (error) {
    return (
      <div style={styles.errorContainer} className={className}>
        <div style={styles.errorContent}>
          <div style={styles.errorIcon}>🖼️</div>
          <div style={styles.errorText}>
            <div style={styles.errorTitle}>Erro ao carregar imagem</div>
            <div style={styles.errorSubtext}>{filename}</div>
          </div>
          {showDownload && (
            <button 
              onClick={downloadImage}
              style={styles.downloadButton}
              title="Tentar baixar"
            >
              ⬇️
            </button>
          )}
        </div>
      </div>
    );
  }

  // ====================================
  // RENDER PRINCIPAL
  // ====================================
  return (
    <>
      {/* CONTAINER DA IMAGEM */}
      <div style={styles.container} className={className}>
        
        {/* LOADING */}
        {isLoading && (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}>⏳</div>
            <div style={styles.loadingText}>Carregando imagem...</div>
          </div>
        )}

        {/* IMAGEM */}
        <img
          ref={imageRef}
          src={imageUrl}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onClick={openFullscreen}
          style={{
            ...styles.image,
            maxWidth,
            maxHeight,
            cursor: clickToOpen && isLoaded ? 'pointer' : 'default',
            display: isLoaded ? 'block' : 'none'
          }}
        />

        {/* INFORMAÇÕES DA IMAGEM */}
        {isLoaded && (
          <div style={styles.imageInfo}>
            <div style={styles.imageDetails}>
              <span style={styles.imageName}>{filename}</span>
              {naturalDimensions.width > 0 && (
                <span style={styles.imageDimensions}>
                  {naturalDimensions.width}×{naturalDimensions.height}
                </span>
              )}
            </div>
            
            {showDownload && (
              <button 
                onClick={downloadImage}
                style={styles.downloadButton}
                title="Baixar imagem"
              >
                ⬇️
              </button>
            )}
          </div>
        )}

        {/* LEGENDA */}
        {caption && isLoaded && (
          <div style={styles.caption}>
            {caption}
          </div>
        )}
      </div>

      {/* MODAL FULLSCREEN */}
      {showFullscreen && (
        <div style={styles.fullscreenOverlay}>
          <div ref={fullscreenRef} style={styles.fullscreenContainer}>
            
            {/* CABEÇALHO */}
            <div style={styles.fullscreenHeader}>
              <div style={styles.fullscreenTitle}>
                <span style={styles.fullscreenFileName}>{filename}</span>
                {naturalDimensions.width > 0 && (
                  <span style={styles.fullscreenDimensions}>
                    {naturalDimensions.width}×{naturalDimensions.height}
                  </span>
                )}
              </div>
              
              <div style={styles.fullscreenControls}>
                <button 
                  onClick={downloadImage}
                  style={styles.fullscreenButton}
                  title="Baixar"
                >
                  ⬇️
                </button>
                <button 
                  onClick={() => window.open(imageUrl, '_blank')}
                  style={styles.fullscreenButton}
                  title="Abrir em nova aba"
                >
                  🔗
                </button>
                <button 
                  onClick={closeFullscreen}
                  style={styles.fullscreenCloseButton}
                  title="Fechar"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* IMAGEM FULLSCREEN */}
            <div style={styles.fullscreenImageContainer}>
              <img
                src={imageUrl}
                alt={alt}
                style={styles.fullscreenImage}
              />
            </div>

            {/* LEGENDA FULLSCREEN */}
            {caption && (
              <div style={styles.fullscreenCaption}>
                {caption}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// ====================================
// ESTILOS PRIMEM
// ====================================
const styles = {
  container: {
    position: 'relative',
    backgroundColor: '#f8f9ff',
    border: '1px solid #e1e5f2',
    borderRadius: '8px',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    minHeight: '120px'
  },

  loadingSpinner: {
    fontSize: '24px',
    marginBottom: '8px'
  },

  loadingText: {
    fontSize: '14px',
    color: '#64748b'
  },

  image: {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: '8px 8px 0 0'
  },

  imageInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'white',
    borderTop: '1px solid #e1e5f2'
  },

  imageDetails: {
    flex: 1,
    minWidth: 0
  },

  imageName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#2B4C7E', // Azul PRIMEM
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  imageDimensions: {
    fontSize: '11px',
    color: '#64748b'
  },

  downloadButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#C5793B', // Laranja PRIMEM
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },

  caption: {
    padding: '8px 12px',
    fontSize: '14px',
    color: '#374151',
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #e1e5f2'
  },

  errorContainer: {
    border: '1px solid #fecaca',
    borderRadius: '8px',
    backgroundColor: '#fef2f2'
  },

  errorContent: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    gap: '12px'
  },

  errorIcon: {
    fontSize: '24px',
    opacity: 0.5
  },

  errorText: {
    flex: 1
  },

  errorTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: '2px'
  },

  errorSubtext: {
    fontSize: '12px',
    color: '#6b7280'
  },

  // FULLSCREEN STYLES
  fullscreenOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },

  fullscreenContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },

  fullscreenHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e1e5f2',
    backgroundColor: '#f8f9ff'
  },

  fullscreenTitle: {
    flex: 1,
    minWidth: 0
  },

  fullscreenFileName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2B4C7E', // Azul PRIMEM
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  fullscreenDimensions: {
    fontSize: '14px',
    color: '#64748b'
  },

  fullscreenControls: {
    display: 'flex',
    gap: '8px'
  },

  fullscreenButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#C5793B', // Laranja PRIMEM
    padding: '8px',
    borderRadius: '6px',
    transition: 'background-color 0.2s'
  },

  fullscreenCloseButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#64748b',
    padding: '8px',
    borderRadius: '6px',
    transition: 'background-color 0.2s'
  },

  fullscreenImageContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
    padding: '20px'
  },

  fullscreenImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  },

  fullscreenCaption: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#374151',
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #e1e5f2'
  }
};

export default ImageViewer;