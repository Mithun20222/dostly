import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

const ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}

const STYLES = {
  success: { bg: 'var(--green-bg)',  color: 'var(--green-text)', border: '#6ee7b7' },
  error:   { bg: 'var(--red-bg)',    color: 'var(--red-text)',   border: '#fca5a5' },
  warning: { bg: 'var(--amber-bg)',  color: 'var(--amber-text)', border: '#fcd34d' },
  info:    { bg: 'var(--blue-bg)',   color: 'var(--blue)',       border: '#93c5fd' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8,
        maxWidth: 360,
      }}>
        {toasts.map(t => {
          const s = STYLES[t.type] ?? STYLES.info
          return (
            <div key={t.id} style={{
              background: s.bg,
              color: s.color,
              border: `1px solid ${s.border}`,
              borderRadius: 'var(--radius)',
              padding: '12px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 10,
              boxShadow: 'var(--shadow)',
              animation: 'fadeIn 0.3s ease',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              lineHeight: 1.5,
            }}>
              <span style={{ fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                {ICONS[t.type]}
              </span>
              {t.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

// The hook every component uses: const toast = useToast()
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}