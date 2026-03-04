import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { validate, registerSchema, loginSchema } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import {
  registerUser, verifyEmail, loginUser,
  refreshTokens, logoutUser, setTokenCookies,
} from '../services/authService.js'

const router = Router()

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many attempts, please try again in a minute' },
})

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { user, verifyToken } = await registerUser(req.validated)

    // TODO: send actual email — for now we return the token in dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n📧 Verify link for ${user.email}:`)
      console.log(`   ${process.env.CLIENT_URL}/verify-email?token=${verifyToken}\n`)
    }

    res.status(201).json({
      message: 'Account created. Check your email to verify.',
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

// ── GET /api/auth/verify-email?token=xxx ─────────────────────
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query
    if (!token) return res.status(400).json({ error: 'Token is required' })
    await verifyEmail(token)
    // Redirect to login with a success flag
    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.validated)
    setTokenCookies(res, accessToken, refreshToken)
    res.json({ message: 'Login successful', user, accessToken })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message, code: err.code })
  }
})

// ── POST /api/auth/refresh ────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token || req.body?.refreshToken
    if (!token) return res.status(401).json({ error: 'Refresh token required' })

    const { accessToken, refreshToken } = await refreshTokens(token)
    setTokenCookies(res, accessToken, refreshToken)
    res.json({ accessToken })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

// ── POST /api/auth/logout ─────────────────────────────────────
router.post('/logout', authenticate, async (req, res) => {
  try {
    await logoutUser(req.user.id)
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    res.json({ message: 'Logged out successfully' })
  } catch {
    res.status(500).json({ error: 'Logout failed' })
  }
})

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user })
})

export default router