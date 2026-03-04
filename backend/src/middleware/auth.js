import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'

export const authenticate = async (req, res, next) => {
  try {
    // Accept token from cookie OR Authorization header (for flexibility)
    let token = req.cookies?.access_token
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) token = header.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

    // Fetch fresh user so bans/deactivations take effect immediately
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, is_verified, active_jobs')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'User not found' })
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Email not verified', code: 'EMAIL_NOT_VERIFIED' })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}