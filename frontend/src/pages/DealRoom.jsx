import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import DocumentsTab from '../components/dealroom/DocumentsTab'
import AgreementsTab from '../components/dealroom/AgreementsTab'
import ChatTab from '../components/dealroom/ChatTab'
import VideoTab from '../components/dealroom/VideoTab'
import AuditLogTab from '../components/dealroom/AuditLogTab'

const NAV_ITEMS = [
  { key: 'documents', label: 'Documents', banner: 'You can upload documents and download templates.' },
  { key: 'agreements', label: 'Agreements', banner: 'Review and sign pending agreements.' },
  { key: 'chat', label: 'Chat', banner: 'Message the other party in this deal room, in real time.' },
  { key: 'video', label: 'Video Call', banner: 'Start or join a video call for this deal room.' },
  { key: 'audit', label: 'Audit Log', banner: 'A running record of activity in this deal room.' },
]

function DealRoom() {
  const { dealRoomId } = useParams()
  const { appToken, appUser } = useAuth()
  const [room, setRoom] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('documents')

  useEffect(() => {
    if (!appToken || !dealRoomId) return

    let cancelled = false
    api
      .get(`/api/dealrooms/${dealRoomId}`, appToken)
      .then((data) => {
        if (!cancelled) setRoom(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [appToken, dealRoomId])

  if (error) {
    return <p className="text-red-400">{error}</p>
  }
  if (!room) {
    return <p className="text-navy-400">Loading deal room…</p>
  }

  const active = NAV_ITEMS.find((item) => item.key === activeTab)

  return (
    <div className="flex bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden h-[calc(100vh-8rem)]">
      {/* Inner sidebar: room nav + parties, distinct from the app's global left nav */}
      <aside className="w-56 bg-navy-950 border-r border-navy-800 p-5 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold text-navy-400 tracking-wide">Deal Room</span>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              room.status === 'ACTIVE' ? 'bg-green-400' : 'bg-navy-600'
            }`}
            title={room.status}
          />
        </div>

        <h2 className="text-gold-500 font-bold uppercase text-sm tracking-wide mb-5">{room.title}</h2>

        <nav className="flex flex-col gap-1 mb-6">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.key
                  ? 'bg-navy-800 text-gold-300'
                  : 'text-navy-100 hover:bg-navy-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <p className="text-xs font-semibold text-navy-400 tracking-wide mb-2">Parties</p>
          <div className="flex flex-col gap-2">
            <div className="px-3 py-2 rounded-lg bg-navy-900 text-sm text-navy-100">
              <span className="text-navy-400 text-xs block">Founder</span>
              {room.founder.name}
            </div>
            <div className="px-3 py-2 rounded-lg bg-navy-900 text-sm text-navy-100">
              <span className="text-navy-400 text-xs block">Investor</span>
              {room.investor.name}
            </div>
          </div>
        </div>
      </aside>

      {/* Content pane */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="bg-green-500/10 text-green-400 text-sm rounded-lg px-4 py-2.5 mb-5 w-fit">
          {active.banner}
        </div>

        {activeTab === 'documents' && (
          <DocumentsTab dealRoomId={dealRoomId} token={appToken} />
        )}
        {activeTab === 'agreements' && (
          <AgreementsTab dealRoomId={dealRoomId} token={appToken} />
        )}
        {activeTab === 'chat' && (
          <ChatTab dealRoomId={dealRoomId} token={appToken} currentUserId={appUser?.id} />
        )}
        {activeTab === 'video' && (
          <VideoTab dealRoomId={dealRoomId} displayName={appUser?.email} />
        )}
        {activeTab === 'audit' && (
          <AuditLogTab dealRoomId={dealRoomId} token={appToken} currentUserId={appUser?.id} />
        )}
      </div>
    </div>
  )
}

export default DealRoom