import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { supabase } from '../config/supabase.js'

// ── Helpers ───────────────────────────────────────────────────

const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS || 'college.edu.in')
  .split(',')
  .map(d => d.trim().toLowerCase())

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
    maxAge: 15 * 60 * 1000,           // 15 min
  })
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true, secure: isProd, sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

// ── Register ──────────────────────────────────────────────────

export const registerUser = async ({ name, email, password, phone, role }) => {
  if (!isAllowedEmail(email)) {
    throw { status: 400, message: 'Only university email addresses are allowed' }
  }

  // Check for existing account
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    throw { status: 409, message: 'An account with this email already exists' }
  }

  const passwordHash   = await bcrypt.hash(password, 12)
  const verifyToken    = crypto.randomBytes(32).toString('hex')
  const verifyTokenHash = crypto.createHash('sha256').update(verifyToken).digest('hex')

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      name, email, role,
      phone: phone || null,
      password_hash: passwordHash,
      verify_token:  verifyTokenHash,
      verify_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id, email, name, role')
    .single()

  if (error) throw { status: 500, message: 'Registration failed', detail: error.message }

  // Return the plain token so we can email it
  return { user, verifyToken }
}

// ── Verify email ──────────────────────────────────────────────

export const verifyEmail = async (token) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const { data: user, error } = await supabase
    .from('users')
    .select('id, verify_token_expires')
    .eq('verify_token', tokenHash)
    .eq('is_verified', false)
    .single()

  if (error || !user) {
    throw { status: 400, message: 'Invalid or expired verification link' }
  }

  if (new Date(user.verify_token_expires) < new Date()) {
    throw { status: 400, message: 'Link has expired. Please register again.' }
  }

  await supabase
    .from('users')
    .update({ is_verified: true, verify_token: null, verify_token_expires: null })
    .eq('id', user.id)

  return user.id
}

// ── Login ─────────────────────────────────────────────────────

export const loginUser = async ({ email, password }) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, role, password_hash, is_verified')
    .eq('email', email)
    .single()

  // Same error for wrong email OR wrong password — don't leak which one
  if (error || !user) {
    throw { status: 401, message: 'Invalid email or password' }
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    throw { status: 401, message: 'Invalid email or password' }
  }

  if (!user.is_verified) {
    throw { status: 403, message: 'Please verify your email first', code: 'EMAIL_NOT_VERIFIED' }
  }

  const tokens = generateTokens(user.id)

  // Store hashed refresh token so we can detect reuse
  const refreshHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex')
  await supabase
    .from('users')
    .update({ refresh_token_hash: refreshHash })
    .eq('id', user.id)

  const { password_hash: _, refresh_token_hash: __, ...safeUser } = user
  return { user: safeUser, ...tokens }
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

  const { data: user } = await supabase
    .from('users')
    .select('id, refresh_token_hash')
    .eq('id', decoded.userId)
    .single()

  // Refresh token reuse detection — if hashes don't match, someone is replaying a stolen token
  if (!user || user.refresh_token_hash !== tokenHash) {
    throw { status: 401, message: 'Refresh token reuse detected' }
  }

  const tokens = generateTokens(user.id)
  const newHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex')
  await supabase.from('users').update({ refresh_token_hash: newHash }).eq('id', user.id)

  return tokens
}

// ── Logout ────────────────────────────────────────────────────

export const logoutUser = async (userId) => {
  await supabase
    .from('users')
    .update({ refresh_token_hash: null })
    .eq('id', userId)
}