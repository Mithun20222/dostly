import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../../components/layout'
import { Button, Input, useToast } from '../../components/ui'
import { authAPI } from '../../api'
import { useAuthStore } from '../../store/authStore'

export default function LoginPage() {
  const navigate      = useNavigate()
  const toast         = useToast()
  const setUser       = useAuthStore(s => s.setUser)
  const [searchParams] = useSearchParams()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)

    setLoading(true)
    setErrors({})

    try {
      const res = await authAPI.login(form)
      setUser(res.data.user)
      toast('Welcome back!', 'success')
      navigate('/dashboard')
    } catch (err) {
      const msg  = err.response?.data?.error || 'Login failed'
      const code = err.response?.data?.code
      if (code === 'EMAIL_NOT_VERIFIED') {
        toast('Please verify your email first.', 'warning')
      } else {
        setErrors({ password: msg })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      {searchParams.get('verified') && (
        <div style={{
          background: 'var(--green-bg)', color: 'var(--green-text)',
          borderRadius: 'var(--radius-sm)', padding: '10px 14px',
          fontSize: 13, marginBottom: 20, textAlign: 'center',
        }}>
          ✓ Email verified! You can now sign in.
        </div>
      )}

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6 }}>
        Welcome back
      </h2>
      <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 24 }}>
        Sign in with your university account
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="University Email"
          type="email"
          placeholder="you@vitapstudent.ac.in"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />

        <Button
          onClick={handleSubmit}
          loading={loading}
          size="lg"
          style={{ width: '100%', marginTop: 4 }}
        >
          Sign In
        </Button>
      </div>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-3)' }}>
        New to Dostly?{' '}
        <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 600 }}>
          Create account
        </Link>
      </p>
    </AuthLayout>
  )
}