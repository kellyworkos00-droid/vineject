export default function Analytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trends</h3>
          <div className="text-sm text-gray-500">Sales analytics and trend charts</div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Analysis</h3>
          <div className="text-sm text-gray-500">Revenue breakdown and projections</div>
        </div>
      </div>
    </div>
  );
}
