export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  style = {},
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: 'none',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.55 : 1,
    transition: 'all 0.18s',
    outline: 'none',
    whiteSpace: 'nowrap',
  }

  const variants = {
    primary:  { background: 'var(--brand)',    color: '#fff',            boxShadow: 'var(--shadow-brand)' },
    secondary:{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' },
    ghost:    { background: 'transparent',     color: 'var(--text-2)'  },
    danger:   { background: 'var(--red)',       color: '#fff'           },
    success:  { background: 'var(--green)',     color: '#fff'           },
    outline:  { background: 'transparent',     color: 'var(--brand)',   border: '1.5px solid var(--brand)' },
  }

  const sizes = {
    sm: { padding: '7px 14px',  fontSize: 13 },
    md: { padding: '10px 20px', fontSize: 14 },
    lg: { padding: '12px 28px', fontSize: 15 },
  }

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...sizes[size], ...style }}
      onMouseEnter={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.filter = 'brightness(1.08)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.filter = ''
        e.currentTarget.style.transform = ''
      }}
    >
      {loading && (
        <span style={{
          width: 14, height: 14,
          border: '2px solid rgba(255,255,255,0.35)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.7s linear infinite',
        }} />
      )}
      {children}
    </button>
  )
}