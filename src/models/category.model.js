import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    ledgerId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ ledgerId: 1, name: 1 });

export default mongoose.model("category", categorySchema);
