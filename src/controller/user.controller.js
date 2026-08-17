import ledgerSchema from "../models/ledger.model.js"
import transactionSchema from "../models/transaction.model.js"
import { decodeToken } from "../utils/jwt.js"
import mongoose from "mongoose";

const getLedgers = async (req, res) => {
    try {
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET);
        const userObjectId = new mongoose.Types.ObjectId(decoded._id);
        const ledgers = await ledgerSchema
            .find({ userId: userObjectId })
            .sort({ updatedAt: -1, createdAt: -1 });

        return res.send(ledgers);
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Server error" });
    }
};


const createLedger = async(req, res) => {
    try {
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET)
        const { _id } = decoded
        
        const data = {
            name: req.body.newName,
            userId: _id
        }
        const newLedger = await ledgerSchema.create(data)
        return res.send(newLedger)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Server error" });
    }
}

const getLedger = async(req, res) => {
    try {
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET)
        const ledger = await ledgerSchema.findOne({
            _id: req.params.ledgerId,
            userId: decoded._id
        })
        if (!ledger) {
            return res.status(404).json({ message: "Ledger not found" });
        }
        return res.send(ledger)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Server error" });
    }
}

const getTransactions = async(req, res) => {
    try {
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET)
        const ledger = await ledgerSchema.findOne({
            _id: req.params.ledgerId,
            userId: decoded._id
        })
        if (!ledger) {
            return res.status(404).json({ message: "Ledger not found" });
        }

        const transactions = await transactionSchema
            .find({ ledgerId: req.params.ledgerId })
            .sort({ createdAt: -1 })

        return res.send(transactions)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Server error" });
    }
}

const createTransactions = async(req, res) => {
    try {
        const { type, amount } = req.body
        const { ledgerId } = req.params
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET)

        const ledger = await ledgerSchema.findOne({
            _id: ledgerId,
            userId: decoded._id
        })
        if (!ledger) {
            return res.status(404).json({ message: "Ledger not found" });
        }

        const created = await transactionSchema.create({ ledgerId, ...req.body })
        if(type === "income") {
            await ledgerSchema.updateOne(
                { _id: ledgerId },
                { $inc: { totalIncome: amount } },
                { timestamps: true }
            )
        } else if(type === "expense") {
            await ledgerSchema.updateOne(
                { _id: ledgerId },
                { $inc: { totalExpense: amount } },
                { timestamps: true }
            )
        }
        return res.send(created)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Server error" });
    }
}

export default {
    getLedgers,
    createLedger,
    getLedger,
    getTransactions,
    createTransactions
}
