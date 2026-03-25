import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Users, LogOut, Store } from 'lucide-react';

interface Owner {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
}

const SuperAdminDashboard = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await api.get('/superadmin/owners');
        setOwners(res.data);
      } catch (error) {
        console.error('Failed to fetch owners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOwners();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-dark text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Store size={24} />
          <h1 className="text-xl font-bold tracking-wide">Dukaan360 SuperAdmin</h1>
        </div>
        <button onClick={() => { logout(); window.location.href='/login'; }} className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors">
          <LogOut size={16} /> Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-full text-primary">
            <Users size={32} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Registered Shops</p>
            <p className="text-3xl font-bold text-gray-800">{loading ? '...' : owners.length}</p>
          </div>
        </div>

        {/* Owners List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800">Shop Owners Directory</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">Loading owners...</td>
                  </tr>
                ) : owners.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">No shop owners found.</td>
                  </tr>
                ) : (
                  owners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-medium text-gray-800">{owner.name}</td>
                      <td className="p-4 text-gray-600 font-mono text-sm">{owner.phone}</td>
                      <td className="p-4 text-gray-600">{owner.email || '-'}</td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(owner.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
