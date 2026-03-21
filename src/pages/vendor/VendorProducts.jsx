import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Eye } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';

export default function VendorProducts() {
  const toast = useToast();
  const [productList, setProductList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/vendor/products');
        if (data.success) {
          setProductList(data.products);
        }
      } catch (err) {
        toast.error('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);

  const filtered = productList.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/vendor/products/${id}`);
      setProductList(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error('Failed to delete product');
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{productList.length} products in your store</p>
        </div>
        <Link to="/vendor/products/add" className="btn-primary"><Plus className="w-4 h-4" /> Add Product</Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-style">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Rating</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={p.images[0] || 'https://via.placeholder.com/150'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium text-surface-900 truncate max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td><span className="badge-blue">{p.category}</span></td>
                  <td className="font-semibold">₹{p.price.toLocaleString()}</td>
                  <td><span className={p.stock > 20 ? 'badge-green' : p.stock > 5 ? 'badge-yellow' : 'badge-red'}>{p.stock} units</span></td>
                  <td><span className={p.approvalStatus === 'approved' ? 'badge-green' : p.approvalStatus === 'pending' ? 'badge-yellow' : 'badge-red'}>{p.approvalStatus || 'approved'}</span></td>
                  <td>⭐ {(p.rating || 0).toFixed(1)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link to={`/product/${p._id}`} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500"><Eye className="w-4 h-4" /></Link>
                      <Link to={`/vendor/products/edit/${p._id}`} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-4 h-4" /></Link>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-surface-500">No products found</div>}
      </div>
    </div>
  );
}
