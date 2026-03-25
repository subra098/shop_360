import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Package, Users, IndianRupee, TrendingUp, Activity } from 'lucide-react';

interface Summary {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalExpenses: number;
  totalSales: number;
  todaySales: number;
}

const Dashboard = () => {
  const [data, setData] = useState<Summary | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/summary').then(res => setData(res.data));
  }, []);

  if (!data) return <div className="p-4 flex justify-center mt-10"><Activity className="animate-spin text-primary" /></div>;

  return (
    <div className="p-4 space-y-4">
      <div className="bg-primary text-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-sm font-medium opacity-80 mb-1">Total Sales</h2>
        <p className="text-3xl font-bold flex items-center">
          <IndianRupee size={28} className="mr-1" /> {data.totalSales.toLocaleString()}
        </p>
        <div className="mt-4 flex justify-between text-sm bg-black/10 p-2 rounded-xl">
          <span>Today's Sales</span>
          <span className="font-semibold flex items-center"><IndianRupee size={14}/> {data.todaySales}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => navigate('/inventory')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:border-blue-200 transition-all active:scale-95"
        >
          <div className="bg-blue-50 text-blue-500 p-3 rounded-full mb-2">
            <Package size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{data.totalProducts}</h3>
          <p className="text-xs text-gray-500 font-medium tracking-wide">PRODUCTS</p>
        </div>

        <div 
          onClick={() => navigate('/customers')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:border-purple-200 transition-all active:scale-95"
        >
          <div className="bg-purple-50 text-purple-500 p-3 rounded-full mb-2">
            <Users size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{data.totalCustomers}</h3>
          <p className="text-xs text-gray-500 font-medium tracking-wide">CUSTOMERS</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <div className="bg-red-50 text-red-500 p-3 rounded-full mb-2">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800"><span className="text-sm">₹</span>{data.totalExpenses}</h3>
          <p className="text-xs text-gray-500 font-medium tracking-wide">EXPENSES</p>
        </div>
        
        <div 
          onClick={() => navigate('/khata')}
          className="bg-white p-4 rounded-2xl shadow-[0_0_15px_rgba(var(--color-primary),0.1)] outline outline-1 outline-primary/30 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all active:scale-95"
        >
          <h3 className="text-2xl font-bold text-gray-800">{data.totalOrders}</h3>
          <p className="text-xs text-primary font-medium tracking-wide">BILLS MADE</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
