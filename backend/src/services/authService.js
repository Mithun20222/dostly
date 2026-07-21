import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { db } from '../config/firebase.js'

// ── Helpers ───────────────────────────────────────────────────

const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS || 'college.edu.in')
  .split(',').map(d => d.trim().toLowerCase())

export const isAllowedEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase()
  return ALLOWED_DOMAINS.some(d => domain === d || domain?.endsWith(`.${d}`))
}

export const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  )
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  )
  return { accessToken, refreshToken }
}

export const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie('access_token', accessToken, {
    httpOnly: true, secure: isProd, sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  })
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true, secure: isProd, sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

// ── Register ──────────────────────────────────────────────────

export const registerUser = async ({ name, email, password, phone, role }) => {
  if (!isAllowedEmail(email)) {
    throw { status: 400, message: 'Only university email addresses are allowed' }
  }

  // Check if email already exists
  const existing = await db.collection('users')
    .where('email', '==', email).limit(1).get()

  if (!existing.empty) {
    throw { status: 409, message: 'An account with this email already exists' }
  }

  const passwordHash    = await bcrypt.hash(password, 12)
  const verifyToken     = crypto.randomBytes(32).toString('hex')
  const verifyTokenHash = crypto.createHash('sha256').update(verifyToken).digest('hex')

  const userRef = db.collection('users').doc()
  await userRef.set({
    id:                   userRef.id,
    name,
    email,
    role,
    phone:                phone || null,
    passwordHash,
    avatarUrl:            null,
    upiId:                null,
    repScore:             5.0,
    completions:          0,
    cancellations:        0,
    disputes:             0,
    activeJobs:           0,
    isVerified:           false,
    verifyTokenHash,
    verifyTokenExpires:   new Date(Date.now() + 24 * 60 * 60 * 1000),
    refreshTokenHash:     null,
    createdAt:            new Date(),
    updatedAt:            new Date(),
  })

  return {
    user: { id: userRef.id, email, name, role },
    verifyToken,
  }
}

// ── Verify email ──────────────────────────────────────────────

export const verifyEmail = async (token) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const snap = await db.collection('users')
    .where('verifyTokenHash', '==', tokenHash)
    .where('isVerified', '==', false)
    .limit(1).get()

  if (snap.empty) {
    throw { status: 400, message: 'Invalid or expired verification link' }
  }

  const userDoc = snap.docs[0]
  const user    = userDoc.data()

  if (new Date(user.verifyTokenExpires.toDate()) < new Date()) {
    throw { status: 400, message: 'Link has expired. Please register again.' }
  }

  await userDoc.ref.update({
    isVerified:         true,
    verifyTokenHash:    null,
    verifyTokenExpires: null,
    updatedAt:          new Date(),
  })

  return userDoc.id
}

// ── Login ─────────────────────────────────────────────────────

export const loginUser = async ({ email, password }) => {
  const snap = await db.collection('users')
    .where('email', '==', email).limit(1).get()

  if (snap.empty) {
    throw { status: 401, message: 'Invalid email or password' }
  }

  const userDoc = snap.docs[0]
  const user    = userDoc.data()

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw { status: 401, message: 'Invalid email or password' }
  }

  if (!user.isVerified) {
    throw { status: 403, message: 'Please verify your email first', code: 'EMAIL_NOT_VERIFIED' }
  }

  const tokens      = generateTokens(userDoc.id)
  const refreshHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex')

  await userDoc.ref.update({ refreshTokenHash: refreshHash, updatedAt: new Date() })

  return {
    user: {
      id:    userDoc.id,
      email: user.email,
      name:  user.name,
      role:  user.role,
    },
    ...tokens,
  }
}

// ── Refresh tokens ────────────────────────────────────────────

export const refreshTokens = async (refreshToken) => {
  let decoded
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
  } catch {
    throw { status: 401, message: 'Invalid refresh token' }
  }

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
  const userDoc   = await db.collection('users').doc(decoded.userId).get()

  if (!userDoc.exists || userDoc.data().refreshTokenHash !== tokenHash) {
    throw { status: 401, message: 'Refresh token reuse detected' }
  }

  const tokens  = generateTokens(decoded.userId)
  const newHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex')
  await userDoc.ref.update({ refreshTokenHash: newHash, updatedAt: new Date() })

  return tokens
}

// ── Logout ────────────────────────────────────────────────────

export const logoutUser = async (userId) => {
  await db.collection('users').doc(userId)
    .update({ refreshTokenHash: null, updatedAt: new Date() })
}