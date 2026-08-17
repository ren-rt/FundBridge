
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function Home() {
  const { user, appUser, loading } = useAuth()
  const role = appUser?.role?.toUpperCase()

  const profileDone =
    localStorage.getItem('founderProfileComplete') === 'true'

  const investorProfileDone =
    localStorage.getItem('investorProfileComplete') === 'true'

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-navy-400">
          Loading your account...
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-3xl font-bold text-gold-500 tracking-tight">
          Welcome to FundBridge
        </h1>

        <p className="text-navy-400 mt-2">
          Connecting first-time founders with the right investors.
        </p>

        <Card className="mt-8 max-w-xl mx-auto">
          <h2 className="text-lg font-semibold text-navy-100">
            Get started
          </h2>

          <p className="text-navy-400 text-sm mt-1">
            Create an account to build your profile and connect.
          </p>

          <div className="flex justify-center gap-3 mt-5">
            <Link to="/signup">
              <Button>
                Sign Up
              </Button>
            </Link>

            <Link to="/login">
              <Button variant="secondary">
                Log In
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <Card>
          <h2 className="text-lg font-semibold text-navy-100">
            Your account role could not be found.
          </h2>

          <p className="text-navy-400 text-sm mt-2">
            Please sign up again or select your role.
          </p>
        </Card>
      </div>
    )
  }

  // ============================================================
  // INVESTOR HOME
  // ============================================================

  if (role === 'INVESTOR') {
    return (
      <div className="max-w-6xl mx-auto py-6">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gold-500 tracking-tight">
            Welcome back, Investor
          </h1>

          <p className="text-navy-400 mt-2">
            Discover promising startups and manage your investment opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Card className="hover:border-gold-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center text-gold-300 text-lg">
                🔎
              </div>

              <span className="text-xs text-gold-300 bg-navy-800 px-3 py-1 rounded-full">
                Explore
              </span>
            </div>

            <h2 className="text-lg font-semibold text-navy-100">
              Discover Startups
            </h2>

            <p className="text-navy-400 text-sm mt-2 leading-relaxed">
              Browse founder pitches and discover promising investment opportunities.
            </p>

            <Link
              to="/feed"
              className="inline-block text-gold-300 hover:text-gold-100 text-sm font-medium mt-5"
            >
              Explore Feed →
            </Link>
          </Card>

          <Card className="hover:border-gold-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center text-gold-300 text-lg">
                👤
              </div>

              <span className="text-xs text-gold-300 bg-navy-800 px-3 py-1 rounded-full">
                Profile
              </span>
            </div>

            <h2 className="text-lg font-semibold text-navy-100">
              Your Investor Profile
            </h2>

            <p className="text-navy-400 text-sm mt-2 leading-relaxed">
              Build your investor profile so founders can understand who you are and what you invest in.
            </p>

            <Link
              to="/profile/investor"
              className="inline-block text-gold-300 hover:text-gold-100 text-sm font-medium mt-5"
            >
              {investorProfileDone
                ? 'View Profile →'
                : 'Create Profile →'}
            </Link>
          </Card>

          <Card className="hover:border-gold-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center text-gold-300 text-lg">
                ★
              </div>

              <span className="text-xs text-navy-400 bg-navy-800 px-3 py-1 rounded-full">
                Saved
              </span>
            </div>

            <h2 className="text-lg font-semibold text-navy-100">
              Saved Opportunities
            </h2>

            <p className="text-navy-400 text-sm mt-2 leading-relaxed">
              Keep track of startups and investment opportunities you're interested in.
            </p>

            <span className="inline-block text-navy-400 text-sm mt-5">
              No saved opportunities yet
            </span>
          </Card>

          <Card className="hover:border-gold-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center text-gold-300 text-lg">
                🤝
              </div>

              <span className="text-xs text-navy-400 bg-navy-800 px-3 py-1 rounded-full">
                Deals
              </span>
            </div>

            <h2 className="text-lg font-semibold text-navy-100">
              Active Deals
            </h2>

            <p className="text-navy-400 text-sm mt-2 leading-relaxed">
              Manage your active conversations and investment opportunities.
            </p>

            <span className="inline-block text-navy-400 text-sm mt-5">
              Open Deal Room →
            </span>
          </Card>

        </div>
      </div>
    )
  }

  // ============================================================
  // FOUNDER HOME
  // ============================================================

  if (role === 'FOUNDER') {
    return (
      <div className="max-w-6xl mx-auto py-6">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gold-500 tracking-tight">
            Welcome back, Founder
          </h1>

          <p className="text-navy-400 mt-2">
            Build your startup, learn, and work toward connecting with investors.
          </p>
        </div>

        <Card className="mb-6">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-xl font-semibold text-navy-100">
                Your Founder Journey
              </h2>

              <p className="text-navy-400 text-sm mt-1">
                Complete each step to move your startup forward.
              </p>
            </div>

            <span className="text-xs text-gold-300 bg-navy-800 border border-navy-700 px-3 py-1.5 rounded-full">
              {profileDone ? '1 of 4 completed' : 'Getting started'}
            </span>

          </div>

          <div className="flex flex-col gap-3">

            <div className="flex items-center gap-4 p-4 rounded-lg bg-navy-950/60 border border-gold-500/30">

              <div className="w-9 h-9 rounded-full bg-gold-500 text-navy-950 flex items-center justify-center font-bold shrink-0">
                {profileDone ? '✓' : '1'}
              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-navy-100">
                  Founder Profile
                </h3>

                <p className="text-navy-400 text-sm mt-1">
                  Add your founder information, startup details and profile.
                </p>

              </div>

              <Link to="/profile/founder">
                <Button variant="secondary">
                  {profileDone ? 'View Profile' : 'Complete Profile'}
                </Button>
              </Link>

            </div>

            <div
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                profileDone
                  ? 'border-gold-500/30 bg-navy-950/60'
                  : 'border-navy-800 bg-navy-950/30 opacity-60'
              }`}
            >

              <div className="w-9 h-9 rounded-full bg-navy-800 text-navy-400 flex items-center justify-center font-bold shrink-0">
                2
              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-navy-100">
                  Startup School
                </h3>

                <p className="text-navy-400 text-sm mt-1">
                  Complete structured lessons for first-time founders.
                </p>

              </div>

              {profileDone ? (
                <Link
                  to="/startup-school"
                  className="text-gold-300 hover:text-gold-100 text-sm font-medium"
                >
                  Continue →
                </Link>
              ) : (
                <span className="text-navy-500 text-sm">
                  Locked
                </span>
              )}

            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border border-navy-800 bg-navy-950/30 opacity-60">

              <div className="w-9 h-9 rounded-full bg-navy-800 text-navy-400 flex items-center justify-center font-bold shrink-0">
                3
              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-navy-100">
                  Submit Pitch
                </h3>

                <p className="text-navy-400 text-sm mt-1">
                  Submit your startup pitch to get in front of investors.
                </p>

              </div>

              <span className="text-navy-500 text-sm">
                Locked
              </span>

            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border border-navy-800 bg-navy-950/30 opacity-60">

              <div className="w-9 h-9 rounded-full bg-navy-800 text-navy-400 flex items-center justify-center font-bold shrink-0">
                4
              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-navy-100">
                  Deal Room
                </h3>

                <p className="text-navy-400 text-sm mt-1">
                  Connect with investors and manage active opportunities.
                </p>

              </div>

              <span className="text-navy-500 text-sm">
                Locked
              </span>

            </div>

          </div>

        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card>

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-lg font-semibold text-navy-100">
                Your Startup
              </h2>

              <Link
                to="/profile/founder"
                className="text-gold-300 hover:text-gold-100 text-sm"
              >
                Edit →
              </Link>

            </div>

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-gold-300 text-xl font-bold">
                F
              </div>

              <div>

                <h3 className="font-semibold text-navy-100">
                  Your Startup
                </h3>

                <p className="text-navy-400 text-sm">
                  Complete your profile to add startup details.
                </p>

              </div>

            </div>

            <div className="mt-5">

              <div className="flex justify-between text-xs mb-2">
                <span className="text-navy-400">
                  Profile completion
                </span>

                <span className="text-gold-300">
                  {profileDone ? '100%' : '0%'}
                </span>
              </div>

              <div className="w-full h-2 bg-navy-800 rounded-full overflow-hidden">

                <div
                  className="h-full bg-gold-500 rounded-full transition-all"
                  style={{
                    width: profileDone ? '100%' : '0%'
                  }}
                />

              </div>

            </div>

          </Card>

          <Card>

            <span className="text-xs text-gold-300 uppercase tracking-wider font-semibold">
              Next Step
            </span>

            <h2 className="text-xl font-semibold text-navy-100 mt-2">
              {profileDone
                ? 'Continue your startup journey'
                : 'Complete your Founder Profile'}
            </h2>

            <p className="text-navy-400 text-sm mt-2 leading-relaxed">
              {profileDone
                ? 'Your profile is complete. Continue with Startup School to prepare for your pitch.'
                : 'Add your founder information, startup details and profile image to continue your FundBridge journey.'}
            </p>

            <Link
              to={profileDone
                ? '/startup-school'
                : '/profile/founder'}
            >
              <Button className="mt-5">
                {profileDone
                  ? 'Continue Startup School'
                  : 'Complete Profile'}
              </Button>
            </Link>

          </Card>

        </div>

      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto text-center py-16">
      <Card>
        <h2 className="text-lg font-semibold text-navy-100">
          Unknown account role
        </h2>

        <p className="text-navy-400 text-sm mt-2">
          Your account role is "{appUser?.role}".
        </p>
      </Card>
    </div>
  )
}

export default Home

