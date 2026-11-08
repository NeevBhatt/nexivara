import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function DoctorSchedule() {
  const { user } = useAuth()
  const [doctorId, setDoctorId] = useState(null)
  const [schedules, setSchedules] = useState([])

  // New schedule form
  const [dayOfWeek, setDayOfWeek] = useState('1')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  useEffect(() => {
    async function loadSchedule() {
      try {
        setLoading(true)
        const { data: docData, error: docErr } = await supabase
          .from('doctors')
          .select('id')
          .eq('profile_id', user.id)
          .single()

        if (docErr) throw docErr
        setDoctorId(docData.id)

        const { data: schedData, error: schedErr } = await supabase
          .from('doctor_schedules')
          .select('*')
          .eq('doctor_id', docData.id)
          .order('day_of_week')

        if (schedErr) throw schedErr
        setSchedules(schedData || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (user) loadSchedule()
  }, [user])

  const handleAddSchedule = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const { error: insErr } = await supabase.from('doctor_schedules').insert([
        {
          doctor_id: doctorId,
          day_of_week: parseInt(dayOfWeek),
          start_time: startTime,
          end_time: endTime,
          is_available: true
        }
      ])

      if (insErr) throw insErr

      setSuccess('Availability schedule added successfully!')
      // Refresh list
      const { data } = await supabase.from('doctor_schedules').select('*').eq('doctor_id', doctorId).order('day_of_week')
      setSchedules(data || [])
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('doctor_schedules').delete().eq('id', id)
      if (error) throw error
      setSchedules(schedules.filter(s => s.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Schedule</h1>
            <p className="text-gray-600">Set your weekly availability slots</p>
          </div>
          <Link to="/doctor/dashboard" className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700">
            Dashboard
          </Link>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6 text-sm">{success}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-1">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Add Schedule Slot</h2>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Day of Week</label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                >
                  {daysOfWeek.map((day, idx) => (
                    <option key={idx} value={idx}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Add Schedule
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Current Schedules</h2>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading schedules...</p>
            ) : schedules.length === 0 ? (
              <p className="text-gray-500 text-sm">No schedule slots configured.</p>
            ) : (
              <div className="space-y-3">
                {schedules.map((sch) => (
                  <div key={sch.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-md">
                    <div>
                      <p className="font-bold text-gray-800">{daysOfWeek[sch.day_of_week]}</p>
                      <p className="text-sm text-gray-600">{sch.start_time} - {sch.end_time}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(sch.id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-xs font-semibold hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
