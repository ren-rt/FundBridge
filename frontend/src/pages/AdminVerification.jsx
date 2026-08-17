import { useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const MOCK_PENDING = [
  {
    id: 1,
    name: 'Nadeesha Perera',
    role: 'FOUNDER',
    startup: 'Agritech Lanka',
    submitted: '2 days ago',
  },
  {
    id: 2,
    name: 'Ravindu Silva',
    role: 'INVESTOR',
    startup: 'Colombo Angels',
    submitted: '1 day ago',
  },
  {
    id: 3,
    name: 'Amaya Fernando',
    role: 'FOUNDER',
    startup: 'EcoPack',
    submitted: '5 hours ago',
  },
]

function AdminVerification() {
  const [pending, setPending] = useState(MOCK_PENDING)
  const [decided, setDecided] = useState([])

  function handleDecision(id, decision) {
    const user = pending.find((u) => u.id === id)

    setPending(pending.filter((u) => u.id !== id))
    setDecided([{ ...user, decision }, ...decided])
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gold-500 mb-1">
        Admin Verification
      </h1>

      <p className="text-navy-400 text-sm mb-6">
        Review and approve pending founder / investor accounts
      </p>

      {pending.length === 0 && decided.length === 0 && (
        <Card>
          <p className="text-navy-400 text-sm">
            No pending accounts.
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {pending.map((u) => (
          <Card
            key={u.id}
            className="flex items-center justify-between"
          >
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-navy-100">
                  {u.name}
                </span>

                <span className="text-xs bg-navy-800 text-navy-300 px-2 py-0.5 rounded-full">
                  {u.role}
                </span>
              </div>

              <p className="text-navy-400 text-sm">
                {u.startup} · submitted {u.submitted}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  handleDecision(u.id, 'rejected')
                }
              >
                Reject
              </Button>

              <Button
                onClick={() =>
                  handleDecision(u.id, 'approved')
                }
              >
                Approve
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {decided.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-navy-400 mb-3">
            Recently decided
          </h2>

          <div className="flex flex-col gap-2">
            {decided.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between text-sm px-4 py-2 bg-navy-900/40 rounded-lg"
              >
                <span className="text-navy-100">
                  {u.name} · {u.startup}
                </span>

                <span
                  className={
                    u.decision === 'approved'
                      ? 'text-gold-300'
                      : 'text-navy-400'
                  }
                >
                  {u.decision === 'approved'
                    ? '✓ Approved'
                    : 'Rejected'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminVerification