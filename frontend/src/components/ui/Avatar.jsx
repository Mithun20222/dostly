// Generates a coloured initial avatar from any name
export default function Avatar({ name = '?', size = 36, src }) {
  const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
  // Deterministic hue from the name string
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360

  if (src) return (
    <img src={src} alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  )

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: `hsl(${hue}, 55%, 84%)`,
      color: `hsl(${hue}, 55%, 28%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: size * 0.36,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}