import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('patient')

  // Doctor specific fields
  const [specializations, setSpecializations] = useState([])
  const [specializationId, setSpecializationId] = useState('')
  const [qualification, setQualification] = useState('')
  const [experience, setExperience] = useState('')
  const [consultationFee, setConsultationFee] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (role === 'doctor') {
      supabase.from('specializations').select('*').then(({ data, error }) => {
        if (!error && data) {
          setSpecializations(data)
          if (data.length > 0) setSpecializationId(data[0].id)
        }
      })
    }
  }, [role])

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Sign up auth user
      const { data: authData, error: authError } = await signUp({ email, password })
      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('User creation failed')

      // 2. Insert profile record
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: userId,
          email,
          full_name: fullName,
          phone,
          role
        }
      ])
      if (profileError) throw profileError

      // 3. Insert role-specific record
      if (role === 'patient') {
        const { error: patientError } = await supabase.from('patients').insert([
          { profile_id: userId }
        ])
        if (patientError) throw patientError
      } else if (role === 'doctor') {
        if (!specializationId) {
          throw new Error('Please select a valid specialization')
        }
        const { error: doctorError } = await supabase.from('doctors').insert([
          {
            profile_id: userId,
            specialization_id: specializationId,
            qualification: qualification.trim(),
            experience: parseInt(experience, 10) || 0,
            consultation_fee: parseFloat(consultationFee) || 0
          }
        ])
        if (doctorError) throw doctorError
      }

      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Register for Nexivara</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {role === 'doctor' && (
            <div className="space-y-4 border-t pt-4 mt-4">
              <h3 className="text-md font-semibold text-gray-800">Doctor Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  value={specializationId}
                  onChange={(e) => setSpecializationId(e.target.value)}
                >
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Qualification</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MBBS, MD"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Consultation Fee ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </div>
        <Link to="/" className="block mt-4 text-gray-500 text-center text-sm hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
