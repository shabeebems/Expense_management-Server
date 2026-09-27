import ledgerSchema from "../models/ledger.model.js"
import transactionSchema from "../models/transaction.model.js"
import categorySchema from "../models/category.model.js"
import { decodeToken } from "../utils/jwt.js"
import mongoose from "mongoose";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findOwnedLedger = (ledgerId, userId) =>
    ledgerSchema.findOne({ _id: ledgerId, userId });

const isPopulatedCategory = (value) =>
    Boolean(value && typeof value === "object" && value._id && value.name);

const serializeTransaction = (transaction) => {
    const plain = typeof transaction.toObject === "function" ? transaction.toObject() : transaction;
    const category = isPopulatedCategory(plain.categoryId)
        ? {
            _id: plain.categoryId._id,
            name: plain.categoryId.name,
        }
        : null;

    return {
        ...plain,
        categoryId: category ? category._id : plain.categoryId || null,
        category,
    };
};

const resolveCategoryId = async (categoryId, ledgerId) => {
    if (categoryId === undefined || categoryId === null || categoryId === "") {
        return { categoryId: null };
    }
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return { error: { status: 400, message: "Category is invalid" } };
    }

    const category = await categorySchema.findOne({
        _id: categoryId,
        ledgerId: String(ledgerId),
    });
    if (!category) {
        return { error: { status: 404, message: "Category not found" } };
    }

    return { categoryId: category._id };
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
            .populate("categoryId", "name")
            .sort({ createdAt: -1 })

        return res.send(transactions.map(serializeTransaction))
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

        const resolved = await resolveCategoryId(req.body.categoryId, ledgerId)
        if (resolved.error) {
            return res.status(resolved.error.status).json({ message: resolved.error.message })
        }

        const { category, ...transactionBody } = req.body
        const created = await transactionSchema.create({
            ...transactionBody,
            ledgerId,
            categoryId: resolved.categoryId,
        })
        await created.populate("categoryId", "name")
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
        return res.send(serializeTransaction(created))
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Server error" });
    }
}

const updateTransaction = async(req, res) => {
    try {
        const { ledgerId, transactionId } = req.params
        const { type, amount, activity } = req.body
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

        const resolved = await resolveCategoryId(req.body.categoryId, ledgerId)
        if (resolved.error) {
            return res.status(resolved.error.status).json({ message: resolved.error.message })
        }

        transaction.activity = trimmedActivity
        transaction.type = type
        transaction.amount = amount
        transaction.categoryId = resolved.categoryId
        await transaction.save()
        await transaction.populate("categoryId", "name")

        if (incomeDelta !== 0 || expenseDelta !== 0) {
            await ledgerSchema.updateOne(
                { _id: ledgerId },
                { $inc: { totalIncome: incomeDelta, totalExpense: expenseDelta } },
                { timestamps: true }
            )
        }

        return res.send(serializeTransaction(transaction))
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

        return res.send({ message: "Transaction deleted", transaction: serializeTransaction(transaction) })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Server error" });
    }
}

const getCategories = async (req, res) => {
    try {
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET)
        const ledger = await findOwnedLedger(req.params.ledgerId, decoded._id)
        if (!ledger) {
            return res.status(404).json({ message: "Ledger not found" });
        }

        const categories = await categorySchema
            .find({ ledgerId: req.params.ledgerId })
            .sort({ name: 1 })

        return res.send(categories)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Server error" });
    }
}

const createCategory = async (req, res) => {
    try {
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET)
        const { ledgerId } = req.params
        const name = req.body.name?.trim()

        if (!name || name.length < 2 || name.length > 30) {
            return res.status(400).json({ message: "Category name must be 2 to 30 characters" });
        }

        const ledger = await findOwnedLedger(ledgerId, decoded._id)
        if (!ledger) {
            return res.status(404).json({ message: "Ledger not found" });
        }

        const existing = await categorySchema.findOne({
            ledgerId: String(ledgerId),
            name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
        })
        if (existing) {
            return res.status(409).json({ message: "That category already exists" });
        }

        const category = await categorySchema.create({
            ledgerId: String(ledgerId),
            name,
        })
        return res.send(category)
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
    deleteTransaction,
    getCategories,
    createCategory,
}
