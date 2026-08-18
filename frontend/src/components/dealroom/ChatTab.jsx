import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../../lib/api'

function ChatTab({ dealRoomId, token, currentUserId }) {
  const [messages, setMessages] = useState([])
  const [online, setOnline] = useState([])
  const [draft, setDraft] = useState('')
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const socketRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!token || !dealRoomId) return

    const socket = io(SOCKET_URL, { auth: { token } })
    socketRef.current = socket

    socket.on('connect_error', (err) => setError(err.message))

    socket.emit('join-room', { dealRoomId }, (response) => {
      if (response?.error) {
        setError(response.error)
        return
      }
      setMessages(response.history || [])
      setConnected(true)
    })

    socket.on('new-message', (message) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on('presence-update', ({ online: onlineIds }) => {
      setOnline(onlineIds || [])
    })

    return () => {
      socket.disconnect()
    }
  }, [token, dealRoomId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend(e) {
    e.preventDefault()
    const content = draft.trim()
    if (!content || !socketRef.current) return

    socketRef.current.emit('send-message', { dealRoomId, content }, (response) => {
      if (response?.error) setError(response.error)
    })
    setDraft('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-navy-100 font-bold uppercase tracking-wide">Chat</h3>
        <span className="text-xs text-navy-400">
          {connected ? `${online.length} online` : 'Connecting…'}
        </span>
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-4 min-h-0">
        {messages.map((msg) => {
          const isMine = msg.sender_user_id === currentUserId
          return (
            <div
              key={msg.id}
              className={`max-w-[70%] px-4 py-2.5 rounded-lg text-sm ${
                isMine
                  ? 'self-end bg-gold-500 text-navy-950'
                  : 'self-start bg-navy-950 border border-navy-800 text-navy-100'
              }`}
            >
              {msg.content}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 bg-navy-950/60 border border-navy-800 rounded-lg px-4 py-2.5 text-navy-100 placeholder-navy-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
        />
        <button
          type="submit"
          className="rounded-lg px-5 py-2.5 font-semibold bg-gold-500 text-navy-950 hover:bg-gold-300 transition-all"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatTab