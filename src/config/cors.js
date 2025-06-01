import cors from 'cors';
import dotenv from "dotenv"
dotenv.config()

const FRONTEND_URL = process.env.FRONTEND_URL;
const VERCEL_FRONTEND_URL = process.env.VERCEL_FRONTEND_URL
export const corsMiddleware = cors({
    origin: [FRONTEND_URL, VERCEL_FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    // origin: "http://localhost:5173",
    credentials: true
})
