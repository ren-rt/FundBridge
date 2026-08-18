import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function LiveSessions() {
  const { getToken } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [joinInfo, setJoinInfo] = useState(null)

  const loadSessions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      const res = await fetch('http://localhost:3000/api/live-sessions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Could not load live sessions')
      setSessions(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    ;(async () => {
      await loadSessions()
    })()
  }, [loadSessions])

  async function handleRegister(id) {
    const token = await getToken()
    await fetch(`http://localhost:3000/api/live-sessions/${id}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    await loadSessions()
  }

  async function handleJoin(id) {
    setError('')
    setJoinInfo(null)
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:3000/api/live-sessions/${id}/join`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not join')
      setJoinInfo(data)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gold-500 mb-6">Live Sessions</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      {joinInfo && (
        <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg px-4 py-3 text-sm text-gold-300 mb-4">
          Joining room: <a className="underline" href={`https://meet.jit.si/${joinInfo.jitsi_room_name}`} target="_blank" rel="noreferrer">meet.jit.si/{joinInfo.jitsi_room_name}</a>
        </div>
      )}

      {loading ? (
        <p className="text-navy-400 text-sm">Loading...</p>
      ) : sessions.length === 0 ? (
        <p className="text-navy-400 text-sm">No upcoming sessions.</p>
      ) : (
        sessions.map((s) => (
          <Card key={s.id} className="mb-4">
            <h3 className="font-semibold text-navy-100">{s.title}</h3>
            <p className="text-navy-400 text-sm mt-1">
              {new Date(s.scheduled_at).toLocaleString()} · {s.registered_count} registered
            </p>
            {s.description && <p className="text-navy-300 text-sm mt-2">{s.description}</p>}

            <div className="flex gap-2 mt-3">
              <Button variant="secondary" className="text-sm px-3 py-1.5" onClick={() => handleRegister(s.id)}>
                Register
              </Button>
              <Button variant="ghost" className="text-sm px-3 py-1.5" onClick={() => handleJoin(s.id)}>
                Join
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

export default LiveSessions