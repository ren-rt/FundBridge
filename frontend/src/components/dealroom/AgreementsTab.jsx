import { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:3000'

function AgreementsTab({ dealRoomId, token }) {
  const [agreements, setAgreements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [signingId, setSigningId] = useState(null)

  function loadAgreements() {
    return fetch(`${API_BASE}/api/dealrooms/${dealRoomId}/agreements`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load agreements')
        return res.json()
      })
      .then((data) => {
        setAgreements(data)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!dealRoomId || !token) return
    loadAgreements().catch(() => {
      // errors already surfaced via setError inside loadAgreements
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealRoomId, token])

  async function handleSign(documentId) {
    setSigningId(documentId)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/dealrooms/documents/${documentId}/sign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Signing failed')
      await loadAgreements()
    } catch (err) {
      setError(err.message)
    } finally {
      setSigningId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-navy-100 font-bold uppercase tracking-wide">Agreements</h3>
        {agreements.some((a) => a.my_status !== 'SIGNED') && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gold-500/15 text-gold-300">
            Awaiting Sign
          </span>
        )}
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      {loading && <p className="text-navy-400 text-sm">Loading…</p>}

      {!loading && agreements.length === 0 && (
        <p className="text-navy-400 text-sm">
          No agreements yet. Upload a document as a "Signed Agreement" type from the Documents tab to start one.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {agreements.map((doc) => (
          <div
            key={doc.document_id}
            className="flex items-center justify-between bg-navy-950 border border-navy-800 rounded-lg px-4 py-3"
          >
            <p className="text-navy-100 font-medium">{doc.file_name}</p>

            {doc.my_status === 'SIGNED' ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">
                Signed
              </span>
            ) : (
              <button
                onClick={() => handleSign(doc.document_id)}
                disabled={signingId === doc.document_id}
                className="rounded-lg px-4 py-1.5 text-sm font-semibold bg-green-500/90 text-navy-950 hover:bg-green-400 transition-colors disabled:opacity-50"
              >
                {signingId === doc.document_id ? 'Signing…' : 'Sign'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgreementsTab