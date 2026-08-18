import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'

function StartupSchool() {
  const { getToken } = useAuth()
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProgress = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const token = await getToken()
      const res = await fetch('http://localhost:3000/api/startup-school/progress', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Could not load Startup School')
      setProgress(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    ;(async () => {
      await loadProgress()
    })()
  }, [loadProgress])

  const completedModules = progress.filter((m) => m.completed_at).length

  const overallProgress = progress.length
    ? Math.round((completedModules / progress.length) * 100)
    : 0

  function statusFor(module) {
    if (module.completed_at) return 'Completed'
    if (!module.unlocked) return 'Locked'
    return 'Not Started'
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gold-500 mb-1">
          Startup School
        </h1>

        <p className="text-navy-400 text-sm">
          Build the knowledge you need to take your startup from idea to
          investor-ready.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-navy-400 text-sm">Loading...</p>
      ) : progress.length === 0 ? (
        <p className="text-navy-400 text-sm">No modules available yet.</p>
      ) : (
        <>
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-navy-100">
                  Your Progress
                </h2>

                <p className="text-navy-400 text-sm mt-1">
                  {completedModules} of {progress.length} modules completed
                </p>
              </div>

              <span className="text-gold-400 font-semibold">
                {overallProgress}%
              </span>
            </div>

            <div className="w-full h-2 bg-navy-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-500 rounded-full transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            {progress.map((module) => {
              const status = statusFor(module)
              const isLocked = status === 'Locked'

              return (
                <Card
                  key={module.course_id}
                  className={`${isLocked ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-gold-400 font-bold">
                      {module.module_order}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-navy-400 mb-1">
                            MODULE {module.module_order}
                          </p>

                          <h2 className="text-lg font-semibold text-navy-100">
                            {module.title}
                          </h2>
                        </div>

                        <span
                          className={`text-xs whitespace-nowrap px-2.5 py-1 rounded-full ${
                            status === 'Completed'
                              ? 'bg-gold-500/10 text-gold-400'
                              : status === 'Locked'
                              ? 'bg-navy-800 text-navy-400'
                              : 'bg-navy-800 text-gold-300'
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="mt-4">
                        {isLocked ? (
                          <button
                            type="button"
                            disabled
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-navy-800 text-navy-500 cursor-not-allowed"
                          >
                            Locked
                          </button>
                        ) : (
                          <Link
                            to={`/startup-school/${module.course_id}`}
                            className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-gold-500 text-navy-950 hover:bg-gold-400 transition-colors"
                          >
                            {status === 'Completed' ? 'Review Module' : 'Start Module'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default StartupSchool