import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../services/apiClient';

export default function ClientChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef(null);

  const token = sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token');

  useEffect(() => {
    let pollInterval;
    if (isOpen && token) {
      pollMessages();
      pollInterval = setInterval(pollMessages, 3000);
    }
    return () => clearInterval(pollInterval);
  }, [isOpen, token]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const pollMessages = async () => {
    if (!token) return;
    try {
      // First try to get the active session. If none, start one.
      const res = await apiClient.get('/client/chat/session').catch(async (e) => {
        if (e.response && e.response.status === 404) {
          return await apiClient.post('/client/chat/start', {});
        }
        throw e;
      });
      
      if (res.data && res.data.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Chat polling error', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !token) return;
    
    const msgText = currentMessage;
    setCurrentMessage('');
    
    try {
      await apiClient.post('/client/chat/messages', {
        message: msgText
      });
      pollMessages();
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  if (!token) return null; // Only show if logged in

  return (
    <div className="client-chat-wrapper">
      <style>{`
        .client-chat-wrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          font-family: 'Outfit', sans-serif;
        }

        .chat-toggle-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .chat-toggle-btn:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 15px 35px -5px rgba(16, 185, 129, 0.5);
        }

        .chat-toggle-btn svg {
          width: 28px;
          height: 28px;
          fill: currentColor;
        }

        .chat-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 360px;
          height: 520px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid #e2e8f0;
        }

        .chat-window.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .chat-header {
          background: linear-gradient(135deg, #10b981, #059669);
          padding: 20px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-header h4 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
        }
        
        .chat-header p {
          margin: 4px 0 0;
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .chat-close-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .chat-close-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .chat-body {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-footer {
          padding: 16px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .chat-input-wrapper {
          display: flex;
          gap: 8px;
          background: #f1f5f9;
          border-radius: 100px;
          padding: 6px 6px 6px 16px;
          border: 1px solid #e2e8f0;
        }

        .chat-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.95rem;
          color: #1e293b;
        }

        .chat-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #10b981;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .msg-bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 0.9rem;
          line-height: 1.4;
          word-break: break-word;
        }

        .msg-client {
          align-self: flex-end;
          background: #10b981;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .msg-admin {
          align-self: flex-start;
          background: white;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 4px;
        }
        
        .msg-ai {
          align-self: flex-start;
          background: #fdf2f8;
          color: #be185d;
          border: 1px solid #fbcfe8;
          border-bottom-left-radius: 4px;
        }
      `}</style>

      {/* Main Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div>
            <h4>Support & Upgrades</h4>
            <p>Chat with SuperAdmin or AI Assistant</p>
          </div>
          <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="chat-body">
          <div className="text-center mb-3">
            <span className="badge bg-light text-muted fw-normal rounded-pill px-3 py-2 border">
              Chat started
            </span>
          </div>
          
          {messages.map((m, idx) => {
            let bubbleClass = 'msg-client';
            if (m.senderType === 'SUPERADMIN') bubbleClass = 'msg-admin';
            if (m.senderType === 'AI') bubbleClass = 'msg-ai';
            
            return (
              <div key={idx} className={`msg-bubble ${bubbleClass}`}>
                {m.message}
                <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
                  {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-footer">
          <form onSubmit={handleSendMessage} className="chat-input-wrapper">
            <input 
              type="text" 
              className="chat-input"
              placeholder="Ask about plans, upgrades..."
              value={currentMessage}
              onChange={e => setCurrentMessage(e.target.value)}
            />
            <button type="submit" className="chat-send-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>
    </div>
  );
}
