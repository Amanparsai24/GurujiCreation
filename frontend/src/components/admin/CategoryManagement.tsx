import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Category } from '../../types';
import toast from 'react-hot-toast';

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [parent_id, setParentId] = useState<number | ''>('');
  const [status, setStatus] = useState('active');
  const [image, setImage] = useState('');

  const [is_featured, setIsFeatured] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setDescription(category.description || '');
      setSlug(category.slug);
      setParentId(category.parent_id || '');
      setStatus(category.status || 'active');
      setImage(category.image || '');
      setIsFeatured(!!category.is_featured);
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('');
      setSlug('');
      setParentId('');
      setStatus('active');
      setImage('');
      setIsFeatured(false);
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
    formData.append('folder', 'categories');

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImage(response.data.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        name, 
        description, 
        slug, 
        parent_id: parent_id === '' ? null : parent_id, 
        status, 
        image,
        is_featured
      };

      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, payload);
        toast.success('Category updated successfully');
      } else {
        await api.post('/admin/categories', payload);
        toast.success('Category created successfully');
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  if (loading) return <div>Loading categories...</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="text-gradient" style={{ margin: 0 }}>Category Management</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Add Category</button>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
              <th style={{ padding: '1rem' }}>Image</th>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Slug</th>
              <th style={{ padding: '1rem' }}>Homepage</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <td style={{ padding: '1rem' }}>
                  {category.image ? (
                    <img src={`http://localhost:8000${category.image}`} alt={category.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.25rem' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', background: 'var(--color-bg)', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>No Img</div>
                  )}
                </td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{category.name}</td>
                <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{category.slug}</td>
                <td style={{ padding: '1rem' }}>
                  {category.is_featured ? (
                    <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold', fontSize: '0.9rem' }}>★ Featured</span>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Hidden</span>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '99px', 
                    fontSize: '0.8rem',
                    background: category.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: category.status === 'active' ? 'var(--color-success)' : 'var(--color-error)'
                  }}>
                    {category.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => handleOpenModal(category)}>Edit</button>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--color-error)', color: 'var(--color-error)' }} onClick={() => handleDelete(category.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Category Name</label>
                <input type="text" className="input-field" value={name} onChange={(e) => {
                  setName(e.target.value);
                  if(!editingCategory) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }} required />
              </div>
              <div className="input-group">
                <label className="input-label">Slug</label>
                <input type="text" className="input-field" value={slug} onChange={(e) => setSlug(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Parent Category</label>
                  <select className="input-field" value={parent_id} onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">None (Top Level)</option>
                    {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Status</label>
                  <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input 
                  type="checkbox" 
                  id="isFeatured" 
                  checked={is_featured} 
                  onChange={(e) => setIsFeatured(e.target.checked)} 
                  style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                />
                <label htmlFor="isFeatured" className="input-label" style={{ margin: 0, cursor: 'pointer' }}>Show on Homepage</label>
              </div>

              <div className="input-group">
                <label className="input-label">Category Image</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {image && <img src={image.startsWith('http') ? image : `http://localhost:8000${image}`} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--color-border)' }} />}
                  <input type="file" accept="image/*" className="input-field" style={{ padding: '0.4rem' }} onChange={handleImageUpload} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCategory ? 'Update' : 'Save'} Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryManagement;
