import { useState } from 'react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function InvestorProfile() {
  const [form, setForm] = useState({
    firmName: '',
    focusAreas: '',
    checkSize: '',
    stagePreference: '',
    bio: '',
  })

  const [saved, setSaved] = useState(false)

  function handleChange(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    console.log('Investor profile data:', form)
    localStorage.setItem('investorProfileComplete', 'true')
    setSaved(true)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gold-500 mb-1">
        Investor Profile
      </h1>

      <p className="text-navy-400 text-sm mb-6">
        Tell founders what you're looking for
      </p>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Firm / individual name"
            placeholder="Acme Ventures"
            value={form.firmName}
            onChange={handleChange('firmName')}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Focus areas"
              placeholder="Agritech, Fintech"
              value={form.focusAreas}
              onChange={handleChange('focusAreas')}
              required
            />

            <Input
              label="Stage preference"
              placeholder="Pre-seed, Seed"
              value={form.stagePreference}
              onChange={handleChange('stagePreference')}
              required
            />
          </div>

          <Input
            label="Typical check size (USD)"
            placeholder="25000"
            type="number"
            value={form.checkSize}
            onChange={handleChange('checkSize')}
            required
          />

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-navy-100">
              About you
            </label>

            <textarea
              rows={4}
              placeholder="What kind of founders do you want to work with?"
              value={form.bio}
              onChange={handleChange('bio')}
              className="bg-navy-950/60 border border-navy-700 rounded-lg px-4 py-2.5 text-navy-100 placeholder-navy-400 transition-all focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 resize-none"
              required
            />
          </div>

          {saved && (
            <p className="text-gold-300 text-sm">
              Saved locally — will sync once the backend endpoint is live.
            </p>
          )}

          <Button type="submit" className="mt-2 self-start">
            Save Profile
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default InvestorProfile