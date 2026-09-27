import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './config/cors.js';
import { connectDB } from './config/db.js';
import { purgeExpiredLedgers } from './jobs/purgeExpiredLedgers.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import session from 'express-session';

dotenv.config();

const app = express();

app.use(express.json());
app.use(corsMiddleware);
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use('/api/auth', authRouter);
app.use('/api', userRouter);

console.log("Loaded FRONTEND_URL:", process.env.FRONTEND_URL, process.env.VERCEL_FRONTEND_URL);

const start = async () => {
    await connectDB();
    try {
        const purged = await purgeExpiredLedgers();
        console.log(`Purged ${purged} expired ledgers`);
    } catch (error) {
        console.error("Expired ledger purge failed:", error.message);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();
