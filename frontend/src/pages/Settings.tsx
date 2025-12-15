export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Gateways</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Stripe</h4>
                <p className="text-sm text-gray-500">Accept payments via Stripe</p>
              </div>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                Configure
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">PayPal</h4>
                <p className="text-sm text-gray-500">Accept payments via PayPal</p>
              </div>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                Configure
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Square</h4>
                <p className="text-sm text-gray-500">Accept payments via Square</p>
              </div>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                Configure
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Plugins</h3>
          <div className="text-sm text-gray-500">
            Manage installed plugins and extensions
          </div>
        </div>
      </div>
    </div>
  );
}
