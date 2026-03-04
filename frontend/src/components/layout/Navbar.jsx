import { NavLink, useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/dashboard',    label: 'Dashboard', icon: '⊞' },
  { to: '/requests',     label: 'Browse',    icon: '🔍' },
  { to: '/requests/new', label: 'Post',      icon: '+' },
  { to: '/my-requests',  label: 'My Errands',icon: '📋' },
]

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(247,243,238,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      height: 60,
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
    }}>

      {/* Logo */}
      <div
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'var(--brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, boxShadow: 'var(--shadow-brand)',
        }}>🤝</div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800, fontSize: 22,
          letterSpacing: '-0.02em',
          color: 'var(--text-1)',
        }}>
          Dostly
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 2 }}>
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--brand)' : 'var(--text-2)',
              background: isActive ? 'var(--brand-bg)' : 'transparent',
              transition: 'all 0.15s',
              textDecoration: 'none',
            })}
          >
            <span style={{ fontSize: link.icon === '+' ? 20 : 13 }}>
              {link.icon}
            </span>
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* User area — hardcoded for now, will connect to auth later */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--brand-bg)',
          border: '2px solid var(--brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 13, color: 'var(--brand)',
        }}>
          AK
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>Arjun Kumar</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>★ 4.7</div>
        </div>
      </div>

    </nav>
  )
}