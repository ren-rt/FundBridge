import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function Messages() {
  const { getToken, appUser } = useAuth()
  const [threads, setThreads] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  const loadThreads = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch('http://localhost:3000/api/messages/threads', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Could not load conversations')
      setThreads(await res.json())
    } catch (err) {
      setError(err.message)
    }
  }, [getToken])

  useEffect(() => {
    ;(async () => {
      await loadThreads()
    })()
  }, [loadThreads])

  async function openThread(thread) {
    setActiveThread(thread)
    setError('')
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch(`http://localhost:3000/api/messages/threads/${thread.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Could not load messages')
      setMessages(await res.json())
    } catch (err) {
      setError(err.message)
    }
  }

  async function respond(accept) {
    if (!activeThread) return
    const token = await getToken()
    try {
      const res = await fetch(
        `http://localhost:3000/api/messages/threads/${activeThread.id}/${accept ? 'accept' : 'decline'}`,
        { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')
      setActiveThread(data)
      await loadThreads()
    } catch (err) {
      setError(err.message)
    }
  }

  async function sendReply(e) {
    e.preventDefault()
    if (!draft.trim() || !activeThread) return
    const token = await getToken()
    try {
      const res = await fetch(`http://localhost:3000/api/messages/threads/${activeThread.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: draft.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not send message')
      setMessages((prev) => [...prev, data.message])
      setDraft('')
    } catch (err) {
      setError(err.message)
    }
  }

  const isRecipient = activeThread && activeThread.initiated_by_user_id !== appUser?.id

  return (
    <div className="grid grid-cols-3 gap-6">
      <div>
        <h2 className="text-lg font-semibold text-navy-100 mb-3">Conversations</h2>
        {threads.map((t) => (
          <Card
            key={t.id}
            className={`mb-2 cursor-pointer ${activeThread?.id === t.id ? 'border-gold-500' : ''}`}
            onClick={() => openThread(t)}
          >
            <p className="font-medium text-navy-100 text-sm">{t.counterparty_label}</p>
            <p className="text-navy-400 text-xs mt-1 truncate">{t.last_message}</p>
            {t.status !== 'ACCEPTED' && (
              <span className="text-xs text-gold-300">{t.status}</span>
            )}
          </Card>
        ))}
      </div>

      <div className="col-span-2">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">
            {error}
          </div>
        )}

        {!activeThread ? (
          <p className="text-navy-400 text-sm">Select a conversation.</p>
        ) : (
          <Card>
            {activeThread.status === 'PENDING' && isRecipient && (
              <div className="flex gap-2 mb-4 pb-4 border-b border-navy-800">
                <Button className="text-sm px-3 py-1.5" onClick={() => respond(true)}>Accept</Button>
                <Button variant="ghost" className="text-sm px-3 py-1.5" onClick={() => respond(false)}>Decline</Button>
              </div>
            )}

            <div className="flex flex-col gap-3 mb-4">
              {messages.map((m) => (
                <div key={m.id} className={m.sender_user_id === appUser?.id ? 'text-right' : ''}>
                  <p className="text-sm text-navy-100 inline-block bg-navy-800 rounded-lg px-3 py-2">{m.content}</p>
                </div>
              ))}
            </div>

            {activeThread.status === 'ACCEPTED' && (
              <form onSubmit={sendReply} className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 bg-navy-950/60 border border-navy-700 rounded-lg px-3 py-2 text-sm text-navy-100"
                />
                <Button type="submit" className="text-sm px-3 py-2">Send</Button>
              </form>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

export default Messages