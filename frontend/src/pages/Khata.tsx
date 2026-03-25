import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, BookOpen, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface KhataTransaction {
  id: number;
  customerId: number;
  customer: { name: string; phone: string; };
  amount: number;
  type: string;
  notes: string;
  createdAt: string;
}

const Khata = () => {
  const [transactions, setTransactions] = useState<KhataTransaction[]>([]);
  const [customers, setCustomers] = useState<{id: number, name: string}[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ customerId: '', amount: '', type: 'PAYMENT_RECEIVED', notes: '' });

  const [summary, setSummary] = useState({ totalSales: 0, cashCollected: 0, totalCredit: 0 });
  const [unifiedEntries, setUnifiedEntries] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PAID' | 'CREDIT'>('ALL');

  const fetchData = async () => {
    try {
      const [txRes, orderRes, cusRes] = await Promise.all([
        api.get('/khata'),
        api.get('/orders'),
        api.get('/customers')
      ]);
      
      setCustomers(cusRes.data);
      const khataTxs = txRes.data;
      const orders = orderRes.data;

      const today = new Date().toLocaleDateString();

      // Filter and Merge Data
      const todayOrders = orders.filter((o: any) => new Date(o.createdAt).toLocaleDateString() === today);
      const todayKhata = khataTxs.filter((t: any) => new Date(t.createdAt).toLocaleDateString() === today);

      // De-duplicate: Remove Khata transactions that are automatically generated from Orders
      // (They usually have notes starting with "Order #")
      const manualKhata = todayKhata.filter((t: any) => !t.notes?.startsWith('Order #'));

      // Calculate Summary
      const totalSales = todayOrders.reduce((acc: number, o: any) => acc + o.finalAmount, 0);
      const cashCollected = todayOrders.filter((o: any) => o.paymentMethod !== 'KHATA').reduce((acc: number, o: any) => acc + o.finalAmount, 0);
      const ledgerPayments = manualKhata.filter((t: any) => t.type === 'PAYMENT_RECEIVED').reduce((acc: number, t: any) => acc + t.amount, 0);
      const creditGivenManual = manualKhata.filter((t: any) => t.type === 'CREDIT_GIVEN').reduce((acc: number, t: any) => acc + t.amount, 0);
      const creditGivenOrders = todayOrders.filter((o: any) => o.paymentMethod === 'KHATA').reduce((acc: number, o: any) => acc + o.finalAmount, 0);

      setSummary({ 
        totalSales, 
        cashCollected: cashCollected + ledgerPayments, 
        totalCredit: creditGivenManual + creditGivenOrders 
      });

      // Unified Feed
      const feed = [
        ...todayOrders.map((o: any) => ({
          id: `order-${o.id}`,
          originalId: o.id,
          source: 'ORDER',
          name: o.customer?.name || 'Walk-in Customer',
          amount: o.finalAmount,
          method: o.paymentMethod,
          type: o.paymentMethod === 'KHATA' ? 'CREDIT' : 'SALE',
          notes: `Sale · ${o.paymentMethod}`,
          createdAt: o.createdAt,
          items: o.items || []
        })),
        ...manualKhata.map((t: any) => ({
          id: `khata-${t.id}`,
          originalId: t.id,
          source: 'KHATA',
          name: t.customer?.name || 'Walk-in Customer',
          amount: t.amount,
          type: t.type === 'PAYMENT_RECEIVED' ? 'PAYMENT' : 'CREDIT',
          notes: t.notes || 'Ledger entry',
          createdAt: t.createdAt
        }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setUnifiedEntries(feed);
      setTransactions(khataTxs); // Still keep for editing purposes if needed
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/khata/${editingId}`, formData);
      } else {
        await api.post('/khata', formData);
      }
      fetchData();
      setIsModalOpen(false);
      setEditingId(null);
    } catch (error) {
      alert('Failed to save entry');
    }
  };

  const handleEdit = (t: KhataTransaction) => {
    setEditingId(t.id);
    setFormData({ 
      customerId: String(t.customerId || ''),
      amount: String(t.amount), 
      type: t.type, 
      notes: t.notes || '' 
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await api.delete(`/khata/${id}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete entry');
      }
    }
  };

  return (
    <div className="p-4 relative min-h-full pb-32 bg-gray-50/30 font-sans">
      {/* Header Dashboard */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-[2rem] shadow-2xl text-white mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <BookOpen size={120} strokeWidth={4} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
              <BookOpen size={18} className="text-orange-400" />
            </div>
            <h2 className="text-lg font-black italic tracking-tighter">Daily Ledger (Khata)</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-6">
            <div 
              onClick={() => setActiveFilter('ALL')}
              className={`cursor-pointer transition-all border rounded-2xl p-3 backdrop-blur-md ${
                activeFilter === 'ALL' ? "bg-white/10 border-white/40 scale-[1.05] ring-4 ring-white/5" : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-1 text-[8px] font-black text-white/50 uppercase tracking-widest mb-1">
                <TrendingUp size={10} className="text-blue-400" /> Total Sales
              </div>
              <p className="text-lg font-black italic tracking-tighter text-blue-400">₹{summary.totalSales}</p>
            </div>
            <div 
              onClick={() => setActiveFilter('PAID')}
              className={`cursor-pointer transition-all border rounded-2xl p-3 backdrop-blur-md ${
                activeFilter === 'PAID' ? "bg-white/10 border-white/40 scale-[1.05] ring-4 ring-white/5" : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-1 text-[8px] font-black text-white/50 uppercase tracking-widest mb-1">
                <TrendingUp size={10} className="text-green-400" /> Cash/Paid
              </div>
              <p className="text-lg font-black italic tracking-tighter text-green-400">₹{summary.cashCollected}</p>
            </div>
            <div 
              onClick={() => setActiveFilter('CREDIT')}
              className={`cursor-pointer transition-all border rounded-2xl p-3 backdrop-blur-md ${
                activeFilter === 'CREDIT' ? "bg-white/10 border-white/40 scale-[1.05] ring-4 ring-white/5" : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-1 text-[8px] font-black text-white/50 uppercase tracking-widest mb-1">
                <TrendingDown size={10} className="text-red-400" /> Net Credit
              </div>
              <p className="text-lg font-black italic tracking-tighter text-red-400">₹{summary.totalCredit}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between px-2">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[4px]">
          {activeFilter === 'ALL' ? 'Recent Entries' : `${activeFilter} records`}
        </h3>
        <button onClick={() => setActiveFilter('ALL')} className={`text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full transition-all ${
          activeFilter === 'ALL' ? 'bg-gray-100 text-gray-400 opacity-0' : 'bg-primary/10 text-primary opacity-100'
        }`}>
          Clear Filter
        </button>
      </div>

      <div className="space-y-4">
        {unifiedEntries
          .filter(e => {
            if (activeFilter === 'ALL') return true;
            if (activeFilter === 'PAID') return e.type === 'PAYMENT' || (e.type === 'SALE' && e.method !== 'KHATA');
            if (activeFilter === 'CREDIT') return e.type === 'CREDIT';
            return true;
          })
          .map(e => (
          <div key={e.id} className="space-y-2">
            <div 
              onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
              className={`bg-white p-5 rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border transition-all flex justify-between items-center group cursor-pointer ${
                expandedId === e.id ? "border-primary/30 ring-4 ring-primary/5" : "border-transparent hover:border-orange-100"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                    e.source === 'ORDER' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'
                  }`}>
                    {e.source === 'ORDER' ? 'Sale' : 'Manual'}
                  </span>
                  {e.method && (
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 uppercase tracking-tighter">
                      {e.method}
                    </span>
                  )}
                </div>
                <h3 className="font-black text-gray-900 text-base italic leading-none truncate">{e.name}</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-1 italic">
                  {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {e.notes}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-right ${e.type === 'PAYMENT' || (e.type === 'SALE' && e.method !== 'KHATA') ? 'text-green-600' : 'text-red-600'}`}>
                  <p className="text-[9px] font-black uppercase tracking-tighter opacity-60">
                    {e.type}
                  </p>
                  <p className="font-black text-xl italic tracking-tighter leading-none mt-1">
                    {e.type === 'PAYMENT' || (e.type === 'SALE' && e.method !== 'KHATA') ? '+' : '-'}₹{e.amount}
                  </p>
                </div>
                {e.source === 'KHATA' && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(event) => { event.stopPropagation(); handleEdit(transactions.find(t => t.id === e.originalId)!); }} className="p-2 text-gray-300 hover:text-blue-500 transition-colors"><Edit2 size={16}/></button>
                    <button onClick={(event) => { event.stopPropagation(); handleDelete(e.originalId); }} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                )}
              </div>
            </div>

            {/* Expanded Item List */}
            {expandedId === e.id && (
              <div className="mx-4 bg-gray-50/50 rounded-2xl p-4 border border-gray-100 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-2">
                   <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Transaction Details</h4>
                   <div className="h-[1px] flex-1 bg-gray-100 mx-3"></div>
                </div>
                
                {e.source === 'ORDER' ? (
                  <div className="space-y-2">
                    {e.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-white/40 p-2 rounded-xl border border-white">
                        <div className="flex-1">
                          <p className="text-xs font-black text-gray-800 italic">{item.product?.name || 'Deleted Product'}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{item.quantity} x ₹{item.price}</p>
                        </div>
                        <p className="text-xs font-black text-gray-900 italic">₹{item.quantity * item.price}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">
                      Manual ledger adjustment recorded at {new Date(e.createdAt).toLocaleTimeString()} for {e.name}.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {unifiedEntries.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center opacity-20">
            <BookOpen size={60} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">No records for today</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => { setEditingId(null); setFormData({ customerId: '', amount: '', type: 'PAYMENT_RECEIVED', notes: '' }); setIsModalOpen(true); }}
        className="fixed bottom-24 right-6 bg-gray-900 text-white p-5 rounded-[1.5rem] shadow-2xl hover:bg-orange-500 hover:scale-110 transition-all z-30 active:scale-90"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-[400px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Plus size={100} className={editingId ? 'rotate-45' : ''} />
            </div>
            <h3 className="text-2xl font-black italic text-gray-900 tracking-tighter">{editingId ? 'Edit Record' : 'Add New Entry'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Daily Customner</label>
                <select required className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/5 transition-all appearance-none" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                  <option value="">Select Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                  <input required type="number" placeholder="0" className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-orange-500/5 transition-all" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Entry Type</label>
                  <select required className="w-full p-4 bg-gray-50 border-none rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-orange-500/5 transition-all" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="PAYMENT_RECEIVED">PAID (+)</option>
                    <option value="CREDIT_GIVEN">CREDIT (-)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Notes / Description</label>
                <input type="text" placeholder="Optional notes..." className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/5 transition-all" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-gray-400 bg-gray-50 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all shadow-lg active:scale-95">
                   {editingId ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Khata;
