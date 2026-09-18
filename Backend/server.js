import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import express from 'express'
import connectDB from './configs/db.js'
import authRoutes from './src/routes/auth.routes.js'
import userRoutes from './src/routes/user.routes.js'
import postRoutes from './src/routes/post.routes.js'
import storyRoutes from './src/routes/story.routes.js'
import messageRoutes from './src/routes/message.routes.js'
import notificationRoutes from './src/routes/notification.routes.js'
import circleRoutes from './src/routes/circle.routes.js'
import { app, server } from './src/socket/socket.js'

// Load environment variables
dotenv.config()

const PORT = process.env.PORT || 5000

// Connect to MongoDB Database
connectDB()

// Robust CORS Middleware: Dynamic origin reflection with credentials
app.use(
  cors({
    origin: (origin, callback) => {
      // In CORS standard, reflecting incoming origin allows credentials: true safely
      return callback(null, origin || true)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cookie',
      'Set-Cookie',
    ],
    exposedHeaders: ['Set-Cookie'],
  })
)

// Explicit preflight and response header fallback
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    )
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie'
    )
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(cookieParser())

// Primary API Routes (standard /api/*)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/post', postRoutes)
app.use('/api/story', storyRoutes)
app.use('/api/message', messageRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/circle', circleRoutes)

// Route Aliases (fallback without /api prefix to avoid 404 if frontend calls without /api)
app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/post', postRoutes)
app.use('/story', storyRoutes)
app.use('/message', messageRoutes)
app.use('/notifications', notificationRoutes)
app.use('/circle', circleRoutes)

// Root / Health-check Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Social Media API is running successfully!',
    timestamp: new Date().toISOString(),
  })
})

// 404 Fallback for unmapped routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server with Socket.io running on port ${PORT}`)
})

export default app
export { server }
