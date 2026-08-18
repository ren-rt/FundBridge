import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function AnalyticsTab() {
  const { getToken } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const token = await getToken()
        const res = await fetch('http://localhost:3000/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Could not load analytics')
        setData(await res.json())
      } catch (err) {
        setError(err.message)
      }
    })()
  }, [getToken])

  if (error) return <p className="text-red-400 text-sm">{error}</p>
  if (!data) return <p className="text-navy-400 text-sm">Loading...</p>

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <h3 className="text-sm font-semibold text-navy-100 mb-2">Users by Role</h3>
        {data.users_by_role.map((r) => (
          <p key={r.role} className="text-navy-300 text-sm">{r.role}: {r.count}</p>
        ))}
      </Card>
      <Card>
        <h3 className="text-sm font-semibold text-navy-100 mb-2">Pitches by Status</h3>
        {data.pitches_by_status.map((p) => (
          <p key={p.status} className="text-navy-300 text-sm">{p.status}: {p.count}</p>
        ))}
      </Card>
      <Card>
        <h3 className="text-sm font-semibold text-navy-100 mb-2">Investor Verifications</h3>
        {data.investor_verifications_by_status.map((v) => (
          <p key={v.verification_status} className="text-navy-300 text-sm">{v.verification_status}: {v.count}</p>
        ))}
      </Card>
      <Card>
        <h3 className="text-sm font-semibold text-navy-100 mb-2">Platform Totals</h3>
        <p className="text-navy-300 text-sm">Deal Rooms: {data.deal_room_count}</p>
        <p className="text-navy-300 text-sm">Live Sessions: {data.live_session_count}</p>
        <p className="text-navy-300 text-sm">Posts: {data.post_count}</p>
      </Card>
    </div>
  )
}

function UsersTab() {
  const { getToken } = useAuth()
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  const loadUsers = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch('http://localhost:3000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Could not load users')
      setUsers(await res.json())
    } catch (err) {
      setError(err.message)
    }
  }, [getToken])

  useEffect(() => {
    ;(async () => {
      await loadUsers()
    })()
  }, [loadUsers])

  async function act(userId, action, extra) {
    setError('')
    try {
      const token = await getToken()
      const method = action === 'delete' ? 'DELETE' : 'PATCH'
      const url =
        action === 'delete'
          ? `http://localhost:3000/api/admin/users/${userId}`
          : `http://localhost:3000/api/admin/users/${userId}/${action}`
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: extra ? JSON.stringify(extra) : undefined,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Action failed')
      }
      await loadUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      {users.map((u) => (
        <Card key={u.id} className="mb-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-navy-100">{u.full_name || u.email}</p>
              <p className="text-xs text-navy-400">{u.email} · {u.role} · {u.status}</p>
            </div>

            <div className="flex gap-2">
              {u.status === 'ACTIVE' ? (
                <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => act(u.id, 'suspend')}>
                  Suspend
                </Button>
              ) : (
                <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => act(u.id, 'reactivate')}>
                  Reactivate
                </Button>
              )}

              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) act(u.id, 'role', { role: e.target.value })
                  e.target.value = ''
                }}
                className="bg-navy-950/60 border border-navy-700 rounded text-xs text-navy-300 px-1"
              >
                <option value="">Change role...</option>
                <option value="FOUNDER">FOUNDER</option>
                <option value="INVESTOR">INVESTOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => act(u.id, 'delete')}>
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function AuditLogTab() {
  const { getToken } = useAuth()
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const token = await getToken()
        const res = await fetch('http://localhost:3000/api/admin/audit-log', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Could not load audit log')
        setEntries(await res.json())
      } catch (err) {
        setError(err.message)
      }
    })()
  }, [getToken])

  if (error) return <p className="text-red-400 text-sm">{error}</p>

  return (
    <div>
      {entries.map((e, i) => (
        <div key={i} className="flex justify-between items-center py-2 border-b border-navy-800 text-sm">
          <div>
            <span className="text-navy-100 font-medium">{e.action}</span>{' '}
            <span className="text-navy-400">by {e.actor_email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-navy-800 text-navy-400 px-2 py-0.5 rounded-full">{e.source}</span>
            <span className="text-navy-500 text-xs">{new Date(e.created_at).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function AdminDashboard() {
  const [tab, setTab] = useState('analytics')

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gold-500 mb-6">Admin Dashboard</h1>

      <div className="flex gap-4 border-b border-navy-800 mb-6 text-sm font-medium">
        {['analytics', 'users', 'audit-log'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 ${tab === t ? 'text-gold-500 border-b-2 border-gold-500' : 'text-navy-400'}`}
          >
            {t === 'analytics' ? 'Analytics' : t === 'users' ? 'Users' : 'Audit Log'}
          </button>
        ))}
      </div>

      {tab === 'analytics' && <AnalyticsTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'audit-log' && <AuditLogTab />}
    </div>
  )
}

export default AdminDashboard