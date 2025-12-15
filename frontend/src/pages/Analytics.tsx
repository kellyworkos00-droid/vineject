import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../lib/api';

type SalesAnalytics = {
  timeseries: { date: string; orders: number; revenue: number }[];
  paymentTimeseries: { date: string; revenue: number }[];
  topProducts: { name: string; revenue: number }[];
  totals: { orders: number; revenue: number; avgOrderValue: number };
};

type InventoryAnalytics = {
  lowStockCount: number;
  totalStock: number;
  stockValue: number;
  categoryBreakdown: { category: string; quantity: number }[];
  movements: { date: string; net: number }[];
};

type CustomerAnalytics = {
  newCustomers: { date: string; count: number }[];
  topCustomers: { name: string; lifetimeValue: number; orders: number }[];
};

type RevenueAnalytics = {
  byGateway: { gateway: string; revenue: number }[];
  timeseries: { date: string; revenue: number }[];
  totalRevenue: number;
};

const gatewayColors: Record<string, string> = {
  stripe: '#6366f1',
  paypal: '#0ea5e9',
  square: '#f59e0b',
  default: '#10b981',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
}

export default function Analytics() {
  const [range, setRange] = useState('30');
  const [channel, setChannel] = useState('all');

  const salesQuery = useQuery<SalesAnalytics>({
    queryKey: ['salesAnalytics', range, channel],
    queryFn: async () => {
      const response = await api.get('/analytics/sales', { params: { range, channel } });
      return response.data.data;
    },
  });

  const revenueQuery = useQuery<RevenueAnalytics>({
    queryKey: ['revenueAnalytics', range, channel],
    queryFn: async () => {
      const response = await api.get('/analytics/revenue', { params: { range, channel } });
      return response.data.data;
    },
  });

  const inventoryQuery = useQuery<InventoryAnalytics>({
    queryKey: ['inventoryAnalytics', range],
    queryFn: async () => {
      const response = await api.get('/analytics/inventory', { params: { range } });
      return response.data.data;
    },
  });

  const customerQuery = useQuery<CustomerAnalytics>({
    queryKey: ['customerAnalytics', range],
    queryFn: async () => {
      const response = await api.get('/analytics/customer', { params: { range } });
      return response.data.data;
    },
  });

  const isLoading = salesQuery.isLoading || revenueQuery.isLoading || inventoryQuery.isLoading || customerQuery.isLoading;

  const rangeOptions = [
    { label: '7d', value: '7' },
    { label: '30d', value: '30' },
    { label: '90d', value: '90' },
  ];

  const channelOptions = [
    { label: 'All', value: 'all' },
    { label: 'Stripe', value: 'stripe' },
    { label: 'PayPal', value: 'paypal' },
    { label: 'Square', value: 'square' },
  ];

  const revenueByGateway = useMemo(() => revenueQuery.data?.byGateway || [], [revenueQuery.data]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-sm text-gray-600">Track sales, revenue, inventory, and customer health.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-3 py-2 text-sm rounded-lg border ${range === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
            >
              {opt.label}
            </button>
          ))}
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700"
          >
            {channelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Orders</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{salesQuery.data?.totals.orders ?? 0}</p>
          <p className="text-xs text-gray-400">Across selected period</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{formatCurrency(salesQuery.data?.totals.revenue || 0)}</p>
          <p className="text-xs text-gray-400">Completed payments</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Avg Order Value</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{formatCurrency(salesQuery.data?.totals.avgOrderValue || 0)}</p>
          <p className="text-xs text-gray-400">Revenue / order</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Low Stock Items</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{inventoryQuery.data?.lowStockCount ?? 0}</p>
          <p className="text-xs text-gray-400">Need attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Performance</h3>
            {isLoading && <span className="text-xs text-gray-400">Loading…</span>}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesQuery.data?.timeseries || []} margin={{ left: -20 }}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} dot={false} name="Orders" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={false} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Gateway</h3>
            {isLoading && <span className="text-xs text-gray-400">Loading…</span>}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenueByGateway} dataKey="revenue" nameKey="gateway" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {revenueByGateway.map((entry) => (
                    <Cell key={entry.gateway} fill={gatewayColors[entry.gateway] || gatewayColors.default} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">Total: {formatCurrency(revenueQuery.data?.totalRevenue || 0)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
            {isLoading && <span className="text-xs text-gray-400">Loading…</span>}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesQuery.data?.topProducts || []} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">New Customers</h3>
            {isLoading && <span className="text-xs text-gray-400">Loading…</span>}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={customerQuery.data?.newCustomers || []} margin={{ left: -20 }}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Top Customers</h4>
            <div className="space-y-2">
              {(customerQuery.data?.topCustomers || []).map((cust) => (
                <div key={cust.name} className="flex items-center justify-between text-sm">
                  <div className="font-medium text-gray-800">{cust.name}</div>
                  <div className="text-gray-500">{formatCurrency(cust.lifetimeValue)} · {cust.orders} orders</div>
                </div>
              ))}
              {!customerQuery.data?.topCustomers?.length && <p className="text-sm text-gray-400">No customers yet.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Movements</h3>
            {isLoading && <span className="text-xs text-gray-400">Loading…</span>}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inventoryQuery.data?.movements || []} margin={{ left: -20 }}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="net" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock by Category</h3>
            {isLoading && <span className="text-xs text-gray-400">Loading…</span>}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryQuery.data?.categoryBreakdown || []} margin={{ left: -20 }}>
                <XAxis dataKey="category" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">Stock value: {formatCurrency(inventoryQuery.data?.stockValue || 0)}</div>
        </div>
      </div>
    </div>
  );
}
