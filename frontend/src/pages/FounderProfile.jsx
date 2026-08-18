import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

function FounderProfile() {
  const navigate = useNavigate()

  const { getToken, appUser } = useAuth()

  const [form, setForm] = useState({
    name: appUser?.full_name || '',
    location: '',
    bio: '',
    skills: '',
    experience: '',
    linkedin: '',
    photo: '',
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

  function handlePhotoChange(e) {
    const file = e.target.files[0]

    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      setForm({
        ...form,
        photo: reader.result,
      })
      setSaved(false)
    }

    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')

    try {
      const token = await getToken()

      if (!token) {
        throw new Error('Authentication token not available. Please log in again.')
      }

      const res = await fetch('http://localhost:3000/api/founders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
  user_id: appUser?.id,
  company: form.name,
  industry: form.skills,
  stage: form.experience,
  country: form.location,
  region: form.location,
  funding_amount: '',
  description: form.bio,
}),
      })

      if (!res.ok) {
        const message = await res.text()
        throw new Error(message || 'Failed to save founder profile')
      }

      // Keep the existing frontend completion behaviour
      localStorage.setItem(
        'founderProfile',
        JSON.stringify(form)
      )

      localStorage.setItem(
        'founderProfileComplete',
        'true'
      )

      setSaved(true)

    } catch (err) {
      console.error('Founder profile save error:', err)
      setError(err.message || 'Could not save founder profile')
    }
  }

  const requiredFields = [
    form.name,
    form.location,
    form.bio,
    form.skills,
    form.experience,
  ]

  const completedFields = requiredFields.filter(
    (field) => field.trim() !== ''
  ).length

  const completion = Math.round(
    (completedFields / requiredFields.length) * 100
  )

  return (
    <div className="max-w-3xl mx-auto">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gold-500">
          Founder Profile
        </h1>

        <p className="text-navy-400 mt-2">
          Tell investors who you are and what you bring to the table.
        </p>
      </div>

      <Card className="mb-6">

        <div className="flex items-center gap-5">

          {form.photo ? (
            <img
              src={form.photo}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-gold-500"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-navy-700 border-2 border-navy-600 flex items-center justify-center">
              <span className="text-3xl text-gold-300">
                {form.name
                  ? form.name.charAt(0).toUpperCase()
                  : 'F'}
              </span>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-navy-100">
              Profile Photo
            </h2>

            <p className="text-sm text-navy-400 mt-1 mb-3">
              Add a professional photo so investors can recognize you.
            </p>

            <label className="inline-block cursor-pointer">
              <span className="inline-block bg-navy-800 border border-navy-700 text-gold-300 px-4 py-2 rounded-lg text-sm hover:border-gold-500 transition-colors">
                Choose Photo
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>

        </div>

      </Card>

      <Card>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >

          <div>
            <h2 className="text-lg font-semibold text-navy-100">
              Personal Information
            </h2>

            <p className="text-sm text-navy-400 mt-1">
              Complete your founder identity before moving on to Startup School.
            </p>
          </div>

          <Input
            label="Full name"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange('name')}
            required
          />

          <Input
            label="Location"
            placeholder="Colombo, Sri Lanka"
            value={form.location}
            onChange={handleChange('location')}
            required
          />

          <div className="flex flex-col gap-1.5 text-left">

            <label className="text-sm font-medium text-navy-100">
              About you
            </label>

            <textarea
              rows={5}
              placeholder="Tell investors a little about yourself, your background and what motivates you."
              value={form.bio}
              onChange={handleChange('bio')}
              required
              className="bg-navy-950/60 border border-navy-700 rounded-lg px-4 py-2.5 text-navy-100 placeholder-navy-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 resize-none"
            />

          </div>

          <Input
            label="Skills"
            placeholder="Leadership, Product Design, Marketing, Python..."
            value={form.skills}
            onChange={handleChange('skills')}
            required
          />

          <div className="flex flex-col gap-1.5 text-left">

            <label className="text-sm font-medium text-navy-100">
              Experience
            </label>

            <textarea
              rows={4}
              placeholder="Describe your previous work, education, projects or entrepreneurial experience."
              value={form.experience}
              onChange={handleChange('experience')}
              required
              className="bg-navy-950/60 border border-navy-700 rounded-lg px-4 py-2.5 text-navy-100 placeholder-navy-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 resize-none"
            />

          </div>

          <Input
            label="LinkedIn profile"
            placeholder="https://linkedin.com/in/yourname"
            value={form.linkedin}
            onChange={handleChange('linkedin')}
          />

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
              Profile saved successfully. You can now continue to Startup School.
            </div>
          )}

          <div className="flex justify-between items-center pt-2">

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/')}
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

export default FounderProfile