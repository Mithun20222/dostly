import { db } from '../config/firebase.js'

// ── Create request ────────────────────────────────────────────

export const createRequest = async (buddyId, data) => {
  // Enforce max 3 active jobs
  const userDoc = await db.collection('users').doc(buddyId).get()
  const user    = userDoc.data()

  if (user.activeJobs >= 3) {
    throw { status: 400, message: 'You already have 3 active errands. Complete one first.' }
  }

  const ref = db.collection('requests').doc()
  const now = new Date()

  // expires_at = deadline minus 1 hour (runner must accept before this)
  const deadline  = new Date(data.deadline)
  const expiresAt = new Date(deadline.getTime() - 60 * 60 * 1000)

  await ref.set({
    id:               ref.id,
    buddyId,
    runnerId:         null,
    title:            data.title,
    description:      data.description || null,
    category:         data.category,
    quantity:         data.quantity,
    offeredTip:       data.offeredTip,
    negotiable:       data.negotiable ?? false,
    finalTip:         null,
    deadline,
    deliveryLocation: data.deliveryLocation,
    status:           'open',
    billPhotoUrl:     null,
    productPhotoUrl:  null,
    otp:              null,
    otpExpiresAt:     null,
    productAmount:    null,
    paymentStatus:    'unpaid',
    expiresAt,
    createdAt:        now,
    updatedAt:        now,
  })

  await userDoc.ref.update({
    activeJobs: user.activeJobs + 1,
    updatedAt:  now,
  })

  return { id: ref.id }
}

// ── Browse open requests ──────────────────────────────────────

export const browseRequests = async (userId, { category, limit = 20 } = {}) => {
  let query = db.collection('requests')
    .where('status', '==', 'open')
    .orderBy('createdAt', 'desc')
    .limit(limit)

  if (category && category !== 'all') {
    query = db.collection('requests')
      .where('status', '==', 'open')
      .where('category', '==', category)
      .orderBy('createdAt', 'desc')
      .limit(limit)
  }

  const snap = await query.get()
  return snap.docs
    .map(d => serializeRequest(d))
    .filter(r => r.buddyId !== userId) // don't show your own
}

// ── Get single request ────────────────────────────────────────

export const getRequest = async (requestId, userId) => {
  const doc = await db.collection('requests').doc(requestId).get()
  if (!doc.exists) throw { status: 404, message: 'Request not found' }

  const req = serializeRequest(doc)

  // Only buddy and runner can see full details
  const isParty = req.buddyId === userId || req.runnerId === userId
  if (!isParty && req.status !== 'open') {
    throw { status: 403, message: 'Access denied' }
  }

  return req
}

// ── Get my requests ───────────────────────────────────────────

export const getMyRequests = async (userId) => {
  const [asB, asR] = await Promise.all([
    db.collection('requests').where('buddyId',  '==', userId).orderBy('createdAt', 'desc').get(),
    db.collection('requests').where('runnerId', '==', userId).orderBy('createdAt', 'desc').get(),
  ])

  const seen = new Set()
  const all  = []

  for (const doc of [...asB.docs, ...asR.docs]) {
    if (!seen.has(doc.id)) {
      seen.add(doc.id)
      all.push(serializeRequest(doc))
    }
  }

  return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// ── Accept request ────────────────────────────────────────────

export const acceptRequest = async (requestId, runnerId) => {
  const runnerDoc = await db.collection('users').doc(runnerId).get()
  const runner    = runnerDoc.data()

  if (runner.activeJobs >= 3) {
    throw { status: 400, message: 'You already have 3 active errands.' }
  }

  const reqRef = db.collection('requests').doc(requestId)
  const reqDoc = await reqRef.get()
  if (!reqDoc.exists) throw { status: 404, message: 'Request not found' }

  const req = reqDoc.data()
  if (req.status !== 'open') throw { status: 409, message: 'Request is no longer available' }
  if (req.buddyId === runnerId) throw { status: 400, message: 'You cannot run your own errand' }

  const now = new Date()
  await reqRef.update({ status: 'accepted', runnerId, updatedAt: now })
  await runnerDoc.ref.update({ activeJobs: runner.activeJobs + 1, updatedAt: now })

  return { message: 'Errand accepted!' }
}

// ── Upload bill ───────────────────────────────────────────────

export const uploadBill = async (requestId, runnerId, { billPhotoUrl, productPhotoUrl, productAmount }) => {
  const reqRef = db.collection('requests').doc(requestId)
  const reqDoc = await reqRef.get()
  if (!reqDoc.exists) throw { status: 404, message: 'Request not found' }

  const req = reqDoc.data()
  if (req.runnerId !== runnerId) throw { status: 403, message: 'Only the runner can upload the bill' }
  if (req.status !== 'accepted') throw { status: 400, message: `Cannot upload bill at status: ${req.status}` }

  await reqRef.update({
    billPhotoUrl,
    productPhotoUrl: productPhotoUrl || null,
    productAmount,
    status:    'bill_uploaded',
    updatedAt: new Date(),
  })

  return { message: 'Bill uploaded' }
}

// ── Generate delivery OTP ─────────────────────────────────────

export const generateOTP = async (requestId, buddyId) => {
  const reqRef = db.collection('requests').doc(requestId)
  const reqDoc = await reqRef.get()
  if (!reqDoc.exists) throw { status: 404, message: 'Request not found' }

  const req = reqDoc.data()
  if (req.buddyId !== buddyId) throw { status: 403, message: 'Only the buddy can generate the OTP' }
  if (req.status !== 'in_delivery') throw { status: 400, message: 'Item must be in delivery first' }

  const otp       = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

  await reqRef.update({ otp, otpExpiresAt: expiresAt, updatedAt: new Date() })

  // Return plain OTP to buddy — they share it verbally with runner
  return { otp }
}

// ── Verify OTP ────────────────────────────────────────────────

export const verifyOTP = async (requestId, runnerId, otp) => {
  const reqRef = db.collection('requests').doc(requestId)
  const reqDoc = await reqRef.get()
  if (!reqDoc.exists) throw { status: 404, message: 'Request not found' }

  const req = reqDoc.data()
  if (req.runnerId !== runnerId) throw { status: 403, message: 'Only the runner can verify the OTP' }
  if (req.status !== 'in_delivery') throw { status: 400, message: 'Invalid status for OTP verification' }
  if (req.otp !== otp) throw { status: 400, message: 'Incorrect OTP' }
  if (new Date(req.otpExpiresAt.toDate()) < new Date()) throw { status: 400, message: 'OTP has expired' }

  await reqRef.update({ status: 'delivered', otp: null, updatedAt: new Date() })

  return { message: 'Delivery confirmed!' }
}

// ── Complete request ──────────────────────────────────────────

export const completeRequest = async (requestId, buddyId) => {
  const reqRef = db.collection('requests').doc(requestId)
  const reqDoc = await reqRef.get()
  if (!reqDoc.exists) throw { status: 404, message: 'Request not found' }

  const req = reqDoc.data()
  if (req.buddyId !== buddyId) throw { status: 403, message: 'Only the buddy can complete the request' }
  if (req.status !== 'delivered') throw { status: 400, message: 'Item must be delivered first' }

  const now = new Date()
  await reqRef.update({ status: 'completed', paymentStatus: 'full_paid', updatedAt: now })

  // Decrement active jobs for both, increment completions for runner
  const [buddyDoc, runnerDoc] = await Promise.all([
    db.collection('users').doc(buddyId).get(),
    db.collection('users').doc(req.runnerId).get(),
  ])

  const buddy  = buddyDoc.data()
  const runner = runnerDoc.data()

  const newCompletions = runner.completions + 1
  const newRepScore    = Math.min(5.0, Math.max(1.0,
    (newCompletions * 5 - runner.cancellations * 2 - runner.disputes * 3)
    / Math.max(newCompletions + runner.cancellations, 1)
  ))

  await Promise.all([
    buddyDoc.ref.update({ activeJobs: Math.max(buddy.activeJobs - 1, 0), updatedAt: now }),
    runnerDoc.ref.update({
      activeJobs:   Math.max(runner.activeJobs - 1, 0),
      completions:  newCompletions,
      repScore:     Math.round(newRepScore * 100) / 100,
      updatedAt:    now,
    }),
  ])

  return { message: 'Errand completed!' }
}

// ── Cancel request ────────────────────────────────────────────

export const cancelRequest = async (requestId, userId) => {
  const reqRef = db.collection('requests').doc(requestId)
  const reqDoc = await reqRef.get()
  if (!reqDoc.exists) throw { status: 404, message: 'Request not found' }

  const req = reqDoc.data()
  const isBuddy  = req.buddyId  === userId
  const isRunner = req.runnerId === userId

  if (!isBuddy && !isRunner) throw { status: 403, message: 'Not a party to this request' }
  if (['completed', 'cancelled', 'expired'].includes(req.status)) {
    throw { status: 400, message: 'Cannot cancel at this stage' }
  }
  if (['bill_uploaded', 'payment_pending', 'in_delivery', 'delivered'].includes(req.status)) {
    throw { status: 400, message: 'Too late to cancel — raise a dispute instead' }
  }

  const now = new Date()
  await reqRef.update({ status: 'cancelled', updatedAt: now })

  // Decrement active jobs for whoever was involved
  const updates = []
  const buddyDoc = await db.collection('users').doc(req.buddyId).get()
  updates.push(buddyDoc.ref.update({
    activeJobs:    Math.max(buddyDoc.data().activeJobs - 1, 0),
    cancellations: buddyDoc.data().cancellations + (isBuddy ? 1 : 0),
    updatedAt:     now,
  }))

  if (req.runnerId) {
    const runnerDoc = await db.collection('users').doc(req.runnerId).get()
    updates.push(runnerDoc.ref.update({
      activeJobs:    Math.max(runnerDoc.data().activeJobs - 1, 0),
      cancellations: runnerDoc.data().cancellations + (isRunner ? 1 : 0),
      updatedAt:     now,
    }))
  }

  await Promise.all(updates)
  return { message: 'Request cancelled' }
}

// ── Advance status (buddy pays, confirms delivery in-flow) ────

export const advanceStatus = async (requestId, userId, toStatus) => {
  const reqRef = db.collection('requests').doc(requestId)
  const reqDoc = await reqRef.get()
  if (!reqDoc.exists) throw { status: 404, message: 'Request not found' }

  const req    = reqDoc.data()
  const isBuddy = req.buddyId === userId

  const allowed = {
    in_delivery: { from: 'bill_uploaded', role: 'buddy' },
  }

  const rule = allowed[toStatus]
  if (!rule) throw { status: 400, message: 'Invalid status transition' }
  if (req.status !== rule.from) throw { status: 400, message: `Must be in '${rule.from}' status` }
  if (rule.role === 'buddy' && !isBuddy) throw { status: 403, message: 'Only the buddy can do this' }

  await reqRef.update({ status: toStatus, updatedAt: new Date() })
  return { message: 'Status updated' }
}

// ── Serialize Firestore doc → plain object ────────────────────

const serializeRequest = (doc) => {
  const d = doc.data()
  return {
    ...d,
    id:          doc.id,
    deadline:    d.deadline?.toDate?.()?.toISOString()    ?? d.deadline,
    expiresAt:   d.expiresAt?.toDate?.()?.toISOString()   ?? d.expiresAt,
    createdAt:   d.createdAt?.toDate?.()?.toISOString()   ?? d.createdAt,
    updatedAt:   d.updatedAt?.toDate?.()?.toISOString()   ?? d.updatedAt,
    otpExpiresAt: d.otpExpiresAt?.toDate?.()?.toISOString() ?? d.otpExpiresAt,
  }
}