import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    place: { type: String },
    image: { type: String },
    companyCode: { type: String },
    status: { 
        type: String, 
        enum: ['Pending', 'In progress', 'Completed', 'Cancelled'], 
        default: 'Pending' 
    },
    expense: { type: Number, default: 0 },
    income: { type: Number, default: 0 },
    startedAt:{ type: Date },
    completedAt: { type: Date },
    userId: { type: String, required: true },
    is_block: { type: Boolean, default: false },
}, {
    timestamps: true
});

export default mongoose.model('Orders', orderSchema);
