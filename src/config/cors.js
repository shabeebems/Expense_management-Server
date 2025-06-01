import cors from 'cors';
import dotenv from "dotenv"
dotenv.config()

export const corsMiddleware = cors({
    origin: [process.env.FRONTEND_URL, process.env.VERCEL_FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});
