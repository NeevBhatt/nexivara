import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Home() {
  const { user, profile, signOut, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading Nexivara...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🏥 Nexivara
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Smart Healthcare Appointment & Management System
        </p>

        {user ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md text-left">
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="font-semibold text-gray-900">{profile?.full_name || user.email}</p>
              <p className="text-xs text-blue-600 uppercase font-semibold mt-1">Role: {profile?.role || 'User'}</p>
              <p className="text-xs text-gray-500 mt-1">Email: {user.email}</p>
            </div>
            {profile?.role && (
              <Link
                to={`/${profile.role}/dashboard`}
                className="block w-full py-2 px-4 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Go to {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} Dashboard
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Login
            </Link>
               
            <Link to="/register" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
