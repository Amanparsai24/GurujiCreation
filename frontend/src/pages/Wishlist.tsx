import { useEffect } from 'react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../api/axios';
import { Trash2 } from 'lucide-react';

const Wishlist = ({ isTab = false }: { isTab?: boolean }) => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { items, isLoading, fetchWishlist, removeFromWishlist } = useWishlistStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') {
      if (!isTab) navigate('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, user, navigate, fetchWishlist, isTab]);

  if (isLoading) {
    return <div className={!isTab ? "container" : ""} style={!isTab ? { paddingTop: '4rem', textAlign: 'center' } : { textAlign: 'center', padding: '2rem' }}>Loading your wishlist...</div>;
  }

  return (
    <div className={!isTab ? "container animate-fade-in" : "animate-fade-in"} style={!isTab ? { paddingTop: '4rem', minHeight: '80vh' } : {}}>
      {!isTab && <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>My Wishlist</h2>}
      
      {items.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--color-text-muted)' }}>Your wishlist is empty.</h3>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>Explore Products</Link>
        </div>
      ) : (
        <div className="product-grid">
          {items.map(product => {
            const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url;
            return (
              <div key={product.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '200px', backgroundColor: 'var(--color-surface)', overflow: 'hidden' }}>
                  {primaryImage ? (
                    <img 
                      src={primaryImage.startsWith('http') ? primaryImage : `${IMAGE_BASE_URL}${primaryImage}`} 
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>No Image</div>
                  )}
                </div>
                
                <button 
                  onClick={() => removeFromWishlist(product.id)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '35px',
                    height: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--color-error)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                  title="Remove from wishlist"
                >
                  <Trash2 size={18} />
                </button>

                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{product.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{product.base_price}</span>
                  </div>
                  
                  <Link to={`/products/${product.id}`} className="btn btn-secondary" style={{ display: 'block', textAlign: 'center', width: '100%' }}>View Details</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
