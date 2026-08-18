import { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:3000'

// Backend stores raw action codes; this maps them to the kind of
// human-readable phrasing the wireframe shows ("Founder Uploaded Deck").
// Only covers actions the backend actually emits -- no "Expressed Interest"
// entry, since nothing in the Deal Room module logs that (it isn't part of
// this feature; if that's wanted, it belongs to whatever module owns
// matching/interest, not the deal room audit trail).
function describeAction(entry) {
  const who = entry.actor_role === 'FOUNDER' ? 'Founder' : entry.actor_role === 'INVESTOR' ? 'Investor' : 'Someone'
  const fileName = entry.metadata?.fileName
  switch (entry.action) {
    case 'DEAL_ROOM_CREATED':
      return 'Deal Room Created'
    case 'DOCUMENT_UPLOADED':
      return `${who} Uploaded${fileName ? ` "${fileName}"` : ' a Document'}`
    case 'DOCUMENT_DOWNLOADED':
      return `${who} Viewed${fileName ? ` "${fileName}"` : ' a Document'}`
    case 'AGREEMENT_SIGNED':
      return `${who} Signed${fileName ? ` "${fileName}"` : ' an Agreement'}`
    default:
      return `${who}: ${entry.action}`
  }
}

function AuditLogTab({ dealRoomId, token }) {
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!dealRoomId || !token) return

    let cancelled = false
    fetch(`${API_BASE}/api/dealrooms/${dealRoomId}/audit-log`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load audit log')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setLog(data)
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
  }, [dealRoomId, token])

  return (
    <div>
      <h3 className="text-navy-100 font-bold uppercase tracking-wide mb-4">Audit Log</h3>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      {loading && <p className="text-navy-400 text-sm">Loading…</p>}

      <div className="flex flex-col gap-2">
        {log.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 bg-navy-950 border border-navy-800 rounded-lg px-4 py-3"
          >
            <div className="w-8 h-8 rounded-full bg-navy-600 text-gold-300 flex items-center justify-center font-semibold text-xs shrink-0">
              {(entry.actor_label || '?').charAt(0).toUpperCase()}
            </div>
            <p className="text-navy-100 text-sm">{describeAction(entry)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AuditLogTab