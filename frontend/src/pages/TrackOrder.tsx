import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import type { Order } from '../types';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const initialPhone = searchParams.get('phone') || '';
  
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    if (phoneParam && phoneParam.length >= 10) {
      setPhoneNumber(phoneParam);
      fetchOrders(phoneParam);
    }
  }, [searchParams]);

  const fetchOrders = async (phone: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/orders/track?phone=${phone}`);
      setOrders(response.data);
      setSearched(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to track orders. Please check your number.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    fetchOrders(phoneNumber);
  };

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Track Your Order</h1>
      <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '3rem' }}>
        Enter the phone number you used during checkout to see the status of your orders.
      </p>

      <div className="glass-card" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flexGrow: 1, marginBottom: 0 }}>
            <label className="input-label">Phone Number</label>
            <input 
              type="tel" 
              className="input-field" 
              placeholder="e.g. 9876543210" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '42px', padding: '0 2rem' }} disabled={loading}>
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {searched && (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>Your Orders ({orders.length})</h3>
          
          {orders.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No orders found for this phone number.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {orders.map(order => (
                <div key={order.id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)' }}>Order #{order.id}</h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>₹{order.total_amount}</div>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '99px', 
                        fontSize: '0.8rem',
                        background: order.status === 'delivered' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: order.status === 'delivered' ? 'var(--color-success)' : 'var(--color-warning)'
                      }}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ marginBottom: '0.5rem' }}>Shipping Address</h5>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
                      {order.shipping_address}
                    </p>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div>
                      <h5 style={{ marginBottom: '0.5rem' }}>Items</h5>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {order.items.map((item: any) => (
                          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span>{item.quantity}x {item.product?.name || 'Product'}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
