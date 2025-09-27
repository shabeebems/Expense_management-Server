import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    ledgerId: { type: String, required: true },
    type: { type: String, required: true, enum: ["expense", "income"] },
    amount: { type: Number, required: true },
    activity: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ ledgerId: 1, createdAt: -1 });

export default mongoose.model("transaction", transactionSchema);
