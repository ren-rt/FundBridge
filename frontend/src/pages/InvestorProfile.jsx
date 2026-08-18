import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const STAGE_OPTIONS = [
  { value: 'PRE_SEED', label: 'Pre-Seed' },
  { value: 'SEED', label: 'Seed' },
  { value: 'SERIES_A', label: 'Series A' },
  { value: 'SERIES_B', label: 'Series B' },
]

function InvestorProfile() {
  const navigate = useNavigate()

  const { getToken, appUser } = useAuth()

  const [form, setForm] = useState({
    firm_name: '',
    primary_domain: '',
    secondary_domains: '',
    stage_pref: [],
    ticket_min: '',
    ticket_max: '',
    location: '',
    investment_thesis: '',
  })

  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleChange(field) {
    return (e) => {
      setForm({
        ...form,
        [field]: e.target.value,
      })

      setSaved(false)
      setError('')
    }
  }

  function toggleStagePref(value) {
    setForm((prev) => ({
      ...prev,
      stage_pref: prev.stage_pref.includes(value)
        ? prev.stage_pref.filter((v) => v !== value)
        : [...prev.stage_pref, value],
    }))
    setSaved(false)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setSaved(false)
    setError('')

    try {
      const token = await getToken()

      if (!token) {
        throw new Error(
          'Authentication token not available. Please log in again.'
        )
      }

      if (!appUser?.id) {
        throw new Error(
          'User information not available. Please log in again.'
        )
      }

      const res = await fetch(
        'http://localhost:3000/api/investors',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: appUser.id,
            firm_name: form.firm_name,
            primary_domain: form.primary_domain,
            secondary_domains: form.secondary_domains
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
            stage_pref: form.stage_pref,
            ticket_min: form.ticket_min,
            ticket_max: form.ticket_max,
            location: form.location,
            investment_thesis: form.investment_thesis,
          }),
        }
      )

      if (!res.ok) {
        const message = await res.text()
        throw new Error(
          message || 'Failed to save investor profile'
        )
      }

      // Keep frontend completion behaviour
      localStorage.setItem(
        'investorProfile',
        JSON.stringify(form)
      )

      localStorage.setItem(
        'investorProfileComplete',
        'true'
      )

      setSaved(true)

    } catch (err) {
      console.error(
        'Investor profile save error:',
        err
      )

      setError(
        err.message ||
        'Could not save investor profile'
      )
    }
  }

  const requiredFields = [
    form.firm_name,
    form.primary_domain,
    form.ticket_min,
    form.ticket_max,
    form.location,
    form.investment_thesis,
  ]

  const completedFields =
    requiredFields.filter((field) => field.trim() !== '').length +
    (form.stage_pref.length > 0 ? 1 : 0)

  const completion = Math.round(
    (completedFields / (requiredFields.length + 1)) * 100
  )

  return (
    <div className="max-w-3xl mx-auto">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gold-500">
          Investor Profile
        </h1>

        <p className="text-navy-400 mt-2">
          Build your investor profile and help founders understand what you are looking for.
        </p>
      </div>

      <Card>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >

          <div>
            <h2 className="text-lg font-semibold text-navy-100">
              Investment Information
            </h2>

            <p className="text-sm text-navy-400 mt-1">
              Tell founders about your investment focus and preferences.
            </p>
          </div>

          <Input
            label="Firm / Individual Name"
            placeholder="Acme Ventures"
            value={form.firm_name}
            onChange={handleChange('firm_name')}
            required
          />

          <div className="grid grid-cols-2 gap-4">

            <Input
              label="Primary Domain"
              placeholder="Fintech"
              value={form.primary_domain}
              onChange={handleChange('primary_domain')}
              required
            />

            <Input
              label="Secondary Domains"
              placeholder="Agritech, AI, SaaS"
              value={form.secondary_domains}
              onChange={handleChange('secondary_domains')}
            />

          </div>

          <div className="flex flex-col gap-1.5 text-left">

            <label className="text-sm font-medium text-navy-100">
              Stage Preference
            </label>

            <div className="flex gap-2 flex-wrap">
              {STAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleStagePref(opt.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    form.stage_pref.includes(opt.value)
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-navy-950/60 border border-navy-700 text-navy-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <Input
              label="Minimum Ticket Size (USD)"
              type="number"
              placeholder="10000"
              value={form.ticket_min}
              onChange={handleChange('ticket_min')}
              required
            />

            <Input
              label="Maximum Ticket Size (USD)"
              type="number"
              placeholder="100000"
              value={form.ticket_max}
              onChange={handleChange('ticket_max')}
              required
            />

          </div>

          <Input
            label="Location"
            placeholder="Colombo, Sri Lanka"
            value={form.location}
            onChange={handleChange('location')}
            required
          />

          <div className="flex flex-col gap-1.5 text-left">

            <label className="text-sm font-medium text-navy-100">
              Investment Thesis
            </label>

            <textarea
              rows={5}
              placeholder="Describe the types of founders, companies and opportunities you are interested in investing in."
              value={form.investment_thesis}
              onChange={handleChange('investment_thesis')}
              required
              className="bg-navy-950/60 border border-navy-700 rounded-lg px-4 py-2.5 text-navy-100 placeholder-navy-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 resize-none"
            />

          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="border-t border-navy-800 pt-5">

            <div className="flex justify-between text-sm mb-2">

              <span className="text-navy-400">
                Profile completion
              </span>

              <span className="text-gold-300 font-medium">
                {completion}%
              </span>

            </div>

            <div className="w-full h-2 bg-navy-800 rounded-full overflow-hidden">

              <div
                className="h-full bg-gold-500 rounded-full transition-all"
                style={{
                  width: `${completion}%`,
                }}
              />

            </div>

          </div>

          {saved && (
            <div className="bg-navy-800 border border-gold-500/30 rounded-lg px-4 py-3 text-sm text-gold-300">
              Investor profile saved successfully.
            </div>
          )}

          <div className="flex justify-between items-center pt-2">

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/investor-home')}
            >
              Back
            </Button>

            <Button type="submit">
              Save Profile
            </Button>

          </div>

        </form>

      </Card>

    </div>
  )
}

export default InvestorProfile