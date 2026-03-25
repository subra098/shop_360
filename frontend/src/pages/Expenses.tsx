import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Receipt, Trash2 } from 'lucide-react';

interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ amount: '', category: 'Stock', description: '', date: new Date().toISOString().substring(0,10) });

  const fetchExpenses = async () => {
    const res = await api.get('/expenses');
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/expenses', formData);
    fetchExpenses();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this expense?')) {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    }
  };

  return (
    <div className="p-4 relative min-h-full pb-24">
      <div className="bg-gradient-to-r from-teal-400 to-emerald-500 p-5 rounded-2xl shadow-lg text-white mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Receipt size={20} />
            <h2 className="font-semibold text-sm opacity-90">Daily Expenses</h2>
          </div>
          <p className="text-2xl font-bold mt-2">
            ₹{expenses.reduce((acc, curr) => acc + curr.amount, 0)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {expenses.map(e => (
          <div key={e.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{e.category}</h3>
              <p className="text-xs text-gray-400 mt-1">{new Date(e.date).toLocaleDateString()} • {e.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-red-500 text-sm">₹{e.amount}</span>
              <button onClick={() => handleDelete(e.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
        {expenses.length === 0 && <p className="text-center text-gray-500 mt-10">No expenses recorded yet.</p>}
      </div>

      <button 
        onClick={() => { setFormData({ amount: '', category: 'Stock', description: '', date: new Date().toISOString().substring(0,10) }); setIsModalOpen(true); }}
        className="fixed bottom-24 right-4 bg-teal-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-30"
      >
        <Plus size={24} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Add Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required type="number" placeholder="Amount (₹)" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              <div className="flex gap-2">
                <select required className="w-1/2 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Electricity">Electricity</option>
                  <option value="Rent">Rent</option>
                  <option value="Salary">Salary</option>
                  <option value="Stock">Stock / Items</option>
                  <option value="Travel">Travel</option>
                  <option value="Misc">Miscellaneous</option>
                </select>
                <input required type="date" className="w-1/2 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <input type="text" placeholder="Description (optional)" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
