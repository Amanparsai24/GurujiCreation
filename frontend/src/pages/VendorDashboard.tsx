import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const VendorDashboard = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'vendor') {
      navigate('/admin/login');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="text-gradient" style={{ margin: 0 }}>Vendor Dashboard</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0' }}>Welcome back, {user?.name}</p>
        </div>
        <button 
          onClick={() => { logout(); navigate('/'); }} 
          className="btn btn-secondary"
        >
          Logout
        </button>
      </div>

      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <h3 style={{ marginBottom: '1rem' }}>Vendor Marketplace Coming Soon</h3>
        <p>You have been registered as a Vendor. In the next platform update, you will be able to manage your specific product inventory and fulfill orders assigned to you.</p>
      </div>
    </div>
  );
};

export default VendorDashboard;
