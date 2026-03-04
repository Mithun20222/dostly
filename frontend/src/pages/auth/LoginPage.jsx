import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout'
import { Button, Input, useToast } from '../../components/ui'

export default function LoginPage() {
  const navigate = useNavigate()
  const toast    = useToast()

  const [form, setForm]     = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
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

    // TODO: replace with real API call in the backend step
    setTimeout(() => {
      setLoading(false)
      toast('Welcome back!', 'success')
      navigate('/dashboard')
    }, 1000)
  }

  return (
    <AuthLayout>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 22, marginBottom: 6,
      }}>
        Welcome back
      </h2>
      <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 24 }}>
        Sign in with your university account
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="University Email"
          type="email"
          placeholder="you@college.edu.in"
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