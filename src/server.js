import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './config/cors.js';
import { connectDB } from './config/db.js';
import authRouter from './routes/auth.routes.js';
import staffRouter from './routes/staff.routes.js';
import managerRouter from './routes/manager.routes.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(express.json());
app.use(corsMiddleware);
app.use(cookieParser());
connectDB();

app.use('/api/auth', authRouter);
app.use('/api/staff', staffRouter);
app.use('/api/manager', managerRouter);
console.log("Loaded FRONTEND_URL:", process.env.FRONTEND_URL, process.env.VERCEL_FRONTEND_URL); // ✅ Debug log

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));