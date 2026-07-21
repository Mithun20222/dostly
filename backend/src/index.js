import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes     from './routes/auth.js'
import requestRoutes  from './routes/requests.js'

const app  = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth',     authRoutes)
app.use('/api/requests', requestRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }))

app.listen(PORT, () => console.log(`Dostly backend running on port ${PORT}`))