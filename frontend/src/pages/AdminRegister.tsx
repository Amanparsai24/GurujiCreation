import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

const AdminRegister = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Send the request with 'role' explicitly set to 'admin'
      const response = await api.post('/auth/register', { name, password, phone, role: 'admin' });
      setAuth(response.data.user, response.data.token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Admin Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem', maxWidth: '500px' }}>
      <div className="glass-card" style={{ borderTop: '4px solid var(--color-primary)' }}>
        <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Registration</h2>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="name">Admin Full Name</label>
            <input id="name" type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          
          <div className="input-group">
            <label className="input-label" htmlFor="phone">Phone Number</label>
            <input id="phone" type="tel" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input id="password" type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating admin account...' : 'Create Admin Account'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Already have an admin account? <Link to="/admin/login" style={{ fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister;
