import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function NotificationBell() {
  const { getToken, appUser } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const containerRef = useRef(null)

  const fetchUnreadCount = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch('http://localhost:3000/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setUnreadCount(data.count)
    } catch {
      // Polling failure is silent -- don't interrupt the rest of the UI over it.
    }
  }, [getToken])

  const fetchNotifications = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch('http://localhost:3000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data)
    } catch {
      // Same as above.
    }
  }, [getToken])

    useEffect(() => {
    if (!appUser) return
    ;(async () => {
      await fetchUnreadCount()
    })()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [appUser, fetchUnreadCount])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function toggleOpen() {
    const next = !open
    setOpen(next)
    if (next) await fetchNotifications()
  }

  async function markRead(id) {
    const token = await getToken()
    if (!token) return
    await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  async function markAllRead() {
    const token = await getToken()
    if (!token) return
    await fetch('http://localhost:3000/api/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  if (!appUser) return null

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggleOpen}
        className="relative p-2 rounded-full hover:bg-navy-800 transition-colors"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-navy-100" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-gold-500 text-navy-950 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-navy-900 border border-navy-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center px-4 py-3 border-b border-navy-800">
            <span className="text-sm font-semibold text-navy-100">Notifications</span>
            {notifications.some((n) => !n.is_read) && (
              <button onClick={markAllRead} className="text-xs text-gold-300 hover:text-gold-100">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-sm text-navy-400 text-center">No notifications yet.</div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`w-full text-left px-4 py-3 border-b border-navy-800 last:border-b-0 hover:bg-navy-800 transition-colors ${n.is_read ? '' : 'bg-navy-800/40'}`}
              >
                <div className="flex items-start gap-2">
                  {!n.is_read && <span className="w-2 h-2 mt-1.5 rounded-full bg-gold-500 flex-shrink-0" />}
                  <div>
                    <p className="text-sm text-navy-100">{n.message}</p>
                    <p className="text-xs text-navy-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell