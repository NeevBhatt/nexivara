import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function DoctorAppointments() {
  const { user, profile } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true)
        const { data: docData, error: docErr } = await supabase
          .from('doctors')
          .select('id')
          .eq('profile_id', user.id)
          .single()

        if (docErr) throw docErr

        const { data: apptData, error: apptErr } = await supabase
          .from('patient_appointment_history')
          .select('*')
          .eq('doctor_id', docData.id)
          .order('appointment_date', { ascending: false })

        if (apptErr) throw apptErr
        setAppointments(apptData || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (user) loadAppointments()
  }, [user])

  const updateStatus = async (appt, newStatus) => {
    try {
      setError('')
      setSuccess('')
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appt.appointment_id)

      if (error) throw error

      setAppointments(appointments.map(a =>
        a.appointment_id === appt.appointment_id ? { ...a, status: newStatus } : a
      ))

      // Notify the patient
      if (appt.patient_profile_id) {
        await supabase.from('notifications').insert([
          {
            profile_id: appt.patient_profile_id,
            title: `Appointment ${newStatus.toUpperCase()}`,
            message: `Dr. ${profile?.full_name || 'Your doctor'} has marked your appointment on ${appt.appointment_date} at ${appt.appointment_time} as ${newStatus}.`,
            type: `appointment_${newStatus}`
          }
        ])
      }

      setSuccess(`Appointment status successfully updated to ${newStatus}.`)
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredAppointments = statusFilter
    ? appointments.filter(a => a.status === statusFilter)
    : appointments

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Appointments</h1>
            <p className="text-gray-600">Review and manage patient appointments</p>
          </div>
          <Link to="/doctor/dashboard" className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700">
            Dashboard
          </Link>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6 text-sm">{success}</div>}

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Appointment Requests</h2>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading appointments...</p>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No appointments found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.appointment_id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{appt.patient_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{appt.appointment_date} {appt.appointment_time}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">{appt.reason || 'N/A'}</td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {appt.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(appt, 'confirmed')}
                            className="text-green-600 hover:text-green-900 font-semibold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateStatus(appt, 'rejected')}
                            className="text-red-600 hover:text-red-900 font-semibold"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {appt.status === 'confirmed' && (
                        <button
                          onClick={() => updateStatus(appt, 'completed')}
                          className="text-blue-600 hover:text-blue-900 font-semibold"
                        >
                          Mark Completed
                        </button>
                      )}
                      {(appt.status === 'confirmed' || appt.status === 'completed') && !appt.has_prescription && (
                        <Link
                          to={`/doctor/prescription/new?appointmentId=${appt.appointment_id}&patientId=${appt.patient_id}`}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold"
                        >
                          + Prescription
                        </Link>
                      )}
                      {appt.has_prescription && (
                        <span className="text-green-600 text-xs font-semibold">
                          Rx Issued ✓
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-600 hover:underline text-sm">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
