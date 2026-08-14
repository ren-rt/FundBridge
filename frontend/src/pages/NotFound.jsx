import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-gold-500">
        404
      </h1>

      <p className="text-navy-100 text-lg mt-4">
        This page doesn't exist.
      </p>

      <p className="text-navy-400 text-sm mt-1">
        Check the URL, or head back home.
      </p>

      <Link to="/" className="mt-6">
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}

export default NotFound