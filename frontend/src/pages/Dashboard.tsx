import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/analytics/dashboard');
      return response.data.data;
    },
  });

  const cards = [
    { 
      title: 'Total Products', 
      value: stats?.totalProducts || 0, 
      icon: Package, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+12%'
    },
    { 
      title: 'Total Orders', 
      value: stats?.totalOrders || 0, 
      icon: ShoppingCart, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      change: '+23%'
    },
    { 
      title: 'Total Customers', 
      value: stats?.totalCustomers || 0, 
      icon: Users, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: '+8%'
    },
    { 8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome to KellyOS - Your complete ERP solution
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg">
          <TrendingUp className="w-5 h-5" />
          <span className="font-semibold">All Systems Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title} 
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden card-hover"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`${card.bgColor} rounded-xl p-3`}>
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                    <ArrowUpRight className="w-4 h-4" />
                    {card.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {card.value}
                  </p>
                </div>
              </div>
              <div className={`h-1 bg-gradient-to-r ${card.color}`}></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <ShoppingCart className="w-12 h-12 mb-3" />
            <p className="text-sm">No recent orders to display</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Package className="w-12 h-12 mb-3" />
            <p className="text-sm">All products are well stocked</p>
          
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
          <div className="text-sm text-gray-500">No recent orders to display</div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Low Stock Alerts</h3>
          <div className="text-sm text-gray-500">All products are well stocked</div>
        </div>
      </div>
    </div>
  );
}
