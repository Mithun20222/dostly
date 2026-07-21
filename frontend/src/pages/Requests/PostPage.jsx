import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../../components/layout'
import { Card, Button, Input, useToast } from '../../components/ui'
import { requestsAPI } from '../../api'

const CATEGORIES = [
  { value: 'groceries',  label: '🛒 Groceries' },
  { value: 'medicine',   label: '💊 Medicine' },
  { value: 'food',       label: '🍜 Food' },
  { value: 'stationery', label: '✏️ Stationery' },
  { value: 'other',      label: '📦 Other' },
]

export default function PostPage() {
  const navigate = useNavigate()
  const toast    = useToast()

  const [form, setForm] = useState({
    title: '', description: '', category: 'groceries',
    quantity: 1, offeredTip: '', negotiable: false,
    deadline: '', deliveryLocation: '',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) =>
    setForm(p => ({ ...p, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.title.trim())           e.title           = 'Required'
    if (!form.offeredTip)             e.offeredTip      = 'Required'
    if (!form.deliveryLocation.trim())e.deliveryLocation = 'Required'
    if (!form.deadline)               e.deadline        = 'Required'
    else if (new Date(form.deadline) <= new Date()) e.deadline = 'Must be in the future'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)
    setErrors({})
    setLoading(true)

    try {
      await requestsAPI.create({
        ...form,
        quantity:   Number(form.quantity),
        offeredTip: Number(form.offeredTip),
        deadline:   new Date(form.deadline).toISOString(),
      })
      toast('Errand posted! Runners can see it now.', 'success')
      navigate('/my-requests')
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to post errand', 'error')
    } finally {
      setLoading(false)
    }
  }

  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }
  const selectStyle = {
    width: '100%', padding: '10px 13px',
    background: '#fff', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)', fontSize: 14,
    fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer',
    color: 'var(--text-1)',
  }

  return (
    <PageLayout maxWidth={720}>
      <div className="fade-in">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            Post an Errand
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
            Tell runners what you need and offer a fair tip.
          </p>
        </div>

        <Card style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <Input
              label="What do you need?"
              placeholder="e.g. Maggi Noodles, 5 packets"
              value={form.title}
              onChange={set('title')}
              error={errors.title}
            />

            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={set('category')} style={selectStyle}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  label="Quantity"
                  type="number" min={1} max={50}
                  value={form.quantity}
                  onChange={set('quantity')}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description (optional)</label>
              <textarea
                value={form.description}
                onChange={set('description')}
                placeholder="Brand preferences, pickup instructions…"
                rows={3}
                style={{
                  width: '100%', padding: '10px 13px',
                  background: '#fff', border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', fontSize: 14,
                  fontFamily: 'var(--font-body)', resize: 'vertical',
                  minHeight: 80, outline: 'none', color: 'var(--text-1)',
                }}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Tip Offered (₹)"
                    type="number" min={0}
                    prefix="₹"
                    placeholder="e.g. 30"
                    value={form.offeredTip}
                    onChange={set('offeredTip')}
                    error={errors.offeredTip}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Allow negotiation?</label>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 13px', cursor: 'pointer',
                    border: `1.5px solid ${form.negotiable ? 'var(--amber)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    background: form.negotiable ? 'var(--amber-bg)' : '#fff',
                    transition: 'all 0.2s',
                  }}>
                    <input
                      type="checkbox"
                      checked={form.negotiable}
                      onChange={set('negotiable')}
                      style={{ width: 16, height: 16, accentColor: 'var(--amber)', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Negotiable</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Allow counter-offers</div>
                    </div>
                  </label>
                </div>
              </div>

              <Input
                label="Delivery Location"
                placeholder="e.g. Hostel B, Room 204"
                value={form.deliveryLocation}
                onChange={set('deliveryLocation')}
                error={errors.deliveryLocation}
              />

              <Input
                label="Deadline"
                type="datetime-local"
                value={form.deadline}
                onChange={set('deadline')}
                error={errors.deadline}
                hint="Runner must accept before this time"
              />
            </div>

            {/* Preview */}
            {form.title && (
              <div style={{
                background: 'var(--brand-bg)', border: '1px solid rgba(181,69,27,.15)',
                borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: 13,
              }}>
                <span style={{ fontWeight: 600, color: 'var(--brand)' }}>Preview: </span>
                <strong>{form.title}</strong> ×{form.quantity}
                {form.deliveryLocation && <> · 📍 {form.deliveryLocation}</>}
                {form.offeredTip && <> · ₹{form.offeredTip} tip{form.negotiable ? ' (negotiable)' : ''}</>}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              loading={loading}
              size="lg"
              style={{ alignSelf: 'flex-start', paddingLeft: 32, paddingRight: 32 }}
            >
              Post Errand
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}