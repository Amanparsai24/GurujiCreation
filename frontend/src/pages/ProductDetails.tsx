import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Product } from '../types';
import { useCartStore } from '../store/useCartStore';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Failed to fetch product', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading product...</div>;
  if (!product) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Product not found.</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem' }}>
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        <div style={{ height: '400px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
          {product.image ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }} /> : 'No Image'}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {product.category && <span style={{ color: 'var(--color-accent)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>{product.category.name}</span>}
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{product.name}</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.8 }}>
            {product.description}
          </p>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '2rem' }}>
            ₹{product.base_price}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => { addItem({ product, quantity: 1 }); navigate('/cart'); }} className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', flex: 1 }}>
              Buy As Is
            </button>
            {product.customizable && (
              <button onClick={() => navigate(`/design?product=${product.id}`)} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', flex: 1, boxShadow: 'var(--shadow-glow)' }}>
                Customize & Design
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
