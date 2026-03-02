import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// We'll fill these in as we build each page
const Placeholder = ({ name }) => (
  <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
    <h2>📍 {name}</h2>
    <p style={{ color: '#888' }}>This page is coming soon.</p>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login"     element={<Placeholder name="Login" />} />
        <Route path="/register"  element={<Placeholder name="Register" />} />

        {/* App */}
        <Route path="/dashboard"   element={<Placeholder name="Dashboard" />} />
        <Route path="/requests"    element={<Placeholder name="Browse Requests" />} />
        <Route path="/requests/new" element={<Placeholder name="Post Errand" />} />
        <Route path="/requests/:id" element={<Placeholder name="Request Detail" />} />
        <Route path="/my-requests"  element={<Placeholder name="My Errands" />} />
        <Route path="/profile"      element={<Placeholder name="Profile" />} />

        {/* Default: redirect / to /dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}