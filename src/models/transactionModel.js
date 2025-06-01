import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    transaction: { type: String, required: true, enum: ["expense", "income"] },
    amount: { type: Number, required: true },
    activity: { type: String, required: true }
})

export default mongoose.model('transaction', transactionSchema)
