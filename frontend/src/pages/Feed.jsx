import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const SUGGESTED_INVESTORS = [
  { name: 'Ann Howard', sub: 'Corporate · Online Media' },
  { name: 'Uplabs', sub: 'TechStart' },
  { name: 'Sharaka Inv.', sub: 'Techson' },
]

const LIVE_SESSIONS = [
  { name: 'Ann Howard', sub: 'Corporate · Online Media' },
  { name: 'Uplabs', sub: 'TechStart' },
  { name: 'Sharaka Inv.', sub: 'Techson' },
]

function PitchFeedCard({ item, onToggleBookmark }) {
  const [deckOpen, setDeckOpen] = useState(false)
  const [deckError, setDeckError] = useState(false)

  return (
    <Card className="mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={item.company} />
          <div>
            <p className="font-semibold text-navy-100">{item.company}</p>
            <p className="text-xs text-navy-400">
              posted their pitch{item.industry ? ` · ${item.industry}` : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => onToggleBookmark(item.id)}
          className={`text-sm ${item.bookmarked ? 'text-gold-400' : 'text-navy-400'} hover:text-gold-300`}
          aria-label="Bookmark"
        >
          {item.bookmarked ? '★ Saved' : '☆ Save'}
        </button>
      </div>

      <h3 className="font-semibold text-navy-100 mt-4">{item.title}</h3>
      <p className="text-navy-300 text-sm mt-2 leading-relaxed">{item.summary}</p>

      {item.ask_amount && (
        <p className="text-gold-300 text-sm mt-3 font-medium">
          Asking ${Number(item.ask_amount).toLocaleString()}
        </p>
      )}

      {item.deck_url && (
        <div className="mt-3">
          <button
            onClick={() => setDeckOpen((v) => !v)}
            className="text-sm text-gold-300 hover:text-gold-100"
          >
            {deckOpen ? 'Hide deck' : 'View deck'}
          </button>

          {deckOpen && (
            deckError ? (
              <div className="mt-3 bg-navy-800 border border-navy-700 rounded-lg px-4 py-6 text-center text-sm text-navy-400">
                Couldn't load this pitch deck.{' '}
                <a href={item.deck_url} target="_blank" rel="noreferrer" className="text-gold-300 hover:text-gold-100 underline">
                  Open it directly instead
                </a>
              </div>
            ) : (
              <iframe
                src={item.deck_url}
                title={`${item.title} deck`}
                className="w-full h-96 mt-3 rounded-lg border border-navy-700"
                onError={() => setDeckError(true)}
              />
            )
          )}
        </div>
      )}
    </Card>
  )
}

function PostFeedCard({ item, onReact, onToggleComments, commentsOpen, comments, onAddComment }) {
  const [draft, setDraft] = useState('')

  function submitComment(e) {
    e.preventDefault()
    if (!draft.trim()) return
    onAddComment(item.id, draft.trim())
    setDraft('')
  }

  return (
    <Card className="mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={item.author_label} />
          <div>
            <p className="font-semibold text-navy-100">{item.author_label}</p>
            <p className="text-xs text-navy-400">shared an update</p>
          </div>
        </div>
      </div>

      <p className="text-navy-300 text-sm mt-4 leading-relaxed whitespace-pre-wrap">
        {item.content}
      </p>

      <div className="flex gap-6 mt-4 text-navy-400">
        <button
          onClick={() => onReact(item.id)}
          className={`hover:text-gold-300 text-sm flex items-center gap-1.5 ${item.reacted_by_me ? 'text-gold-300' : ''}`}
        >
          ♥ {item.reacted_by_me ? 'Liked' : 'Like'} {item.reaction_count > 0 && `(${item.reaction_count})`}
        </button>

        <button
          onClick={() => onToggleComments(item.id)}
          className="hover:text-gold-300 text-sm flex items-center gap-1.5"
        >
          💬 Comment {item.comment_count > 0 && `(${item.comment_count})`}
        </button>
      </div>

      {commentsOpen && (
        <div className="mt-4 pt-4 border-t border-navy-800">
          {(comments || []).map((c) => (
            <div key={c.id} className="flex items-start gap-2 mb-3">
              <Avatar name={c.author_label} size="sm" />
              <div>
                <p className="text-sm">
                  <span className="font-medium text-navy-100">{c.author_label}</span>{' '}
                  <span className="text-navy-300">{c.content}</span>
                </p>
              </div>
            </div>
          ))}

          <form onSubmit={submitComment} className="flex gap-2 mt-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-navy-950/60 border border-navy-700 rounded-lg px-3 py-2 text-sm text-navy-100 placeholder-navy-400 focus:outline-none focus:border-gold-500"
            />
            <Button type="submit" className="px-3 py-2 text-sm">Post</Button>
          </form>
        </div>
      )}
    </Card>
  )
}

function SuggestionRow({ name, sub }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar name={name} size="sm" />
        <div>
          <p className="text-sm font-medium text-navy-100">{name}</p>
          <p className="text-xs text-navy-400">{sub}</p>
        </div>
      </div>

      <button className="text-xs border border-gold-500 text-gold-300 rounded-full px-3 py-1 hover:bg-gold-500 hover:text-navy-950 transition-colors">
        Connect
      </button>
    </div>
  )
}

function Feed() {
  const { getToken, appUser } = useAuth()

  const [composerText, setComposerText] = useState('')
  const [feedItems, setFeedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openComments, setOpenComments] = useState({})
  const [commentsByPost, setCommentsByPost] = useState({})
  const [sort, setSort] = useState('newest')

  const loadFeed = useCallback(async () => {
    const token = await getToken()
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const headers = { Authorization: `Bearer ${token}` }

      const [pitchRes, postRes] = await Promise.all([
        fetch(`http://localhost:3000/api/feed?sort=${sort}`, { headers }),
        fetch('http://localhost:3000/api/posts', { headers }),
      ])

      const pitchData = pitchRes.ok ? await pitchRes.json() : { items: [] }
      const postData = postRes.ok ? await postRes.json() : []

      const pitchItems = (pitchData.items || []).map((p) => ({ ...p, type: 'pitch' }))
      const postItems = (postData || []).map((p) => ({ ...p, type: 'post' }))

      const merged = [...pitchItems, ...postItems].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )

      setFeedItems(merged)
    } catch {
      setError('Could not load the feed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [getToken, sort])

  async function handleToggleBookmark(pitchId) {
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch(`http://localhost:3000/api/feed/${pitchId}/bookmark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const { bookmarked } = await res.json()
      setFeedItems((prev) =>
        prev.map((item) =>
          item.type === 'pitch' && item.id === pitchId ? { ...item, bookmarked } : item
        )
      )
    } catch {
      // Non-critical -- leave the UI as it was.
    }
  }

  useEffect(() => {
    if (appUser) {
      ;(async () => {
        await loadFeed()
      })()
    }
  }, [appUser, loadFeed])

  async function handlePostSubmit(e) {
    e.preventDefault()
    if (!composerText.trim()) return

    const token = await getToken()
    if (!token) return

    try {
      const res = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: composerText.trim() }),
      })

      if (!res.ok) throw new Error('Failed to post update')

      const newPost = await res.json()
      setFeedItems((prev) => [
        {
          ...newPost,
          type: 'post',
          author_label: appUser?.full_name || appUser?.email,
          comment_count: 0,
          reaction_count: 0,
          reacted_by_me: false,
        },
        ...prev,
      ])
      setComposerText('')
    } catch {
      setError('Could not share your update. Please try again.')
    }
  }

  async function handleReact(postId) {
    const token = await getToken()
    if (!token) return

    try {
      const res = await fetch(`http://localhost:3000/api/posts/${postId}/react`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const { reacted } = await res.json()

      setFeedItems((prev) =>
        prev.map((item) =>
          item.type === 'post' && item.id === postId
            ? {
                ...item,
                reacted_by_me: reacted,
                reaction_count: item.reaction_count + (reacted ? 1 : -1),
              }
            : item
        )
      )
    } catch {
      // Reaction failures are non-critical -- leave the UI as it was.
    }
  }

  async function handleToggleComments(postId) {
    const nextOpen = !openComments[postId]
    setOpenComments((prev) => ({ ...prev, [postId]: nextOpen }))

    if (nextOpen && !commentsByPost[postId]) {
      const token = await getToken()
      if (!token) return

      try {
        const res = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const comments = await res.json()
        setCommentsByPost((prev) => ({ ...prev, [postId]: comments }))
      } catch {
        // Comment list failing to load isn't fatal -- the section just stays empty.
      }
    }
  }

  async function handleAddComment(postId, content) {
    const token = await getToken()
    if (!token) return

    try {
      const res = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) return
      const newComment = await res.json()

      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [
          ...(prev[postId] || []),
          { ...newComment, author_label: appUser?.full_name || appUser?.email },
        ],
      }))

      setFeedItems((prev) =>
        prev.map((item) =>
          item.type === 'post' && item.id === postId
            ? { ...item, comment_count: item.comment_count + 1 }
            : item
        )
      )
    } catch {
      // Same as react -- non-critical, UI just doesn't update.
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <aside className="lg:col-span-3">
        <Card className="text-center">
          <div className="flex justify-center">
            <Avatar name={appUser?.full_name || 'You'} size="lg" />
          </div>

          <p className="font-semibold text-navy-100 mt-3">
            {appUser?.full_name || 'Your account'}
          </p>

          <p className="text-navy-400 text-sm">
            {appUser?.role === 'FOUNDER' ? 'Founder' : 'Investor'}
          </p>
        </Card>
      </aside>

      <main className="lg:col-span-6">

        <div className="flex gap-6 border-b border-navy-800 mb-4 text-sm font-medium items-center justify-between">
          <div className="flex gap-6">
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

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-navy-950/60 border border-navy-700 rounded-lg px-2 py-1 text-xs text-navy-300 mb-2"
          >
            <option value="newest">Newest</option>
            <option value="ask_amount_high">Highest Ask</option>
            <option value="ask_amount_low">Lowest Ask</option>
          </select>
        </div>

        <Card className="mb-4">
          <form onSubmit={handlePostSubmit}>
            <input
              placeholder="Share an update or idea..."
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              className="w-full bg-navy-950/60 border border-navy-700 rounded-lg px-4 py-2.5 text-navy-100 placeholder-navy-400 focus:outline-none focus:border-gold-500"
            />
          </form>
        </Card>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-navy-400 text-sm">Loading feed...</p>
        ) : feedItems.length === 0 ? (
          <p className="text-navy-400 text-sm">Nothing in the feed yet.</p>
        ) : (
          feedItems.map((item) =>
            item.type === 'pitch' ? (
              <PitchFeedCard key={`pitch-${item.id}`} item={item} onToggleBookmark={handleToggleBookmark} />
            ) : (
              <PostFeedCard
                key={`post-${item.id}`}
                item={item}
                onReact={handleReact}
                onToggleComments={handleToggleComments}
                commentsOpen={!!openComments[item.id]}
                comments={commentsByPost[item.id]}
                onAddComment={handleAddComment}
              />
            )
          )
        )}
      </main>

      <aside className="lg:col-span-3">

        <Card className="mb-4">
          <h3 className="text-sm font-semibold text-navy-100 mb-3">
            Suggested Investors
          </h3>

          <div className="flex flex-col gap-3">
            {SUGGESTED_INVESTORS.map((inv) => (
              <SuggestionRow key={inv.name} {...inv} />
            ))}
          </div>
        </Card>

        <Card className="mb-4">
          <h3 className="text-sm font-semibold text-navy-100 mb-3">
            Upcoming Live Sessions
          </h3>

          <div className="flex flex-col gap-3">
            {LIVE_SESSIONS.map((s) => (
              <SuggestionRow key={s.name} {...s} />
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