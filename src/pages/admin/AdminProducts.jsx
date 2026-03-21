import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { categories } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';

export default function AdminProducts() {
  const toast = useToast();
  const [productList, setProductList] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/admin/products');
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

  const filtered = productList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !catFilter || p.category === catFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProductList(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Failed to delete product');
      console.error(err);
    }
  };

  const handleApprove = async (id, status) => {
    try {
      const { data } = await api.put(`/admin/products/${id}/approve`, { approvalStatus: status });
      if (data.success) {
        setProductList(prev => prev.map(p => p._id === id ? { ...p, approvalStatus: status } : p));
        toast.success(`Product ${status} successfully`);
      }
    } catch (err) {
      toast.error('Failed to update status');
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Product Management</h1>
        <p className="page-subtitle">Manage all marketplace products</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input-field py-2 w-auto min-w-[150px]">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-style">
            <thead><tr><th>Product</th><th>Category</th><th>Vendor</th><th>Price</th><th>Stock</th><th>Status</th><th>Rating</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={p.images[0] || 'https://via.placeholder.com/150'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium truncate max-w-[180px]">{p.name}</span>
                    </div>
                  </td>
                  <td><span className="badge-blue">{p.category}</span></td>
                  <td className="text-sm text-surface-600">{p.vendorName || p.vendorId || 'Unknown'}</td>
                  <td className="font-semibold">₹{p.price.toLocaleString()}</td>
                  <td><span className={p.stock > 20 ? 'badge-green' : p.stock > 5 ? 'badge-yellow' : 'badge-red'}>{p.stock}</span></td>
                  <td><span className={p.approvalStatus === 'approved' ? 'badge-green' : p.approvalStatus === 'pending' ? 'badge-yellow' : 'badge-red'}>{p.approvalStatus || 'approved'}</span></td>
                  <td>⭐ {(p.rating || 0).toFixed(1)}</td>
                  <td>
                    <div className="flex gap-1 items-center">
                      {p.approvalStatus === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(p._id, 'approved')} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleApprove(p._id, 'rejected')} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <Link to={`/product/${p._id}`} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500"><Eye className="w-4 h-4" /></Link>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="8" className="text-center py-4 text-surface-500">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
