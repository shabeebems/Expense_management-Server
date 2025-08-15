import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    expense: { type: Number, default: 0 },
    income: { type: Number, default: 0 },
    userId: { type: String, required: true },
}, {
    timestamps: true
});

export default mongoose.model('Ledger', ledgerSchema);
