export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--surface) 0%, var(--brand-bg) 100%)',
      padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: 16,
            background: 'var(--brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            fontSize: 28,
            boxShadow: 'var(--shadow-brand)',
          }}>🤝</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 34,
            letterSpacing: '-0.02em',
            color: 'var(--text-1)',
          }}>Dostly</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 4 }}>
            Campus errands, made easy.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
          padding: '32px 28px',
        }}>
          {children}
        </div>

      </div>
    </div>
  )
}