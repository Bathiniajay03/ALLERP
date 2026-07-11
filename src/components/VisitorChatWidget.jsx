import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5157/api';

export default function VisitorChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check if session exists in storage
    const savedSessionId = sessionStorage.getItem('erp_chat_session_id');
    const savedName = sessionStorage.getItem('erp_chat_name');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      setName(savedName || 'Guest');
      setHasStarted(true);
      pollMessages(savedSessionId, 0);
    }
  }, []);

  useEffect(() => {
    let pollInterval;
    if (hasStarted && sessionId) {
      // Poll every 3 seconds
      pollInterval = setInterval(() => {
        const lastMsgId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) : 0;
        pollMessages(sessionId, lastMsgId);
      }, 3000);
    }
    return () => clearInterval(pollInterval);
  }, [hasStarted, sessionId, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const pollMessages = async (sid, lastId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/visitor-chat/poll/${sid}?lastMessageId=${lastId}`);
      if (res.data && res.data.length > 0) {
        setMessages(prev => {
          const newMessages = res.data.filter(nm => !prev.some(pm => pm.id === nm.id));
          return [...prev, ...newMessages];
        });
      }
    } catch (err) {
      console.error('Chat polling error', err);
    }
  };

  const handleStartChat = async (e) => {
    e.preventDefault();
    if (!name) return;
    
    // Generate new session ID
    const newSessionId = 'CH-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    try {
      await axios.post(`${API_BASE_URL}/visitor-chat/start`, {
        sessionId: newSessionId,
        name: name,
        email: email
      });
      
      sessionStorage.setItem('erp_chat_session_id', newSessionId);
      sessionStorage.setItem('erp_chat_name', name);
      setSessionId(newSessionId);
      setHasStarted(true);
    } catch (err) {
      console.error('Error starting chat', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !sessionId) return;
    
    const msgText = currentMessage;
    setCurrentMessage('');
    
    try {
      const res = await axios.post(`${API_BASE_URL}/visitor-chat/send`, {
        sessionId: sessionId,
        message: msgText
      });
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  return (
    <div className="visitor-chat-wrapper">
      <style>{`
        .visitor-chat-wrapper {
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
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.4);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .chat-toggle-btn:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 15px 35px -5px rgba(14, 165, 233, 0.5);
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
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
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
          background: #0ea5e9;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .chat-send-btn:hover {
          background: #0284c7;
        }

        .msg-bubble {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.4;
          word-break: break-word;
        }

        .msg-visitor {
          align-self: flex-end;
          background: #0ea5e9;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .msg-admin {
          align-self: flex-start;
          background: #ffffff;
          color: #1e293b;
          border-bottom-left-radius: 4px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        
        .msg-time {
          font-size: 0.7rem;
          opacity: 0.7;
          margin-top: 4px;
          text-align: right;
        }

        .chat-setup-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
          justify-content: center;
        }

        .chat-setup-form input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          outline: none;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }

        .chat-setup-form input:focus {
          border-color: #0ea5e9;
        }

        .chat-setup-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>

      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div>
            <h4>Live Support</h4>
            <p>We typically reply in a few minutes.</p>
          </div>
          <button className="chat-close-btn" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="chat-body">
          {!hasStarted ? (
            <form className="chat-setup-form" onSubmit={handleStartChat}>
              <div className="text-center mb-2 text-muted" style={{ fontSize: '0.9rem' }}>
                Please introduce yourself before starting the chat.
              </div>
              <input 
                type="text" 
                placeholder="Your Name *" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
              <input 
                type="email" 
                placeholder="Email Address (Optional)" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
              <button type="submit" className="chat-setup-btn">Start Chat</button>
            </form>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="text-center text-muted mt-4" style={{ fontSize: '0.85rem' }}>
                  Chat session started. Send a message to connect with our team.
                </div>
              )}
              {messages.map((m, idx) => {
                const isVisitor = m.senderType === 'VISITOR';
                const timeStr = new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={idx} className={`msg-bubble ${isVisitor ? 'msg-visitor' : 'msg-admin'}`}>
                    {m.message}
                    <div className="msg-time">{timeStr}</div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {hasStarted && (
          <form className="chat-footer" onSubmit={handleSendMessage}>
            <div className="chat-input-wrapper">
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Type your message..." 
                value={currentMessage}
                onChange={e => setCurrentMessage(e.target.value)}
              />
              <button type="submit" className="chat-send-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </form>
        )}
      </div>

      <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
          </svg>
        )}
      </button>
    </div>
  );
}
