import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui'
import { PageLayout } from './components/layout'
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

const Placeholder = ({ name }) => (
  <PageLayout>
    <div className="fade-in">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{name}</h2>
      <p style={{ color: 'var(--text-3)', marginTop: 8 }}>Coming soon.</p>
    </div>
  </PageLayout>
)

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/register"      element={<RegisterPage />} />
          <Route path="/dashboard"     element={<Placeholder name="Dashboard" />} />
          <Route path="/requests"      element={<Placeholder name="Browse Requests" />} />
          <Route path="/requests/new"  element={<Placeholder name="Post Errand" />} />
          <Route path="/requests/:id"  element={<Placeholder name="Request Detail" />} />
          <Route path="/my-requests"   element={<Placeholder name="My Errands" />} />
          <Route path="/profile"       element={<Placeholder name="Profile" />} />
          <Route path="/"              element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}