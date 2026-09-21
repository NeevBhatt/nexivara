export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🏥 Nexivara
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Smart Healthcare Appointment & Management System
        </p>
        <p className="text-sm text-gray-500 mb-6">
          React + Vite + Tailwind CSS + Supabase
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Login
          </a>
          <a href="/register" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Register
          </a>
        </div>
      </div>
    </div>
  )
}
