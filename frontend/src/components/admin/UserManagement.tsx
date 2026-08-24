import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import type { User } from '../../types';

interface UserManagementProps {
  roleFilter?: string; // 'customer' or 'vendor' or undefined for all
}

const UserManagement = ({ roleFilter }: UserManagementProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: roleFilter || 'customer' });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const endpoint = roleFilter ? `/admin/users?role=${roleFilter}` : '/admin/users';
      const response = await api.get(endpoint);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated');
      fetchUsers();
    } catch (error) {
      console.error('Failed to update role', error);
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to delete user', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      toast.success('User added successfully');
      setShowAddModal(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: roleFilter || 'customer' });
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to add user', error);
      toast.error(error.response?.data?.message || 'Failed to add user');
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="text-gradient" style={{ margin: 0 }}>
          {roleFilter ? `${roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)} Management` : 'User Management'}
        </h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add {roleFilter ? roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1) : 'User'}
        </button>
      </div>
      
      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Phone</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Joined</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem' }}>#{user.id}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{user.name}</td>
                <td style={{ padding: '1rem' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>{user.phone || 'N/A'}</td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    value={user.role} 
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="input-field"
                    style={{ padding: '0.4rem', width: 'auto', margin: 0 }}
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: '1rem' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDelete(user.id)} 
                    className="btn btn-secondary" 
                    style={{ padding: '0.4rem', color: 'var(--color-error)' }}
                    title="Delete User"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No users found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Add New {roleFilter ? roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1) : 'User'}</h3>
            <form onSubmit={handleAddUser}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input type="email" className="input-field" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input type="tel" className="input-field" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="password" className="input-field" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              {!roleFilter && (
                <div className="input-group">
                  <label className="input-label">Role</label>
                  <select className="input-field" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement;
