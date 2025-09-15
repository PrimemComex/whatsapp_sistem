// client/src/layouts/AuthLayout.js
// =====================================
// PRIMEM WHATSAPP - LAYOUT DE AUTENTICAÇÃO
// Layout especializado para páginas de login e autenticação
// =====================================

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Importar componentes
import Footer from '../components/layout/Footer';

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

const AuthLayout = ({
  children,
  showHeader = false,
  showFooter = true,
  showBackgroundPattern = true,
  showLogo = true,
  logoUrl = null,
  backgroundGradient = true,
  theme = 'primem',
  centerContent = true,
  maxWidth = '450px',
  className = '',
  style = {}
}) => {
  // ====================================
  // ESTADOS LOCAIS
  // ====================================
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animationStep, setAnimationStep] = useState(0);

  // ====================================
  // EFEITOS
  // ====================================
  useEffect(() => {
    // Atualizar relógio a cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Animação de entrada
    const animationTimer = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(animationTimer);
  }, []);

  // ====================================
  // ESTILOS
  // ====================================
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: backgroundGradient 
        ? 'transparent'
        : PRIMEM_COLORS.background,
      background: backgroundGradient 
        ? `linear-gradient(135deg, 
           ${PRIMEM_COLORS.primary} 0%, 
           ${PRIMEM_COLORS.secondary} 50%, 
           ${PRIMEM_COLORS.accent} 100%)`
        : PRIMEM_COLORS.background,
      ...style
    },

    // PADRÃO DE FUNDO ANIMADO
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
      background: `
        radial-gradient(circle at 25% 25%, ${PRIMEM_COLORS.white}40 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, ${PRIMEM_COLORS.white}30 0%, transparent 50%),
        linear-gradient(45deg, transparent 40%, ${PRIMEM_COLORS.white}10 50%, transparent 60%)
      `,
      animation: 'float 20s ease-in-out infinite'
    },

    // PARTÍCULAS ANIMADAS
    particles: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none'
    },

    particle: {
      position: 'absolute',
      width: '4px',
      height: '4px',
      backgroundColor: PRIMEM_COLORS.white,
      borderRadius: '50%',
      opacity: 0.6,
      animation: 'particle 15s linear infinite'
    },

    // HEADER OPCIONAL
    header: {
      padding: '20px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: `${PRIMEM_COLORS.white}10`,
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${PRIMEM_COLORS.white}20`
    },

    headerLogo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: PRIMEM_COLORS.white,
      fontSize: '18px',
      fontWeight: '700'
    },

    logoImage: {
      width: '32px',
      height: '32px',
      borderRadius: '6px'
    },

    headerTime: {
      color: PRIMEM_COLORS.white,
      fontSize: '14px',
      opacity: 0.8
    },

    // ÁREA DE CONTEÚDO PRINCIPAL
    mainContent: {
      flex: 1,
      display: 'flex',
      alignItems: centerContent ? 'center' : 'flex-start',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      zIndex: 2
    },

    contentWrapper: {
      width: '100%',
      maxWidth,
      position: 'relative'
    },

    // LOGO FLUTUANTE (QUANDO NÃO TEM HEADER)
    floatingLogo: {
      position: 'absolute',
      top: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 3,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: PRIMEM_COLORS.white,
      fontSize: '20px',
      fontWeight: '700',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
    },

    floatingLogoImage: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    },

    // ELEMENTOS DECORATIVOS
    decorativeElements: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      overflow: 'hidden'
    },

    decorativeCircle: {
      position: 'absolute',
      borderRadius: '50%',
      border: `2px solid ${PRIMEM_COLORS.white}20`,
      animation: 'rotate 30s linear infinite'
    },

    decorativeCircle1: {
      width: '200px',
      height: '200px',
      top: '-100px',
      right: '-100px'
    },

    decorativeCircle2: {
      width: '150px',
      height: '150px',
      bottom: '-75px',
      left: '-75px',
      animationDirection: 'reverse',
      animationDuration: '25s'
    },

    decorativeCircle3: {
      width: '300px',
      height: '300px',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      animationDuration: '40s'
    },

    // FOOTER
    footer: {
      padding: '20px 24px',
      backgroundColor: `${PRIMEM_COLORS.white}10`,
      backdropFilter: 'blur(10px)',
      borderTop: `1px solid ${PRIMEM_COLORS.white}20`,
      color: PRIMEM_COLORS.white,
      textAlign: 'center',
      fontSize: '14px'
    },

    footerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto'
    },

    footerLinks: {
      display: 'flex',
      gap: '20px'
    },

    footerLink: {
      color: PRIMEM_COLORS.white,
      textDecoration: 'none',
      opacity: 0.8,
      transition: 'opacity 0.2s ease',
      '&:hover': {
        opacity: 1
      }
    },

    copyright: {
      opacity: 0.7
    },

    // RESPONSIVO
    '@media (max-width: 768px)': {
      container: {
        padding: '0'
      },
      mainContent: {
        padding: '20px 16px'
      },
      footerContent: {
        flexDirection: 'column',
        gap: '12px'
      },
      footerLinks: {
        flexWrap: 'wrap',
        justifyContent: 'center'
      }
    }
  };

  // ====================================
  // FUNÇÕES AUXILIARES
  // ====================================
  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  };

  const generateParticles = () => {
    const particles = [];
    for (let i = 0; i < 15; i++) {
      particles.push(
        <div
          key={i}
          style={{
            ...styles.particle,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}
        />
      );
    }
    return particles;
  };

  // ====================================
  // RENDERIZAÇÃO
  // ====================================
  return (
    <div className={className} style={styles.container}>
      {/* CSS ANIMATIONS */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-10px) rotate(1deg); }
            50% { transform: translateY(-5px) rotate(-1deg); }
            75% { transform: translateY(-15px) rotate(0.5deg); }
          }

          @keyframes particle {
            0% { 
              transform: translateY(100vh) translateX(0px) rotate(0deg); 
              opacity: 0; 
            }
            10% { opacity: 0.6; }
            90% { opacity: 0.6; }
            100% { 
              transform: translateY(-100px) translateX(50px) rotate(360deg); 
              opacity: 0; 
            }
          }

          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          .auth-layout-fade-in {
            animation: fadeIn 1s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* Responsividade */
          @media (max-width: 768px) {
            .auth-layout-container {
              background-size: 200% 200%;
            }
          }
        `}
      </style>

      {/* PADRÃO DE FUNDO */}
      {showBackgroundPattern && (
        <div style={styles.backgroundPattern} />
      )}

      {/* PARTÍCULAS ANIMADAS */}
      <div style={styles.particles}>
        {generateParticles()}
      </div>

      {/* ELEMENTOS DECORATIVOS */}
      <div style={styles.decorativeElements}>
        <div style={{...styles.decorativeCircle, ...styles.decorativeCircle1}} />
        <div style={{...styles.decorativeCircle, ...styles.decorativeCircle2}} />
        <div style={{...styles.decorativeCircle, ...styles.decorativeCircle3}} />
      </div>

      {/* HEADER OPCIONAL */}
      {showHeader && (
        <header style={styles.header}>
          <div style={styles.headerLogo}>
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Logo" 
                style={styles.logoImage}
              />
            )}
            <span>PRIMEM COMEX</span>
          </div>
          <div style={styles.headerTime}>
            {formatTime(currentTime)}
          </div>
        </header>
      )}

      {/* LOGO FLUTUANTE */}
      {showLogo && !showHeader && (
        <div style={styles.floatingLogo}>
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt="Logo" 
              style={styles.floatingLogoImage}
            />
          )}
          <span>PRIMEM COMEX</span>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <main style={styles.mainContent}>
        <div style={styles.contentWrapper} className="auth-layout-fade-in">
          {children}
        </div>
      </main>

      {/* FOOTER */}
      {showFooter && (
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerLinks}>
              <a 
                href="#" 
                style={styles.footerLink}
                onClick={(e) => e.preventDefault()}
              >
                Suporte
              </a>
              <a 
                href="#" 
                style={styles.footerLink}
                onClick={(e) => e.preventDefault()}
              >
                Privacidade
              </a>
              <a 
                href="#" 
                style={styles.footerLink}
                onClick={(e) => e.preventDefault()}
              >
                Termos
              </a>
            </div>
            <div style={styles.copyright}>
              © 2025 PRIMEM COMEX. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

// ====================================
// PROP TYPES
// ====================================
AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  showHeader: PropTypes.bool,
  showFooter: PropTypes.bool,
  showBackgroundPattern: PropTypes.bool,
  showLogo: PropTypes.bool,
  logoUrl: PropTypes.string,
  backgroundGradient: PropTypes.bool,
  theme: PropTypes.oneOf(['primem', 'dark', 'light']),
  centerContent: PropTypes.bool,
  maxWidth: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object
};

export default AuthLayout;