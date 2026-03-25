import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, Search, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Category {
  id: number;
  name: string;
  productCount?: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  categoryId: number | null;
  category: Category | null;
}

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: 0, name: '', price: '', quantity: '', categoryId: '' });
  const [categoryName, setCategoryName] = useState('');

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      categoryId: formData.categoryId ? Number(formData.categoryId) : null
    };
    
    try {
      if (formData.id) {
        await api.put(`/products/${formData.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      alert('Failed to save product');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/categories', { name: categoryName });
      setCategoryName('');
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Failed to add category');
    }
  };

  const editProduct = (p: Product) => {
    setFormData({ 
      id: p.id, 
      name: p.name, 
      price: p.price.toString(), 
      quantity: p.quantity.toString(), 
      categoryId: p.categoryId?.toString() || '' 
    });
    setIsModalOpen(true);
  };

  const deleteProduct = async (id: number) => {
    if (confirm('Are you sure?')) {
      await api.delete(`/products/${id}`);
      fetchData();
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 relative min-h-full">
      <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-4 items-center">
        <Search className="text-gray-400 mx-2" size={20} />
        <input 
          type="text" 
          placeholder="Search products..." 
          className="flex-1 outline-none p-1 text-sm bg-transparent"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button 
          onClick={() => setIsCategoryModalOpen(true)}
          className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <Tag size={16} />
          Categories
        </button>
      </div>

      <div className="space-y-3 pb-24">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">{p.name}</h3>
                {p.category && (
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 font-medium capitalize">
                    {p.category.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Stock: <span className={p.quantity < 5 ? 'text-red-500 font-bold' : ''}>{p.quantity}</span> • ₹{p.price}</p>
            </div>
            {user?.role === 'ADMIN' && (
              <div className="flex flex-col gap-2">
                <button onClick={() => editProduct(p)} className="p-2 border border-blue-200 text-blue-500 rounded-lg hover:bg-blue-50"><Edit2 size={16}/></button>
                <button onClick={() => deleteProduct(p.id)} className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={16}/></button>
              </div>
            )}
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">No products found</div>
        )}
      </div>

      {user?.role === 'ADMIN' && (
        <button 
          onClick={() => { setFormData({ id: 0, name: '', price: '', quantity: '', categoryId: '' }); setIsModalOpen(true); }}
          className="fixed bottom-24 right-4 bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-30"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">{formData.id ? 'Edit' : 'Add'} Product</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required type="text" placeholder="Name" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 ring-primary/20" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <div className="flex gap-2">
                <input required type="number" placeholder="Price (₹)" className="w-1/2 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 ring-primary/20" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                <input required type="number" placeholder="Quantity" className="w-1/2 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 ring-primary/20" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-gray-500 px-1">Category</label>
                <select 
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 ring-primary/20"
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="">No Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/20">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal (Simple) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Manage Categories</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400">✕</button>
            </div>
            
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input 
                required 
                type="text" 
                placeholder="New category..." 
                className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 ring-primary/20" 
                value={categoryName} 
                onChange={e => setCategoryName(e.target.value)} 
              />
              <button type="submit" className="bg-primary text-white p-3 rounded-xl"><Plus size={20}/></button>
            </form>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg text-sm">
                  <span className="font-medium text-gray-700">{cat.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{cat.productCount} Items</span>
                    <button 
                      onClick={async () => {
                        if(confirm('Delete category?')) {
                          try { await api.delete(`/categories/${cat.id}`); fetchData(); } 
                          catch (e: any) { alert(e.response?.data?.error || 'Failed to delete'); }
                        }
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && <p className="text-center text-xs text-gray-400 py-4">No categories added</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
