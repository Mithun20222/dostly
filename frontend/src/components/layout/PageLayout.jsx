import Navbar from './Navbar'

export default function PageLayout({ children, maxWidth = 1100 }) {
  return (
    <div>
      <Navbar />
      <main style={{
        maxWidth,
        margin: '0 auto',
        padding: '36px 24px',
        minHeight: 'calc(100vh - 60px)',
      }}>
        {children}
      </main>
    </div>
  )
}