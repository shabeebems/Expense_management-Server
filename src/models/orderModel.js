import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    place: { type: String },
    image: { type: String },
    companyCode: { type: String },
    status: { type: String, default: 'Pending' },
    expense: { type: Number, default: 0 },
    income: { type: Number, default: 0 },
    userId: { type: String, required: true },
    is_block: { type: Boolean, default: false },
})

export default mongoose.model('Orders', orderSchema)
