import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function DoctorProfile() {
  const { id } = useParams()
  const { user, profile } = useAuth()

  const [doctor, setDoctor] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [reviews, setReviews] = useState([])
  const [patientId, setPatientId] = useState(null)
  const [doctorProfileId, setDoctorProfileId] = useState(null)

  // Booking form state
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [reason, setReason] = useState('')

  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadDoctorDetails() {
      try {
        setLoading(true)
        const [docRes, schedRes, patRes, revRes, docRec] = await Promise.all([
          supabase.from('doctor_appointment_summary').select('*').eq('doctor_id', id).single(),
          supabase.from('doctor_schedules').select('*').eq('doctor_id', id).eq('is_available', true),
          supabase.from('patients').select('id').eq('profile_id', user.id).single(),
          supabase.from('reviews').select('id, rating, comment, created_at, patients(profiles(full_name))').eq('doctor_id', id).order('created_at', { ascending: false }),
          supabase.from('doctors').select('profile_id').eq('id', id).single()
        ])

        if (docRes.error) throw docRes.error
        setDoctor(docRes.data)
        setSchedules(schedRes.data || [])
        if (patRes.data) setPatientId(patRes.data.id)
        setReviews(revRes.data || [])
        if (docRec.data) setDoctorProfileId(docRec.data.profile_id)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (id && user) loadDoctorDetails()
  }, [id, user])

  const handleBookAppointment = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBookingLoading(true)

    try {
      if (!patientId) throw new Error('Patient profile not found for current user')

      const { error: bookErr } = await supabase.from('appointments').insert([
        {
          patient_id: patientId,
          doctor_id: id,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          reason,
          status: 'pending'
        }
      ])

      if (bookErr) throw bookErr

      // Send notification to doctor
      if (doctorProfileId) {
        await supabase.from('notifications').insert([
          {
            profile_id: doctorProfileId,
            title: 'New Appointment Request',
            message: `${profile?.full_name || 'A patient'} requested an appointment on ${appointmentDate} at ${appointmentTime}.`,
            type: 'appointment_booked'
          }
        ])
      }

      setSuccess('Appointment booked successfully! Status is pending confirmation from the doctor.')
      setAppointmentDate('')
      setAppointmentTime('')
      setReason('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBookingLoading(false)
    }
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600">Loading doctor profile...</p></div>
  }

  if (!doctor) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600">Doctor not found.</p></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/patient/doctors" className="text-blue-600 hover:underline text-sm font-medium">← Back to Doctor Search</Link>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6 text-sm">{success}</div>}

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{doctor.doctor_name}</h1>
              <p className="text-blue-600 font-semibold text-lg">{doctor.specialization}</p>
              <p className="text-gray-600 text-sm mt-1">{doctor.qualification} • {doctor.experience} years experience</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">${doctor.consultation_fee}</span>
              <p className="text-xs text-gray-500">Consultation Fee</p>
            </div>
          </div>
          <div className="flex items-center text-sm text-yellow-600 mt-2">
            <span>★ {doctor.average_rating} ({doctor.total_reviews} reviews)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Available Schedules</h2>
            {schedules.length === 0 ? (
              <p className="text-gray-500 text-sm">No specific weekly availability listed.</p>
            ) : (
              <ul className="space-y-2">
                {schedules.map(sch => (
                  <li key={sch.id} className="bg-gray-50 p-3 rounded-md flex justify-between text-sm">
                    <span className="font-semibold text-gray-700">{daysOfWeek[sch.day_of_week]}</span>
                    <span className="text-gray-600">{sch.start_time} - {sch.end_time}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Book Appointment</h2>
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Appointment Date</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Appointment Time</label>
                <input
                  type="time"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
                <textarea
                  required
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your symptoms or reason for visit..."
                />
              </div>
              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {bookingLoading ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </div>
        </div>

        {/* Patient Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Patient Reviews & Ratings</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet for this doctor.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(rev => (
                <div key={rev.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                      {rev.patients?.profiles?.full_name || 'Patient'}
                    </span>
                    <span className="text-yellow-600 text-sm font-bold">
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </span>
                  </div>
                  {rev.comment && <p className="text-gray-600 text-sm mt-1">{rev.comment}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(rev.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
