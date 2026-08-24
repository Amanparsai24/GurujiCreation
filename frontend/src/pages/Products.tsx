import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import type { Product } from '../types';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

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
          filteredProducts.map((product) => (
            <div key={product.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                {product.image ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }} /> : 'No Image'}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{product.name}</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', flexGrow: 1 }}>{product.description?.substring(0, 80)}...</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)' }}>₹{product.base_price}</span>
                <Link to={`/products/${product.uuid || product.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View Details</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;
