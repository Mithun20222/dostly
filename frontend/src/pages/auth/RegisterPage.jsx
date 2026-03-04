import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout'
import { Button, Input, useToast } from '../../components/ui'

const ROLE_OPTIONS = [
  { value: 'both',   label: 'Both — post errands & run them' },
  { value: 'buddy',  label: 'Buddy — I only post errands' },
  { value: 'runner', label: 'Runner — I only fulfill errands' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const toast    = useToast()

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'both',
  })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const set = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())      e.name     = 'Name is required'
    if (!form.email)            e.email    = 'Email is required'
    if (form.password.length < 8) e.password = 'Min. 8 characters'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)

    setLoading(true)
    setErrors({})

    // TODO: replace with real API call
    setTimeout(() => {
      setLoading(false)
      setDone(true)
    }, 1000)
  }

  if (done) return (
    <AuthLayout>
      <div style={{ textAlign: 'center', padding: '12px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>
          Check your inbox!
        </h2>
        <p style={{ color: 'var(--text-3)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          We sent a verification link to <strong>{form.email}</strong>.
          Click it to activate your account.
        </p>
        <Button variant="outline" onClick={() => navigate('/login')}>
          Back to Sign In
        </Button>
      </div>
    </AuthLayout>
  )

  return (
    <AuthLayout>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6 }}>
        Join Dostly
      </h2>
      <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 24 }}>
        Only university email addresses are allowed
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Full Name"         placeholder="Arjun Kumar"          value={form.name}     onChange={set('name')}     error={errors.name} />
        <Input label="University Email"  type="email" placeholder="you@college.edu.in" value={form.email} onChange={set('email')} error={errors.email} />
        <Input label="Password"          type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} error={errors.password} />
        <Input label="Phone (optional)"  type="tel"   placeholder="9876543210"       value={form.phone}    onChange={set('phone')} hint="Used for delivery notifications" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
            I want to…
          </label>
          <select
            value={form.role}
            onChange={set('role')}
            style={{
              padding: '10px 13px',
              background: '#fff',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14, color: 'var(--text-1)',
              fontFamily: 'var(--font-body)',
              outline: 'none', cursor: 'pointer',
            }}
          >
            {ROLE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div style={{
          background: 'var(--brand-bg)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          fontSize: 13,
          color: 'var(--brand-dark)',
          border: '1px solid rgba(181,69,27,.15)',
        }}>
          🔒 Only <strong>@college.edu.in</strong> addresses can register.
        </div>

        <Button
          onClick={handleSubmit}
          loading={loading}
          size="lg"
          style={{ width: '100%' }}
        >
          Create Account
        </Button>
      </div>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-3)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </AuthLayout>
  )
}