// client/src/hooks/useMessages.js
// =====================================
// PRIMEM WHATSAPP - HOOK DE MENSAGENS
// Lógica específica para gerenciamento de mensagens
// =====================================

import { useState, useEffect, useCallback, useMemo } from 'react';

const useMessages = (messages = [], selectedChat = null) => {
  // ====================================
  // ESTADOS LOCAIS
  // ====================================
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageFilter, setMessageFilter] = useState('all'); // all, media, text, files
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  // ====================================
  // UTILITÁRIOS DE FORMATAÇÃO
  // ====================================

  // Formatar timestamp
  const formatMessageTime = useCallback((timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Menos de 1 minuto
    if (diffMinutes < 1) {
      return 'Agora';
    }
    
    // Menos de 1 hora
    if (diffMinutes < 60) {
      return `${diffMinutes}min`;
    }
    
    // Menos de 24 horas
    if (diffHours < 24) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Menos de 7 dias
    if (diffDays < 7) {
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Mais de 7 dias
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: diffDays > 365 ? '2-digit' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Formatar data para agrupamento
  const formatDateGroup = useCallback((timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: diffDays > 365 ? 'numeric' : undefined
      });
    }
  }, []);

  // ====================================
  // FILTROS E BUSCA
  // ====================================

  // Filtrar mensagens por busca
  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    
    const query = searchQuery.toLowerCase();
    return messages.filter(message => {
      // Buscar no corpo da mensagem
      if (message.body?.toLowerCase().includes(query)) {
        return true;
      }
      
      // Buscar no nome do arquivo
      if (message.media?.filename?.toLowerCase().includes(query)) {
        return true;
      }
      
      // Buscar no nome do contato
      if (message.contact?.name?.toLowerCase().includes(query)) {
        return true;
      }
      
      return false;
    });
  }, [messages, searchQuery]);

  // Filtrar mensagens por tipo
  const filteredByType = useMemo(() => {
    if (messageFilter === 'all') return filteredBySearch;
    
    return filteredBySearch.filter(message => {
      switch (messageFilter) {
        case 'media':
          return message.hasMedia && (
            message.media?.mimetype?.startsWith('image/') ||
            message.media?.mimetype?.startsWith('video/')
          );
        case 'files':
          return message.hasMedia && (
            message.media?.mimetype?.includes('pdf') ||
            message.media?.mimetype?.includes('document') ||
            message.media?.mimetype?.includes('spreadsheet') ||
            message.media?.mimetype?.includes('zip')
          );
        case 'audio':
          return message.hasMedia && message.media?.mimetype?.startsWith('audio/');
        case 'text':
          return !message.hasMedia && message.body?.trim();
        default:
          return true;
      }
    });
  }, [filteredBySearch, messageFilter]);

  // Filtrar mensagens por data
  const filteredByDate = useMemo(() => {
    if (dateFilter === 'all') return filteredByType;
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return filteredByType.filter(message => {
      if (!message.timestamp) return false;
      
      const messageDate = new Date(message.timestamp);
      
      switch (dateFilter) {
        case 'today':
          return messageDate >= startOfToday;
        case 'week':
          const weekAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
          return messageDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
          return messageDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [filteredByType, dateFilter]);

  // Mensagens finais filtradas
  const filteredMessages = filteredByDate;

  // ====================================
  // AGRUPAMENTO DE MENSAGENS
  // ====================================

  // Agrupar mensagens por data
  const groupedByDate = useMemo(() => {
    if (!filteredMessages.length) return [];
    
    const groups = [];
    let currentGroup = null;
    
    filteredMessages.forEach(message => {
      const dateKey = formatDateGroup(message.timestamp);
      
      if (!currentGroup || currentGroup.date !== dateKey) {
        currentGroup = {
          date: dateKey,
          messages: []
        };
        groups.push(currentGroup);
      }
      
      currentGroup.messages.push(message);
    });
    
    return groups;
  }, [filteredMessages, formatDateGroup]);

  // Agrupar mensagens consecutivas do mesmo remetente
  const groupedByConsecutive = useMemo(() => {
    return groupedByDate.map(dateGroup => ({
      ...dateGroup,
      messages: groupConsecutiveMessages(dateGroup.messages)
    }));
  }, [groupedByDate]);

  // Função para agrupar mensagens consecutivas
  const groupConsecutiveMessages = useCallback((messages) => {
    if (!messages.length) return [];
    
    const grouped = [];
    let currentGroup = null;
    
    messages.forEach((message, index) => {
      const prevMessage = messages[index - 1];
      const shouldGroup = prevMessage && 
        prevMessage.fromMe === message.fromMe &&
        prevMessage.from === message.from &&
        (message.timestamp - prevMessage.timestamp) < 5 * 60 * 1000; // 5 minutos
      
      if (!shouldGroup) {
        // Iniciar novo grupo
        currentGroup = {
          fromMe: message.fromMe,
          from: message.from,
          contact: message.contact,
          timestamp: message.timestamp,
          messages: [message],
          isGroup: false
        };
        grouped.push(currentGroup);
      } else {
        // Adicionar ao grupo atual
        currentGroup.messages.push(message);
        currentGroup.isGroup = currentGroup.messages.length > 1;
      }
    });
    
    return grouped;
  }, []);

  // ====================================
  // ANÁLISE DE MENSAGENS
  // ====================================

  // Estatísticas das mensagens
  const messageStats = useMemo(() => {
    const stats = {
      total: messages.length,
      sent: 0,
      received: 0,
      media: 0,
      text: 0,
      files: 0,
      audio: 0,
      unread: 0,
      today: 0,
      thisWeek: 0
    };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

    messages.forEach(message => {
      // Contadores básicos
      if (message.fromMe) {
        stats.sent++;
      } else {
        stats.received++;
        if (!message.isRead) {
          stats.unread++;
        }
      }

      // Tipos de mensagem
      if (message.hasMedia) {
        const mimetype = message.media?.mimetype || '';
        if (mimetype.startsWith('image/') || mimetype.startsWith('video/')) {
          stats.media++;
        } else if (mimetype.startsWith('audio/')) {
          stats.audio++;
        } else {
          stats.files++;
        }
      } else {
        stats.text++;
      }

      // Contadores de tempo
      const messageDate = new Date(message.timestamp);
      if (messageDate >= startOfToday) {
        stats.today++;
      }
      if (messageDate >= startOfWeek) {
        stats.thisWeek++;
      }
    });

    return stats;
  }, [messages]);

  // ====================================
  // UTILITÁRIOS DE MENSAGEM
  // ====================================

  // Verificar se mensagem é mídia
  const isMediaMessage = useCallback((message) => {
    return message.hasMedia && message.media?.mimetype;
  }, []);

  // Verificar tipo específico de mídia
  const getMessageType = useCallback((message) => {
    if (!message.hasMedia) {
      return message.body?.trim() ? 'text' : 'empty';
    }

    const mimetype = message.media?.mimetype || '';
    
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.includes('pdf')) return 'pdf';
    if (mimetype.includes('document')) return 'document';
    if (mimetype.includes('spreadsheet')) return 'spreadsheet';
    if (mimetype.includes('zip') || mimetype.includes('rar')) return 'archive';
    
    return 'file';
  }, []);

  // Obter ícone da mensagem
  const getMessageIcon = useCallback((message) => {
    const type = getMessageType(message);
    
    const icons = {
      text: '💬',
      image: '🖼️',
      video: '🎥',
      audio: '🎵',
      pdf: '📄',
      document: '📝',
      spreadsheet: '📊',
      archive: '📦',
      file: '📎',
      empty: '❔'
    };
    
    return icons[type] || icons.file;
  }, [getMessageType]);

  // Formatar tamanho de arquivo
  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return '';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }, []);

  // ====================================
  // FUNÇÕES DE BUSCA
  // ====================================

  // Buscar mensagens
  const searchMessages = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Limpar busca
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Filtrar por tipo
  const filterByType = useCallback((type) => {
    setMessageFilter(type);
  }, []);

  // Filtrar por data
  const filterByDate = useCallback((period) => {
    setDateFilter(period);
  }, []);

  // Limpar todos os filtros
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setMessageFilter('all');
    setDateFilter('all');
  }, []);

  // ====================================
  // FUNÇÕES DE INTERAÇÃO
  // ====================================

  // Selecionar mensagem
  const selectMessage = useCallback((message) => {
    setSelectedMessage(message);
  }, []);

  // Responder mensagem
  const replyToMessage = useCallback((message) => {
    setReplyingTo(message);
  }, []);

  // Editar mensagem
  const editMessage = useCallback((message) => {
    setEditingMessage(message);
  }, []);

  // Limpar seleções
  const clearSelections = useCallback(() => {
    setSelectedMessage(null);
    setReplyingTo(null);
    setEditingMessage(null);
  }, []);

  // ====================================
  // SCROLL E NAVEGAÇÃO
  // ====================================

  // Encontrar mensagem por ID
  const findMessageById = useCallback((messageId) => {
    return messages.find(msg => msg.id === messageId);
  }, [messages]);

  // Obter índice da mensagem
  const getMessageIndex = useCallback((messageId) => {
    return messages.findIndex(msg => msg.id === messageId);
  }, [messages]);

  // Navegar para mensagem
  const navigateToMessage = useCallback((messageId) => {
    const message = findMessageById(messageId);
    if (message) {
      setSelectedMessage(message);
      return message;
    }
    return null;
  }, [findMessageById]);

  // ====================================
  // EXPORT/DOWNLOAD
  // ====================================

  // Exportar mensagens filtradas
  const exportMessages = useCallback((format = 'json') => {
    const dataToExport = filteredMessages.map(msg => ({
      id: msg.id,
      timestamp: msg.timestamp,
      from: msg.from,
      fromMe: msg.fromMe,
      body: msg.body,
      contact: msg.contact?.name || msg.from,
      hasMedia: msg.hasMedia,
      mediaType: msg.media?.mimetype,
      filename: msg.media?.filename
    }));

    const chatName = selectedChat?.name || 'mensagens';
    const date = new Date().toISOString().split('T')[0];
    const filename = `${chatName}-${date}.${format}`;

    if (format === 'json') {
      const dataStr = JSON.stringify(dataToExport, null, 2);
      downloadFile(dataStr, filename, 'application/json');
    } else if (format === 'csv') {
      const csvContent = convertToCSV(dataToExport);
      downloadFile(csvContent, filename, 'text/csv');
    }
  }, [filteredMessages, selectedChat]);

  // Converter para CSV
  const convertToCSV = useCallback((data) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }, []);

  // Download de arquivo
  const downloadFile = useCallback((content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  // ====================================
  // RETORNO DO HOOK
  // ====================================
  return {
    // Mensagens processadas
    messages: filteredMessages,
    groupedMessages: groupedByConsecutive,
    originalMessages: messages,
    
    // Estados de filtros
    searchQuery,
    messageFilter,
    dateFilter,
    
    // Estados de interação
    selectedMessage,
    replyingTo,
    editingMessage,
    
    // Estatísticas
    messageStats,
    
    // Funções de formatação
    formatMessageTime,
    formatDateGroup,
    formatFileSize,
    
    // Funções de análise
    isMediaMessage,
    getMessageType,
    getMessageIcon,
    
    // Funções de busca e filtros
    searchMessages,
    clearSearch,
    filterByType,
    filterByDate,
    clearFilters,
    
    // Funções de interação
    selectMessage,
    replyToMessage,
    editMessage,
    clearSelections,
    
    // Funções de navegação
    findMessageById,
    getMessageIndex,
    navigateToMessage,
    
    // Funções de export
    exportMessages,
    
    // Computed properties
    hasFilters: searchQuery || messageFilter !== 'all' || dateFilter !== 'all',
    isEmpty: filteredMessages.length === 0,
    hasUnread: messageStats.unread > 0,
    
    // Filters options
    typeFilters: [
      { value: 'all', label: 'Todas', icon: '💬' },
      { value: 'text', label: 'Texto', icon: '📝' },
      { value: 'media', label: 'Mídia', icon: '🖼️' },
      { value: 'audio', label: 'Áudio', icon: '🎵' },
      { value: 'files', label: 'Arquivos', icon: '📎' }
    ],
    
    dateFilters: [
      { value: 'all', label: 'Todas' },
      { value: 'today', label: 'Hoje' },
      { value: 'week', label: 'Esta semana' },
      { value: 'month', label: 'Este mês' }
    ]
  };
};

export default useMessages;
export { useMessages }; // ← ADICIONAR ESTA LINHA