import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('FOUNDER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signup } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      await signup(fullName, email, password, role)

      // Role is now handled by the backend.
      // No localStorage role is needed.

      if (role === 'FOUNDER') {
        navigate('/founder-home', { replace: true })
      } else {
        navigate('/investor-home', { replace: true })
      }
    } catch (err) {
      console.error('Firebase signup error:', err)

      if (err.code === 'auth/email-already-in-use') {
        setError('That email is already registered. Please log in.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else {
        setError(
          err.code ||
          err.message ||
          'Could not create account'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold-500 tracking-tight">
            Create your account
          </h1>

          <p className="text-navy-400 mt-2 text-sm">
            Join FundBridge as a founder or investor
          </p>
        </div>

        <Card>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >

            <Input
              type="text"
              label="Full name"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5 text-left">

              <label className="text-sm font-medium text-navy-100">
                I am a
              </label>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={() => setRole('FOUNDER')}
                  className={`flex-1 rounded-lg px-4 py-2.5 font-medium transition-all ${
                    role === 'FOUNDER'
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-navy-950/60 border border-navy-700 text-navy-100'
                  }`}
                >
                  Founder
                </button>

                <button
                  type="button"
                  onClick={() => setRole('INVESTOR')}
                  className={`flex-1 rounded-lg px-4 py-2.5 font-medium transition-all ${
                    role === 'INVESTOR'
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-navy-950/60 border border-navy-700 text-navy-100'
                  }`}
                >
                  Investor
                </button>

              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-left">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="mt-2"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>

          </form>
        </Card>

        <p className="text-center text-navy-400 text-sm mt-6">
          Already have an account?{' '}

          <Link
            to="/login"
            className="text-gold-300 hover:text-gold-100"
          >
            Log in
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Signup