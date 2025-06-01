import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('mongodb connect successfully')
    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}