import { decode } from "jsonwebtoken"
import orderModel from "../models/orderModel.js"
import transactionModel from "../models/transactionModel.js"

const createOrder = async(req, res) => {
    try {
        const accessToken = req.cookies.accessToken
        const decoded = decode(accessToken, process.env.ACCESS_TOKEN_SECRET)
        const { name, place } = req.body
        const { _id, companyCode } = decoded
        const data = {
            name, place, companyCode, userId: _id
        }
        const newOrder = await orderModel.create(data)
        return res.send(newOrder)
    } catch (error) {
        console.log(error.message)
    }
}

const getOrders = async(req, res) => {
    try {
        console.log('Fetching')
        // const accessToken = req.cookies.accessToken
        // const decoded = decode(accessToken, process.env.ACCESS_TOKEN_SECRET)
        const orders = await orderModel.find()
        return res.send(orders)
    } catch (error) {
        console.log(error.message)
    }
}

const getSingleOrder = async(req, res) => {
    try {
        const order = await orderModel.findOne({ _id: req.params?.orderId })
        return res.send(order)
    } catch (error) {
        console.log(error.message)
    }
}

const addExpense = async(req, res) => {
    try {
        const data = {
            orderId: req.params.orderId,
            transaction: "expense",
            amount: req.body.amount,
            activity: req.body.description
        }
        await transactionModel.create(data)
        await orderModel.findOneAndUpdate({ _id: req.params?.orderId }, { $inc: { expense: req.body.amount } })
        return res.send({ success: true })
    } catch (error) {
        console.log(error.message)
    }
}

const addIncome = async(req, res) => {
    try {
        const data = {
            orderId: req.params.orderId,
            transaction: "income",
            amount: req.body.amount,
            activity: req.body.description
        }
        await transactionModel.create(data)
        await orderModel.findOneAndUpdate({ _id: req.params?.orderId }, { $inc: { income: req.body.amount } })
        return res.send({ success: true })
    } catch (error) {
        console.log(error.message)
    }
}

const fetchIncomeAndExpense = async(req, res) => {
    try {
        const expenses = await transactionModel.find({ orderId: req.params.orderId, transaction: "expense" })
        const incomes = await transactionModel.find({ orderId: req.params.orderId, transaction: "income" })
        return res.send({ expenses, incomes })
    } catch (error) {
        console.log(error.message)
    }
}

export default {
    createOrder,
    getOrders,
    getSingleOrder,
    addExpense,
    addIncome,
    fetchIncomeAndExpense
}
