import React, { useState, useRef, useEffect } from 'react';

interface Conversation {
  id: number;
  name: string;
  phone: string;
  email: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  photoUrl: string | null;
  online: boolean;
  isFavorite: boolean;
  isUnread: boolean;
  department: string;
  lastRefId: string;
  notes: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'client' | 'agent';
  timestamp: string;
  status: string;
  refId: string;
  refIdLink: string;
  agentName?: string;
  type: string;
  fileContent: any;
}

interface Agent {
  id: number;
  name: string;
  online: boolean;
  department: string;
}

const ChatPage: React.FC = () => {
  // Estados principais
  const [conversations] = useState<Conversation[]>([
    {
      id: 1,
      name: "João Silva",
      phone: "+5511999999999",
      email: "joao@empresa.com",
      lastMessage: "Aguardando retorno sobre o orçamento",
      timestamp: "14:30",
      unread: 2,
      avatar: "JS",
      photoUrl: "https://via.placeholder.com/48/2B4C8C/FFFFFF?text=JS",
      online: true,
      isFavorite: false,
      isUnread: false,
      department: "comercial",
      lastRefId: "ID100",
      notes: "Cliente importante - pagamento sempre em dia"
    },
    {
      id: 2,
      name: "Maria Santos",
      phone: "+5511888888888",
      email: "maria@cliente.com",
      lastMessage: "Muito obrigada pela atenção!",
      timestamp: "12:15",
      unread: 0,
      avatar: "MS",
      photoUrl: null,
      online: false,
      isFavorite: true,
      isUnread: true,
      department: "financeiro",
      lastRefId: "ID200",
      notes: "Preferência por contato pela manhã"
    }
  ]);

  const [selectedChat, setSelectedChat] = useState<Conversation>(conversations[0]);
  const [messages] = useState<Message[]>([
    {
      id: 1,
      text: "Olá! Gostaria de um orçamento para importação",
      sender: "client",
      timestamp: "14:25",
      status: "received",
      refId: "ID100",
      refIdLink: "https://primem.bitrix24.com.br/crm/deal/details/100/",
      type: "normal",
      fileContent: null
    },
    {
      id: 2,
      text: "*Ana Maria*\nOlá João! Claro, posso te ajudar. Que tipo de produto você gostaria de importar?\n\n---\nPRIMEM COMEX\n📞 +55 11 4002-8900",
      sender: "agent",
      timestamp: "14:26",
      status: "sent",
      refId: "ID100",
      refIdLink: "https://primem.bitrix24.com.br/crm/deal/details/100/",
      agentName: "Ana Maria",
      type: "normal",
      fileContent: null
    }
  ]);

  const [agents] = useState<Agent[]>([
    { id: 1, name: "Ana Maria", online: true, department: "comercial" },
    { id: 2, name: "Bruno Silva", online: true, department: "operacional" },
    { id: 3, name: "Carlos Santos", online: false, department: "financeiro" }
  ]);

  // Estados de UI
  const [newMessage, setNewMessage] = useState("");
  const [selectedRefId, setSelectedRefId] = useState("ID100");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState("all");
  const [rightPanelTab, setRightPanelTab] = useState("ids");
  const [showSignature, setShowSignature] = useState(false);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Estados para formatação de texto
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontSize: 14
  });

  // IDs do contato atual
  const currentContactIds = {
    active: [
      { id: "ID100", link: "https://primem.bitrix24.com.br/crm/deal/details/100/" },
      { id: "ID101", link: "https://primem.bitrix24.com.br/crm/deal/details/101/" }
    ],
    finished: [
      { id: "ID050", link: "https://primem.bitrix24.com.br/crm/deal/details/50/" },
      { id: "ID051", link: "https://primem.bitrix24.com.br/crm/deal/details/51/" }
    ]
  };

  // Referências
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Função para duplo clique no REF ID
  const handleRefIdDoubleClick = (messageId: number, currentRefId: string) => {
    const newRefId = prompt('Editar REF ID:', currentRefId);
    if (newRefId && newRefId !== currentRefId) {
      alert(`REF ID alterado para: ${newRefId}`);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: rightPanelVisible ? '350px 1fr 320px' : '350px 1fr',
      height: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f0f2f5'
    }}>
      {/* Coluna 1: Lista de Conversas */}
      <div style={{
        backgroundColor: 'white',
        borderRight: '1px solid #e1e1e1',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e1e1e1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#2B4C8C', fontSize: '18px', fontWeight: '600' }}>
            💬 Conversas
          </h2>
          <button style={{
            backgroundColor: '#2B4C8C',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            ➕
          </button>
        </div>
        
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e1e1e1',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <input
            type="text"
            placeholder="🔍 Buscar..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              fontSize: '14px',
              outline: 'none'
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '12px',
            outline: 'none'
          }}>
            <option value="all">🔍 Buscar Tudo</option>
            <option value="contacts">👤 Contatos</option>
            <option value="messages">💬 Mensagens</option>
          </select>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map(conv => (
            <div
              key={conv.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: selectedChat?.id === conv.id ? '#e3f2fd' : 'white'
              }}
              onClick={() => setSelectedChat(conv)}
            >
              <div style={{ position: 'relative', marginRight: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#2B4C8C',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  overflow: 'hidden'
                }}>
                  {conv.photoUrl ? (
                    <img src={conv.photoUrl} alt={conv.name} style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }} />
                  ) : (
                    conv.avatar
                  )}
                </div>
                {conv.online && <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  border: '2px solid white'
                }} />}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <span style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>
                    {conv.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    {conv.timestamp}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: '#666',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}>
                    {conv.lastMessage.substring(0, 35)}...
                  </span>
                  {conv.unread > 0 && (
                    <span style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginLeft: '8px'
                    }}>
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#666',
                  backgroundColor: '#f8f9fa',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  alignSelf: 'flex-start'
                }}>
                  {conv.department}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna 2: Área de Chat */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#e5ddd5'
      }}>
        {/* Header do Chat */}
        <div style={{
          backgroundColor: 'white',
          padding: '16px 20px',
          borderBottom: '1px solid #e1e1e1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#2B4C8C',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              marginRight: '12px',
              overflow: 'hidden'
            }}>
              {selectedChat.photoUrl ? (
                <img src={selectedChat.photoUrl} alt={selectedChat.name} style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }} />
              ) : (
                selectedChat.avatar
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
                {selectedChat.name}
              </h3>
              <span style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                {selectedChat.phone}
              </span>
              <span style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                Departamento: {selectedChat.department}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '16px'
            }}>
              ✏️
            </button>
            <button 
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                padding: '8px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '16px'
              }}
              onClick={() => setRightPanelVisible(!rightPanelVisible)}
            >
              {rightPanelVisible ? '➡️' : '⬅️'}
            </button>
          </div>
        </div>

        {/* Lista de Mensagens */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex',
              justifyContent: msg.sender === 'agent' ? 'flex-end' : 'flex-start',
              marginBottom: '8px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                maxWidth: '70%'
              }}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: msg.sender === 'agent' ? '#dcf8c6' : 'white',
                  color: '#333'
                }}>
                  <div style={{
                    fontSize: '14px',
                    lineHeight: '1.4',
                    marginBottom: '4px'
                  }}>
                    {msg.text.split('\n').map((line, index) => (
                      <div key={index}>
                        {line.startsWith('*') && line.endsWith('*') ? (
                          <strong>{line.slice(1, -1)}</strong>
                        ) : (
                          line
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px'
                  }}>
                    {msg.timestamp}
                    {msg.sender === 'agent' && (
                      <span style={{ color: '#4fc3f7' }}>
                        {msg.status === 'sent' ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* REF ID editável com duplo clique */}
                <div style={{ display: 'flex', marginTop: '4px' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '500',
                      backgroundColor: '#E3F2FD',
                      color: '#1976D2',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minWidth: '60px',
                      userSelect: 'none'
                    }}
                    onDoubleClick={() => handleRefIdDoubleClick(msg.id, msg.refId)}
                    onClick={() => msg.refIdLink && window.open(msg.refIdLink, '_blank')}
                    title="Duplo clique para editar | Clique para abrir link"
                  >
                    {msg.refId}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Barra de formatação + REF ID */}
        <div style={{
          backgroundColor: 'white',
          padding: '8px 20px',
          borderTop: '1px solid #e1e1e1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Formatação à esquerda */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
            <button style={{
              border: '1px solid #ddd',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              backgroundColor: textFormatting.bold ? '#2B4C8C' : 'transparent',
              color: textFormatting.bold ? 'white' : '#333'
            }}
            onClick={() => setTextFormatting(prev => ({...prev, bold: !prev.bold}))}>
              <strong>B</strong>
            </button>
            <button style={{
              border: '1px solid #ddd',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              backgroundColor: textFormatting.italic ? '#2B4C8C' : 'transparent',
              color: textFormatting.italic ? 'white' : '#333'
            }}
            onClick={() => setTextFormatting(prev => ({...prev, italic: !prev.italic}))}>
              <em>I</em>
            </button>
            <select style={{
              padding: '4px 6px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '11px',
              outline: 'none'
            }}>
              <option value="12">12px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
            </select>
            <button style={{
              border: '1px solid #ddd',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              😊
            </button>
          </div>
          
          {/* REF ID no centro */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 2,
            justifyContent: 'center'
          }}>
            <label style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#333',
              whiteSpace: 'nowrap'
            }}>
              REF. ID:
            </label>
            <input
              type="text"
              style={{
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '12px',
                outline: 'none',
                width: '120px'
              }}
              value={selectedRefId}
              onChange={(e) => setSelectedRefId(e.target.value)}
              placeholder="Digite ou selecione"
            />
            <button style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              ➕
            </button>
          </div>
          
          {/* Assinatura à direita */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flex: 1,
            justifyContent: 'flex-end'
          }}>
            <button style={{
              border: '1px solid #ddd',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              backgroundColor: showSignature ? '#2B4C8C' : 'transparent',
              color: showSignature ? 'white' : '#333'
            }}
            onClick={() => setShowSignature(!showSignature)}>
              ✍️
            </button>
          </div>
        </div>

        {/* Input de Mensagem */}
        <div style={{
          backgroundColor: 'white',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderTop: '1px solid #e1e1e1'
        }}>
          {/* Botão assinatura (duplicado) */}
          <button style={{
            backgroundColor: showSignature ? '#2B4C8C' : 'transparent',
            color: showSignature ? 'white' : '#333',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px'
          }}
          onClick={() => setShowSignature(!showSignature)}>
            ✍️
          </button>
          
          <button style={{
            backgroundColor: 'transparent',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px'
          }}
          onClick={() => fileInputRef.current?.click()}>
            📎
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              ref={messageInputRef}
              type="text"
              placeholder="Digite uma mensagem..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                fontSize: '14px',
                outline: 'none'
              }}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
          </div>
          
          <button style={{
            backgroundColor: 'transparent',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px'
          }}>
            🎤
          </button>
          
          {/* Botão agendar */}
          <button style={{
            backgroundColor: '#C97A4A',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          onClick={() => setShowScheduleModal(true)}>
            ⏰
          </button>
          
          <button style={{
            backgroundColor: '#2B4C8C',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            📤
          </button>
        </div>
      </div>

      {/* Coluna 3: Painel Lateral Direito */}
      {rightPanelVisible && (
        <div style={{
          backgroundColor: '#f8f9fa',
          borderLeft: '1px solid #e1e1e1',
          display: 'flex',
          flexDirection: 'column',
          width: '320px'
        }}>
          <div style={{
            display: 'flex',
            backgroundColor: 'white',
            borderBottom: '1px solid #e1e1e1'
          }}>
            <button style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              backgroundColor: rightPanelTab === 'ids' ? '#2B4C8C' : 'transparent',
              color: rightPanelTab === 'ids' ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
            onClick={() => setRightPanelTab('ids')}>
              🔴 IDs
            </button>
            <button style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              backgroundColor: rightPanelTab === 'agents' ? '#2B4C8C' : 'transparent',
              color: rightPanelTab === 'agents' ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
            onClick={() => setRightPanelTab('agents')}>
              👥 Atendentes
            </button>
          </div>

          <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            {rightPanelTab === 'ids' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    IDs ATIVOS
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentContactIds.active.map(item => (
                      <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px'
                      }}>
                        <span style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedRefId(item.id)}>
                          🔴 {item.id}
                        </span>
                        <button style={{
                          backgroundColor: '#2B4C8C',
                          color: 'white',
                          border: 'none',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                        onClick={() => window.open(item.link, '_blank')}>
                          🔗
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    IDs FINALIZADOS
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentContactIds.finished.map(item => (
                      <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px'
                      }}>
                        <span style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedRefId(item.id)}>
                          ✅ {item.id}
                        </span>
                        <button style={{
                          backgroundColor: '#2B4C8C',
                          color: 'white',
                          border: 'none',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                        onClick={() => window.open(item.link, '_blank')}>
                          🔗
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {rightPanelTab === 'agents' && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  👥 Atendentes Online
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {agents.filter(agent => agent.online).map(agent => (
                    <div key={agent.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#333'
                        }}>
                          {agent.name}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          color: '#666'
                        }}>
                          {agent.department}
                        </span>
                      </div>
                      <button style={{
                        backgroundColor: '#2B4C8C',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}>
                        🔄
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Agendamento */}
      {showScheduleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setShowScheduleModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e1e1e1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3>⏰ Agendar Mensagem</h3>
              <button 
                onClick={() => setShowScheduleModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Data:</label>
                <input
                  type="date"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Hora:</label>
                <input
                  type="time"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Mensagem:</label>
                <textarea
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite a mensagem a ser agendada..."
                  rows={4}
                />
              </div>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '20px'
              }}>
                <button style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowScheduleModal(false)}>
                  Cancelar
                </button>
                <button style={{
                  backgroundColor: '#2B4C8C',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  ⏰ Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;