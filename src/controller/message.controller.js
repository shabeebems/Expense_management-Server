import messageSchema from "../models/message.model.js";
import chatSchema from "../models/chat.model.js";
import { decodeToken } from "../utils/jwt.js";
import mongoose from "mongoose";

const sendMessage = async (req, res) => {
    try {
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET);
        const { content, chatId, ledgerId } = req.body;
        
        if (!content || !chatId || !ledgerId) {
            return res.status(400).send({ error: "Missing required fields" });
        }

        const newMessage = {
            content,
            sender: decoded._id,
            chatId,
            ledgerId,
            readBy: [{ userId: decoded._id }] // Mark as read by sender
        };

        const createdMessage = await messageSchema.create(newMessage);
        
        const populatedMessage = await messageSchema.findById(createdMessage._id)
            .populate('sender', 'username _id');

        await chatSchema.findByIdAndUpdate(chatId, {
            latestMessage: createdMessage._id,
            latestMessageAt: new Date()
        });

        return res.send(populatedMessage);
    } catch (error) {
        console.log("Error in sendMessage:", error.message);
        return res.status(500).send({ error: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET);
        
        const messages = await messageSchema.find({ chatId })
            .populate('sender', 'username _id')
            .sort({ createdAt: 1 });

        // Mark messages as read
        await messageSchema.updateMany(
            { 
                chatId, 
                'readBy.userId': { $ne: decoded._id }
            },
            { 
                $push: { 
                    readBy: { 
                        userId: decoded._id, 
                        readAt: new Date() 
                    } 
                }
            }
        );

        return res.send(messages);
    } catch (error) {
        console.log("Error in getMessages:", error.message);
        return res.status(500).send({ error: error.message });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET);
        const userObjectId = new mongoose.Types.ObjectId(decoded._id);
        
        const userChats = await chatSchema.find({
            'members.userId': userObjectId
        });

        let totalUnreadCount = 0;
        const chatUnreadCounts = {};

        for (const chat of userChats) {
            const unreadCount = await messageSchema.countDocuments({
                chatId: chat._id,
                sender: { $ne: userObjectId },
                'readBy.userId': { $ne: userObjectId }
            });
            
            chatUnreadCounts[chat._id] = unreadCount;
            totalUnreadCount += unreadCount;
        }

        return res.send({
            totalUnreadCount,
            chatUnreadCounts
        });
    } catch (error) {
        console.log("Error in getUnreadCount:", error.message);
        return res.status(500).send({ error: error.message });
    }
};

export default {
    sendMessage,
    getMessages,
    getUnreadCount
};
