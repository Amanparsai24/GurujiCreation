import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import DesignBuilder from './pages/DesignBuilder';
import AdminDashboard from './pages/AdminDashboard';
import AdminDesignViewer from './pages/AdminDesignViewer';
import AdminRegister from './pages/AdminRegister';
import TrackOrder from './pages/TrackOrder';
import ContactUs from './pages/ContactUs';
import VendorDashboard from './pages/VendorDashboard';
import MyOrders from './pages/MyOrders';
import MyDesigns from './pages/MyDesigns';
import Wishlist from './pages/Wishlist';
import { useCartStore } from './store/useCartStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useAuthStore } from './store/useAuthStore';
import { ShoppingCart, User, LogOut, Heart, Palette } from 'lucide-react';

import Home from './pages/Home';

import { Toaster } from 'react-hot-toast';

function AppContent() {
  const cartItemsCount = useCartStore(state => state.items.length);
  const { fetchSettings, siteLogo, whatsappNumber } = useSettingsStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Hide the public navbar on admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');

  // WhatsApp message for the floating button
  const whatsappMessage = encodeURIComponent("Hello! I have a question about Guruji Creation.");

  return (
    <>
      <Toaster position="top-right" />
      
      {!isAdminRoute && (
        <nav className="navbar">
          <div className="container navbar-container">
            <Link to="/" className="logo text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {siteLogo && <img src={siteLogo} alt="Guruji Creation Logo" style={{ height: '40px', objectFit: 'contain' }} />}
              {!siteLogo && "Guruji Creation"}
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/products" className="nav-link">Shop</Link>
              <Link to="/design" className="nav-link">Create Your Design</Link>
              <Link to="/track-order" className="nav-link">Track Order</Link>
              <Link to="/contact" className="nav-link">Contact Us</Link>
              <Link to="/cart" className="nav-link" style={{ position: 'relative' }}>
                <ShoppingCart size={20} />
                Cart
                {cartItemsCount > 0 && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-10px', background: 'var(--color-secondary)', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 'bold' }}>
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              {isAuthenticated && user?.role === 'customer' ? (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                  <Link to="/wishlist" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Heart size={18} />
                  </Link>
                  <Link to="/my-designs" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Palette size={18} />
                  </Link>
                  <Link to="/my-orders" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} />
                    My Account
                  </Link>
                  <button onClick={() => { logout(); window.location.href = '/'; }} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', marginLeft: '1rem' }}>Login</Link>
              )}
            </div>
          </div>
        </nav>
      )}
      
      <main className={isAdminRoute ? "" : "main-content"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/design" element={<DesignBuilder />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/my-designs" element={<MyDesigns />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/contact" element={<ContactUs />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/design-viewer/:orderId" element={<AdminDesignViewer />} />

          {/* Vendor Routes */}
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        </Routes>
      </main>

      {/* Floating WhatsApp Button */}
      {!isAdminRoute && (
        <a 
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: '#25D366',
            color: 'white',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            zIndex: 1000,
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Chat on WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
          </svg>
        </a>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
