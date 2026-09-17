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

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(cookieParser())

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/post', postRoutes)
app.use('/api/story', storyRoutes)
app.use('/api/message', messageRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/circle', circleRoutes)

// Root / Health-check Route
app.get('/', (req, res) => {
  res.send('Social Media API is running successfully!')
})

// Start server
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`🚀 Server with Socket.io running on http://localhost:${PORT}`)
  })
}

export default app
export { server }
