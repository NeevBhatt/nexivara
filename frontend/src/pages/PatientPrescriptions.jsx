import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function PatientPrescriptions() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPrescriptions() {
      try {
        setLoading(true)
        const { data: patData, error: patErr } = await supabase
          .from('patients')
          .select('id')
          .eq('profile_id', user.id)
          .single()

        if (patErr) throw patErr

        const { data: rxData, error: rxErr } = await supabase
          .from('prescription_details')
          .select('*')
          .eq('patient_id', patData.id)
          .order('prescription_date', { ascending: false })

        if (rxErr) throw rxErr
        setPrescriptions(rxData || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (user) loadPrescriptions()
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
            <p className="text-gray-600">View medical prescriptions issued by your doctors</p>
          </div>
          <Link to="/patient/dashboard" className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700">
            Dashboard
          </Link>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm">{error}</div>}

        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading prescriptions...</p>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No prescriptions found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {prescriptions.map((rx) => (
              <div key={`${rx.prescription_id}-${rx.medicine_name}`} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Dr. {rx.doctor_name} ({rx.specialization})</h3>
                    <p className="text-sm text-gray-500">Appointment Date: {rx.appointment_date}</p>
                  </div>
                  <span className="text-xs text-gray-400">Issued: {new Date(rx.prescription_date).toLocaleDateString()}</span>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700">Diagnosis:</p>
                  <p className="text-gray-800 text-sm">{rx.diagnosis}</p>
                  {rx.prescription_notes && (
                    <p className="text-gray-600 text-xs mt-1">Notes: {rx.prescription_notes}</p>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Prescribed Medicine:</p>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900">{rx.medicine_name} ({rx.generic_name}) - {rx.medicine_type}</span>
                    <span className="text-gray-600">{rx.dosage} | {rx.frequency} | {rx.duration}</span>
                  </div>
                  {rx.instructions && (
                    <p className="text-xs text-gray-500 mt-1">Instructions: {rx.instructions}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
