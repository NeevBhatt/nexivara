import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function PatientDashboard() {
  const { user, profile, signOut } = useAuth()
  const [patientId, setPatientId] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Review modal state
  const [reviewModalAppt, setReviewModalAppt] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  useEffect(() => {
    async function loadPatientData() {
      try {
        setLoading(true)
        // Get patient record id
        const { data: patData, error: patErr } = await supabase
          .from('patients')
          .select('id')
          .eq('profile_id', user.id)
          .single()

        if (patErr) throw patErr
        setPatientId(patData.id)

        // Fetch appointments using patient_appointment_history view
        const { data: apptData, error: apptErr } = await supabase
          .from('patient_appointment_history')
          .select('*')
          .eq('patient_id', patData.id)
          .order('appointment_date', { ascending: false })

        if (apptErr) throw apptErr
        setAppointments(apptData || [])

        // Fetch user notifications
        const { data: notifData, error: notifErr } = await supabase
          .from('notifications')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false })

        if (!notifErr) {
          setNotifications(notifData || [])
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user) loadPatientData()
  }, [user])

  const handleCancelAppointment = async (appt) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return

    try {
      setActionLoading(true)
      setError('')
      setSuccess('')

      const { error: cancelErr } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appt.appointment_id)

      if (cancelErr) throw cancelErr

      // Update local state
      setAppointments(appointments.map(a =>
        a.appointment_id === appt.appointment_id ? { ...a, status: 'cancelled' } : a
      ))

      // Send notification to doctor if profile id is known
      if (appt.doctor_profile_id) {
        await supabase.from('notifications').insert([
          {
            profile_id: appt.doctor_profile_id,
            title: 'Appointment Cancelled',
            message: `${profile?.full_name || 'A patient'} cancelled the appointment on ${appt.appointment_date} at ${appt.appointment_time}.`,
            type: 'appointment_cancelled'
          }
        ])
      }

      setSuccess('Appointment successfully cancelled.')
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewModalAppt) return

    try {
      setActionLoading(true)
      setError('')
      setSuccess('')

      const { error: revErr } = await supabase.from('reviews').insert([
        {
          appointment_id: reviewModalAppt.appointment_id,
          doctor_id: reviewModalAppt.doctor_id,
          patient_id: patientId,
          rating: parseInt(rating),
          comment: comment.trim()
        }
      ])

      if (revErr) throw revErr

      // Update appointment locally to mark has_review = true
      setAppointments(appointments.map(a =>
        a.appointment_id === reviewModalAppt.appointment_id ? { ...a, has_review: true } : a
      ))

      setSuccess('Thank you! Your review has been submitted.')
      setReviewModalAppt(null)
      setComment('')
      setRating(5)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
            <p className="text-gray-600">Welcome, {profile?.full_name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                if (!showNotifications && unreadCount > 0) markAllNotificationsRead()
              }}
              className="relative px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 flex items-center gap-2"
            >
              <span>🔔 Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <Link to="/patient/doctors" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
              Find Doctors
            </Link>
            <Link to="/patient/prescriptions" className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
              My Prescriptions
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
              <h3 className="font-bold text-gray-900">Recent Notifications</h3>
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

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6 text-sm">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">My Appointments</h2>
          {loading ? (
            <p className="text-gray-500 py-4 text-center">Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You have no appointments booked yet.</p>
              <Link to="/patient/doctors" className="text-blue-600 font-medium hover:underline">
                Browse doctors and book an appointment
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appt) => (
                    <tr key={appt.appointment_id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{appt.doctor_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{appt.specialization}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{appt.appointment_date} {appt.appointment_time}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          appt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">{appt.reason || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {/* Cancel button for pending/confirmed appointments */}
                        {(appt.status === 'pending' || appt.status === 'confirmed') && (
                          <button
                            onClick={() => handleCancelAppointment(appt)}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-900 font-semibold"
                          >
                            Cancel
                          </button>
                        )}

                        {/* Review button for completed appointments */}
                        {appt.status === 'completed' && !appt.has_review && (
                          <button
                            onClick={() => setReviewModalAppt(appt)}
                            className="text-indigo-600 hover:text-indigo-900 font-semibold"
                          >
                            Leave Review
                          </button>
                        )}
                        {appt.status === 'completed' && appt.has_review && (
                          <span className="text-yellow-600 text-xs font-semibold">★ Reviewed</span>
                        )}

                        {/* Prescription link if available */}
                        {appt.has_prescription && (
                          <Link
                            to="/patient/prescriptions"
                            className="text-green-600 hover:text-green-900 font-semibold ml-2"
                          >
                            Prescription
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Leave Review Modal */}
        {reviewModalAppt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Review Dr. {reviewModalAppt.doctor_name}</h3>
              <p className="text-xs text-gray-500 mb-4">
                Appointment on {reviewModalAppt.appointment_date} ({reviewModalAppt.specialization})
              </p>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                    <option value="3">⭐⭐⭐ 3 - Good</option>
                    <option value="2">⭐⭐ 2 - Fair</option>
                    <option value="1">⭐ 1 - Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feedback / Comment</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Share your experience with this consultation..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setReviewModalAppt(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
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
