import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'

function Layout() {
  const { user, appUser, logout } = useAuth()

  return (
    <div className="min-h-screen bg-navy-950 text-navy-100 flex">
      <aside className="w-56 bg-navy-900 p-5 flex flex-col gap-1 border-r border-navy-800">
        <h2 className="text-gold-500 font-bold text-xl mb-6 tracking-tight">
          FundBridge
        </h2>

        <Link
          to="/"
          className="px-3 py-2 rounded hover:bg-navy-800 hover:text-gold-300 transition-colors"
        >
          Home
        </Link>

        <Link
          to="/feed"
          className="px-3 py-2 rounded hover:bg-navy-800 hover:text-gold-300 transition-colors"
        >
          Feed
        </Link>

        <Link
          to="/profile/founder"
          className="px-3 py-2 rounded hover:bg-navy-800 hover:text-gold-300 transition-colors"
        >
          Founder Profile
        </Link>

        <Link
          to="/profile/investor"
          className="px-3 py-2 rounded hover:bg-navy-800 hover:text-gold-300 transition-colors"
        >
          Investor Profile
        </Link>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-navy-900 border-b border-navy-800 px-6 py-4 flex justify-between items-center">
          <span className="font-semibold text-navy-100">
            Dashboard
          </span>

          {user ? (
            <Button variant="ghost" onClick={logout}>
              Log Out
            </Button>
          ) : (
            <Link
              to="/login"
              className="text-gold-300 hover:text-gold-100 text-sm font-medium"
            >
              Log In
            </Link>
          )}
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout