import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../api/axios';
import type { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  const { isAuthenticated, user } = useAuthStore();
  const { isInWishlist, addToWishlist, removeFromWishlist, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') {
      fetchWishlist();
    }
  }, [isAuthenticated, user, fetchWishlist]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Fetch current product
        const response = await api.get(`/products/${id}`);
        const currentProduct = response.data;
        setProduct(currentProduct);

        // Fetch related products (same category, exclude current)
        if (currentProduct.category_id) {
          const allProductsRes = await api.get('/products');
          const related = allProductsRes.data
            .filter((p: Product) => p.category_id === currentProduct.category_id && p.id !== currentProduct.id)
            .slice(0, 4); // Limit to 4 related products
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Failed to fetch product data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  if (loading) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading product...</div>;
  if (!product) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Product not found.</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem' }}>
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        <div style={{ height: '400px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
          {product.images?.[0] ? <img src={product.images[0].image_url.startsWith('http') ? product.images[0].image_url : `${IMAGE_BASE_URL}${product.images[0].image_url}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }} /> : 'No Image'}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <button 
            onClick={() => {
              if (!isAuthenticated || user?.role !== 'customer') {
                useAuthStore.getState().openLoginModal();
                return;
              }
              isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product.id);
            }}
            style={{
              position: 'absolute', top: '0', right: '0',
              background: isAuthenticated && isInWishlist(product.id) ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '45px', height: '45px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              color: isAuthenticated && isInWishlist(product.id) ? 'var(--color-error)' : 'var(--color-text-muted)',
              transition: 'all 0.3s ease'
            }}
            title={isAuthenticated && isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={22} fill={isAuthenticated && isInWishlist(product.id) ? 'var(--color-error)' : 'none'} />
          </button>
          {product.category && <span style={{ color: 'var(--color-accent)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>{product.category.name}</span>}
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', paddingRight: '50px' }}>{product.name}</h1>
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

      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '5rem', marginBottom: '3rem' }}>
          <h2 className="text-gradient" style={{ marginBottom: '2rem', textAlign: 'center' }}>Related Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {relatedProducts.map((relatedProd) => {
              const primaryImage = relatedProd.images?.find(img => img.is_primary)?.image_url || relatedProd.images?.[0]?.image_url;
              return (
                <div key={relatedProd.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <div style={{ height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', overflow: 'hidden' }}>
                    {primaryImage ? <img src={primaryImage.startsWith('http') ? primaryImage : `${IMAGE_BASE_URL}${primaryImage}`} alt={relatedProd.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }} /> : 'No Image'}
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{relatedProd.name}</h3>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', flexGrow: 1 }}>{relatedProd.description?.substring(0, 60)}...</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)' }}>₹{relatedProd.base_price}</span>
                    <button 
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        navigate(`/products/${relatedProd.uuid || relatedProd.id}`);
                      }} 
                      className="btn btn-secondary" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
