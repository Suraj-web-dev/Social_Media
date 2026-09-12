import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { serve } from 'inngest/express'
import connectDB from './configs/db.js'
import { inngest, functions } from './src/index.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB Database
connectDB()

// Middlewares
app.use(cors())
app.use(express.json())

// Inngest Endpoint
app.use('/api/inngest', serve({ client: inngest, functions }))

// Root / Health-check Route
app.get('/', (req, res) => {
  res.send('API is running successfully!')
})

// Start server (only listen if run directly, not when imported as serverless function on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
  })
}

export default app
