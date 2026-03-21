import { useState, useEffect } from 'react';
import { Search, Trash2, Users as UsersIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';

export default function AdminUsers() {
  const toast = useToast();
  const [userList, setUserList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/admin/users');
        if (data.success) {
          setUserList(data.users);
        }
      } catch (err) {
        toast.error('Failed to load users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  const filtered = userList.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUserList(prev => prev.filter(u => u._id !== id));
      toast.success('User removed');
    } catch (err) {
      toast.error('Failed to delete user');
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage registered users</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-style">
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={u.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + u.name} className="w-8 h-8 rounded-full bg-surface-100" alt="" />
                      <div><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-surface-500">{u.email}</p></div>
                    </div>
                  </td>
                  <td><span className="badge-purple capitalize">{u.role}</span></td>
                  <td><span className="badge-green">Active</span></td>
                  <td className="text-xs text-surface-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td><button onClick={() => handleDelete(u._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-surface-500">No users found</div>}
      </div>
    </div>
  );
}
