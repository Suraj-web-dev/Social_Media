import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.warn("⚠️ MONGODB_URI or MONGO_URI is not defined in environment variables");
      return;
    }

    await mongoose.connect(uri);

    console.log("✅ MongoDB Database Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
};

export default connectDB;