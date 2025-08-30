import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content: { 
        type: String, 
        required: true,
        trim: true
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user",
        required: true
    },
    chatId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "chat",
        required: true
    },
    ledgerId: {
        type: String,
        required: true
    },
    readBy: [{
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "user"
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

export default mongoose.model('message', messageSchema);