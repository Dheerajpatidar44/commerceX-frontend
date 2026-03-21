import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, Store } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';

export default function AdminVendors() {
  const toast = useToast();
  const [vendorList, setVendorList] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const { data } = await api.get('/admin/vendors');
        if (data.success) {
          setVendorList(data.vendors);
        }
      } catch (err) {
        toast.error('Failed to load vendors');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, [toast]);

  const pending = vendorList.filter(v => v.approvalStatus === 'pending');
  const approved = vendorList.filter(v => v.approvalStatus === 'approved');

  const handleAction = async (id, status) => {
    try {
      const { data } = await api.put(`/admin/vendors/${id}`, { approvalStatus: status });
      if (data.success) {
        setVendorList(prev => prev.map(v => v._id === id ? { ...v, approvalStatus: status } : v));
        setSelectedVendor(null);
        toast.success(`Vendor ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      }
    } catch (err) {
      toast.error('Failed to update vendor status');
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex justify-center items-center"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Vendor Management</h1>
        <p className="page-subtitle">Approve, reject, and manage vendor applications</p>
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="text-lg font-display font-semibold text-surface-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Pending Approvals ({pending.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.map(v => (
              <div key={v._id} className="card p-5 border-l-4 border-l-amber-500">
                <div className="flex items-center gap-3 mb-3">
                  <img src={v.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + v.name} className="w-10 h-10 rounded-full bg-surface-100" alt="" />
                  <div><p className="font-semibold text-sm">{v.name}</p><p className="text-xs text-surface-500">{v.email}</p></div>
                </div>
                <div className="flex items-center gap-2 mb-3"><Store className="w-4 h-4 text-surface-400" /><span className="text-sm font-medium">{v.storeName || 'N/A'}</span></div>
                <p className="text-xs text-surface-500 mb-4">Applied on {new Date(v.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(v._id, 'approved')} className="btn-primary btn-sm flex-1 justify-center"><CheckCircle className="w-3.5 h-3.5" /> Approve</button>
                  <button onClick={() => handleAction(v._id, 'rejected')} className="btn-danger btn-sm flex-1 justify-center"><XCircle className="w-3.5 h-3.5" /> Reject</button>
                  <button onClick={() => setSelectedVendor(v)} className="btn-ghost btn-sm"><Eye className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-display font-semibold text-surface-900 mb-3">All Vendors</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-style">
              <thead><tr><th>Vendor</th><th>Store</th><th>Products</th><th>Revenue</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {vendorList.map(v => (
                  <tr key={v._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={v.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + v.name} className="w-8 h-8 rounded-full bg-surface-100" alt="" />
                        <div><p className="font-medium text-sm">{v.name}</p><p className="text-xs text-surface-500">{v.email}</p></div>
                      </div>
                    </td>
                    <td className="font-medium">{v.storeName || 'N/A'}</td>
                    <td>{v.products || 0}</td>
                    <td className="font-semibold">₹{(v.revenue || 0).toLocaleString()}</td>
                    <td><span className={v.approvalStatus === 'approved' ? 'badge-green' : v.approvalStatus === 'pending' ? 'badge-yellow' : 'badge-red'}>{v.approvalStatus}</span></td>
                    <td><button onClick={() => setSelectedVendor(v)} className="btn-ghost btn-sm"><Eye className="w-4 h-4" /></button></td>
                  </tr>
                ))}
                {vendorList.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-4 text-surface-500">No vendors found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={!!selectedVendor} onClose={() => setSelectedVendor(null)} title="Vendor Details" size="md">
        {selectedVendor && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={selectedVendor.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + selectedVendor.name} className="w-14 h-14 rounded-full bg-surface-100" alt="" />
              <div>
                <p className="font-semibold text-lg">{selectedVendor.name}</p>
                <p className="text-sm text-surface-500">{selectedVendor.email}</p>
                <span className={selectedVendor.approvalStatus === 'approved' ? 'badge-green' : selectedVendor.approvalStatus === 'pending' ? 'badge-yellow' : 'badge-red'}>{selectedVendor.approvalStatus}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="card p-3"><p className="text-surface-500">Store</p><p className="font-semibold">{selectedVendor.storeName || 'N/A'}</p></div>
              <div className="card p-3"><p className="text-surface-500">Products</p><p className="font-semibold">{selectedVendor.products || 0}</p></div>
              <div className="card p-3"><p className="text-surface-500">Revenue</p><p className="font-semibold">₹{(selectedVendor.revenue || 0).toLocaleString()}</p></div>
              <div className="card p-3"><p className="text-surface-500">Orders</p><p className="font-semibold">{selectedVendor.orders || 0}</p></div>
            </div>
            {selectedVendor.approvalStatus === 'pending' && (
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleAction(selectedVendor._id, 'approved')} className="btn-primary flex-1 justify-center">Approve</button>
                <button onClick={() => handleAction(selectedVendor._id, 'rejected')} className="btn-danger flex-1 justify-center">Reject</button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
