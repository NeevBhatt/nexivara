export default function AdminDashboardTest() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-purple-600 mb-2">Admin Portal Test</h1>
        <p className="text-gray-600">Access granted for Admin role.</p>
        <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">Back to Home</a>
      </div>
    </div>
  )
}
