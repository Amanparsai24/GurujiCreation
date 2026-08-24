import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AdminChat = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchConversations();
  }, [isAuthenticated, user, navigate]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (conversationId: number) => {
    try {
      const response = await api.get(`/conversations/${conversationId}`);
      setActiveConversation(response.data);
      setMessages(response.data.messages || []);
      
      // Mark as read
      await api.post('/messages/read', { conversation_id: conversationId });
    } catch (error) {
      console.error('Failed to load conversation', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const response = await api.post('/messages', {
        conversation_id: activeConversation.id,
        message: newMessage
      });
      
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  // Simple HTTP polling for new messages (since WebSockets were omitted)
  useEffect(() => {
    if (!activeConversation) return;
    
    const interval = setInterval(() => {
      api.get(`/conversations/${activeConversation.id}`).then(response => {
        if (response.data.messages.length > messages.length) {
          setMessages(response.data.messages);
        }
      }).catch(console.error);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [activeConversation, messages.length]);

  if (loading) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem' }}>
      <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Customer Support</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', height: '600px' }}>
        
        {/* Conversations List */}
        <div className="glass-card" style={{ padding: '1rem', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Active Chats</h3>
          {conversations.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No conversations yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {conversations.map(conv => (
                <div 
                  key={conv.id} 
                  onClick={() => loadConversation(conv.id)}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '0.5rem', 
                    background: activeConversation?.id === conv.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    border: activeConversation?.id === conv.id ? '1px solid var(--color-primary)' : '1px solid transparent'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{conv.customer?.name}</div>
                  {conv.messages && conv.messages.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.messages[0].message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {activeConversation ? (
            <>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', background: 'rgba(15, 23, 42, 0.5)' }}>
                <h3 style={{ margin: 0 }}>Chat with {activeConversation.customer?.name}</h3>
              </div>
              
              <div style={{ flexGrow: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: 'auto' }}>No messages yet. Say hi!</p>
                ) : (
                  messages.map(msg => {
                    const isAdmin = msg.sender?.role === 'admin';
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                          maxWidth: '70%', 
                          padding: '0.75rem 1rem', 
                          borderRadius: '1rem', 
                          background: isAdmin ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)',
                          borderBottomRightRadius: isAdmin ? '0' : '1rem',
                          borderBottomLeftRadius: isAdmin ? '1rem' : '0'
                        }}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', background: 'rgba(15, 23, 42, 0.5)' }}>
                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ marginBottom: 0 }} 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>Send</button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
              Select a conversation to start chatting
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminChat;
