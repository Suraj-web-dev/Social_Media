import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Database Connected Successfully')
    })

    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ Warning: MONGODB_URI is not defined in .env file')
      return
    }

    const uri = process.env.MONGODB_URI.endsWith('/')
      ? `${process.env.MONGODB_URI}social-media`
      : `${process.env.MONGODB_URI}/social-media`

    await mongoose.connect(
      process.env.MONGODB_URI.includes('social-media') || process.env.MONGODB_URI.includes('?')
        ? process.env.MONGODB_URI
        : uri
    )
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message)
  }
}

export default connectDB

