import ledgerSchema from "../models/ledger.model.js"
import transactionSchema from "../models/transaction.model.js"
import { decodeToken } from "../utils/jwt.js"
import mongoose from "mongoose";

const parseTransactionDate = (value) => {
    if (!value) return null;
    const str = String(value).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [year, month, day] = str.split("-").map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const todayDateString = () =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

const isFutureTransactionDate = (happenedDate) => {
    if (!happenedDate) return true;
    return happenedDate.toISOString().slice(0, 10) > todayDateString();
};

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
        const name = req.body.newName?.trim()

        if (!name || name.length < 3) {
            return res.status(400).json({ message: "Ledger name must be at least 3 characters" });
        }
        
        const data = {
            name,
            userId: _id
        }
        const newLedger = await ledgerSchema.create(data)
        return res.send(newLedger)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Server error" });
    }
}

const updateLedger = async(req, res) => {
    try {
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET)
        const name = req.body.newName?.trim()

        if (!name || name.length < 3) {
            return res.status(400).json({ message: "Ledger name must be at least 3 characters" });
        }

        const ledger = await ledgerSchema.findOneAndUpdate(
            { _id: req.params.ledgerId, userId: decoded._id },
            { name },
            { new: true }
        )
        if (!ledger) {
            return res.status(404).json({ message: "Ledger not found" });
        }
        return res.send(ledger)
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
            .sort({ date: -1, createdAt: -1 })

        return res.send(transactions)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Server error" });
    }
}

const createTransactions = async(req, res) => {
    try {
        const { type, amount, activity, date } = req.body
        const { ledgerId } = req.params
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET)

        const happenedDate = parseTransactionDate(date)
        if (!happenedDate) {
            return res.status(400).json({ message: "Date is required" });
        }
        if (isFutureTransactionDate(happenedDate)) {
            return res.status(400).json({ message: "Date cannot be after today" });
        }

        const ledger = await ledgerSchema.findOne({
            _id: ledgerId,
            userId: decoded._id
        })
        if (!ledger) {
            return res.status(404).json({ message: "Ledger not found" });
        }

        const created = await transactionSchema.create({
            ledgerId,
            type,
            amount,
            activity,
            date: happenedDate
        })
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

const updateTransaction = async(req, res) => {
    try {
        const { ledgerId, transactionId } = req.params
        const { type, amount, activity, date } = req.body
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET)

        const trimmedActivity = activity?.trim()
        if (!trimmedActivity || trimmedActivity.length < 3) {
            return res.status(400).json({ message: "Description must be at least 3 characters" });
        }
        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({ message: "Type must be income or expense" });
        }
        if (typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than 0" });
        }

        const happenedDate = parseTransactionDate(date)
        if (!happenedDate) {
            return res.status(400).json({ message: "Date is required" });
        }
        if (isFutureTransactionDate(happenedDate)) {
            return res.status(400).json({ message: "Date cannot be after today" });
        }

        const ledger = await ledgerSchema.findOne({
            _id: ledgerId,
            userId: decoded._id
        })
        if (!ledger) {
            return res.status(404).json({ message: "Ledger not found" });
        }

        const transaction = await transactionSchema.findOne({
            _id: transactionId,
            ledgerId
        })
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        const incomeDelta = (type === "income" ? amount : 0) - (transaction.type === "income" ? transaction.amount : 0)
        const expenseDelta = (type === "expense" ? amount : 0) - (transaction.type === "expense" ? transaction.amount : 0)

        transaction.activity = trimmedActivity
        transaction.type = type
        transaction.amount = amount
        transaction.date = happenedDate
        await transaction.save()

        if (incomeDelta !== 0 || expenseDelta !== 0) {
            await ledgerSchema.updateOne(
                { _id: ledgerId },
                { $inc: { totalIncome: incomeDelta, totalExpense: expenseDelta } },
                { timestamps: true }
            )
        }

        return res.send(transaction)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Server error" });
    }
}

const deleteTransaction = async(req, res) => {
    try {
        const { ledgerId, transactionId } = req.params
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET)

        const ledger = await ledgerSchema.findOne({
            _id: ledgerId,
            userId: decoded._id
        })
        if (!ledger) {
            return res.status(404).json({ message: "Ledger not found" });
        }

        const transaction = await transactionSchema.findOne({
            _id: transactionId,
            ledgerId
        })
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        await transaction.deleteOne()

        const incomeDelta = transaction.type === "income" ? -transaction.amount : 0
        const expenseDelta = transaction.type === "expense" ? -transaction.amount : 0

        await ledgerSchema.updateOne(
            { _id: ledgerId },
            { $inc: { totalIncome: incomeDelta, totalExpense: expenseDelta } },
            { timestamps: true }
        )

        return res.send({ message: "Transaction deleted", transaction })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Server error" });
    }
}

export default {
    getLedgers,
    createLedger,
    updateLedger,
    getLedger,
    getTransactions,
    createTransactions,
    updateTransaction,
    deleteTransaction
}
