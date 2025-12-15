export default function Inventory() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Add Product
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-sm text-gray-500">
          Inventory management interface - Product listing, stock levels, and warehouse management
        </div>
      </div>
    </div>
  );
}
