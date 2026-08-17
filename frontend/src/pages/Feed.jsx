import { useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const POSTS = [
  {
    id: 1,
    name: 'Noah Carter',
    title: 'Smart Water Quality Monitoring System',
    body: 'Successfully completed the integration of our calibrated IoT sensors with the ESP32 microcontroller! The system is now reliably capturing real-time pH, temperature, and turbidity parameters to monitor water safety.',
  },
  {
    id: 2,
    name: 'Brooklyn Simmons',
    title: 'AI-Powered Eco Logistics',
    body: 'We are optimizing supply chain routes using predictive machine learning algorithms to minimize carbon emissions in urban delivery grids. Seeking seed funding to scale our cloud infrastructure.',
  },
]

const SUGGESTED_INVESTORS = [
  {
    name: 'Ann Howard',
    sub: 'Corporate · Online Media',
  },
  {
    name: 'Uplabs',
    sub: 'TechStart',
  },
  {
    name: 'Sharaka Inv.',
    sub: 'Techson',
  },
]

const LIVE_SESSIONS = [
  {
    name: 'Ann Howard',
    sub: 'Corporate · Online Media',
  },
  {
    name: 'Uplabs',
    sub: 'TechStart',
  },
  {
    name: 'Sharaka Inv.',
    sub: 'Techson',
  },
]

function PostCard({ post }) {
  return (
    <Card className="mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={post.name} />

          <div>
            <p className="font-semibold text-navy-100">
              {post.name}
            </p>

            <p className="text-xs text-navy-400">
              posted their pitch
            </p>
          </div>
        </div>

        <button className="text-navy-400 hover:text-navy-100">
          ⋯
        </button>
      </div>

      <h3 className="font-semibold text-navy-100 mt-4">
        {post.title}
      </h3>

      <p className="text-navy-300 text-sm mt-2 leading-relaxed">
        {post.body}
      </p>

      <div className="flex gap-6 mt-4 text-navy-400">
        <button className="hover:text-gold-300 text-sm flex items-center gap-1.5">
          ♥ Like
        </button>

        <button className="hover:text-gold-300 text-sm flex items-center gap-1.5">
          💬 Comment
        </button>

        <button className="hover:text-gold-300 text-sm flex items-center gap-1.5">
          ↗ Share
        </button>
      </div>
    </Card>
  )
}

function SuggestionRow({ name, sub }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar name={name} size="sm" />

        <div>
          <p className="text-sm font-medium text-navy-100">
            {name}
          </p>

          <p className="text-xs text-navy-400">
            {sub}
          </p>
        </div>
      </div>

      <button className="text-xs border border-gold-500 text-gold-300 rounded-full px-3 py-1 hover:bg-gold-500 hover:text-navy-950 transition-colors">
        Connect
      </button>
    </div>
  )
}

function Feed() {
  const [update, setUpdate] = useState('')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* Left column */}
      <aside className="lg:col-span-3">
        <Card className="text-center">
          <div className="flex justify-center">
            <Avatar name="Cameron Williams" size="lg" />
          </div>

          <p className="font-semibold text-navy-100 mt-3">
            Cameron Williams
          </p>

          <p className="text-navy-400 text-sm">
            Founder at Care4All
          </p>

          <div className="mt-4 pt-4 border-t border-navy-800 text-left text-sm">
            <div className="flex justify-between py-1">
              <span className="text-navy-400">
                Who viewed your profile
              </span>

              <span className="text-gold-300 font-medium">
                96
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-navy-400">
                Views of your post
              </span>

              <span className="text-gold-300 font-medium">
                627
              </span>
            </div>
          </div>
        </Card>
      </aside>

      {/* Middle column */}
      <main className="lg:col-span-6">

        <div className="flex gap-6 border-b border-navy-800 mb-4 text-sm font-medium">
          <span className="text-gold-500 border-b-2 border-gold-500 pb-3">
            Dashboard
          </span>

          <Link
            to="/startup-school"
            className="text-navy-400 hover:text-navy-100 pb-3"
          >
            Startup School
          </Link>

          <span className="text-navy-400 pb-3">
            Messages
          </span>
        </div>

        <Card className="mb-4">
          <input
            placeholder="Share an update or idea..."
            value={update}
            onChange={(e) => setUpdate(e.target.value)}
            className="w-full bg-navy-950/60 border border-navy-700 rounded-lg px-4 py-2.5 text-navy-100 placeholder-navy-400 focus:outline-none focus:border-gold-500"
          />
        </Card>

        {POSTS.map((p) => (
          <PostCard
            key={p.id}
            post={p}
          />
        ))}
      </main>

      {/* Right column */}
      <aside className="lg:col-span-3">

        <Card className="mb-4">
          <h3 className="text-sm font-semibold text-navy-100 mb-3">
            Suggested Investors
          </h3>

          <div className="flex flex-col gap-3">
            {SUGGESTED_INVESTORS.map((inv) => (
              <SuggestionRow
                key={inv.name}
                {...inv}
              />
            ))}
          </div>
        </Card>

        <Card className="mb-4">
          <h3 className="text-sm font-semibold text-navy-100 mb-3">
            Upcoming Live Sessions
          </h3>

          <div className="flex flex-col gap-3">
            {LIVE_SESSIONS.map((s) => (
              <SuggestionRow
                key={s.name}
                {...s}
              />
            ))}
          </div>
        </Card>

        <Link to="/pitch">
          <Button className="w-full">
            Create a Pitch
          </Button>
        </Link>

      </aside>
    </div>
  )
}

export default Feed