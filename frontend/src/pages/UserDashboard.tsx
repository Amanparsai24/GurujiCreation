import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MyOrders from './MyOrders';
import MyDesigns from './MyDesigns';
import Wishlist from './Wishlist';
import { useAuthStore } from '../store/useAuthStore';
import { ShoppingBag, Palette, Heart } from 'lucide-react';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'designs' | 'wishlist'>('orders');
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') {
      useAuthStore.getState().openLoginModal();
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Allows deep linking to tabs like /account?tab=wishlist
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'orders' || tab === 'designs' || tab === 'wishlist') {
      setActiveTab(tab);
    }
  }, [location]);

  const handleTabChange = (tab: 'orders' | 'designs' | 'wishlist') => {
    setActiveTab(tab);
    navigate(`/account?tab=${tab}`, { replace: true });
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ margin: 0 }}>My Account</h1>
      </div>

      <div className="glass-card" style={{ padding: '0', marginBottom: '2rem', display: 'flex', overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button 
          onClick={() => handleTabChange('orders')}
          style={{
            flex: 1,
            padding: '1.2rem',
            background: activeTab === 'orders' ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'orders' ? 'var(--color-primary)' : 'var(--color-text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: activeTab === 'orders' ? 'bold' : 'normal',
            transition: 'all 0.3s ease'
          }}
        >
          <ShoppingBag size={18} />
          My Orders
        </button>
        <button 
          onClick={() => handleTabChange('designs')}
          style={{
            flex: 1,
            padding: '1.2rem',
            background: activeTab === 'designs' ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'designs' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'designs' ? 'var(--color-primary)' : 'var(--color-text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: activeTab === 'designs' ? 'bold' : 'normal',
            transition: 'all 0.3s ease'
          }}
        >
          <Palette size={18} />
          My Designs
        </button>
        <button 
          onClick={() => handleTabChange('wishlist')}
          style={{
            flex: 1,
            padding: '1.2rem',
            background: activeTab === 'wishlist' ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'wishlist' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'wishlist' ? 'var(--color-primary)' : 'var(--color-text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: activeTab === 'wishlist' ? 'bold' : 'normal',
            transition: 'all 0.3s ease'
          }}
        >
          <Heart size={18} />
          Wishlist
        </button>
      </div>

      <div style={{ paddingBottom: '4rem' }}>
        {activeTab === 'orders' && <MyOrders isTab={true} />}
        {activeTab === 'designs' && <MyDesigns isTab={true} />}
        {activeTab === 'wishlist' && <Wishlist isTab={true} />}
      </div>
    </div>
  );
};

export default UserDashboard;
