import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function Home() {
  const { token, user } = useAuth()

  const profileDone =
    localStorage.getItem('founderProfileComplete') === 'true'

  return (
    <div className="max-w-4xl mx-auto text-center py-8">
      <h1 className="text-3xl font-bold text-gold-500 tracking-tight">
        {token
          ? `Welcome back${user?.name ? ', ' + user.name : ''}`
          : 'Welcome to FundBridge'}
      </h1>

      <p className="text-navy-400 mt-2">
        {token
          ? 'Continue your journey below.'
          : 'Connecting first-time founders with the right investors.'}
      </p>

      {!token && (
        <Card className="mt-8 flex items-center justify-between text-left">
          <div>
            <h2 className="text-lg font-semibold text-navy-100">
              Get started
            </h2>
            <p className="text-navy-400 text-sm mt-1">
              Create an account to build your profile and connect.
            </p>
          </div>

          <div className="flex gap-3">
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>

            <Link to="/login">
              <Button variant="secondary">Log In</Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <Card className={!token ? 'opacity-50' : ''}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-navy-800 text-navy-400">
              {profileDone ? '✓' : '1'}
            </span>

            <h3 className="font-semibold text-navy-100">
              Founder Profile
            </h3>
          </div>

          <p className="text-navy-400 text-sm mb-4">
            Build your startup profile and pitch.
          </p>

          {!token ? (
            <span className="text-navy-400 text-sm">
              Locked
            </span>
          ) : profileDone ? (
            <Link
              to="/profile/founder"
              className="text-gold-300 hover:text-gold-100 text-sm font-medium"
            >
              View profile →
            </Link>
          ) : (
            <Link
              to="/profile/founder"
              className="text-gold-300 hover:text-gold-100 text-sm font-medium"
            >
              Start →
            </Link>
          )}
        </Card>

        <Card className={!profileDone ? 'opacity-50' : ''}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-navy-800 text-navy-400">
              2
            </span>

            <h3 className="font-semibold text-navy-100">
              Startup School
            </h3>
          </div>

          <p className="text-navy-400 text-sm mb-4">
            Structured education for first-time founders.
          </p>

          <span className="text-navy-400 text-sm">
            {profileDone ? 'Coming soon' : 'Locked'}
          </span>
        </Card>

        <Card className="opacity-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-navy-800 text-navy-400">
              3
            </span>

            <h3 className="font-semibold text-navy-100">
              Deal Room
            </h3>
          </div>

          <p className="text-navy-400 text-sm mb-4">
            Encrypted, real-time investor conversations.
          </p>

          <span className="text-navy-400 text-sm">
            Locked
          </span>
        </Card>

      </div>
    </div>
  )
}

export default Home