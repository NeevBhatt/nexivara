import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function DoctorDashboard() {
  const { user, profile, signOut } = useAuth()
  const [summary, setSummary] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDoctorData() {
      try {
        setLoading(true)
        const { data: docData, error: docErr } = await supabase
          .from('doctors')
          .select('id')
          .eq('profile_id', user.id)
          .single()

        if (docErr) throw docErr

        const [sumRes, notifRes] = await Promise.all([
          supabase.from('doctor_appointment_summary').select('*').eq('doctor_id', docData.id).single(),
          supabase.from('notifications').select('*').eq('profile_id', user.id).order('created_at', { ascending: false })
        ])

        if (sumRes.error && sumRes.error.code !== 'PGRST116') throw sumRes.error
        setSummary(sumRes.data)
        setNotifications(notifRes.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user) loadDoctorData()
  }, [user])

  const markAllNotificationsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('profile_id', user.id)

      if (!error) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-lg shadow-sm gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600">Welcome, Dr. {profile?.full_name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                if (!showNotifications && unreadCount > 0) markAllNotificationsRead()
              }}
              className="relative px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 flex items-center gap-2"
            >
              <span>🔔 Alerts</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <Link to="/doctor/schedule" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
              Manage Schedule
            </Link>
            <Link to="/doctor/appointments" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
              Appointments
            </Link>
            <button onClick={() => signOut()} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>

        {/* Notifications Dropdown Panel */}
        {showNotifications && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Recent Notifications & Bookings</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Close ✕
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No notifications yet.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-md text-sm ${notif.is_read ? 'bg-gray-50 text-gray-600' : 'bg-blue-50 text-blue-900 font-medium'}`}
                  >
                    <p className="font-semibold">{notif.title}</p>
                    <p className="text-xs mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm">{error}</div>}

        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading dashboard...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.total_appointments || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Appointments</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{summary?.pending_appointments || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Appointments</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{summary?.completed_appointments || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Rating</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">★ {summary?.average_rating || '0.00'}</p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-600 hover:underline text-sm">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
