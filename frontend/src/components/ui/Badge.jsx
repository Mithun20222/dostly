// Status badge — maps request status to a color
const STATUS = {
  open:            { label: 'Open',            bg: 'var(--brand-bg)',  color: 'var(--brand)' },
  negotiating:     { label: 'Negotiating',     bg: 'var(--amber-bg)',  color: 'var(--amber-text)' },
  accepted:        { label: 'Accepted',        bg: 'var(--green-bg)',  color: 'var(--green-text)' },
  purchased:       { label: 'Purchased',       bg: '#e0f2fe',          color: '#0369a1' },
  bill_uploaded:   { label: 'Bill Uploaded',   bg: '#e0f2fe',          color: '#0369a1' },
  payment_pending: { label: 'Payment Pending', bg: 'var(--amber-bg)',  color: 'var(--amber-text)' },
  in_delivery:     { label: 'In Delivery',     bg: 'var(--green-bg)',  color: 'var(--green-text)' },
  delivered:       { label: 'Delivered',       bg: 'var(--green-bg)',  color: 'var(--green-text)' },
  completed:       { label: 'Completed',       bg: 'var(--blue-bg)',   color: 'var(--blue)' },
  cancelled:       { label: 'Cancelled',       bg: 'var(--red-bg)',    color: 'var(--red-text)' },
  expired:         { label: 'Expired',         bg: 'var(--surface-2)', color: 'var(--text-3)' },
}

const CATEGORY = {
  groceries:  { label: 'Groceries',  icon: '🛒', color: 'var(--brand)' },
  medicine:   { label: 'Medicine',   icon: '💊', color: 'var(--red)' },
  food:       { label: 'Food',       icon: '🍜', color: 'var(--amber)' },
  stationery: { label: 'Stationery', icon: '✏️', color: 'var(--blue)' },
  other:      { label: 'Other',      icon: '📦', color: 'var(--text-2)' },
}

export function StatusBadge({ status }) {
  const cfg = STATUS[status] ?? { label: status, bg: 'var(--surface-2)', color: 'var(--text-3)' }
  return (
    <span style={{
      fontSize: 11, fontWeight: 700,
      padding: '3px 9px',
      borderRadius: 20,
      background: cfg.bg,
      color: cfg.color,
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-body)',
    }}>
      {cfg.label}
    </span>
  )
}

export function CategoryBadge({ category }) {
  const cfg = CATEGORY[category] ?? { label: category, icon: '📦', color: 'var(--text-2)' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 12, fontWeight: 500,
      padding: '3px 10px',
      borderRadius: 20,
      background: cfg.color + '18',
      color: cfg.color,
      fontFamily: 'var(--font-body)',
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}