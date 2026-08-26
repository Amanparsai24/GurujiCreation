import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { items, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'payments');

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPaymentProofUrl(response.data.url);
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload screenshot. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <h3>Your cart is empty.</h3>
        <button onClick={() => navigate('/products')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Products</button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        total_amount: getTotal(),
        shipping_address: shippingAddress,
        payment_status: 'pending',
        payment_proof_url: paymentProofUrl,
        items: items.map(i => ({
          product_id: i.product.id,
          quantity: i.quantity,
          price: i.product.base_price,
          design_id: i.design?.id
        }))
      };

      if (isAuthenticated) {
        // @ts-ignore
        orderPayload.user_id = useAuthStore.getState().user?.id;
      } else {
        // @ts-ignore
        orderPayload.guest_name = guestName;
        // @ts-ignore
        orderPayload.guest_phone = guestPhone;
      }

      await api.post('/orders', orderPayload);

      // Success!
      clearCart();
      const phoneParam = guestPhone ? guestPhone : (useAuthStore.getState().user?.phone || '');
      toast.success('Order placed successfully!');
      navigate(`/track-order${phoneParam ? `?phone=${phoneParam}` : ''}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Products</button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem' }}>
      <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Checkout</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        <div className="checkout-form">
          <form onSubmit={handlePlaceOrder}>
            {step === 1 && (
              <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>1. Shipping Details</h3>
                
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Full Address</label>
                  <textarea 
                    className="input-field" 
                    rows={4} 
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Street, City, State, ZIP..."
                  />
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} 
                  onClick={() => {
                    if ((!isAuthenticated && (!guestName || !guestPhone)) || !shippingAddress) {
                      setError("Please fill in all shipping details.");
                      return;
                    }
                    setError("");
                    setStep(2);
                  }}
                >
                  Next: Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>2. Offline Payment</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  Please scan the QR code below using any UPI app (GPay, PhonePe, Paytm) and pay the exact amount: <strong>₹{getTotal().toFixed(2)}</strong>. After payment, upload the screenshot.
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                  <div style={{ width: '200px', height: '200px', background: 'white', padding: '10px', borderRadius: '8px' }}>
                    {/* Mock QR Code */}
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=guruji@upi&pn=Guruji%20Creation&am=" alt="QR Code" style={{ width: '100%', height: '100%' }} />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Upload Payment Screenshot</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="input-field" 
                    onChange={handleFileUpload}
                    required={!paymentProofUrl}
                    disabled={isUploading}
                  />
                  {isUploading && <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>Uploading image... please wait.</span>}
                  
                  {paymentProofUrl && (
                    <div style={{ marginTop: '1rem', border: '1px solid var(--color-border)', padding: '0.5rem', borderRadius: '8px', background: 'var(--color-surface)' }}>
                      <span style={{ color: 'var(--color-success)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', fontWeight: 'bold' }}>✓ Screenshot uploaded successfully</span>
                      <img 
                        src={paymentProofUrl.startsWith('http') ? paymentProofUrl : `http://localhost:8000${paymentProofUrl}`} 
                        alt="Payment Proof Preview" 
                        style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '4px' }} 
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '1rem' }} onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '1rem', fontSize: '1.1rem' }} disabled={isUploading || isPlacingOrder || !paymentProofUrl}>
                    {isPlacingOrder ? 'Confirming Order...' : 'Confirm Order'}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div style={{ color: 'var(--color-error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>
            )}
          </form>
        </div>

        <div className="checkout-summary">
          <div className="glass-card" style={{ position: 'sticky', top: '6rem' }}>
            <h3 style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>Order Summary</h3>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '0.8rem', borderRadius: '0.5rem' }}>
              Note: Orders with custom designs will be sent to the admin for review and approval. Once approved, production will begin.
            </p>
            
            <div style={{ marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>₹{(parseFloat(item.product.base_price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 700, paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <span>Total to Pay</span>
              <span className="text-gradient">₹{getTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
