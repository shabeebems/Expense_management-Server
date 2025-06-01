import { decode } from "jsonwebtoken"
import orderModel from "../models/orderModel.js"

const getOrders = async(req, res) => {
    try {
        console.log(req.cookies)
        const accessToken = req.cookies.accessToken
        const decoded = decode(accessToken, process.env.ACCESS_TOKEN_SECRET)
        const orders = await orderModel.find({ companyCode: decoded.companyCode })
        return res.send(orders)
    } catch (error) {
        console.log(error.message)
    }
}

const updateOrder = async(req, res) => {
    try {
        await orderModel.findOneAndUpdate({ _id: req.params.orderId }, { $set: { status: "Activated" } })
        return res.send({ success: true })
    } catch (error) {
        console.log(error.message)
    }
}

export default {
    getOrders,
    updateOrder
}