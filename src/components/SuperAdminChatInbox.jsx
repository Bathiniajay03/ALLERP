import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5157/api';

export default function SuperAdminChatInbox() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Need the superadmin token for auth
  const token = sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeSession) {
      fetchMessages(activeSession.id);
      const msgInterval = setInterval(() => fetchMessages(activeSession.id), 3000);
      return () => clearInterval(msgInterval);
    }
  }, [activeSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/super-admin/chat/sessions`, config);
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to fetch chat sessions', err);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/super-admin/chat/sessions/${sessionId}/messages`, config);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !activeSession) return;
    
    const msgText = currentMessage;
    setCurrentMessage('');
    
    try {
      await axios.post(`${API_BASE_URL}/super-admin/chat/sessions/${activeSession.id}/reply`, {
        message: msgText
      }, config);
      fetchMessages(activeSession.id);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const markSessionClosed = async (sessionId) => {
    try {
      await axios.put(`${API_BASE_URL}/super-admin/chat/sessions/${sessionId}/status`, {
        status: 'CLOSED'
      }, config);
      if (activeSession?.id === sessionId) setActiveSession(null);
      fetchSessions();
    } catch (err) {
      console.error('Failed to close session', err);
    }
  };

  return (
    <div className="chat-inbox-container row g-0 rounded-3 shadow-sm overflow-hidden" style={{ height: '70vh', background: 'white', border: '1px solid #e2e8f0' }}>
      {/* Sidebar - Sessions */}
      <div className="col-4 border-end bg-light d-flex flex-column" style={{ height: '100%' }}>
        <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
          <h5 className="m-0 fw-bold">Active Chats</h5>
          <span className="badge bg-primary rounded-pill">{sessions.filter(s => s.status === 'ACTIVE').length}</span>
        </div>
        <div className="overflow-auto flex-grow-1 p-2">
          {sessions.length === 0 ? (
            <div className="text-center text-muted p-4 small">No active chats</div>
          ) : (
            sessions.map(s => {
              const isActive = activeSession?.id === s.id;
              const timeStr = new Date(s.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div 
                  key={s.id} 
                  className={`p-3 mb-2 rounded-2 cursor-pointer transition-all ${isActive ? 'bg-primary text-white shadow-sm' : 'bg-white border hover-bg-light'}`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setActiveSession(s)}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold fs-6 text-truncate">{s.visitorName}</span>
                    <span className={`small ${isActive ? 'text-white-50' : 'text-muted'}`}>{timeStr}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className={`small text-truncate ${isActive ? 'text-white' : 'text-secondary'}`} style={{ maxWidth: '70%' }}>
                      {s.visitorEmail || 'No Email'}
                    </span>
                    {s.status === 'CLOSED' && <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>CLOSED</span>}
                    {s.status === 'ACTIVE' && <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>ACTIVE</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Area - Messages */}
      <div className="col-8 d-flex flex-column" style={{ height: '100%', background: '#f8fafc' }}>
        {activeSession ? (
          <>
            <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center shadow-sm z-1">
              <div>
                <h5 className="m-0 fw-bold">{activeSession.visitorName}</h5>
                <span className="small text-muted">{activeSession.visitorEmail} • ID: {activeSession.sessionId}</span>
              </div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => markSessionClosed(activeSession.id)} disabled={activeSession.status === 'CLOSED'}>
                Close Chat
              </button>
            </div>
            
            <div className="flex-grow-1 p-4 overflow-auto d-flex flex-column gap-3">
              {messages.length === 0 && (
                <div className="text-center text-muted my-auto">No messages yet.</div>
              )}
              {messages.map(m => {
                const isAdmin = m.senderType === 'SUPERADMIN';
                const timeStr = new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={m.id} className={`d-flex ${isAdmin ? 'justify-content-end' : 'justify-content-start'}`}>
                    <div style={{
                      maxWidth: '75%',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      background: isAdmin ? '#0ea5e9' : 'white',
                      color: isAdmin ? 'white' : '#1e293b',
                      border: isAdmin ? 'none' : '1px solid #e2e8f0',
                      borderBottomRightRadius: isAdmin ? '4px' : '16px',
                      borderBottomLeftRadius: isAdmin ? '16px' : '4px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}>
                      <div className="mb-1" style={{ wordBreak: 'break-word' }}>{m.message}</div>
                      <div className={`text-end small ${isAdmin ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}>{timeStr}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-3 bg-white border-top">
              <form onSubmit={handleSendMessage} className="d-flex gap-2">
                <input 
                  type="text" 
                  className="form-control rounded-pill px-4 bg-light border-0" 
                  placeholder="Type your reply..." 
                  value={currentMessage}
                  onChange={e => setCurrentMessage(e.target.value)}
                  disabled={activeSession.status === 'CLOSED'}
                />
                <button type="submit" className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '45px', height: '45px' }} disabled={activeSession.status === 'CLOSED'}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1" className="mb-3">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <p>Select a chat session to view and reply to messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
