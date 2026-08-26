import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api, { IMAGE_BASE_URL } from '../api/axios';
import type { Order } from '../types';
import { Link, useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading your orders...</div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem', minHeight: '80vh' }}>
      <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>My Orders</h2>
      
      {orders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--color-text-muted)' }}>You haven't placed any orders yet.</h3>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>Shop Now</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0 }}>Order #{order.id}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span style={{ 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '2rem', 
                    fontSize: '0.85rem',
                    backgroundColor: order.status === 'delivered' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: order.status === 'delivered' ? '#10B981' : '#F59E0B',
                    textTransform: 'capitalize'
                  }}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {order.items?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '0.5rem', backgroundColor: 'var(--color-bg)', overflow: 'hidden' }}>
                      {item.product?.images?.[0] ? (
                        <img 
                          src={item.product.images[0].image_url.startsWith('http') ? item.product.images[0].image_url : `${IMAGE_BASE_URL}${item.product.images[0].image_url}`} 
                          alt={item.product.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>No Img</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h5 style={{ margin: 0 }}>{item.product?.name}</h5>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        Qty: {item.quantity} × ₹{item.price}
                      </div>
                      {item.design_id && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Custom Design Included</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>Total Amount:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>₹{order.total_amount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
