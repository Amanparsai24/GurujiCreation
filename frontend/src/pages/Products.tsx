import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../api/axios';
import type { Product } from '../types';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const { isAuthenticated, user } = useAuthStore();
  const { isInWishlist, addToWishlist, removeFromWishlist, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') {
      fetchWishlist();
    }
  }, [isAuthenticated, user, fetchWishlist]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading products...</div>;
  }

  const filteredProducts = categoryFilter 
    ? products.filter(p => p.category?.uuid === categoryFilter || p.category?.name === categoryFilter || p.category?.slug === categoryFilter)
    : products;

  // Let's find the category name if we are filtering by UUID
  const activeCategory = categoryFilter && products.length > 0 
    ? products.find(p => p.category?.uuid === categoryFilter || p.category?.slug === categoryFilter || p.category?.name === categoryFilter)?.category?.name
    : categoryFilter;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem' }}>
      <h2 className="text-gradient" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        {activeCategory ? `${activeCategory} Products` : 'Our Custom Products'}
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {filteredProducts.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)' }}>No products available at the moment.</p>
        ) : (
          filteredProducts.map((product) => {
            const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url;
            const isWishlisted = isInWishlist(product.id);
            return (
              <div key={product.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', overflow: 'hidden' }}>
                  {primaryImage ? <img src={primaryImage.startsWith('http') ? primaryImage : `${IMAGE_BASE_URL}${primaryImage}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }} /> : 'No Image'}
                </div>
                
                  <button 
                    onClick={() => {
                      if (!isAuthenticated || user?.role !== 'customer') {
                        // Using navigate from react-router-dom, but I need to make sure it's imported
                        window.location.href = '/login';
                        return;
                      }
                      isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id);
                    }}
                    style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: isAuthenticated && isWishlisted ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.4)',
                      border: 'none', borderRadius: '50%', width: '35px', height: '35px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      color: isAuthenticated && isWishlisted ? 'var(--color-error)' : 'white',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Heart size={18} fill={isAuthenticated && isWishlisted ? 'var(--color-error)' : 'none'} />
                  </button>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', flexGrow: 1 }}>{product.description?.substring(0, 80)}...</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)' }}>₹{product.base_price}</span>
                  <Link to={`/products/${product.uuid || product.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View Details</Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Products;
