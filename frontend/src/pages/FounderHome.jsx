import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function FounderHome() {
  const { user } = useAuth()

  const profileComplete =
    localStorage.getItem('founderProfileComplete') === 'true'

  return (
    <div className="max-w-5xl mx-auto">

      <div className="mb-8">
        <p className="text-gold-400 text-sm font-medium">
          FOUNDER DASHBOARD
        </p>

        <h1 className="text-3xl font-bold text-navy-100 mt-1">
          Welcome{user?.email ? `, ${user.email}` : ''}
        </h1>

        <p className="text-navy-400 mt-2">
          Build your startup, learn, and connect with investors.
        </p>
      </div>

      {!profileComplete && (
        <Card className="mb-6 border border-gold-500/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div>
              <h2 className="text-lg font-semibold text-navy-100">
                Complete your founder profile
              </h2>

              <p className="text-sm text-navy-400 mt-1">
                Tell investors who you are, what you're building,
                and what your startup needs.
              </p>
            </div>

            <Link to="/profile/founder">
              <Button>
                Create Profile
              </Button>
            </Link>

          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <Card>
          <div className="text-2xl mb-3">👤</div>

          <h2 className="font-semibold text-navy-100">
            Founder Profile
          </h2>

          <p className="text-sm text-navy-400 mt-2 mb-4">
            {profileComplete
              ? 'Your founder profile is ready.'
              : 'Create your profile and introduce yourself.'}
          </p>

          <Link
            to="/profile/founder"
            className="text-gold-300 text-sm font-medium hover:text-gold-100"
          >
            {profileComplete ? 'View Profile →' : 'Create Profile →'}
          </Link>
        </Card>

        <Card className={!profileComplete ? 'opacity-50' : ''}>
          <div className="text-2xl mb-3">📚</div>

          <h2 className="font-semibold text-navy-100">
            Startup School
          </h2>

          <p className="text-sm text-navy-400 mt-2 mb-4">
            Learn the fundamentals of building and fundraising.
          </p>

          {profileComplete ? (
            <Link
              to="/startup-school"
              className="text-gold-300 text-sm font-medium hover:text-gold-100"
            >
              Continue Learning →
            </Link>
          ) : (
            <span className="text-navy-500 text-sm">
              Complete your profile first
            </span>
          )}
        </Card>

        <Card className={!profileComplete ? 'opacity-50' : ''}>
          <div className="text-2xl mb-3">🚀</div>

          <h2 className="font-semibold text-navy-100">
            Submit Pitch
          </h2>

          <p className="text-sm text-navy-400 mt-2 mb-4">
            Submit your startup pitch and get in front of investors.
          </p>

          {profileComplete ? (
            <Link
              to="/pitch"
              className="text-gold-300 text-sm font-medium hover:text-gold-100"
            >
              Submit Pitch →
            </Link>
          ) : (
            <span className="text-navy-500 text-sm">
              Complete your profile first
            </span>
          )}
        </Card>

        <Card className="opacity-50">
          <div className="text-2xl mb-3">💬</div>

          <h2 className="font-semibold text-navy-100">
            Deal Room
          </h2>

          <p className="text-sm text-navy-400 mt-2">
            Connect and discuss opportunities with investors.
          </p>

          <span className="text-navy-500 text-sm mt-4 block">
            Coming soon
          </span>
        </Card>

      </div>
    </div>
  )
}

export default FounderHome