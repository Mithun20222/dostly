import { z } from 'zod'

// Returns middleware that validates req.body against a Zod schema
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    const details = result.error.errors.map(e => ({
      field:   e.path.join('.'),
      message: e.message,
    }))
    return res.status(400).json({ error: 'Validation failed', details })
  }
  req.validated = result.data
  next()
}

// ── Schemas ───────────────────────────────────────────────────
export const registerSchema = z.object({
  name:     z.string().min(2).max(60).trim(),
  email:    z.string().email().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone:    z.string().regex(/^[6-9]\d{9}$/).optional().or(z.literal('')),
  role:     z.enum(['buddy', 'runner', 'both']).default('both'),
})

export const loginSchema = z.object({
  email:    z.string().email().toLowerCase(),
  password: z.string().min(1),
})