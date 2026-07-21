import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'
import {
  createRequest, browseRequests, getRequest, getMyRequests,
  acceptRequest, uploadBill, generateOTP, verifyOTP,
  completeRequest, cancelRequest, advanceStatus,
} from '../services/requestService.js'

const router = Router()

// All request routes require auth
router.use(authenticate)

const createSchema = z.object({
  title:            z.string().min(3).max(120).trim(),
  description:      z.string().max(500).optional(),
  category:         z.enum(['groceries','medicine','food','stationery','other']),
  quantity:         z.number().int().min(1).max(50),
  offeredTip:       z.number().min(0),
  negotiable:       z.boolean().default(false),
  deadline:         z.string().datetime(),
  deliveryLocation: z.string().min(3).max(200).trim(),
})

// Browse
router.get('/', async (req, res) => {
  try {
    const data = await browseRequests(req.user.id, req.query)
    res.json({ requests: data })
  } catch (err) { res.status(err.status||500).json({ error: err.message }) }
})

// My requests
router.get('/mine', async (req, res) => {
  try {
    const data = await getMyRequests(req.user.id)
    res.json({ requests: data })
  } catch (err) { res.status(err.status||500).json({ error: err.message }) }
})

// Get single
router.get('/:id', async (req, res) => {
  try {
    const data = await getRequest(req.params.id, req.user.id)
    res.json({ request: data })
  } catch (err) { res.status(err.status||500).json({ error: err.message }) }
})

// Create
router.post('/', validate(createSchema), async (req, res) => {
  try {
    const data = await createRequest(req.user.id, req.validated)
    res.status(201).json(data)
  } catch (err) { res.status(err.status||500).json({ error: err.message }) }
})

// Accept
router.post('/:id/accept', async (req, res) => {
  try {
    const data = await acceptRequest(req.params.id, req.user.id)
    res.json(data)
  } catch (err) { res.status(err.status||500).json({ error: err.message }) }
})

// Upload bill
router.post('/:id/bill', validate(z.object({
  billPhotoUrl:    z.string().url(),
  productPhotoUrl: z.string().url().optional(),
  productAmount:   z.number().min(0),
})), async (req, res) => {
  try {
    const data = await uploadBill(req.params.id, req.user.id, req.validated)
    res.json(data)
  } catch (err) { res.status(err.status||500).json({ error: err.message }) }
})

// Advance status (buddy pays → in_delivery)
router.post('/:id/advance', validate(z.object({
  toStatus: z.string(),
})), async (req, res) => {
  try {
    const data = await advanceStatus(req.params.id, req.user.id, req.validated.toStatus)
    res.json(data)
  } catch (err) { res.status(err.status||500).json({ error: err.message }) }
})

// Generate OTP
router.post('/:id/otp', async (req, res) => {
  try {
    const data = await generateOTP(req.params.id, req.user.id)
    res.json(data)
  } catch (err) { res.status(err.status||500).json({ error: err.message }) }
})

// Verify OTP
router.post('/:id/verify-otp', validate(z.object({ otp: z.string().length(6) })), async (req, res) => {
  try {
    const data = await verifyOTP(req.params.id, req.user.id, req.validated.otp)
    res.json(data)
  } catch (err) { res.status(err.status||500).json({ error: err.message }) }
})

// Complete
router.post('/:id/complete', async (req, res) => {
  try {
    const data = await completeRequest(req.params.id, req.user.id)
    res.json(data)
  } catch (err) { res.status(err.status||500).json({ error: err.message }) }
})

// Cancel
router.delete('/:id', async (req, res) => {
  try {
    const data = await cancelRequest(req.params.id, req.user.id)
    res.json(data)
  } catch (err) { res.status(err.status||500).json({ error: err.message }) }
})

export default router