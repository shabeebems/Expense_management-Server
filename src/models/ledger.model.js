import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user",
        required: true 
    },
    totalExpense: { type: Number, default: 0 },
    totalIncome: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.model('Ledger', ledgerSchema);
