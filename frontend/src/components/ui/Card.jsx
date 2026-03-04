import { useState } from 'react'

export default function Card({
  children,
  hover = false,
  onClick,
  style = {},
  padding = '20px 22px',
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--card)',
        border: `1px solid ${hovered && hover ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: hovered && hover ? 'var(--shadow)' : 'var(--shadow-sm)',
        transform: hovered && hover ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s',
        cursor: onClick ? 'pointer' : 'default',
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  )
}