
import ledgerSchema from "../models/ledger.model.js"
import transactionSchema from "../models/transaction.model.js"
import { decodeToken } from "../utils/jwt.js"

const getLedgers = async(req, res) => {
    try {
        const decoded = await decodeToken(req, process.env.ACCESS_TOKEN_SECRET)
        const ledgers = await ledgerSchema.find({ userId: decoded._id })
        return res.send(ledgers)
    } catch (error) {
        console.log(error.message)
    }
}

const createLedger = async(req, res) => {
    try {
        const accessToken = req.cookies.accessToken
        const decoded = decode(accessToken, process.env.ACCESS_TOKEN_SECRET)
        const { _id } = decoded
        const data = {
            name: req.body.newName, userId: _id
        }
        const newLedger = await ledgerSchema.create(data)
        return res.send(newLedger)
    } catch (error) {
        console.log(error.message)
    }
}

const getLedger = async(req, res) => {
    try {
        const ledger = await ledgerSchema.findOne({ _id: req.params.ledgerId })
        return res.send(ledger)
    } catch (error) {
        console.log(error.message)
    }
}

const getTransactions = async(req, res) => {
    try {
        const transactions = await transactionSchema.find({ ledgerId: req.params.ledgerId })
        const incomes = transactions.filter((t) => t.type === "income");
        const expenses = transactions.filter((t) => t.type === "expense");
        return res.send({ incomes, expenses })
    } catch (error) {
        console.log(error.message)
    }
}

const createTransactions = async(req, res) => {
    try {
        const { type, amount } = req.body
        const { ledgerId } = req.params

        await transactionSchema.create({ ledgerId, ...req.body })
        if(type === "income") {
            await ledgerSchema.updateOne({ _id: ledgerId }, { $inc: { totalIncome: amount } })
        } else if(type === "expense") {
            await ledgerSchema.updateOne({ _id: ledgerId }, { $inc: { totalExpense: amount } })
        }
        return res.send({ success: true })
    } catch (error) {
        console.log(error.message)
    }
}

export default {
    getLedgers,
    createLedger,
    getLedger,
    getTransactions,
    createTransactions
}
