import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('doctors')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingDoctors: 0
  })
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [medicines, setMedicines] = useState([])

  // New Specialization Form
  const [newSpecName, setNewSpecName] = useState('')
  const [newSpecDesc, setNewSpecDesc] = useState('')

  // New Medicine Form
  const [newMedName, setNewMedName] = useState('')
  const [newMedGeneric, setNewMedGeneric] = useState('')
  const [newMedType, setNewMedType] = useState('tablet')
  const [newMedDesc, setNewMedDesc] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true)
        const [
          profilesRes,
          patientsRes,
          doctorsRes,
          appointmentsRes,
          specRes,
          medRes
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('patients').select('id', { count: 'exact', head: true }),
          supabase.from('doctors').select('id, is_verified, qualification, experience, consultation_fee, profiles(full_name, email, phone), specializations(name)', { count: 'exact' }),
          supabase.from('appointments').select('id, appointment_date, appointment_time, status, reason, patients(profiles(full_name)), doctors(profiles(full_name))'),
          supabase.from('specializations').select('*').order('name'),
          supabase.from('medicines').select('*').order('name')
        ])

        const allDocs = doctorsRes.data || []
        const pendingCount = allDocs.filter(d => !d.is_verified).length

        setStats({
          totalUsers: profilesRes.count || 0,
          totalPatients: patientsRes.count || 0,
          totalDoctors: doctorsRes.count || 0,
          totalAppointments: appointmentsRes.data?.length || 0,
          pendingDoctors: pendingCount
        })

        setDoctors(allDocs)
        setAppointments(appointmentsRes.data || [])
        setSpecializations(specRes.data || [])
        setMedicines(medRes.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user) loadAdminData()
  }, [user])

  const toggleVerification = async (doctorId, currentStatus) => {
    try {
      setError('')
      setSuccess('')
      const { error } = await supabase
        .from('doctors')
        .update({ is_verified: !currentStatus })
        .eq('id', doctorId)

      if (error) throw error

      setDoctors(doctors.map(d => d.id === doctorId ? { ...d, is_verified: !currentStatus } : d))
      setSuccess('Doctor verification status updated successfully.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAddSpecialization = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const { data, error } = await supabase
        .from('specializations')
        .insert([{ name: newSpecName.trim(), description: newSpecDesc.trim() }])
        .select()
        .single()

      if (error) throw error
      setSpecializations([...specializations, data])
      setNewSpecName('')
      setNewSpecDesc('')
      setSuccess('Specialization added successfully.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAddMedicine = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const { data, error } = await supabase
        .from('medicines')
        .insert([{
          name: newMedName.trim(),
          generic_name: newMedGeneric.trim(),
          type: newMedType,
          description: newMedDesc.trim()
        }])
        .select()
        .single()

      if (error) throw error
      setMedicines([...medicines, data])
      setNewMedName('')
      setNewMedGeneric('')
      setNewMedDesc('')
      setSuccess('Medicine added successfully.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {profile?.full_name || 'Admin'}</p>
          </div>
          <div className="flex space-x-4">
            <Link to="/" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">Home</Link>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">Logout</button>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6 text-sm">{success}</div>}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-indigo-500">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-500">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Patients</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPatients}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-green-500">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Doctors</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalDoctors}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Appointments</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAppointments}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-purple-500 col-span-2 md:col-span-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Doctors</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingDoctors}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg px-4 pt-2">
          <button
            onClick={() => setActiveTab('doctors')}
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'doctors'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Doctors ({doctors.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'appointments'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('specializations')}
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'specializations'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Specializations ({specializations.length})
          </button>
          <button
            onClick={() => setActiveTab('medicines')}
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'medicines'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Medicines ({medicines.length})
          </button>
        </div>

        {/* Tab 1: Doctors */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Doctor Verification & Management</h2>
            {loading ? (
              <p className="text-gray-500 py-4">Loading doctors...</p>
            ) : doctors.length === 0 ? (
              <p className="text-gray-500 py-4">No doctors registered in the system.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qualification</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee ($)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {doctors.map((doc) => (
                      <tr key={doc.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{doc.profiles?.full_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{doc.profiles?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{doc.specializations?.name || 'General'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{doc.qualification} ({doc.experience} yrs)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${doc.consultation_fee}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full font-semibold ${doc.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {doc.is_verified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => toggleVerification(doc.id, doc.is_verified)}
                            className={`px-3 py-1 rounded text-xs font-semibold ${doc.is_verified ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                          >
                            {doc.is_verified ? 'Revoke' : 'Verify'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Appointments */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Appointments</h2>
            {loading ? (
              <p className="text-gray-500 py-4">Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <p className="text-gray-500 py-4">No appointments recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appt) => (
                      <tr key={appt.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {appt.patients?.profiles?.full_name || 'Patient'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          Dr. {appt.doctors?.profiles?.full_name || 'Doctor'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {appt.appointment_date} {appt.appointment_time}
                        </td>
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
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {appt.reason || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Specializations */}
        {activeTab === 'specializations' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-1">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add Specialization</h2>
              <form onSubmit={handleAddSpecialization} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cardiology"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    value={newSpecName}
                    onChange={(e) => setNewSpecName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Brief description of the specialization..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    value={newSpecDesc}
                    onChange={(e) => setNewSpecDesc(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Add Specialization
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Current Specializations</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {specializations.map((spec) => (
                  <div key={spec.id} className="p-3 bg-gray-50 rounded-md">
                    <p className="font-semibold text-gray-900">{spec.name}</p>
                    {spec.description && <p className="text-xs text-gray-600 mt-1">{spec.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Medicines */}
        {activeTab === 'medicines' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-1">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add Medicine</h2>
              <form onSubmit={handleAddMedicine} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxicillin"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Generic Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Amoxicillin Trihydrate"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    value={newMedGeneric}
                    onChange={(e) => setNewMedGeneric(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    value={newMedType}
                    onChange={(e) => setNewMedType(e.target.value)}
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="syrup">Syrup</option>
                    <option value="injection">Injection</option>
                    <option value="drops">Drops</option>
                    <option value="ointment">Ointment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows="2"
                    placeholder="Usage and indications..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    value={newMedDesc}
                    onChange={(e) => setNewMedDesc(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Add Medicine
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Medicine Formulary</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {medicines.map((med) => (
                  <div key={med.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{med.name} <span className="text-xs text-gray-500 font-normal">({med.generic_name || 'N/A'})</span></p>
                      {med.description && <p className="text-xs text-gray-600 mt-1">{med.description}</p>}
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-medium">
                      {med.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
