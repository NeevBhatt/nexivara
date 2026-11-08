import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function DoctorSearch() {
  const [doctors, setDoctors] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [specRes, docRes] = await Promise.all([
          supabase.from('specializations').select('*'),
          supabase.from('doctor_appointment_summary').select('*')
        ])

        if (specRes.error) throw specRes.error
        if (docRes.error) throw docRes.error

        setSpecializations(specRes.data || [])
        setDoctors(docRes.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredDoctors = doctors.filter(doc => {
    const matchesSpec = selectedSpecialization ? doc.specialization === selectedSpecialization : true
    const nameMatch = doc.doctor_name ? doc.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) : false
    const qualMatch = doc.qualification ? doc.qualification.toLowerCase().includes(searchTerm.toLowerCase()) : false
    const matchesSearch = searchTerm ? (nameMatch || qualMatch) : true
    return matchesSpec && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Doctors</h1>
            <p className="text-gray-600">Search and filter verified healthcare specialists</p>
          </div>
          <Link to="/patient/dashboard" className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700">
            Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by doctor name or qualification..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec.id} value={spec.name}>{spec.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading doctors...</p>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No doctors found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doc => (
              <div key={doc.doctor_id} className="bg-white rounded-lg shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{doc.doctor_name}</h3>
                    {doc.is_verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">Verified</span>
                    )}
                  </div>
                  <p className="text-blue-600 font-medium text-sm mb-1">{doc.specialization}</p>
                  <p className="text-gray-600 text-sm mb-3">{doc.qualification} • {doc.experience} yrs exp</p>
                  <p className="text-gray-700 text-sm mb-4 font-semibold">Fee: ${doc.consultation_fee}</p>
                  <div className="flex items-center text-sm text-yellow-600 mb-4">
                    <span>★ {doc.average_rating} ({doc.total_reviews} reviews)</span>
                  </div>
                </div>
                <Link
                  to={`/patient/doctor/${doc.doctor_id}`}
                  className="w-full text-center py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  View Profile & Book
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
