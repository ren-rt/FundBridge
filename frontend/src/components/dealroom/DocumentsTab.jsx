import { useEffect, useState } from 'react'

function formatSize(bytes) {
  if (!bytes) return ''
  const kb = bytes / 1024
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`
}

function DocumentsTab({ dealRoomId, token }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  const API_BASE = 'http://localhost:3000'

  function loadDocuments() {
    return fetch(`${API_BASE}/api/dealrooms/${dealRoomId}/documents`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load documents')
        return res.json()
      })
      .then((data) => {
        setDocuments(data)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!dealRoomId || !token) return
    loadDocuments().catch(() => {
      // errors already surfaced via setError inside loadDocuments
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealRoomId, token])

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('documentType', 'UPLOAD')

      const res = await fetch(`${API_BASE}/api/dealrooms/${dealRoomId}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) throw new Error('Upload failed')
      await loadDocuments()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDownload(doc) {
    try {
      const res = await fetch(`${API_BASE}/api/dealrooms/documents/${doc.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.file_name
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-navy-100 font-bold uppercase tracking-wide">Documents</h3>

        <label className="rounded-lg px-5 py-2.5 font-semibold transition-all active:scale-[0.98] bg-navy-800 text-navy-100 hover:bg-navy-600 border border-navy-600 cursor-pointer">
          {uploading ? 'Uploading…' : 'Upload'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      {loading && <p className="text-navy-400 text-sm">Loading…</p>}

      {!loading && documents.length === 0 && (
        <p className="text-navy-400 text-sm">No documents yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between bg-navy-950 border border-navy-800 rounded-lg px-4 py-3"
          >
            <div>
              <p className="text-navy-100 font-medium">{doc.file_name}</p>
              <p className="text-xs text-navy-400">
                {doc.document_type} · {formatSize(doc.size_bytes)}
              </p>
            </div>
            <button
              onClick={() => handleDownload(doc)}
              className="text-gold-300 hover:text-gold-100 text-sm font-medium"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DocumentsTab