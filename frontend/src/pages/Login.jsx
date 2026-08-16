import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      await login(email, password)

      // Get the role saved when this account was created
      const role = localStorage.getItem('fundbridgeRole')

      console.log('Logged in role:', role)

      if (role === 'FOUNDER') {
        navigate('/founder-home', { replace: true })
      } else if (role === 'INVESTOR') {
        navigate('/investor-home', { replace: true })
      } else {
        // No role saved
        setError(
          'Your account role could not be found. Please sign up again or select your role.'
        )
      }

    } catch (err) {
      console.error('Firebase login error:', err)

      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setError('Invalid email or password')
      } else {
        setError(err.message || 'Could not log in')
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
            Welcome back
          </h1>

          <p className="text-navy-400 mt-2 text-sm">
            Log in to your FundBridge account
          </p>
        </div>

        <Card>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >

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
              {loading ? 'Logging in...' : 'Log In'}
            </Button>

          </form>
        </Card>

        <p className="text-center text-navy-400 text-sm mt-6">
          Don't have an account?{' '}

          <Link
            to="/signup"
            className="text-gold-300 hover:text-gold-100"
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login