import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastProvider } from './components/ui'
import { PageLayout } from './components/layout'
import { useAuthStore } from './store/authStore'
import LoginPage       from './pages/Auth/LoginPage'
import RegisterPage    from './pages/Auth/RegisterPage'
import VerifyEmailPage from './pages/Auth/VerifyEmailPage'
import BrowsePage      from './pages/Requests/BrowsePage'
import PostPage        from './pages/Requests/PostPage'

const Guard = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const Placeholder = ({ name }) => (
  <PageLayout>
    <div className="fade-in">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{name}</h2>
      <p style={{ color: 'var(--text-3)', marginTop: 8 }}>Coming soon.</p>
    </div>
  </PageLayout>
)

function AppRoutes() {
  const init = useAuthStore(s => s.init)
  useEffect(() => { init() }, [])

  return (
    <Routes>
      <Route path="/login"        element={<LoginPage />} />
      <Route path="/register"     element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route path="/dashboard"    element={<Guard><Placeholder name="Dashboard" /></Guard>} />
      <Route path="/requests"     element={<Guard><BrowsePage /></Guard>} />
      <Route path="/requests/new" element={<Guard><PostPage /></Guard>} />
      <Route path="/requests/:id" element={<Guard><Placeholder name="Request Detail" /></Guard>} />
      <Route path="/my-requests"  element={<Guard><Placeholder name="My Errands" /></Guard>} />
      <Route path="/profile"      element={<Guard><Placeholder name="Profile" /></Guard>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  )
}