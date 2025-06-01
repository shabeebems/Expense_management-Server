import cors from 'cors';
import dotenv from "dotenv"
dotenv.config()

console.log(process.env.FRONTEND_URL, process.env.VERCEL_FRONTEND_URL)

export const corsMiddleware = cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});
