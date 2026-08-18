import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function QuizSection({ courseId, type, title }) {
  const { getToken } = useAuth()
  const [questions, setQuestions] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadQuiz() {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const token = await getToken()
      const res = await fetch(
        `http://localhost:3000/api/startup-school/courses/${courseId}/quiz?type=${type}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'No quiz available for this module')
      }
      const data = await res.json()
      setQuestions(data)
      setAnswers({})
    } catch (err) {
      setError(err.message)
      setQuestions(null)
    } finally {
      setLoading(false)
    }
  }

  function selectAnswer(questionId, index) {
    setAnswers((prev) => ({ ...prev, [questionId]: index }))
  }

  async function submit() {
    setError('')
    try {
      const token = await getToken()
      const res = await fetch(
        `http://localhost:3000/api/startup-school/courses/${courseId}/quiz/attempt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type,
            answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({
              questionId,
              selectedIndex,
            })),
          }),
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Could not submit quiz')
      }
      setResult(await res.json())
    } catch (err) {
      setError(err.message)
    }
  }

  const allAnswered = questions && questions.every((q) => answers[q.id] !== undefined)

  return (
    <Card className="mb-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-navy-100">{title}</h3>
        {!questions && (
          <Button variant="secondary" className="text-sm px-3 py-1.5" onClick={loadQuiz} disabled={loading}>
            {loading ? 'Loading...' : 'Take Quiz'}
          </Button>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-3">{error}</p>
      )}

      {questions && questions.length > 0 && !result && (
        <div className="mt-4 flex flex-col gap-4">
          {questions.map((q, i) => (
            <div key={q.id}>
              <p className="text-sm text-navy-100 font-medium mb-2">
                {i + 1}. {q.question_text}
              </p>
              <div className="flex flex-col gap-1.5">
                {q.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-sm text-navy-300 cursor-pointer">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === idx}
                      onChange={() => selectAnswer(q.id, idx)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <Button onClick={submit} disabled={!allAnswered} className="self-start">
            Submit
          </Button>
        </div>
      )}

      {result && (
        <div className={`mt-4 rounded-lg px-4 py-3 text-sm ${result.passed ? 'bg-gold-500/10 text-gold-300 border border-gold-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          <p className="font-medium">
            {result.passed ? 'Passed!' : 'Not quite -- try again.'} Score: {result.score}/{result.total}
          </p>
          {!result.passed && (
            <Button variant="ghost" className="text-sm mt-2 px-0" onClick={loadQuiz}>
              Retry
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

function StartupSchoolModule() {
  const { id } = useParams()
  const { getToken } = useAuth()

  const [course, setCourse] = useState(null)
  const [mode, setMode] = useState('video')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completeMessage, setCompleteMessage] = useState('')

  const loadCourse = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:3000/api/startup-school/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Could not load this module')
      }
      const data = await res.json()
      setCourse(data)
      setMode(data.video_url ? 'video' : 'text')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id, getToken])

  useEffect(() => {
    ;(async () => {
      await loadCourse()
    })()
  }, [loadCourse])

  async function markComplete() {
    setCompleteMessage('')
    setError('')
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:3000/api/startup-school/courses/${id}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || 'Could not mark this module complete')
      setCompleteMessage('Module marked complete!')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="text-navy-400 text-sm">Loading module...</p>

  if (error && !course) {
    return (
      <div className="max-w-3xl">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">
          {error}
        </div>
        <Link to="/startup-school" className="text-gold-300 hover:text-gold-100 text-sm">
          &larr; Back to Startup School
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <Link to="/startup-school" className="text-navy-400 hover:text-navy-100 text-sm mb-4 inline-block">
        &larr; Back to Startup School
      </Link>

      <h1 className="text-2xl font-bold text-gold-500 mb-1">{course.title}</h1>
      <p className="text-navy-400 text-sm mb-6">{course.description}</p>

      {(course.video_url || course.text_content) && (
        <Card className="mb-4">
          {course.video_url && course.text_content && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode('video')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === 'video' ? 'bg-gold-500 text-navy-950' : 'bg-navy-800 text-navy-300'}`}
              >
                Video
              </button>
              <button
                onClick={() => setMode('text')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === 'text' ? 'bg-gold-500 text-navy-950' : 'bg-navy-800 text-navy-300'}`}
              >
                Text
              </button>
            </div>
          )}

          {mode === 'video' && course.video_url && (
            <video src={course.video_url} controls className="w-full rounded-lg" />
          )}

          {mode === 'text' && course.text_content && (
            <p className="text-navy-300 text-sm leading-relaxed whitespace-pre-wrap">{course.text_content}</p>
          )}
        </Card>
      )}

      <QuizSection courseId={id} type="MID_VIDEO" title="Mid-Video Quiz" />
      <QuizSection courseId={id} type="FINAL" title="Final Assessment" />

      {error && course && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      {completeMessage && (
        <p className="text-gold-300 text-sm mb-4">{completeMessage}</p>
      )}

      <Button onClick={markComplete}>Mark Module Complete</Button>
    </div>
  )
}

export default StartupSchoolModule