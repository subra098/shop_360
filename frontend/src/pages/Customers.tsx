import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Phone, MapPin, Search } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const fetchCustomers = () => {
    api.get('/customers').then(res => setCustomers(res.data));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/customers', formData);
    fetchCustomers();
    setIsModalOpen(false);
  };

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <div className="p-4 relative min-h-full">
      <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-4 items-center">
        <Search className="text-gray-400 mx-2" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or phone" 
          className="flex-1 outline-none p-1 text-sm bg-transparent"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3 pb-24">
        {filtered.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
            <h3 className="font-bold text-gray-800">{c.name}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <Phone size={14} className="mr-2 text-primary" /> {c.phone}
            </div>
            {c.address && (
              <div className="flex items-start text-sm text-gray-500">
                <MapPin size={14} className="mr-2 mt-0.5 text-gray-400" /> {c.address}
              </div>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={() => { setFormData({ name: '', phone: '', address: '' }); setIsModalOpen(true); }}
        className="fixed bottom-24 right-4 bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-30"
      >
        <Plus size={24} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Add Customer</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required type="text" placeholder="Name" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="text" placeholder="Phone Number" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <textarea placeholder="Address (optional)" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-24 resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
