// client/src/pages/ConnectionPage.js
// =====================================
// PRIMEM WHATSAPP - CONEXÃO COM QR CODE CORRIGIDO
// Versão completa com todas as correções aplicadas
// =====================================

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';

// Importar contextos e hooks
import { useAuth } from '../contexts/AuthContext';
import { useWhatsApp } from '../contexts/WhatsAppContext';
import { useSettingsContext } from '../contexts/SettingsContext';

// Importar componentes
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';

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

const ConnectionPage = ({
  onConnectionSuccess,
  onBackToDashboard,
  className = '',
  style = {}
}) => {
  // ====================================
  // CONTEXTOS E HOOKS
  // ====================================
  const { user, logout } = useAuth();
  const { 
    status, 
    qrCode, 
    isConnecting,
    connectionInfo,
    error,
    connectWhatsApp,
    disconnectWhatsApp,
    refreshConnection,
    clearError
  } = useWhatsApp();
  
  const { settings } = useSettingsContext();

  // ====================================
  // ESTADOS LOCAIS
  // ====================================
  const [isManualConnecting, setIsManualConnecting] = useState(false);
  const [connectionLogs, setConnectionLogs] = useState([]);
  const [processedQRCode, setProcessedQRCode] = useState(null);
  const [qrError, setQrError] = useState(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  // ====================================
  // FUNÇÃO PARA PROCESSAR QR CODE - CORRIGIDA
  // ====================================
  const processQRCode = useCallback((rawQrCode) => {
    console.log('🔍 Processando QR Code:', {
      type: typeof rawQrCode,
      length: rawQrCode?.length,
      isString: typeof rawQrCode === 'string',
      preview: rawQrCode?.substring?.(0, 100)
    });

    try {
      if (!rawQrCode) {
        console.log('❌ QR Code vazio');
        setProcessedQRCode(null);
        setQrError('QR Code não recebido');
        return;
      }

      // Converter para string se necessário
      let qrString = String(rawQrCode);
      
      // CASO 1: QR Code como base64 data URL
      if (qrString.startsWith('data:image/')) {
        console.log('📸 QR Code é uma imagem base64 - convertendo para exibição direta');
        setProcessedQRCode('IMAGE_BASE64');
        setQrError(null);
        return;
      }
      
      // CASO 2: QR Code muito longo (provavelmente base64 puro)
      if (qrString.length > 2000) {
        console.log('📏 QR Code muito longo - tratando como base64');
        if (/^[A-Za-z0-9+/=]+$/.test(qrString)) {
          setProcessedQRCode('IMAGE_BASE64');
          setQrError(null);
          return;
        }
      }
      
      // CASO 3: QR Code como JSON/objeto
      if (qrString.startsWith('{') && qrString.endsWith('}')) {
        try {
          const parsed = JSON.parse(qrString);
          console.log('📋 QR Code é JSON:', parsed);
          
          const possibleFields = ['qr', 'qrCode', 'code', 'data', 'value'];
          for (const field of possibleFields) {
            if (parsed[field] && typeof parsed[field] === 'string') {
              console.log(`✅ Encontrado QR Code no campo: ${field}`);
              setProcessedQRCode(parsed[field]);
              setQrError(null);
              return;
            }
          }
        } catch (e) {
          console.log('❌ Erro ao parsear JSON do QR Code:', e);
        }
      }
      
      // CASO 4: QR Code normal (string direta)
      if (qrString.length > 10 && qrString.length < 1000) {
        console.log('✅ QR Code parece ser string normal');
        setProcessedQRCode(qrString);
        setQrError(null);
        return;
      }
      
      // CASO 5: Tentar extrair código WhatsApp padrão
      const whatsappMatch = qrString.match(/1@[A-Za-z0-9+/=]+/);
      if (whatsappMatch) {
        console.log('📱 Encontrado código WhatsApp padrão');
        setProcessedQRCode(whatsappMatch[0]);
        setQrError(null);
        return;
      }
      
      // CASO 6: URL/link
      if (qrString.includes('://')) {
        console.log('🔗 QR Code é uma URL');
        setProcessedQRCode(qrString);
        setQrError(null);
        return;
      }
      
      // FALLBACK: Tentar usar os primeiros caracteres
      console.log('⚠️ Formato desconhecido - usando fallback');
      const fallback = qrString.substring(0, 500);
      setProcessedQRCode(fallback);
      setQrError(`Formato não reconhecido. Usando primeiros ${fallback.length} caracteres.`);
      
    } catch (error) {
      console.error('❌ Erro ao processar QR Code:', error);
      setProcessedQRCode(null);
      setQrError(`Erro ao processar: ${error.message}`);
    }
  }, []);

  // ====================================
  // FUNÇÃO PARA RENDERIZAR QR CODE - CORRIGIDA
  // ====================================
  const renderQRCode = () => {
    console.log('🎨 Renderizando QR Code:', {
      processedQRCode: processedQRCode ? 'EXISTE' : 'NULL',
      qrError,
      type: typeof processedQRCode
    });

    if (qrError) {
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: `${PRIMEM_COLORS.error}10`, 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <div style={{ color: PRIMEM_COLORS.error, marginBottom: '8px' }}>
            {qrError}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            QR Code original: {qrCode?.length || 0} caracteres
          </div>
        </div>
      );
    }

    if (!processedQRCode) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Aguardando QR Code...
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '16px' }}>
            {status === 'connecting' ? 'Gerando código...' : 'Preparando conexão...'}
          </div>
          <Loading size="medium" />
        </div>
      );
    }

    // QR Code como imagem base64
    if (processedQRCode === 'IMAGE_BASE64') {
      const imageData = qrCode.startsWith('data:') ? 
        qrCode : 
        `data:image/png;base64,${qrCode}`;
        
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>📱</div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Escaneie o QR Code com seu WhatsApp
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            display: 'inline-block',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <img
              src={imageData}
              alt="QR Code WhatsApp"
              style={{
                width: '280px',
                height: '280px',
                objectFit: 'contain'
              }}
            />
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginTop: '16px',
            maxWidth: '300px',
            margin: '16px auto 0'
          }}>
            Abra o WhatsApp → Dispositivos vinculados → Vincular dispositivo
          </div>
        </div>
      );
    }

    // QR Code como string (usar biblioteca QRCode)
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '16px' }}>📱</div>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Escaneie o QR Code com seu WhatsApp
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          display: 'inline-block',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <QRCode
            value={processedQRCode}
            size={280}
            level="M"
            includeMargin={true}
            renderAs="canvas"
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: '#666', 
          marginTop: '16px',
          maxWidth: '300px',
          margin: '16px auto 0'
        }}>
          Abra o WhatsApp → Dispositivos vinculados → Vincular dispositivo
        </div>
      </div>
    );
  };

  // ====================================
  // FUNÇÃO PARA TRATAMENTO SEGURO DE ERRO - CORRIGIDA
  // ====================================
  const getSafeErrorMessage = (error) => {
    if (!error) return null;
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (typeof error === 'object') {
      return error.message || 
             error.error || 
             error.msg || 
             JSON.stringify(error) || 
             'Erro desconhecido na conexão';
    }
    
    return String(error);
  };

  // ====================================
  // EFEITO PARA PROCESSAR QR CODE
  // ====================================
  useEffect(() => {
    if (qrCode) {
      processQRCode(qrCode);
    } else {
      setProcessedQRCode(null);
      setQrError(null);
    }
  }, [qrCode, processQRCode]);

  // ====================================
  // OUTROS EFEITOS
  // ====================================
  useEffect(() => {
    const newLog = {
      timestamp: Date.now(),
      status: status || 'unknown',
      message: getStatusMessage(status),
      type: getLogType(status)
    };
    
    setConnectionLogs(prev => [newLog, ...prev].slice(0, 50));
  }, [status]);

  useEffect(() => {
    if (status === 'connected') {
      if (onConnectionSuccess) {
        onConnectionSuccess();
      }
    }
  }, [status, onConnectionSuccess]);

  // ====================================
  // FUNÇÕES AUXILIARES
  // ====================================
  const getStatusMessage = (status) => {
    switch (status) {
      case 'connected': return 'WhatsApp conectado com sucesso';
      case 'connecting': return 'Conectando ao WhatsApp...';
      case 'disconnected': return 'WhatsApp desconectado';
      case 'error': return 'Erro na conexão';
      case 'qr': return 'Aguardando leitura do QR Code';
      case 'loading': return 'Inicializando WhatsApp...';
      default: return `Status: ${status || 'desconhecido'}`;
    }
  };

  const getLogType = (status) => {
    switch (status) {
      case 'connected': return 'success';
      case 'connecting': 
      case 'qr':
      case 'loading': return 'info';
      case 'disconnected': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return PRIMEM_COLORS.success;
      case 'connecting':
      case 'qr':
      case 'loading': return PRIMEM_COLORS.warning;
      case 'disconnected': 
      case 'error': return PRIMEM_COLORS.error;
      default: return PRIMEM_COLORS.accent;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return '✅';
      case 'connecting': 
      case 'loading': return '⏳';
      case 'qr': return '📱';
      case 'disconnected': return '❌';
      case 'error': return '⚠️';
      default: return '🔄';
    }
  };

  // ====================================
  // HANDLERS - CORRIGIDOS
  // ====================================
  const handleConnect = async () => {
    console.log('🔌 Iniciando conexão WhatsApp...');
    setIsManualConnecting(true);
    
    if (clearError) {
      clearError();
    }
    
    try {
      if (connectWhatsApp) {
        await connectWhatsApp();
      } else {
        console.error('❌ Função connectWhatsApp não disponível');
      }
    } catch (error) {
      console.error('❌ Erro ao conectar:', error);
    } finally {
      setTimeout(() => {
        setIsManualConnecting(false);
      }, 5000);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (disconnectWhatsApp) {
        await disconnectWhatsApp();
      }
      setShowDisconnectConfirm(false);
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      if (refreshConnection) {
        await refreshConnection();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar conexão:', error);
    }
  };

  const handleBackToDashboard = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      window.location.href = '/dashboard';
    }
  };

  // ====================================
  // DEBUG LOG - SEGURO
  // ====================================
  console.log('🧪 CONNECTION PAGE - Dados de debug:', {
    user: user ? `${user.email} (${user.role})` : 'null',
    status: status || 'null',
    qrCode: qrCode ? `presente (${qrCode.length} chars)` : 'ausente',
    error: getSafeErrorMessage(error) || 'nenhum erro',
    isConnecting,
    settings: settings ? 'carregado' : 'null'
  });

  // ====================================
  // RENDER PRINCIPAL - LAYOUT COMPLETO
  // ====================================
  return (
    <DashboardLayout className={className} style={style}>
      <div style={{
        minHeight: '100vh',
        backgroundColor: PRIMEM_COLORS.background,
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* HEADER */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: PRIMEM_COLORS.primary,
                margin: '0 0 8px 0'
              }}>
                🔗 Conexão WhatsApp
              </h1>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '16px'
              }}>
                Configure e monitore sua conexão com o WhatsApp Business
              </p>
            </div>
            
            {/* STATUS BADGE */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: `${getStatusColor(status)}15`,
                border: `1px solid ${getStatusColor(status)}30`,
                borderRadius: '20px'
              }}>
                <span style={{ fontSize: '16px' }}>{getStatusIcon(status)}</span>
                <span style={{
                  color: getStatusColor(status),
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {getStatusMessage(status)}
                </span>
              </div>
              
              <Button
                onClick={() => setShowLogs(!showLogs)}
                variant="outline"
                size="small"
              >
                📋 Logs
              </Button>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div style={{ flex: 1, padding: '32px' }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: showLogs ? '1fr 400px' : '1fr',
            gap: '32px'
          }}>
            
            {/* MAIN CONTENT */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              minHeight: '500px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>

              {/* CONECTADO */}
              {status === 'connected' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '72px', marginBottom: '24px' }}>✅</div>
                  <h2 style={{ color: PRIMEM_COLORS.success, marginBottom: '16px' }}>
                    WhatsApp Conectado!
                  </h2>
                  <p style={{ color: '#666', marginBottom: '32px', fontSize: '16px' }}>
                    Sua conexão está ativa e funcionando perfeitamente.
                  </p>
                  
                  {connectionInfo && (
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '24px',
                      textAlign: 'left'
                    }}>
                      <h4 style={{ margin: '0 0 8px 0' }}>Informações da Conexão:</h4>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        <strong>Dispositivo:</strong> {connectionInfo.device || 'N/A'}
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        <strong>Número:</strong> {connectionInfo.phone || 'N/A'}
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        <strong>Conectado em:</strong> {connectionInfo.connectedAt || 'N/A'}
                      </p>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Button
                      onClick={handleBackToDashboard}
                      variant="primary"
                      size="large"
                    >
                      🏠 Ir para Dashboard
                    </Button>
                    <Button
                      onClick={() => setShowDisconnectConfirm(true)}
                      variant="outline"
                      size="large"
                    >
                      🔌 Desconectar
                    </Button>
                  </div>
                </div>
              )}

              {/* QR CODE */}
              {status === 'qr' && (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  {renderQRCode()}
                  
                  <div style={{ marginTop: '32px' }}>
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      style={{ marginRight: '12px' }}
                    >
                      🔄 Atualizar QR
                    </Button>
                    <Button
                      onClick={handleBackToDashboard}
                      variant="secondary"
                    >
                      🏠 Voltar
                    </Button>
                  </div>
                </div>
              )}

              {/* LOADING/CONNECTING */}
              {(status === 'loading' || status === 'connecting' || isManualConnecting) && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '24px' }}>⏳</div>
                  <h3 style={{ color: PRIMEM_COLORS.warning, marginBottom: '16px' }}>
                    {status === 'loading' ? 'Inicializando...' : 'Conectando ao WhatsApp...'}
                  </h3>
                  <p style={{ color: '#666', textAlign: 'center', marginBottom: '24px' }}>
                    {status === 'connecting' ? 'Estabelecendo conexão segura' : 'Aguarde um momento'}
                  </p>
                  <Loading size="large" />
                </div>
              )}

              {/* ERRO - CORRIGIDO */}
              {status === 'error' && error && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '72px', marginBottom: '24px' }}>⚠️</div>
                  <h3 style={{ color: PRIMEM_COLORS.error, marginBottom: '16px' }}>
                    Erro de Conexão
                  </h3>
                  <p style={{ 
                    color: '#666', 
                    textAlign: 'center', 
                    maxWidth: '400px',
                    marginBottom: '24px',
                    lineHeight: '1.5'
                  }}>
                    {getSafeErrorMessage(error)}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Button
                      onClick={handleConnect}
                      variant="primary"
                    >
                      🔄 Tentar Novamente
                    </Button>
                    <Button
                      onClick={handleBackToDashboard}
                      variant="outline"
                    >
                      🏠 Voltar
                    </Button>
                  </div>
                </div>
              )}

              {/* DESCONECTADO */}
              {status === 'disconnected' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '72px', marginBottom: '24px' }}>❌</div>
                  <h3 style={{ color: PRIMEM_COLORS.error, marginBottom: '16px' }}>
                    WhatsApp Desconectado
                  </h3>
                  <p style={{ color: '#666', marginBottom: '32px' }}>
                    Clique no botão abaixo para estabelecer uma nova conexão.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Button
                      onClick={handleConnect}
                      variant="primary"
                      size="large"
                      loading={isManualConnecting}
                    >
                      🔌 Conectar WhatsApp
                    </Button>
                    <Button
                      onClick={handleBackToDashboard}
                      variant="outline"
                      size="large"
                    >
                      🏠 Voltar
                    </Button>
                  </div>
                </div>
              )}

            </div>

            {/* LOGS SIDEBAR */}
            {showLogs && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                maxHeight: '600px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  color: PRIMEM_COLORS.primary,
                  fontSize: '18px'
                }}>
                  📋 Logs de Conexão
                </h3>
                
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}>
                  {connectionLogs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '8px',
                        marginBottom: '4px',
                        backgroundColor: log.type === 'error' ? '#fee2e2' :
                                        log.type === 'success' ? '#dcfce7' :
                                        log.type === 'warning' ? '#fef3c7' : '#f3f4f6',
                        borderRadius: '4px',
                        borderLeft: `3px solid ${
                          log.type === 'error' ? PRIMEM_COLORS.error :
                          log.type === 'success' ? PRIMEM_COLORS.success :
                          log.type === 'warning' ? PRIMEM_COLORS.warning : PRIMEM_COLORS.accent
                        }`
                      }}
                    >
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div style={{ color: '#333' }}>
                        {log.message}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={() => setConnectionLogs([])}
                  variant="outline"
                  size="small"
                  style={{ marginTop: '16px' }}
                >
                  🗑️ Limpar Logs
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* MODAL DE CONFIRMAÇÃO PARA DESCONECTAR */}
        <Modal
          isOpen={showDisconnectConfirm}
          onClose={() => setShowDisconnectConfirm(false)}
          title="Confirmar Desconexão"
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ marginBottom: '16px' }}>
              Desconectar WhatsApp?
            </h3>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Isso irá encerrar sua sessão atual. Você precisará escanear o QR Code novamente para reconectar.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button
                onClick={() => setShowDisconnectConfirm(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="danger"
              >
                Desconectar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

// ====================================
// PROP TYPES
// ====================================
ConnectionPage.propTypes = {
  onConnectionSuccess: PropTypes.func,
  onBackToDashboard: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object
};

export default ConnectionPage;