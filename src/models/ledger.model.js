import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    totalExpense: { type: Number, default: 0 },
    totalIncome: { type: Number, default: 0 },
    userId: { type: String, required: true },
}, {
    timestamps: true
});

export default mongoose.model('Ledger', ledgerSchema);
