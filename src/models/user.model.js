import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    managerId: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['manager', 'staff'] },
}, {
    timestamps: true
})

export default mongoose.model('User', userSchema)
