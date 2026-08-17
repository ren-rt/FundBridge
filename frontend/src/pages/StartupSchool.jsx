import Card from '../components/ui/Card'

const MODULES = [
  {
    number: 1,
    title: 'The Startup Mindset',
    description:
      'Understand what startups are, how they create value, and the mindset required to build one.',
    lessons: 5,
    progress: 100,
    status: 'Completed',
  },
  {
    number: 2,
    title: 'Problem & Market Validation',
    description:
      'Learn how to identify real problems, define your ideal customer, and validate market demand.',
    lessons: 6,
    progress: 70,
    status: 'In Progress',
  },
  {
    number: 3,
    title: 'Business Model Fundamentals',
    description:
      'Build a clear business model and understand how your startup creates, delivers, and captures value.',
    lessons: 5,
    progress: 40,
    status: 'In Progress',
  },
  {
    number: 4,
    title: 'Fundraising 101',
    description:
      'Understand funding stages, investors, equity, dilution, SAFEs, and how startup rounds work.',
    lessons: 6,
    progress: 0,
    status: 'Not Started',
  },
  {
    number: 5,
    title: 'Building Your Pitch',
    description:
      'Learn how to structure your pitch deck, tell your startup story, present traction, and make the ask.',
    lessons: 7,
    progress: 0,
    status: 'Locked',
  },
  {
    number: 6,
    title: 'Legal & Financial Basics',
    description:
      'Learn the essential legal, ownership, cap table, financial, and founder considerations.',
    lessons: 6,
    progress: 0,
    status: 'Locked',
  },
]

function StartupSchool() {
  const completedModules = MODULES.filter(
    (module) => module.progress === 100
  ).length

  const overallProgress = Math.round(
    MODULES.reduce((sum, module) => sum + module.progress, 0) /
      MODULES.length
  )

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gold-500 mb-1">
          Startup School
        </h1>

        <p className="text-navy-400 text-sm">
          Build the knowledge you need to take your startup from idea to
          investor-ready.
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-navy-100">
              Your Progress
            </h2>

            <p className="text-navy-400 text-sm mt-1">
              {completedModules} of {MODULES.length} modules completed
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

      {/* Modules */}
      <div className="flex flex-col gap-4">
        {MODULES.map((module) => {
          const isLocked = module.status === 'Locked'

          return (
            <Card
              key={module.number}
              className={`${
                isLocked ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Module Number */}
                <div className="w-10 h-10 shrink-0 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-gold-400 font-bold">
                  {module.number}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-navy-400 mb-1">
                        MODULE {module.number}
                      </p>

                      <h2 className="text-lg font-semibold text-navy-100">
                        {module.title}
                      </h2>

                      <p className="text-sm text-navy-400 mt-1">
                        {module.description}
                      </p>
                    </div>

                    <span
                      className={`text-xs whitespace-nowrap px-2.5 py-1 rounded-full ${
                        module.status === 'Completed'
                          ? 'bg-gold-500/10 text-gold-400'
                          : module.status === 'In Progress'
                          ? 'bg-navy-800 text-gold-300'
                          : 'bg-navy-800 text-navy-400'
                      }`}
                    >
                      {module.status}
                    </span>
                  </div>

                  {/* Module Info */}
                  <div className="flex items-center justify-between mt-5 mb-2">
                    <span className="text-xs text-navy-400">
                      {module.lessons} lessons
                    </span>

                    <span className="text-xs text-navy-400">
                      {module.progress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-navy-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-500 rounded-full"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>

                  {/* Static Button */}
                  <div className="mt-4">
                    <button
                      type="button"
                      disabled={isLocked}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isLocked
                          ? 'bg-navy-800 text-navy-500 cursor-not-allowed'
                          : 'bg-gold-500 text-navy-950 hover:bg-gold-400'
                      }`}
                    >
                      {module.status === 'Completed'
                        ? 'Review Module'
                        : module.status === 'In Progress'
                        ? 'Continue Learning'
                        : module.status === 'Locked'
                        ? 'Locked'
                        : 'Start Module'}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default StartupSchool