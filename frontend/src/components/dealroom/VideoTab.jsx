import { useEffect, useRef } from 'react'

function VideoTab({ dealRoomId, displayName }) {
  const containerRef = useRef(null)
  const apiRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    function start() {
      // Room name scoped to the deal room UUID -- not a real access control
      // mechanism. The public meet.jit.si instance doesn't enforce auth, so
      // anyone with this room name could join. Fine for a demo; a
      // self-hosted Jitsi with JWT would be the real fix if this matters
      // beyond the sprint.
      const domain = 'meet.jit.si'
      const options = {
        roomName: `fundbridge-dealroom-${dealRoomId}`,
        parentNode: containerRef.current,
        width: '100%',
        height: '100%',
        userInfo: { displayName: displayName || 'FundBridge user' },
        configOverwrite: { prejoinPageEnabled: false },
      }
      // eslint-disable-next-line no-undef
      apiRef.current = new JitsiMeetExternalAPI(domain, options)
    }

    if (window.JitsiMeetExternalAPI) {
      start()
    } else {
      const script = document.createElement('script')
      script.src = 'https://meet.jit.si/external_api.js'
      script.async = true
      script.onload = start
      document.body.appendChild(script)
    }

    return () => {
      apiRef.current?.dispose()
    }
  }, [dealRoomId, displayName])

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-navy-100 font-bold uppercase tracking-wide mb-4">Video Call</h3>
      <div ref={containerRef} className="flex-1 rounded-lg overflow-hidden bg-black min-h-[400px]" />
    </div>
  )
}

export default VideoTab