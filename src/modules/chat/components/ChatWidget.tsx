'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { chatService } from '../services/chat.service';
import { ChatMessage } from '../types/chat.types';
import { authService } from '@/modules/auth/services/auth.service';
import styles from './ChatWidget.module.css';

export const ChatWidget: React.FC = () => {
  const t = useTranslations('chat');
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();

      const response = await chatService.sendMessage({
        message: inputValue,
        thread_id: threadId,
        auth_token: token ?? undefined,
        user_context: currentUser ?? undefined,
        current_page: pathname,
      });

      // Guardar el thread_id para mantener el contexto
      if (!threadId) {
        setThreadId(response.thread_id);
      }

      const agentMessage: ChatMessage = {
        role: 'agent',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        role: 'agent',
        content: t('errorMessage'),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.chatWidget}>
      {isOpen && (
        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
              <div className={styles.agentAvatar}>🤖</div>
              <div className={styles.chatHeaderTitle}>
                <h3>{t('title')}</h3>
                <p>{t('online')}</p>
              </div>
            </div>
            <button 
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label={t('close')}
            >
              ×
            </button>
          </div>

          <div className={styles.chatMessages}>
            {messages.length === 0 ? (
              <div className={styles.welcomeMessage}>
                <h4>{t('welcomeTitle')}</h4>
                <p>{t('welcomeDescription')}</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`${styles.message} ${styles[message.role]}`}
                >
                  <div className={styles.messageAvatar}>
                    {message.role === 'agent' ? '🤖' : '👤'}
                  </div>
                  <div className={styles.messageContent}>
                    <div className={styles.messageBubble}>
                      {message.content}
                    </div>
                    <div className={styles.messageTime}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className={styles.typingIndicator}>
                <div className={styles.messageAvatar}>🤖</div>
                <div className={styles.typingBubble}>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className={styles.chatInput} onSubmit={handleSendMessage}>
            <div className={styles.inputContainer}>
              <input
                type="text"
                placeholder={t('placeholder')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
              <button 
                type="submit" 
                className={styles.sendButton}
                disabled={isLoading || !inputValue.trim()}
                aria-label={t('send')}
              >
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      <button 
        className={styles.chatButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? t('close') : t('open')}
      >
        {isOpen ? '×' : '💬'}
      </button>
    </div>
  );
};
