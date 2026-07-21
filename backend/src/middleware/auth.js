import jwt from 'jsonwebtoken'
import { db } from '../config/firebase.js'

export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.access_token
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) token = header.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

    const userDoc = await db.collection('users').doc(decoded.userId).get()
    if (!userDoc.exists) {
      return res.status(401).json({ error: 'User not found' })
    }

    const user = userDoc.data()
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email not verified', code: 'EMAIL_NOT_VERIFIED' })
    }

    req.user = {
      id:         userDoc.id,
      email:      user.email,
      name:       user.name,
      role:       user.role,
      activeJobs: user.activeJobs,
    }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}