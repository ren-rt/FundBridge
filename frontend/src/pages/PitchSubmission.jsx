import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function PitchSubmission() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { getToken } = useAuth()

  const [form, setForm] = useState({
    title: '',
    summary: '',
    askAmount: '',
    deckLink: '',
  })

  const [status, setStatus] = useState('DRAFT')
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditing) return

    async function loadPitch() {
      const token = await getToken()
      if (!token) return

      try {
        const res = await fetch(`http://localhost:3000/api/pitches/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Could not load this pitch')
        const pitch = await res.json()

        setForm({
          title: pitch.title || '',
          summary: pitch.summary || '',
          askAmount: pitch.ask_amount || '',
          deckLink: pitch.image_url || '',
        })
        setStatus(pitch.status)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPitch()
  }, [id, isEditing, getToken])

  function handleChange(field) {
    return (e) => {
      setForm({ ...form, [field]: e.target.value })
      setMessage('')
    }
  }

  async function save(nextStatus) {
    setError('')
    setMessage('')
    setSaving(true)

    try {
      const token = await getToken()
      if (!token) throw new Error('Authentication token not available. Please log in again.')

      const body = {
        title: form.title,
        summary: form.summary,
        ask_amount: form.askAmount || null,
        // No dedicated "deck" field exists on the backend yet (pitch decks
        // aren't viewable inline anywhere in the app) -- this reuses the
        // pitch's image_url column as a stand-in link for now.
        image_url: form.deckLink || null,
        status: nextStatus,
      }

      const url = isEditing
        ? `http://localhost:3000/api/pitches/${id}`
        : 'http://localhost:3000/api/pitches'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || data?.errors?.[0]?.msg || 'Failed to save pitch')
      }

      const saved = await res.json()
      setStatus(saved.status)
      setMessage(nextStatus === 'DRAFT' ? 'Draft saved.' : 'Pitch submitted!')

      if (!isEditing) {
        navigate(`/pitch/${saved.id}`, { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Could not save pitch')
    } finally {
      setSaving(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    save('SUBMITTED')
  }

  function handleSaveDraft() {
    save('DRAFT')
  }

  if (loading) {
    return <p className="text-navy-400 text-sm">Loading pitch...</p>
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gold-500 mb-1">
        {isEditing ? 'Edit Your Pitch' : 'Submit Your Pitch'}
      </h1>

      <p className="text-navy-400 text-sm mb-6">
        {isEditing
          ? `Status: ${status}`
          : 'Get in front of investors on FundBridge'}
      </p>

      <Card>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Input
            label="Pitch title"
            placeholder="Solar-powered cold storage for farmers"
            value={form.title}
            onChange={handleChange('title')}
            required
          />

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-navy-100">
              Summary
            </label>

            <textarea
              rows={4}
              placeholder="What's the problem, the solution, and why now?"
              value={form.summary}
              onChange={handleChange('summary')}
              className="bg-navy-950/60 border border-navy-700 rounded-lg px-4 py-2.5 text-navy-100 placeholder-navy-400 transition-all focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 resize-none"
              required
            />
          </div>

          <Input
            label="Funding ask (USD)"
            type="number"
            placeholder="50000"
            value={form.askAmount}
            onChange={handleChange('askAmount')}
            required
          />

          <Input
            label="Pitch deck link"
            placeholder="https://..."
            value={form.deckLink}
            onChange={handleChange('deckLink')}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {message && (
            <p className="text-gold-300 text-sm">{message}</p>
          )}

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={saving}
            >
              Save as Draft
            </Button>

            <Button type="submit" disabled={saving}>
              {isEditing ? 'Save & Submit' : 'Submit Pitch'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default PitchSubmission