import cors from 'cors';
import dotenv from "dotenv"
dotenv.config()

console.log(process.env.FRONTEND_URL, process.env.VERCEL_FRONTEND_URL)

export const corsMiddleware = cors({
  origin: function (origin, callback) {
    console.log("Origin attempting to access:", origin);  // <-- Add this
    const allowedOrigins = [process.env.FRONTEND_URL, process.env.VERCEL_FRONTEND_URL];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

