import { useState, useEffect } from 'react';
import api, { IMAGE_BASE_URL } from '../../api/axios';
import type { Product, Category } from '../../types';
import toast from 'react-hot-toast';

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [basePrice, setBasePrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [customizable, setCustomizable] = useState(false);
  const [status, setStatus] = useState('active');
  const [images, setImages] = useState<{image_url: string, is_primary: boolean}[]>([]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setDescription(product.description || '');
      setCategoryId(product.category_id);
      setBasePrice(product.base_price.toString());
      setDiscountPrice(product.discount_price?.toString() || '');
      setSku(product.sku || '');
      setStockQuantity(product.stock_quantity?.toString() || '0');
      setCustomizable(product.customizable);
      setStatus(product.status || 'active');
      
      const prodImages = product.images?.length 
        ? product.images.map(img => ({ image_url: img.image_url, is_primary: img.is_primary }))
        : (product.image ? [{ image_url: product.image, is_primary: true }] : []);
      setImages(prodImages);
    } else {
      setEditingProduct(null);
      setName('');
      setDescription('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setBasePrice('');
      setDiscountPrice('');
      setSku('');
      setStockQuantity('0');
      setCustomizable(false);
      setStatus('active');
      setImages([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'products');

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImages([...images, { image_url: response.data.url, is_primary: images.length === 0 }]);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    // If we removed the primary, make the first one primary
    if (newImages.length > 0 && !newImages.some(img => img.is_primary)) {
      newImages[0].is_primary = true;
    }
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryId === '') {
      toast.error('Please select a category');
      return;
    }

    try {
      const payload = { 
        name, 
        description, 
        category_id: categoryId,
        base_price: Number(basePrice),
        discount_price: discountPrice ? Number(discountPrice) : null,
        sku,
        stock_quantity: Number(stockQuantity),
        customizable,
        status, 
        images,
        image: images.find(img => img.is_primary)?.image_url || null // Fallback for old schema
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created successfully');
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="text-gradient" style={{ margin: 0 }}>Product Management</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Add Product</button>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
              <th style={{ padding: '1rem' }}>Image</th>
              <th style={{ padding: '1rem' }}>Name & SKU</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem' }}>Stock</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.image;
              return (
                <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    {primaryImage ? (
                      <img src={`${IMAGE_BASE_URL}${primaryImage}`} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.25rem' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', background: 'var(--color-surface)', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>No Img</div>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{product.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{product.sku || 'No SKU'}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{product.category?.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <div>₹{product.base_price}</div>
                    {product.discount_price && <div style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>Discount: ₹{product.discount_price}</div>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: (product.stock_quantity || 0) < 5 ? 'var(--color-error)' : 'inherit' }}>
                      {product.stock_quantity || 0}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '99px', 
                      fontSize: '0.8rem',
                      background: product.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: product.status === 'active' ? 'var(--color-success)' : 'var(--color-error)'
                    }}>
                      {product.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => handleOpenModal(product)}>Edit</button>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--color-error)', color: 'var(--color-error)' }} onClick={() => handleDelete(product.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Product Name</label>
                  <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">SKU</label>
                  <input type="text" className="input-field" value={sku} onChange={(e) => setSku(e.target.value)} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Category</label>
                  <select className="input-field" value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} required>
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Base Price (₹)</label>
                  <input type="number" step="0.01" className="input-field" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Discount Price (₹)</label>
                  <input type="number" step="0.01" className="input-field" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Stock Quantity</label>
                  <input type="number" className="input-field" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} required />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Status</label>
                  <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'flex-end' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem 0' }}>
                    <input type="checkbox" checked={customizable} onChange={(e) => setCustomizable(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                    Allow Custom Design?
                  </label>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Product Images</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {images.map((img, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img src={`${IMAGE_BASE_URL}${img.image_url}`} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.5rem', border: img.is_primary ? '2px solid var(--color-primary)' : '1px solid var(--color-border)' }} />
                      <button type="button" onClick={() => removeImage(index)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--color-error)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>×</button>
                      {img.is_primary && <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'var(--color-primary)', color: 'white', fontSize: '10px', textAlign: 'center', padding: '2px', borderBottomLeftRadius: '0.4rem', borderBottomRightRadius: '0.4rem' }}>Primary</div>}
                    </div>
                  ))}
                  <label className="input-field" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderStyle: 'dashed' }}>
                    +
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingProduct ? 'Update' : 'Save'} Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductManagement;
