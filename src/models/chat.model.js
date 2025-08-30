import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ledgerId: { type: String, required: true },
    members: { type: Array, required: true },
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message"
    },
    latestMessageAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('chat', chatSchema);