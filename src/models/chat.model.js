import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ledgerId: { type: String, required: true },
    members: { type: Array },
}, {
    timestamps: true
});

export default mongoose.model('chat', chatSchema);
