import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import * as Sentry from "@sentry/node";
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import { handleClerkWebhook } from './controllers/webhooks.js'
import handler from './routes/healthRoute.js'

const app = express()

// Improved CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Clerk-Cookie', 'token']
}))

// Body parsers (needs to be before clerkMiddleware)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Clerk middleware
app.use(clerkMiddleware())

// Database connections
await connectDB()
await connectCloudinary()

// Webhook handler needs raw body for verification
app.post('/webhooks', 
  express.raw({ type: 'application/json' }), 
  handleClerkWebhook
)

// Routes
app.get('/', (req, res) => res.send("API working"))
app.use('/api/company', companyRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)

// to delete later
app.get('/health',handler)

// Error handling
Sentry.setupExpressErrorHandler(app)

// Debug middleware (moved before routes)
app.use((req, res, next) => {
  console.log("Clerk auth state:", req.auth)
  next()
})

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Server failed to start:", error)
    process.exit(1)
  }
}

startServer()

export default app