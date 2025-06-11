import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String },
    place: { type: String },
    image: { type: String },
    companyCode: { type: String },
    password: { type: String, required: true },
    is_block: { type: Boolean, default: false },
    is_admin: { type: Boolean, default: false },
    role: { type: String, required: true, enum: ['Company', 'Admin', 'User'] }
}, {
    timestamps: true
})

export default mongoose.model('User', userSchema)
