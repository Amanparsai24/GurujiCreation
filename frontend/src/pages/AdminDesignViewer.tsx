import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from 'fabric';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AdminDesignViewer = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!canvasRef.current || !order) return;

    // Find the first item with a design
    const itemWithDesign = order.items?.find((item: any) => item.design);
    
    if (!itemWithDesign) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f8fafc'
    });

    setFabricCanvas(canvas);

    // Load JSON data into Canvas
    try {
      const designJson = JSON.parse(itemWithDesign.design.canvas_data);
      canvas.loadFromJSON(designJson, () => {
        canvas.renderAll();
      });
    } catch (e) {
      console.error("Error parsing design JSON", e);
    }

    return () => {
      canvas.dispose();
    };
  }, [order]);

  const handleStatusUpdate = async (designId: number, status: string) => {
    try {
      await api.put(`/admin/designs/${designId}/status`, { status });
      toast.success(`Design ${status}`);
      fetchOrder(); // Refetch to get updated status
    } catch (error) {
      console.error('Failed to update design status', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading Design...</div>;

  const itemWithDesign = order?.items?.find((item: any) => item.design);
  const design = itemWithDesign?.design;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="text-gradient" style={{ margin: 0 }}>Design Review: Order #{orderId}</h2>
          {design && (
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>Status:</span>
              <span style={{ 
                padding: '0.2rem 0.8rem', 
                borderRadius: '1rem', 
                fontSize: '0.9rem',
                backgroundColor: design.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                 design.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 
                                 'rgba(245, 158, 11, 0.1)',
                color: design.status === 'approved' ? '#10b981' : 
                       design.status === 'rejected' ? '#ef4444' : 
                       '#f59e0b',
                fontWeight: 'bold'
              }}>
                {design.status.toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary">Back to Dashboard</button>
      </div>
      
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', background: '#e2e8f0', borderRadius: '1rem', overflow: 'hidden' }}>
        {!design ? (
          <p style={{ color: '#1e293b' }}>No custom design found for this order.</p>
        ) : (
          <div style={{ boxShadow: 'var(--shadow-md)', borderRadius: '4px', overflow: 'hidden' }}>
            <canvas ref={canvasRef} />
          </div>
        )}
      </div>
      
      {design && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {design.status !== 'approved' && (
            <button 
              className="btn btn-primary" 
              style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
              onClick={() => handleStatusUpdate(design.id, 'approved')}
            >
              Approve for Production
            </button>
          )}
          
          {design.status !== 'rejected' && (
            <button 
              className="btn btn-secondary" 
              style={{ color: '#ef4444', borderColor: '#ef4444' }}
              onClick={() => handleStatusUpdate(design.id, 'rejected')}
            >
              Reject Design
            </button>
          )}

          <button 
            className="btn btn-secondary" 
            onClick={() => {
              if (fabricCanvas) {
                const dataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 });
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = `order_${orderId}_design.png`;
                a.click();
              }
            }}
          >
            Export HD Image
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDesignViewer;
