import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Navigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useAuthStore();
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="text-gradient" style={{ margin: 0 }}>My Dashboard</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '99px', border: '1px solid var(--color-border)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span>{user?.name}</span>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
        <div className="glass-card" style={{ height: 'fit-content', padding: '1.5rem' }}>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <button 
                className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => setActiveTab('orders')}
              >
                My Orders
              </button>
            </li>
            <li>
              <button 
                className={`btn ${activeTab === 'designs' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => setActiveTab('designs')}
              >
                My Designs
              </button>
            </li>
            <li>
              <button 
                className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => setActiveTab('profile')}
              >
                My Profile
              </button>
            </li>
            <li>
              <button 
                className={`btn ${activeTab === 'addresses' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => setActiveTab('addresses')}
              >
                Addresses
              </button>
            </li>
          </ul>
        </div>
        
        <div className="glass-card animate-fade-in" style={{ minHeight: '500px' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            {activeTab === 'orders' && 'Recent Orders'}
            {activeTab === 'designs' && 'Saved Designs'}
            {activeTab === 'profile' && 'Profile Settings'}
            {activeTab === 'addresses' && 'Saved Addresses'}
          </h3>
          <div style={{ 
            padding: '4rem 2rem', 
            textAlign: 'center', 
            color: 'var(--color-text-muted)', 
            border: '2px dashed rgba(255,255,255,0.1)', 
            borderRadius: '1rem',
            background: 'rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📦</div>
            <p style={{ fontSize: '1.1rem' }}>No {activeTab} found.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
