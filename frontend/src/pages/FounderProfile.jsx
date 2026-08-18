import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const API_URL = 'http://localhost:3000/api/founders'

const STAGE_OPTIONS = [
  { value: 'PRE_SEED', label: 'Pre-Seed' },
  { value: 'SEED', label: 'Seed' },
  { value: 'SERIES_A', label: 'Series A' },
  { value: 'SERIES_B', label: 'Series B' },
]

function FounderProfile() {
  const navigate = useNavigate()
  const { getToken, appUser } = useAuth()

  const [form, setForm] = useState({
    full_name: appUser?.full_name || '',
    company: '',
    location: '',
    bio: '',
    skills: '',
    stage: '',
    experience: '',
    linkedin: '',
    photo: '',
  })

  const [profileId, setProfileId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      if (!appUser) {
        setLoading(false)
        return
      }

      try {
        setError('')

        const token = await getToken()

        if (!token) {
          throw new Error(
            'Authentication token not available. Please log in again.'
          )
        }

        const res = await fetch(`${API_URL}/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.status === 404) {
          setLoading(false)
          return
        }

        if (!res.ok) {
          const data = await res.json().catch(() => null)

          throw new Error(
            data?.error || 'Failed to load founder profile'
          )
        }

        const profile = await res.json()

        setProfileId(profile.id)

        setForm({
          full_name:
            profile.full_name ||
            appUser.full_name ||
            '',

          company:
            profile.company ||
            '',

          location:
            profile.country ||
            '',

          bio:
            profile.description ||
            '',

          skills:
            profile.industry ||
            '',

          stage:
            profile.stage ||
            '',

          experience:
            profile.experience ||
            '',

          linkedin:
            profile.linkedin_url ||
            '',

          photo:
            profile.photo_url ||
            '',
        })

        localStorage.setItem(
          'founderProfileComplete',
          'true'
        )
      } catch (err) {
        console.error('Founder profile load error:', err)

        setError(
          err.message || 'Could not load founder profile'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [appUser, getToken])

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))

      setSaved(false)
      setError('')
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]

    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        photo: reader.result,
      }))

      setSaved(false)
      setError('')
    }

    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setSaved(false)

    try {
      const token = await getToken()

      if (!token) {
        throw new Error(
          'Authentication token not available. Please log in again.'
        )
      }

      if (!appUser?.id) {
        throw new Error(
          'User information is not available. Please log in again.'
        )
      }

      const payload = {
        user_id: appUser.id,

        full_name: form.full_name,

        company: form.company,

        industry: form.skills,

        stage: form.stage,

        country: form.location,

        region: form.location,

        funding_amount: null,

        description: form.bio,

        experience: form.experience,

        linkedin_url: form.linkedin || null,

        photo_url: form.photo || null,
      }

      let res

      if (profileId) {
        // Existing profile → UPDATE
        res = await fetch(
          `${API_URL}/${profileId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        )
      } else {
        // No profile yet → CREATE
        res = await fetch(
          API_URL,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        )
      }

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const validationError =
          data?.errors?.[0]?.msg

        throw new Error(
          data?.error ||
          validationError ||
          'Failed to save founder profile'
        )
      }

      // Store the profile ID returned by backend
      if (data?.id) {
        setProfileId(data.id)
      }

      // Keep localStorage in sync
      localStorage.setItem(
        'founderProfile',
        JSON.stringify(form)
      )

      localStorage.setItem(
        'founderProfileComplete',
        'true'
      )

      // Update the form with whatever backend returned
      setForm({
        full_name: data.full_name || '',
        company: data.company || '',
        location: data.country || '',
        bio: data.description || '',
        skills: data.industry || '',
        stage: data.stage || '',
        experience: data.experience || '',
        linkedin: data.linkedin_url || '',
        photo: data.photo_url || '',
      })

      setSaved(true)
    } catch (err) {
      console.error('Founder profile save error:', err)

      setError(
        err.message || 'Could not save founder profile'
      )
    }
  }

  const requiredFields = [
    form.full_name,
    form.company,
    form.location,
    form.bio,
    form.skills,
    form.stage,
    form.experience,
  ]

  const completedFields = requiredFields.filter(
    (field) =>
      typeof field === 'string' &&
      field.trim() !== ''
  ).length

  const completion = Math.round(
    (completedFields / requiredFields.length) * 100
  )

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-navy-400">
          Loading founder profile...
        </p>
      </div>
    )
  }

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

      {/* Profile Photo */}
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
                {form.full_name
                  ? form.full_name.charAt(0).toUpperCase()
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

      {/* Personal Information */}
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

          {/* Full Name */}
          <Input
            label="Full name"
            placeholder="Your full name"
            value={form.full_name}
            onChange={handleChange('full_name')}
            required
          />

          {/* Company Name */}
          <Input
            label="Company / Startup name"
            placeholder="Your startup name"
            value={form.company}
            onChange={handleChange('company')}
            required
          />

          {/* Location */}
          <Input
            label="Location"
            placeholder="Colombo, Sri Lanka"
            value={form.location}
            onChange={handleChange('location')}
            required
          />

          {/* About */}
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

          {/* Skills */}
          <Input
            label="Skills"
            placeholder="Leadership, Product Design, Marketing, Python..."
            value={form.skills}
            onChange={handleChange('skills')}
            required
          />

          {/* Startup Stage */}
          <div className="flex flex-col gap-1.5 text-left">

            <label className="text-sm font-medium text-navy-100">
              Startup stage
            </label>

            <select
              value={form.stage}
              onChange={handleChange('stage')}
              required
              className="bg-navy-950/60 border border-navy-700 rounded-lg px-4 py-2.5 text-navy-100 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            >
              <option value="">
                Select startup stage
              </option>

              {STAGE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

          </div>

          {/* Experience */}
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

          {/* LinkedIn */}
          <Input
            label="LinkedIn profile"
            placeholder="https://linkedin.com/in/yourname"
            value={form.linkedin}
            onChange={handleChange('linkedin')}
          />

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Completion */}
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

          {/* Success */}
          {saved && (
            <div className="bg-navy-800 border border-gold-500/30 rounded-lg px-4 py-3 text-sm text-gold-300">
              Profile saved successfully. Your changes have been saved.
            </div>
          )}

          {/* Buttons */}
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