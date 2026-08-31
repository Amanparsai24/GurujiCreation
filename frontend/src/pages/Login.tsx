import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore(state => state.setAuth);

  const isAdminRoute = location.pathname.includes('/admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/login', { phone, password });
      const user = response.data.user;
      setAuth(user, response.data.token);
      
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/'); // Customers go home
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem', maxWidth: '500px' }}>
      <div className="glass-card">
        <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="phone">Phone Number</label>
            <input 
              id="phone" 
              type="tel" 
              className="input-field" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required 
              disabled={loading}
              placeholder="10-digit mobile number"
            />
          </div>
          
          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Don't have an account? <Link to={isAdminRoute ? "/admin/register" : "/register"} style={{ fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
