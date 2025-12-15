export default function Sales() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Sales & Orders</h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          New Order
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-sm text-gray-500">
          Sales management interface - Orders, invoices, and payment processing
        </div>
      </div>
    </div>
  );
}
