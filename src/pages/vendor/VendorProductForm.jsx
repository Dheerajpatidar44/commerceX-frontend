import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Upload, X, Loader2 } from 'lucide-react';
import { categories } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';

export default function VendorProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: categories[0],
    stock: '',
  });

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          if (data.success) {
            const p = data.product;
            setForm({
              name: p.name,
              description: p.description,
              price: p.price,
              category: p.category,
              stock: p.stock,
            });
            setImages(p.images || []);
          }
        } catch (err) {
          toast.error('Failed to load product details');
          console.error(err);
          navigate('/vendor/products');
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, navigate, toast]);

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    
    try {
      const payload = { ...form, images };
      if (isEdit) {
        await api.put(`/vendor/products/${id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/vendor/products', payload);
        toast.success('Product added successfully!');
      }
      navigate('/vendor/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  if (fetching) return <div className="min-h-[60vh] flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        <p className="page-subtitle">{isEdit ? 'Update product details' : 'Fill in the details to list a new product'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <div>
            <label className="input-label">Product Name *</label>
            <input className="input-field" placeholder="e.g. Wireless Headphones" value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea className="input-field min-h-[120px] resize-none" placeholder="Describe your product..." value={form.description} onChange={e => update('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Price (₹) *</label>
              <input type="number" className="input-field" placeholder="2999" value={form.price} onChange={e => update('price', e.target.value)} required />
            </div>
            <div>
              <label className="input-label">Category</label>
              <select className="input-field" value={form.category} onChange={e => update('category', e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Stock *</label>
              <input type="number" className="input-field" placeholder="100" value={form.stock} onChange={e => update('stock', e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <label className="input-label">Product Images</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {images.map((img, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-surface-200 group">
                <img src={img || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <input 
              type="file" 
              accept="image/*" 
              id="image-upload" 
              className="hidden" 
              onChange={handleImageUpload} 
            />
            <button type="button" onClick={() => document.getElementById('image-upload').click()}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-surface-300 flex flex-col items-center justify-center gap-1 text-surface-400 hover:border-brand-400 hover:text-brand-500 transition-colors">
              <Upload className="w-5 h-5" />
              <span className="text-[10px]">Add Image</span>
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary btn-lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> {isEdit ? 'Update Product' : 'Add Product'}</>}
          </button>
          <button type="button" onClick={() => navigate('/vendor/products')} className="btn-secondary btn-lg">Cancel</button>
        </div>
      </form>
    </div>
  );
}
