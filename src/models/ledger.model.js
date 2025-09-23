import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: String, required: true },
    members: { type: Array },
    totalExpense: { type: Number, default: 0 },
    totalIncome: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ["active", "closed"], 
        default: "active" 
    }
}, {
    timestamps: true
});

export default mongoose.model('Ledger', ledgerSchema);
