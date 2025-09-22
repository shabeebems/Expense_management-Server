import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './config/cors.js';
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import { Server } from 'socket.io';
import http from 'http';
import chatSchema from './models/chat.model.js';
import session from 'express-session';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(corsMiddleware);
app.use(cookieParser());
connectDB();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use('/api/auth', authRouter);
app.use('/api', userRouter);

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("New socket connected:", socket.id);

    socket.on("setup", (userData) => {
        console.log(`${userData.username} connected to chat`);
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat: ${chatId}`);
    });

    socket.on("leave chat", (chatId) => {
        socket.leave(chatId);
        console.log(`User left chat: ${chatId}`);
    });

    socket.on("new message", async (newMessageReceived) => {
        try {
            const chat = await chatSchema.findById(newMessageReceived.chatId);
            
            if (!chat || !chat.members) {
                console.log("Chat not found or chat.members undefined");
                return;
            }

            // Emit to all chat members except sender
            chat.members.forEach((member) => {
                if (member.userId.toString() === newMessageReceived.sender._id.toString()) {
                    return;
                }
                
                socket.in(member.userId.toString()).emit("message received", newMessageReceived);
            });

        } catch (error) {
            console.error("Error in 'new message' event:", error);
        }
    });

    socket.on("typing", ({ chatId, user }) => {
        socket.to(chatId).emit("typing", user);
    });

    socket.on("stop typing", ({ chatId }) => {
        socket.to(chatId).emit("stop typing");
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

console.log("Loaded FRONTEND_URL:", process.env.FRONTEND_URL, process.env.VERCEL_FRONTEND_URL);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));