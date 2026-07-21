import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../../components/layout'
import { Card, StatusBadge, CategoryBadge, Button, useToast } from '../../components/ui'
import { requestsAPI } from '../../api'

const CATEGORIES = [
  { value: 'all',        label: 'All',        icon: '✦' },
  { value: 'groceries',  label: 'Groceries',  icon: '🛒' },
  { value: 'medicine',   label: 'Medicine',   icon: '💊' },
  { value: 'food',       label: 'Food',       icon: '🍜' },
  { value: 'stationery', label: 'Stationery', icon: '✏️' },
  { value: 'other',      label: 'Other',      icon: '📦' },
]

const timeLeft = (deadline) => {
  const s = Math.floor((new Date(deadline) - Date.now()) / 1000)
  if (s <= 0) return 'Expired'
  if (s < 3600) return `${Math.floor(s / 60)}m left`
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m left`
}

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60)   return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

function RequestCard({ req, onAccept, onView, loading }) {
  const urgent = (new Date(req.deadline) - Date.now()) < 3600000

  return (
    <Card hover onClick={() => onView(req.id)} style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, paddingRight: 12 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <CategoryBadge category={req.category} />
            {req.negotiable && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: 'var(--amber-bg)', color: 'var(--amber-text)' }}>
                Negotiable
              </span>
            )}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>
            {req.title}
          </h3>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--brand)' }}>
            ₹{req.offeredTip}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>tip</div>
        </div>
      </div>

      {req.description && (
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10, lineHeight: 1.5,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {req.description}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: 'var(--text-3)',
        borderTop: '1px solid var(--border)', paddingTop: 10, marginBottom: 12 }}>
        <span>📍 {req.deliveryLocation}</span>
        <span>📦 ×{req.quantity}</span>
        <span style={{ color: urgent ? 'var(--red)' : 'var(--text-3)', fontWeight: urgent ? 600 : 400 }}>
          ⏰ {timeLeft(req.deadline)}
        </span>
        <span style={{ marginLeft: 'auto' }}>🕐 {timeAgo(req.createdAt)}</span>
      </div>

      <Button
        onClick={e => { e.stopPropagation(); onAccept(req) }}
        loading={loading === req.id}
        style={{ width: '100%' }}
      >
        Accept Errand
      </Button>
    </Card>
  )
}

export default function BrowsePage() {
  const navigate       = useNavigate()
  const toast          = useToast()
  const [requests, setRequests] = useState([])
  const [category, setCategory] = useState('all')
  const [search,   setSearch]   = useState('')
  const [fetching, setFetching] = useState(true)
  const [accepting, setAccepting] = useState(null)

  const load = async (cat) => {
    setFetching(true)
    try {
      const res = await requestsAPI.browse(cat !== 'all' ? { category: cat } : {})
      setRequests(res.data.requests)
    } catch {
      toast('Failed to load errands', 'error')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => { load(category) }, [category])

  const handleAccept = async (req) => {
    setAccepting(req.id)
    try {
      await requestsAPI.accept(req.id)
      toast('Errand accepted! Check My Errands.', 'success')
      load(category)
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to accept', 'error')
    } finally {
      setAccepting(null)
    }
  }

  const filtered = requests.filter(r =>
    !search || r.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageLayout>
      <div className="fade-in">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            Browse Errands
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
            Help your campus mates — earn tips on the way.
          </p>
        </div>

        {/* Search */}
        <input
          placeholder="🔍  Search errands…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', marginBottom: 16,
            padding: '10px 16px',
            background: '#fff', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius)', fontSize: 14,
            fontFamily: 'var(--font-body)', outline: 'none',
          }}
        />

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCategory(c.value)} style={{
              padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
              border: `1.5px solid ${category === c.value ? 'var(--brand)' : 'var(--border)'}`,
              background: category === c.value ? 'var(--brand-bg)' : '#fff',
              color: category === c.value ? 'var(--brand)' : 'var(--text-2)',
              fontSize: 13, fontWeight: category === c.value ? 600 : 400,
              fontFamily: 'var(--font-body)', transition: 'all 0.15s',
            }}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {fetching ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 200, borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)',
                animation: 'pulse 1.5s ease infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>
              No errands found
            </h3>
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
              {search ? `No results for "${search}"` : 'No open errands right now — check back soon.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {filtered.map(r => (
              <RequestCard
                key={r.id}
                req={r}
                onAccept={handleAccept}
                onView={id => navigate(`/requests/${id}`)}
                loading={accepting}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}