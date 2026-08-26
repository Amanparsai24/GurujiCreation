import { useEffect, useRef, useState, useReducer } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Canvas, IText, Rect, Circle, FabricImage, FabricObject } from 'fabric';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import type { Product } from '../types';

import toast from 'react-hot-toast';

const DesignBuilder = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<FabricObject | null>(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  
  const { addItem } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (productId) {
      api.get(`/products/${productId}`).then(res => setProduct(res.data)).catch(console.error);
    }
    api.get('/design-templates').then(res => setTemplates(res.data)).catch(console.error);
  }, [productId]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: bgColor
    });

    setFabricCanvas(canvas);

    canvas.on('selection:created', (e) => setActiveObject(e.selected?.[0] || null));
    canvas.on('selection:updated', (e) => setActiveObject(e.selected?.[0] || null));
    canvas.on('selection:cleared', () => setActiveObject(null));

    return () => {
      canvas.dispose();
    };
  }, []);

  const addText = () => {
    if (!fabricCanvas) return;
    const text = new IText('Your Text Here', {
      left: 300,
      top: 250,
      fontFamily: 'Outfit',
      fill: color,
      fontSize: 40,
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
  };

  const addShape = (type: 'rect' | 'circle') => {
    if (!fabricCanvas) return;
    let shape;
    if (type === 'rect') {
      shape = new Rect({ left: 300, top: 200, fill: color, width: 100, height: 100 });
    } else {
      shape = new Circle({ left: 300, top: 200, fill: color, radius: 50 });
    }
    fabricCanvas.add(shape);
    fabricCanvas.setActiveObject(shape);
    fabricCanvas.renderAll();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas) return;
    
    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      FabricImage.fromURL(data).then((img) => {
        img.scaleToWidth(200);
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    if (activeObject && fabricCanvas) {
      activeObject.set('fill', newColor);
      fabricCanvas.renderAll();
    }
  };

  const bringForward = () => {
    if (fabricCanvas && activeObject) {
      fabricCanvas.bringObjectForward(activeObject);
      fabricCanvas.renderAll();
    }
  };

  const sendBackward = () => {
    if (fabricCanvas && activeObject) {
      fabricCanvas.sendObjectBackwards(activeObject);
      fabricCanvas.renderAll();
    }
  };

  const handleDelete = () => {
    if (fabricCanvas && activeObject) {
      fabricCanvas.remove(activeObject);
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
    }
  };

  const handleSaveAndAddToCart = async () => {
    if (!fabricCanvas) return;
    if (!product) {
      toast.error("Please select a product before saving.");
      return;
    }

    setLoading(true);
    try {
      const canvasJson = JSON.stringify(fabricCanvas.toJSON());
      const previewImage = fabricCanvas.toDataURL({ format: 'png', quality: 0.8, multiplier: 1 });
      
      const design = {
        product_id: product.id,
        canvas_data: canvasJson,
        preview_image_url: previewImage,
        status: 'pending'
      };

      addItem({
        product,
        quantity: 1,
        design
      });

      toast.success("Design saved to cart!");
      navigate('/cart');
    } catch (err) {
      console.error(err);
      toast.error("Failed to save design.");
    } finally {
      setLoading(false);
    }
  const handleSaveDesignToAccount = async () => {
    if (!fabricCanvas) return;
    if (!product) {
      toast.error("Please select a product before saving.");
      return;
    }

    if (!isAuthenticated || user?.role !== 'customer') {
      toast.error("Please login to save your custom designs.");
      return;
    }

    setLoading(true);
    try {
      const canvasJson = JSON.stringify(fabricCanvas.toJSON());
      const previewImage = fabricCanvas.toDataURL({ format: 'png', quality: 0.8, multiplier: 1 });
      
      await api.post('/designs', {
        product_id: product.id,
        canvas_data: canvasJson,
        preview_image_url: previewImage
      });

      toast.success("Design saved to your account!");
      navigate('/my-designs');
    } catch (err) {
      console.error(err);
      toast.error("Failed to save design.");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = async (templateJson: string) => {
    if (!fabricCanvas) return;
    try {
      await fabricCanvas.loadFromJSON(JSON.parse(templateJson));
      fabricCanvas.renderAll();
    } catch (error) {
      console.error("Failed to load template", error);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem', maxWidth: '1400px' }}>
      {/* Header Toolbar */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '1rem' }}>
        <div>
          <h2 className="text-gradient" style={{ margin: 0 }}>Design Studio</h2>
          {product && <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Editing: {product.name} (₹{product.base_price})</div>}
        </div>
        
          <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => fabricCanvas?.clear()}>Clear Canvas</button>
          {isAuthenticated && user?.role === 'customer' && (
            <button 
              className="btn btn-secondary" 
              onClick={handleSaveDesignToAccount}
              disabled={loading || !product}
            >
              Save to My Designs
            </button>
          )}
          <button 
            className="btn btn-primary" 
            onClick={handleSaveAndAddToCart}
            disabled={loading || !product}
          >
            {loading ? 'Processing...' : (product ? 'Add to Cart' : 'Select Product')}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 250px', gap: '1.5rem', minHeight: '650px' }}>
        
        {/* Left Sidebar - Elements */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Elements</h3>
          <button className="btn btn-secondary" onClick={addText}>Add Text</button>
          <button className="btn btn-secondary" onClick={() => addShape('rect')}>Add Rectangle</button>
          <button className="btn btn-secondary" onClick={() => addShape('circle')}>Add Circle</button>
          
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <label className="btn btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer' }}>
              Upload Image
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            </label>
          </div>

          {templates.length > 0 && (
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Templates</h4>
              {templates.map(tpl => (
                <button key={tpl.id} className="btn btn-secondary" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={() => loadTemplate(tpl.canvas_data)}>
                  {tpl.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center - Canvas Area */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#e2e8f0', padding: 0, overflow: 'hidden', position: 'relative' }}>
          <div style={{ boxShadow: 'var(--shadow-lg)', backgroundColor: 'white' }}>
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Properties</h3>
          
          {activeObject ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label>Color:</label>
                <input type="color" value={color} onChange={handleColorChange} style={{ background: 'none', border: 'none', cursor: 'pointer', height: '30px', width: '30px' }} />
              </div>
              
              {activeObject.type === 'i-text' && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <label>Text Properties:</label>
                  <select 
                    className="input-field" 
                    value={activeObject.get('fontFamily') || 'Outfit'}
                    onChange={(e) => {
                      activeObject.set('fontFamily', e.target.value);
                      fabricCanvas?.renderAll();
                      forceUpdate();
                    }}
                  >
                    <option value="Outfit">Outfit</option>
                    <option value="Arial">Arial</option>
                    <option value="Pacifico">Pacifico</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Cinzel">Cinzel</option>
                    <option value="Dancing Script">Dancing Script</option>
                    <option value="Righteous">Righteous</option>
                    <option value="Permanent Marker">Permanent Marker</option>
                  </select>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85rem' }}>Size:</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      style={{ padding: '0.2rem 0.5rem', flex: 1 }}
                      value={activeObject.get('fontSize') || 40}
                      onChange={(e) => {
                        activeObject.set('fontSize', parseInt(e.target.value, 10));
                        fabricCanvas?.renderAll();
                        forceUpdate();
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ flex: 1, fontWeight: 'bold', background: activeObject.get('fontWeight') === 'bold' ? 'var(--color-primary)' : '', color: activeObject.get('fontWeight') === 'bold' ? 'white' : '' }}
                      onClick={() => {
                        const newWeight = activeObject.get('fontWeight') === 'bold' ? 'normal' : 'bold';
                        activeObject.set('fontWeight', newWeight);
                        fabricCanvas?.renderAll();
                        forceUpdate();
                      }}
                    >
                      B
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ flex: 1, fontStyle: 'italic', background: activeObject.get('fontStyle') === 'italic' ? 'var(--color-primary)' : '', color: activeObject.get('fontStyle') === 'italic' ? 'white' : '' }}
                      onClick={() => {
                        const newStyle = activeObject.get('fontStyle') === 'italic' ? 'normal' : 'italic';
                        activeObject.set('fontStyle', newStyle);
                        fabricCanvas?.renderAll();
                        forceUpdate();
                      }}
                    >
                      I
                    </button>
                  </div>
                </div>
              )}
              
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label>Layer Ordering:</label>
                <button className="btn btn-secondary" onClick={bringForward}>Bring Forward</button>
                <button className="btn btn-secondary" onClick={sendBackward}>Send Backward</button>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: 'auto' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', color: 'white', backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }} 
                  onClick={handleDelete}
                >
                  Delete Selected
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem 0', borderBottom: '1px solid var(--color-border)' }}>
                Select an element to edit its properties.
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                <label>Canvas Background:</label>
                <input 
                  type="color" 
                  value={bgColor} 
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setBgColor(newColor);
                    if (fabricCanvas) {
                      fabricCanvas.backgroundColor = newColor;
                      fabricCanvas.renderAll();
                    }
                  }} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', height: '30px', width: '30px' }} 
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DesignBuilder;
