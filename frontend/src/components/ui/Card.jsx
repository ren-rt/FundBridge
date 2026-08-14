function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-navy-900/60 backdrop-blur border border-navy-800 rounded-2xl p-8 shadow-2xl shadow-black/40 ${className}`}
    >
      {children}
    </div>
  )
}

export default Card