import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import toast from 'react-hot-toast';

const MyDesigns = ({ isTab = false }: { isTab?: boolean }) => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') {
      if (!isTab) navigate('/login');
      return;
    }
    fetchDesigns();
  }, [isAuthenticated, user, navigate, isTab]);

  const fetchDesigns = async () => {
    try {
      const response = await api.get('/designs');
      setDesigns(response.data);
    } catch (error) {
      console.error('Failed to fetch designs', error);
      toast.error('Failed to load your designs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (design: any) => {
    addItem({
      product: design.product,
      quantity: 1,
      design: design
    });
    toast.success('Design added to cart');
    navigate('/cart');
  };

  if (loading) {
    return <div className={!isTab ? "container" : ""} style={!isTab ? { paddingTop: '4rem', textAlign: 'center' } : { textAlign: 'center', padding: '2rem' }}>Loading your designs...</div>;
  }

  return (
    <div className={!isTab ? "container animate-fade-in" : "animate-fade-in"} style={!isTab ? { paddingTop: '4rem', minHeight: '80vh' } : {}}>
      {!isTab && <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>My Custom Designs</h2>}
      
      {designs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--color-text-muted)' }}>You haven't saved any designs yet.</h3>
          <Link to="/design" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>Start Designing</Link>
        </div>
      ) : (
        <div className="product-grid">
          {designs.map(design => (
            <div key={design.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '250px', backgroundColor: 'var(--color-surface)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {design.preview_image_url ? (
                  <img 
                    src={design.preview_image_url} 
                    alt={`Design for ${design.product.name}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ color: 'var(--color-text-muted)' }}>No Preview</div>
                )}
              </div>

              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{design.product.name}</h3>
                  <span style={{ 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.7rem', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    backgroundColor: design.status === 'approved' ? 'rgba(46, 213, 115, 0.2)' : 
                                     design.status === 'rejected' ? 'rgba(255, 71, 87, 0.2)' : 
                                     'rgba(255, 165, 2, 0.2)',
                    color: design.status === 'approved' ? '#2ed573' : 
                           design.status === 'rejected' ? '#ff4757' : 
                           '#ffa502'
                  }}>
                    {design.status}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{design.product.base_price}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {new Date(design.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <button 
                  onClick={() => handleAddToCart(design)}
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDesigns;
