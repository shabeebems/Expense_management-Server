import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './config/cors.js';
import { connectDB } from './config/db.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import cookieParser from 'cookie-parser';
import adminRouter from './routes/adminRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(corsMiddleware);
app.use(cookieParser());
connectDB();

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));