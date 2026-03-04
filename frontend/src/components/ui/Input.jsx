export default function Input({
  label,
  error,
  hint,
  prefix,
  style = {},
  ...props
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>

      {label && (
        <label style={{
          fontSize: 12, fontWeight: 600,
          color: 'var(--text-2)',
          fontFamily: 'var(--font-body)',
        }}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: 12,
            color: 'var(--text-3)', fontSize: 14,
            pointerEvents: 'none',
          }}>
            {prefix}
          </span>
        )}
        <input
          {...props}
          style={{
            width: '100%',
            padding: prefix ? '10px 13px 10px 30px' : '10px 13px',
            background: '#fff',
            border: `1.5px solid ${error ? 'var(--red)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            color: 'var(--text-1)',
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            fontFamily: 'var(--font-body)',
            ...style,
          }}
          onFocus={e => {
            e.target.style.borderColor = error ? 'var(--red)' : 'var(--brand)'
            e.target.style.boxShadow  = `0 0 0 3px ${error ? 'rgba(192,57,43,.1)' : 'var(--brand-glow)'}`
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'
            e.target.style.boxShadow   = 'none'
          }}
        />
      </div>

      {error && (
        <p style={{ fontSize: 12, color: 'var(--red)' }}>{error}</p>
      )}
      {hint && !error && (
        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{hint}</p>
      )}

    </div>
  )
}