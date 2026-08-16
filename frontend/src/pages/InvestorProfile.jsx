import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

function InvestorProfile() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    location: '',
    bio: '',
    organization: '',
    interests: '',
    experience: '',
    linkedin: '',
    photo: '',
  })

  const [saved, setSaved] = useState(false)

  function handleChange(field) {
    return (e) => {
      setForm({
        ...form,
        [field]: e.target.value,
      })
      setSaved(false)
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

  function handleSubmit(e) {
    e.preventDefault()

    localStorage.setItem(
      'investorProfile',
      JSON.stringify(form)
    )

    localStorage.setItem(
      'investorProfileComplete',
      'true'
    )

    setSaved(true)
  }

  const requiredFields = [
    form.name,
    form.location,
    form.bio,
    form.organization,
    form.interests,
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
          Investor Profile
        </h1>

        <p className="text-navy-400 mt-2">
          Build your investor identity and help founders understand who you are.
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
                  : 'I'}
              </span>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-navy-100">
              Profile Photo
            </h2>

            <p className="text-sm text-navy-400 mt-1 mb-3">
              Add a professional photo to your investor profile.
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
              Tell founders who you are and what you are looking for.
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

          <Input
            label="Organization / Firm"
            placeholder="Your company, fund or organization"
            value={form.organization}
            onChange={handleChange('organization')}
            required
          />

          <div className="flex flex-col gap-1.5 text-left">

            <label className="text-sm font-medium text-navy-100">
              About you
            </label>

            <textarea
              rows={5}
              placeholder="Tell founders about yourself, your investment background and your experience."
              value={form.bio}
              onChange={handleChange('bio')}
              required
              className="bg-navy-950/60 border border-navy-700 rounded-lg px-4 py-2.5 text-navy-100 placeholder-navy-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 resize-none"
            />

          </div>

          <div className="flex flex-col gap-1.5 text-left">

            <label className="text-sm font-medium text-navy-100">
              Investment interests
            </label>

            <textarea
              rows={4}
              placeholder="Fintech, Agritech, AI, Climate Tech, SaaS..."
              value={form.interests}
              onChange={handleChange('interests')}
              required
              className="bg-navy-950/60 border border-navy-700 rounded-lg px-4 py-2.5 text-navy-100 placeholder-navy-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 resize-none"
            />

          </div>

          <div className="flex flex-col gap-1.5 text-left">

            <label className="text-sm font-medium text-navy-100">
              Investment experience
            </label>

            <textarea
              rows={4}
              placeholder="Describe your investment experience, previous investments or relevant professional background."
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