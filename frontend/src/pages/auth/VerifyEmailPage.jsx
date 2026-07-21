import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { AuthLayout } from '../../components/layout'
import { Button } from '../../components/ui'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('verifying') // verifying | success | error

  useEffect(() => {
    if (!token) return setStatus('error')

    fetch(`http://localhost:5000/api/auth/verify-email?token=${token}`)
      .then(res => {
        // Backend redirects on success, so any response here means it worked
        setStatus('success')
      })
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <AuthLayout>
      {status === 'verifying' && (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>
            Verifying your email…
          </h2>
        </div>
      )}

      {status === 'success' && (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>
            Email verified!
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 24 }}>
            Your account is ready. Sign in to get started.
          </p>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>
            Invalid link
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 24 }}>
            This link is expired or already used. Register again to get a new one.
          </p>
          <Link to="/register">
            <Button variant="outline">Back to Register</Button>
          </Link>
        </div>
      )}
    </AuthLayout>
  )
}