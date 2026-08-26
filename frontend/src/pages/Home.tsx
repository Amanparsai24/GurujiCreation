import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../api/axios';
import type { Category } from '../types';

const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero" style={{ padding: '6rem 0', textAlign: 'center', background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.1) 100%)' }}>
        <div className="container">
          <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>
            Bring Your Ideas to Life<br/>with Guruji Creation
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Premium custom manufacturing. Specializing in Acrylic Boards, CNC Work, Name Plates, and custom gifts.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/products" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>Shop Products</Link>
            <Link to="/design" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', boxShadow: 'var(--shadow-glow)' }}>Start Designing</Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>Our Categories</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              Loading categories...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              {categories.map((cat) => (
                <div key={cat.id} className="glass-card hover-glow" style={{ textAlign: 'center', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--color-bg)' }}>
                    {cat.image ? (
                      <img 
                        src={cat.image.startsWith('http') ? cat.image : `${IMAGE_BASE_URL}${cat.image}`} 
                        alt={cat.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                        No Image
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>{cat.name}</h3>
                    <Link to={`/products?category=${cat.uuid || cat.slug}`} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>View Collection</Link>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No categories found. Please add some categories from the admin panel.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--color-surface)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>Why Choose Us</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Premium Quality</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>We use only the finest materials and cutting-edge CNC technology for unmatched precision.</p>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Endless Customization</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Our advanced online Design Studio lets you create exactly what you envision.</p>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Fast Delivery</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Quick production times and reliable shipping across the country.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ padding: '3rem 0', borderTop: '1px solid var(--color-border)', textAlign: 'center', marginTop: '4rem' }}>
        <div className="container">
          <h3 className="text-gradient" style={{ marginBottom: '1rem' }}>Guruji Creation</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Premium Custom Manufacturing & Design Platform</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>&copy; 2026 Guruji Creation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
