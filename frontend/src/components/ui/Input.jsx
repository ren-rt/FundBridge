function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      {label && (
        <label className="text-sm font-medium text-navy-100">
          {label}
        </label>
      )}

      <input
        className={`bg-navy-950/60 border border-navy-700 rounded-lg px-4 py-2.5 text-navy-100 placeholder-navy-400 transition-all focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 ${className}`}
        {...props}
      />

      {error && (
        <p className="text-red-400 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input