import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const STATUS_STYLES = {
  DRAFT: 'bg-navy-700 text-navy-200',
  SUBMITTED: 'bg-gold-500/20 text-gold-300',
  ARCHIVED: 'bg-navy-800 text-navy-400',
}

function MyPitches() {
  const { getToken } = useAuth()
  const [pitches, setPitches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPitches = useCallback(async () => {
    const token = await getToken()
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('http://localhost:3000/api/pitches/mine', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Could not load your pitches')
      setPitches(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [getToken])

    useEffect(() => {
    ;(async () => {
      await loadPitches()
    })()
  }, [loadPitches])

  async function handleArchive(pitchId) {
    const token = await getToken()
    if (!token) return

    try {
      const res = await fetch(`http://localhost:3000/api/pitches/${pitchId}/archive`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Could not archive pitch')
      const updated = await res.json()
      setPitches((prev) => prev.map((p) => (p.id === pitchId ? updated : p)))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gold-500">My Pitches</h1>
        <Link to="/pitch">
          <Button>New Pitch</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-navy-400 text-sm">Loading...</p>
      ) : pitches.length === 0 ? (
        <p className="text-navy-400 text-sm">You haven't created any pitches yet.</p>
      ) : (
        pitches.map((pitch) => (
          <Card key={pitch.id} className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-navy-100">{pitch.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[pitch.status]}`}>
                    {pitch.status}
                  </span>
                </div>

                <p className="text-navy-400 text-sm mt-1">
                  {pitch.view_count} view{pitch.view_count === 1 ? '' : 's'}
                  {pitch.ask_amount && ` · Asking $${Number(pitch.ask_amount).toLocaleString()}`}
                </p>
              </div>

              <div className="flex gap-2">
                <Link to={`/pitch/${pitch.id}`}>
                  <Button variant="secondary" className="text-sm px-3 py-1.5">
                    {pitch.status === 'DRAFT' ? 'Continue' : 'Edit'}
                  </Button>
                </Link>

                {pitch.status !== 'ARCHIVED' && (
                  <Button
                    variant="ghost"
                    className="text-sm px-3 py-1.5"
                    onClick={() => handleArchive(pitch.id)}
                  >
                    Archive
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

export default MyPitches