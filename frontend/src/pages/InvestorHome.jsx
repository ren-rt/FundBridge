import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

function InvestorHome() {
  const { user } = useAuth()

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gold-300 mb-2">
          INVESTOR DASHBOARD
        </p>

        <h1 className="text-3xl font-bold text-gold-500">
          Welcome back{user?.email ? `, ${user.email}` : ', Investor'}
        </h1>

        <p className="text-navy-400 mt-2">
          Discover startups, manage your profile and explore investment opportunities.
        </p>
      </div>

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Discover Startups */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs text-gold-300 uppercase tracking-wider">
                Discover
              </p>

              <h2 className="text-xl font-semibold text-navy-100 mt-1">
                Discover Startups
              </h2>
            </div>

            <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-gold-300">
              →
            </div>
          </div>

          <p className="text-sm text-navy-400 leading-relaxed mb-5">
            Browse founders, startup pitches and opportunities that match
            your investment interests.
          </p>

          <Link to="/feed">
            <Button>
              Explore Feed
            </Button>
          </Link>
        </Card>

        {/* Investor Profile */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs text-gold-300 uppercase tracking-wider">
                Your Profile
              </p>

              <h2 className="text-xl font-semibold text-navy-100 mt-1">
                Investor Profile
              </h2>
            </div>

            <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-gold-300">
              I
            </div>
          </div>

          <p className="text-sm text-navy-400 leading-relaxed mb-5">
            Add your background, investment interests and professional
            information.
          </p>

          <Link to="/profile/investor">
            <Button variant="secondary">
              View Profile
            </Button>
          </Link>
        </Card>

        {/* Saved Opportunities */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs text-gold-300 uppercase tracking-wider">
                Opportunities
              </p>

              <h2 className="text-xl font-semibold text-navy-100 mt-1">
                Saved Opportunities
              </h2>
            </div>

            <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-gold-300">
              ☆
            </div>
          </div>

          <p className="text-sm text-navy-400 leading-relaxed mb-5">
            Keep track of startups and investment opportunities you want
            to revisit.
          </p>

          <span className="text-sm text-navy-500">
            No saved opportunities yet
          </span>
        </Card>

        {/* Deal Room */}
        <Card className="p-6 opacity-70">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs text-gold-300 uppercase tracking-wider">
                Connections
              </p>

              <h2 className="text-xl font-semibold text-navy-100 mt-1">
                Active Deals
              </h2>
            </div>

            <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-gold-300">
              ◆
            </div>
          </div>

          <p className="text-sm text-navy-400 leading-relaxed mb-5">
            Manage conversations and active investment opportunities
            in your Deal Room.
          </p>

          <span className="text-sm text-navy-500">
            Deal Room coming soon
          </span>
        </Card>

      </div>
    </div>
  )
}

export default InvestorHome