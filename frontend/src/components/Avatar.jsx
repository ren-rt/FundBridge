function Avatar({ name, size = 'md' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-navy-600 text-gold-300 flex items-center justify-center font-semibold shrink-0`}
    >
      {initials}
    </div>
  )
}

export default Avatar