import { useState } from 'react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function PitchSubmission() {
  const [form, setForm] = useState({
    title: '',
    summary: '',
    askAmount: '',
    deckLink: '',
  })

  const [submitted, setSubmitted] = useState(false)

  function handleChange(field) {
    return (e) => {
      setForm({
        ...form,
        [field]: e.target.value,
      })
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    console.log('Pitch submission:', form)
    setSubmitted(true)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gold-500 mb-1">
        Submit Your Pitch
      </h1>

      <p className="text-navy-400 text-sm mb-6">
        Get in front of investors on FundBridge
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

          {submitted && (
            <p className="text-gold-300 text-sm">
              Submitted locally — will sync once the backend endpoint is live.
            </p>
          )}

          <Button
            type="submit"
            className="mt-2 self-start"
          >
            Submit Pitch
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default PitchSubmission