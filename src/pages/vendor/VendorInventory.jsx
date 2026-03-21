import { useState, useEffect } from 'react';
import { AlertTriangle, Package, Save, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';

export default function VendorInventory() {
  const toast = useToast();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/vendor/products');
      if (data.success) {
        setInventory(data.products.map(p => ({ ...p, newStock: p.stock })));
      }
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const lowStock = inventory.filter(p => p.stock < 20);

  const updateStock = (id, val) => {
    setInventory(prev => prev.map(p => p._id === id ? { ...p, newStock: parseInt(val) || 0 } : p));
  };

  const saveStock = async (id, newStock) => {
    try {
      setSavingId(id);
      const { data } = await api.put(`/vendor/inventory/${id}`, { stock: newStock });
      if (data.success) {
        setInventory(prev => prev.map(p => p._id === id ? { ...p, stock: newStock } : p));
        toast.success('Stock updated successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Inventory Management</h1>
        <p className="page-subtitle">Track and update your product stock levels</p>
      </div>

      {lowStock.length > 0 && (
        <div className="card p-5 border-l-4 border-l-amber-500 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Low Stock Alert</p>
              <p className="text-sm text-amber-700">{lowStock.length} products are running low on stock</p>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-style">
            <thead><tr><th>Product</th><th>Category</th><th>Current Stock</th><th>Status</th><th>Update Stock</th><th>Action</th></tr></thead>
            <tbody>
              {inventory.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium truncate max-w-[180px]">{p.name}</span>
                    </div>
                  </td>
                  <td><span className="badge-blue">{p.category}</span></td>
                  <td className="font-semibold">{p.stock}</td>
                  <td><span className={p.stock > 20 ? 'badge-green' : p.stock > 5 ? 'badge-yellow' : 'badge-red'}>{p.stock > 20 ? 'In Stock' : p.stock > 5 ? 'Low Stock' : 'Critical'}</span></td>
                  <td><input type="number" className="input-field py-1.5 px-2 text-sm w-20" value={p.newStock} onChange={e => updateStock(p._id, e.target.value)} min="0" /></td>
                  <td>
                    <button onClick={() => saveStock(p._id, p.newStock)} disabled={savingId === p._id} className="btn-primary btn-sm">
                      {savingId === p._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
