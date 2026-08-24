import { useCartStore } from '../store/useCartStore';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem' }}>
      <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Shopping Cart</h2>
      
      {items.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>Your cart is empty</h3>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="glass-card" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                <div style={{ width: '100px', height: '100px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', flexShrink: 0, overflow: 'hidden' }}>
                  {item.design?.preview_image_url ? (
                    <img src={item.design.preview_image_url} alt="Custom Design" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : item.product.image ? (
                    <img src={item.product.image} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>No Image</div>
                  )}
                </div>
                
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{item.product.name}</h4>
                  {item.design && <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Custom Design Included</span>}
                  <div style={{ marginTop: '0.5rem', color: 'var(--color-primary)', fontWeight: 600 }}>₹{item.product.base_price}</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '0.2rem' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', color: 'white', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>-</button>
                    <span style={{ padding: '0 0.5rem' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', color: 'white', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="glass-card" style={{ position: 'sticky', top: '6rem' }}>
              <h3 style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>Order Summary</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{getTotal().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
                <span>Shipping</span>
                <span>Calculated next step</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 700, paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <span>Total</span>
                <span className="text-gradient">₹{getTotal().toFixed(2)}</span>
              </div>
              
              <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Proceed to Checkout</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
