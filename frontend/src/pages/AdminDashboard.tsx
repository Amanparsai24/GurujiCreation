import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useNavigate, Link } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../api/axios';
import ProductManagement from '../components/admin/ProductManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import UserManagement from '../components/admin/UserManagement';
import { 
  LayoutDashboard, ShoppingCart, MessageSquare, Package, 
  Tags, Users, Store, Settings, LogOut, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const sidebarTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
  { id: 'contacts', label: 'Contacts', icon: <MessageSquare size={20} /> },
  { id: 'products', label: 'Products', icon: <Package size={20} /> },
  { id: 'categories', label: 'Categories', icon: <Tags size={20} /> },
  { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
  { id: 'vendors', label: 'Vendors', icon: <Store size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const AdminDashboard = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { themeColor, siteLogo, whatsappNumber, updateSettings } = useSettingsStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsTab, setSettingsTab] = useState('theme'); // For settings sub-navigation
  const [orderTab, setOrderTab] = useState('design'); // For splitting orders
  const [selectedPaymentProof, setSelectedPaymentProof] = useState<any>(null); // For Payment Verification Modal

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [localThemeColor, setLocalThemeColor] = useState(themeColor);
  const [localLogoPreview, setLocalLogoPreview] = useState<string | null>(siteLogo);
  const [localWhatsappNumber, setLocalWhatsappNumber] = useState(whatsappNumber);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    setLocalThemeColor(themeColor);
    setLocalLogoPreview(siteLogo);
    setLocalWhatsappNumber(whatsappNumber);
  }, [themeColor, siteLogo, whatsappNumber]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      // If they don't have a token, they need to login.
      if (!localStorage.getItem('token')) {
        navigate('/admin/login');
      } else {
        navigate('/'); // Invalid role
      }
      return;
    }

    const fetchData = async () => {
      try {
        const [ordersRes, contactsRes] = await Promise.all([
          api.get('/admin/orders'),
          api.get('/admin/contacts')
        ]);
        setOrders(ordersRes.data);
        setContacts(contactsRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, [isAuthenticated, user, navigate]);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/admin/orders/${id}`, { status });
      setOrders(orders.map(order => order.id === id ? { ...order, status } : order));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    }
  };

  const handleUpdateContactStatus = async (id: number, status: string) => {
    try {
      await api.put(`/admin/contacts/${id}`, { status });
      setContacts(contacts.map(c => c.id === id ? { ...c, status } : c));
    } catch (error) {
      console.error('Failed to update contact status', error);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLocalLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateSettings({
        themeColor: localThemeColor,
        siteLogo: localLogoPreview,
        whatsappNumber: localWhatsappNumber
      });
      toast.success('Settings updated globally!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <>
            <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Dashboard Overview</h2>
            <div className="dashboard-grid">
              <div className="glass-card"><h3>Total Orders</h3><p style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>{orders.length}</p></div>
              <div className="glass-card"><h3>Pending</h3><p style={{ fontSize: '2rem', color: 'var(--color-secondary)' }}>{orders.filter(o => o.status === 'pending').length}</p></div>
              <div className="glass-card"><h3>Production</h3><p style={{ fontSize: '2rem', color: '#f59e0b' }}>{orders.filter(o => o.status === 'production').length}</p></div>
              <div className="glass-card"><h3>Revenue</h3><p style={{ fontSize: '2rem', color: '#10b981' }}>₹{orders.reduce((sum, o) => sum + Number(o.total_amount), 0)}</p></div>
            </div>
          </>
        );
      case 'orders':
        // Filter logic based on order items
        const isDesignOrder = (order: any) => order.items && order.items.some((item: any) => item.design_id !== null);
        
        const filteredOrders = orders.filter(o => 
          orderTab === 'design' ? isDesignOrder(o) : !isDesignOrder(o)
        );

        return (
          <>
            <h2 className="text-gradient" style={{ marginBottom: '1rem' }}>Order Management</h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button 
                onClick={() => setOrderTab('design')}
                style={{
                  padding: '0.8rem 1.5rem',
                  borderRadius: '30px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  background: orderTab === 'design' ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: orderTab === 'design' ? 'white' : 'var(--color-text)',
                  boxShadow: orderTab === 'design' ? 'var(--shadow-md)' : 'none',
                }}
              >
                Custom Design Orders
              </button>
              <button 
                onClick={() => setOrderTab('website')}
                style={{
                  padding: '0.8rem 1.5rem',
                  borderRadius: '30px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  background: orderTab === 'website' ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: orderTab === 'website' ? 'white' : 'var(--color-text)',
                  boxShadow: orderTab === 'website' ? 'var(--shadow-md)' : 'none',
                }}
              >
                Website Orders
              </button>
            </div>

            <div className="glass-card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Order ID</th>
                    <th style={{ padding: '1rem' }}>Customer</th>
                    <th style={{ padding: '1rem' }}>Amount</th>
                    <th style={{ padding: '1rem' }}>Payment Status</th>
                    <th style={{ padding: '1rem' }}>Order Status</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem' }}>#{order.id}</td>
                      <td style={{ padding: '1rem' }}>User {order.user_id || `Guest (${order.user?.phone || 'N/A'})`}</td>
                      <td style={{ padding: '1rem' }}>₹{order.total_amount}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          display: 'inline-block',
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor: order.payment_status === 'paid' ? '#d1fae5' : '#fef3c7',
                          color: order.payment_status === 'paid' ? '#065f46' : '#92400e'
                        }}>
                          {order.payment_status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          value={order.status} 
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="input-field"
                          style={{ padding: '0.4rem', width: 'auto' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="design_approved">Design Approved</option>
                          <option value="production">Production</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {order.payment_proof_url && order.payment_status !== 'paid' && (
                          <button 
                            className="btn btn-primary" 
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                            onClick={() => setSelectedPaymentProof(order)}
                          >
                            Verify Payment
                          </button>
                        )}
                        {orderTab === 'design' && (
                          <Link to={`/admin/design-viewer/${order.id}`} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>View Design</Link>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No {orderTab} orders found.</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Payment Proof Modal */}
            {selectedPaymentProof && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }} onClick={() => setSelectedPaymentProof(null)}>
                <div 
                  className="glass-card animate-fade-in" 
                  style={{ width: '90%', maxWidth: '500px', backgroundColor: 'white', padding: '2rem', position: 'relative' }}
                  onClick={e => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setSelectedPaymentProof(null)}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={24} />
                  </button>
                  <h3 style={{ marginBottom: '1rem' }}>Payment Verification (Order #{selectedPaymentProof.id})</h3>
                  
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
                    <img 
                      src={selectedPaymentProof.payment_proof_url?.startsWith('http') ? selectedPaymentProof.payment_proof_url : `${IMAGE_BASE_URL}${selectedPaymentProof.payment_proof_url}`} 
                      alt="Payment Proof" 
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', border: '1px solid var(--color-border)' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1 }}
                      onClick={async () => {
                        try {
                          await api.put(`/admin/orders/${selectedPaymentProof.id}`, { payment_status: 'paid', status: 'production' });
                          setOrders(orders.map(o => o.id === selectedPaymentProof.id ? { ...o, payment_status: 'paid', status: 'production' } : o));
                          toast.success('Payment verified and order confirmed!');
                          setSelectedPaymentProof(null);
                        } catch (error) {
                          toast.error('Failed to update order');
                        }
                      }}
                    >
                      Confirm Payment & Order
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedPaymentProof(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      case 'products':
        return <ProductManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'contacts':
        return (
          <>
            <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Contact Inquiries</h2>
            <div className="glass-card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Date</th>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Phone</th>
                    <th style={{ padding: '1rem' }}>Message</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(contact => (
                    <tr key={contact.id} style={{ borderBottom: '1px solid var(--color-border)', background: contact.status === 'unread' ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
                      <td style={{ padding: '1rem' }}>{new Date(contact.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem', fontWeight: contact.status === 'unread' ? 'bold' : 'normal' }}>{contact.name}</td>
                      <td style={{ padding: '1rem' }}>{contact.phone}</td>
                      <td style={{ padding: '1rem', maxWidth: '300px' }}>{contact.message}</td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          value={contact.status} 
                          onChange={(e) => handleUpdateContactStatus(contact.id, e.target.value)}
                          className="input-field"
                          style={{ padding: '0.4rem', width: 'auto' }}
                        >
                          <option value="unread">Unread</option>
                          <option value="read">Read</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {contacts.length === 0 && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No inquiries yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        );
      case 'settings':
        const renderSettingsTabButton = (id: string, label: string) => {
          const isActive = settingsTab === id;
          return (
            <button
              onClick={() => setSettingsTab(id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.8rem 1rem',
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--color-text)',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { 
                if(!isActive) {
                  e.currentTarget.style.background = 'var(--color-bg)';
                }
              }}
              onMouseOut={(e) => { 
                if(!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {label}
            </button>
          );
        };

        return (
          <>
            <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Website Settings</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'start' }}>
              {/* Settings Left Menu */}
              <div className="glass-card" style={{ padding: '1rem' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li>{renderSettingsTabButton('theme', 'Theme Settings')}</li>
                  <li>{renderSettingsTabButton('branding', 'Logo & Branding')}</li>
                  <li>{renderSettingsTabButton('contact', 'Contact Settings')}</li>
                </ul>
              </div>

              {/* Settings Right Content */}
              <div>
                {settingsTab === 'theme' && (
                  <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Theme Settings</h3>
                    <div className="input-group">
                      <label className="input-label">Primary Color</label>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input 
                          type="color" 
                          className="input-field" 
                          value={localThemeColor}
                          onChange={(e) => setLocalThemeColor(e.target.value)}
                          style={{ width: '60px', padding: '0.2rem', cursor: 'pointer' }}
                        />
                        <span style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{localThemeColor}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                        This updates the primary accents across the website.
                      </p>
                    </div>
                  </div>
                )}

                {settingsTab === 'branding' && (
                  <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Logo & Branding</h3>
                    <div className="input-group">
                      <label className="input-label">Website Logo</label>
                      
                      {localLogoPreview && (
                        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', border: '1px dashed var(--color-border)', borderRadius: '8px', display: 'inline-block' }}>
                          <img src={localLogoPreview} alt="Logo preview" style={{ maxHeight: '60px' }} />
                        </div>
                      )}
                      
                      <input 
                        type="file" 
                        accept="image/*"
                        className="input-field"
                        onChange={handleLogoUpload}
                      />
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                        Upload a new logo to display in the navigation bar. 
                      </p>
                    </div>
                  </div>
                )}

                {settingsTab === 'contact' && (
                  <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Contact Settings</h3>
                    <div className="input-group">
                      <label className="input-label">Business WhatsApp Number</label>
                      <input 
                        type="text" 
                        className="input-field"
                        value={localWhatsappNumber}
                        onChange={(e) => setLocalWhatsappNumber(e.target.value)}
                        placeholder="e.g. 919876543210"
                      />
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                        The number customers will reach when they click the WhatsApp button. Include country code (e.g. 91 for India) without '+' symbol.
                      </p>
                    </div>
                  </div>
                )}
                
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  style={{ width: 'auto', padding: '0.8rem 2rem' }}
                >
                  {isSavingSettings ? 'Saving...' : 'Save Global Settings'}
                </button>
              </div>
            </div>
          </>
        );
      case 'vendors':
        return <UserManagement roleFilter="vendor" />;
      case 'customers':
        return <UserManagement roleFilter="customer" />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-layout">
      {isSidebarOpen && <div className="mobile-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
      
      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ marginBottom: '3rem', paddingLeft: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>Admin Portal</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Manage your business</p>
          </div>
          <button className="mobile-sidebar-toggle" onClick={() => setIsSidebarOpen(false)} style={{ display: 'none' }}>
            <X size={24} />
          </button>
        </div>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          {sidebarTabs.map(tab => (
            <li key={tab.id}>
              <button 
                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.8rem 1.2rem',
                  background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : 'var(--color-text-muted)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  transition: 'all 0.2s',
                  boxShadow: activeTab === tab.id ? 'var(--shadow-md)' : 'none'
                }}
                onMouseOver={(e) => { 
                  if(activeTab !== tab.id) {
                    e.currentTarget.style.background = 'var(--color-bg)';
                    e.currentTarget.style.color = 'var(--color-text)';
                  }
                }}
                onMouseOut={(e) => { 
                  if(activeTab !== tab.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-muted)';
                  }
                }}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'contacts' && contacts.filter(c => c.status === 'unread').length > 0 && (
                  <span style={{ 
                    marginLeft: 'auto',
                    background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--color-error)', 
                    color: 'white', 
                    padding: '0.1rem 0.5rem', 
                    borderRadius: '10px', 
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {contacts.filter(c => c.status === 'unread').length}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
          <button 
            onClick={() => { logout(); navigate('/'); }} 
            className="btn btn-secondary" 
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '0.5rem',
              color: 'var(--color-text)',
              borderColor: 'transparent',
              background: 'var(--color-bg)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--color-error)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.background = 'var(--color-bg)'; }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Admin Header */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="mobile-sidebar-toggle" onClick={() => setIsSidebarOpen(true)}>
              ☰
            </button>
            <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'none' /* Optional if we want text here */ }}>Dashboard</h2>
          </div>
          
          <div className="admin-profile">
            <div className="admin-profile-text" style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{user?.name || 'Admin User'}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Administrator</p>
            </div>
            <div className="admin-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
