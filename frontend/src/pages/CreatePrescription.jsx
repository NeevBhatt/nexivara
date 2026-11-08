import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function CreatePrescription() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const appointmentId = searchParams.get('appointmentId')
  const patientId = searchParams.get('patientId')

  const [doctorId, setDoctorId] = useState(null)
  const [medicines, setMedicines] = useState([])
  const [selectedMedicineId, setSelectedMedicineId] = useState('')

  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('')
  const [duration, setDuration] = useState('')
  const [instructions, setInstructions] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [docRes, medRes] = await Promise.all([
          supabase.from('doctors').select('id').eq('profile_id', user.id).single(),
          supabase.from('medicines').select('*')
        ])

        if (docRes.error) throw docRes.error
        if (medRes.error) throw medRes.error

        setDoctorId(docRes.data.id)
        setMedicines(medRes.data || [])
        if (medRes.data && medRes.data.length > 0) {
          setSelectedMedicineId(medRes.data[0].id)
        }
      } catch (err) {
        setError(err.message)
      }
    }
    if (user) loadInitialData()
  }, [user])

  const handleCreatePrescription = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!appointmentId || !patientId) throw new Error('Missing appointment or patient reference')

      // 1. Insert prescription
      const { data: rxData, error: rxErr } = await supabase
        .from('prescriptions')
        .insert([
          {
            appointment_id: appointmentId,
            patient_id: patientId,
            doctor_id: doctorId,
            diagnosis,
            notes
          }
        ])
        .select()
        .single()

      if (rxErr) throw rxErr

      // 2. Insert prescription medicine
      const { error: pmErr } = await supabase
        .from('prescription_medicines')
        .insert([
          {
            prescription_id: rxData.id,
            medicine_id: selectedMedicineId,
            dosage,
            frequency,
            duration,
            instructions
          }
        ])

      if (pmErr) throw pmErr

      // 3. Mark appointment as completed
      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId)

      // 4. Send notification to patient if patient profile is found
      const { data: patRec } = await supabase
        .from('patients')
        .select('profile_id')
        .eq('id', patientId)
        .single()

      if (patRec?.profile_id) {
        await supabase.from('notifications').insert([
          {
            profile_id: patRec.profile_id,
            title: 'Prescription Issued',
            message: 'Your doctor has issued a new prescription. You can view details in My Prescriptions.',
            type: 'prescription_added'
          }
        ])
      }

      setSuccess('Prescription created successfully! Appointment marked as completed.')
      setTimeout(() => navigate('/doctor/appointments'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link to="/doctor/appointments" className="text-blue-600 hover:underline text-sm font-medium">← Back to Appointments</Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Prescription</h1>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6 text-sm">{success}</div>}

          <form onSubmit={handleCreatePrescription} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Bronchitis"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Clinical Notes</label>
              <textarea
                rows="2"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional advice or notes..."
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-md font-bold text-gray-800 mb-3">Medicine Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Medicine</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    value={selectedMedicineId}
                    onChange={(e) => setSelectedMedicineId(e.target.value)}
                  >
                    {medicines.map((med) => (
                      <option key={med.id} value={med.id}>{med.name} ({med.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dosage</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500mg"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frequency</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Twice daily"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 days"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Take after meals"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 mt-6"
            >
              {loading ? 'Creating Prescription...' : 'Save & Issue Prescription'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
