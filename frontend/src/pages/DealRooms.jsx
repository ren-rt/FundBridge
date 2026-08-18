import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

function DealRooms() {
  const { appToken } = useAuth()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!appToken) return

    let cancelled = false
    api
      .get('/api/dealrooms/mine', appToken)
      .then((data) => {
        if (!cancelled) setRooms(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [appToken])

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-navy-100 mb-6">Deal Rooms</h1>

      {loading && <p className="text-navy-400">Loading your deal rooms…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && rooms.length === 0 && (
        <Card>
          <p className="text-navy-400">
            No deal rooms yet. A deal room opens once a founder and investor connect through matching.
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {rooms.map((room) => (
          <Link key={room.id} to={`/dealrooms/${room.id}`}>
            <Card className="hover:border-gold-500/40 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy-100">{room.title}</p>
                  <p className="text-sm text-navy-400">
                    {room.counterparty.role === 'FOUNDER' ? 'Founder' : 'Investor'}: {room.counterparty.name}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    room.status === 'ACTIVE'
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-navy-800 text-navy-400'
                  }`}
                >
                  {room.status}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default DealRooms