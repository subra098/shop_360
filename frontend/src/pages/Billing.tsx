import { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShoppingCart, Plus, Minus, Trash2, Search, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Product { id: number; name: string; price: number; quantity: number; }
interface CartItem extends Product { cartQuantity: number; }

const Billing = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes] = await Promise.all([
        api.get('/products')
      ]);
      setProducts(pRes.data);
    } catch (err: any) {
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) return alert('This item is out of stock!');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.cartQuantity >= product.quantity) return alert('Cannot add more than available stock');
      setCart(cart.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, cartQuantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const newQ = item.cartQuantity + delta;
        if (newQ <= 0) return null; 
        if (product && newQ > product.quantity) { alert('Stock limit reached'); return item; }
        return { ...item, cartQuantity: newQ };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const clearCart = () => { if(window.confirm('Are you sure you want to clear the current bill?')) setCart([]); };

  const total = cart.reduce((acc, item) => acc + (item.price * item.cartQuantity), 0);
  const finalAmount = Math.max(0, total - discount);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Please add items to the bill first');
    if (paymentMethod === 'KHATA' && !customerName && !customerPhone) return alert('Please provide Customer Name or Phone for Khata (Credit) payment');

    try {
      const payload = {
        customerId: null, // Always null for manual entry, backend will find or create
        customerName,
        customerPhone,
        discount,
        paymentMethod,
        items: cart.map(i => ({ productId: i.id, quantity: i.cartQuantity, price: i.price }))
      };
      const res = await api.post('/orders', payload);
      generatePDF(res.data.id, res.data.customer); // Pass the final customer object from backend
      setCart([]);
      setDiscount(0);
      setCustomerName('');
      setCustomerPhone('');
      alert('Bill Generated Successfully!');
      fetchData(); 
    } catch (err) {
      alert('Checkout Failed. Check your connection.');
    }
  };

  const generatePDF = (orderId: number, finalCustomer?: any) => {
    const doc = new jsPDF();
    doc.setFontSize(24);
    doc.setTextColor(17, 24, 39);
    doc.text("Dukaan360 INVOICE", 105, 25, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Invoice No: INV-${orderId}`, 20, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 52);
    doc.text(`Payment: ${paymentMethod}`, 20, 59);

    const displayCustomer = finalCustomer || { name: customerName, phone: customerPhone };
    if (displayCustomer.name || displayCustomer.phone) {
      doc.text(`Customer: ${displayCustomer.name || 'N/A'}`, 140, 45);
      doc.text(`Phone: ${displayCustomer.phone || 'N/A'}`, 140, 52);
    }
    
    let y = 80;
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(243, 244, 246);
    doc.rect(20, y-7, 170, 10, 'F');
    doc.text("Item Name", 25, y);
    doc.text("Qty", 110, y);
    doc.text("Total", 170, y);
    y += 10;
    
    doc.setFont("helvetica", "normal");
    cart.forEach(item => {
      doc.text(item.name, 25, y);
      doc.text(item.cartQuantity.toString(), 110, y);
      doc.text(`${item.price * item.cartQuantity}`, 170, y);
      y += 8;
    });
    
    y += 10;
    doc.line(20, y, 190, y);
    y += 10;
    doc.text(`Subtotal: ${total}`, 140, y);
    y += 8;
    doc.text(`Discount: ${discount}`, 140, y);
    y += 12;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Bill: Rs ${finalAmount}`, 130, y);

    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text("Thank you for your business!", 105, 280, { align: "center" });
    doc.save(`Dukaan360_Bill_${orderId}.pdf`);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-gray-50 overflow-hidden font-sans">

      {/* Top Section: Available Items */}
      <div className="h-[35%] flex flex-col p-4 overflow-hidden border-b border-gray-100 bg-white">
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900 italic tracking-tighter">Available Items</h2>
            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
               {products.length} Items
            </span>
          </div>
          <button onClick={fetchData} className="p-1.5 text-gray-400 hover:text-primary transition-all">
             <Plus size={20} className="rotate-45" />
          </button>
        </div>

        <div className="mb-3 bg-gray-50 rounded-2xl p-2 flex items-center gap-3 border border-gray-100 focus-within:border-primary/30 transition-all">
          <Search size={18} className="text-gray-400 ml-2" />
          <input 
            className="bg-transparent border-none outline-none w-full text-sm font-bold placeholder:text-gray-400" 
            placeholder="Search products..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="p-2 text-gray-400 hover:text-primary">
            {viewMode === 'grid' ? <FileText size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
             <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
             </div>
          ) : products.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 py-10">
               <ShoppingCart size={40} className="opacity-10 mb-2" />
               <p className="text-[10px] font-black uppercase tracking-widest">Store Inventory Empty</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-3" : "space-y-2"}>
              {filteredProducts.map(p => {
                const cartItem = cart.find(i => i.id === p.id);
                if (viewMode === 'grid') {
                  return (
                    <div key={p.id} onClick={() => p.quantity > 0 && addToCart(p)} className={`bg-white rounded-2xl p-3 cursor-pointer transition-all border shadow-sm active:scale-95 ${cartItem ? "border-primary bg-primary/5" : "border-gray-50 hover:border-primary/20"}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-gray-900 text-xs italic leading-tight truncate mr-1">{p.name}</h3>
                        <span className="text-sm font-black text-primary italic shrink-0">₹{p.price}</span>
                      </div>
                      <div className="flex justify-between items-center mt-auto">
                        <p className={`text-[8px] font-black px-1.5 py-0.5 rounded ${p.quantity > 5 ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>STOCK: {p.quantity}</p>
                        {cartItem && <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{cartItem.cartQuantity}</span>}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={p.id} onClick={() => p.quantity > 0 && addToCart(p)} className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all border shadow-sm active:scale-[0.98] ${cartItem ? "bg-primary/5 border-primary" : "bg-white border-gray-50"}`}>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-gray-900 text-sm italic truncate">{p.name}</h4>
                      <p className="text-[9px] text-gray-400 font-black uppercase mt-0.5">₹{p.price} · {p.quantity} Left</p>
                    </div>
                    {cartItem && <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold">{cartItem.cartQuantity}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Billing Cart */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">
        <div className="p-4 bg-white border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 italic tracking-tighter">Selected Bill</h2>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
               {cart.reduce((a,b)=>a+b.cartQuantity,0)} Items in Bill
            </p>
          </div>
          {cart.length > 0 && <button onClick={clearCart} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={18} /></button>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-200 py-10">
              <ShoppingCart size={80} className="opacity-10 mb-5" />
              <p className="text-xs font-black uppercase tracking-[3px] italic text-center px-10 leading-relaxed">Select products from the list above to add them to this bill</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-all active:scale-[0.99]">
                <div className="flex-1">
                  <h4 className="font-black text-gray-900 text-sm italic leading-none">{item.name}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase mt-2">₹{item.price} each</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-100 p-1.5">
                  <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} className="p-1 hover:text-primary text-gray-400 transition-colors"><Minus size={16} strokeWidth={3} /></button>
                  <span className="w-5 text-center text-sm font-black text-gray-900">{item.cartQuantity}</span>
                  <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} className="p-1 hover:text-primary text-gray-400 transition-colors"><Plus size={16} strokeWidth={3} /></button>
                </div>
                <div className="text-right min-w-[70px]">
                  <span className="font-black text-lg text-gray-900 italic tracking-tighter">₹{item.price * item.cartQuantity}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Footer */}
        <div className="p-6 bg-white border-t border-gray-100 space-y-5 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] pb-12">
          <div className="grid grid-cols-2 gap-4">
            <div>
               <input type="text" placeholder="Customer Name" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-primary/20 transition-all" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>
            <div>
               <input type="text" placeholder="Phone No" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-primary/20 transition-all" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
            </div>
            <div>
              <select className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-black outline-none ring-1 ring-gray-100" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="KHATA">KHATA</option>
              </select>
            </div>
            <div>
              <input type="number" placeholder="Discount ₹" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-black outline-none ring-1 ring-gray-100" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} />
            </div>
          </div>

          <div className="flex items-center justify-between mb-2 px-2">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Payable</span>
             <span className="text-3xl font-black italic tracking-tighter text-gray-900">₹{finalAmount}</span>
          </div>

          <button 
            onClick={handleCheckout} 
            disabled={cart.length === 0}
            className={`w-full font-black text-base py-4 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
              cart.length > 0 ? "bg-gray-900 text-white hover:bg-primary shadow-lg" : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            <FileText size={20} /> PRINT BILL
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
