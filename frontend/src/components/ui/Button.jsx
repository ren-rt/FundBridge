function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'rounded-lg px-5 py-2.5 font-semibold transition-all active:scale-[0.98]'

  const variants = {
    primary: 'bg-gold-500 text-navy-950 hover:bg-gold-300 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30',
    secondary: 'bg-navy-800 text-navy-100 hover:bg-navy-600 border border-navy-600',
    ghost: 'text-gold-300 hover:text-gold-100 hover:bg-navy-800',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button