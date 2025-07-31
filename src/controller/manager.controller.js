import { decode } from "jsonwebtoken"
import orderModel from "../models/project.model.js"

const getOrders = async(req, res) => {
    try {
        const accessToken = req.cookies.accessToken
        const decoded = decode(accessToken, process.env.ACCESS_TOKEN_SECRET)
        let orders;
        if(req.params.statusFilter === "All") {
            orders = await orderModel.find({ companyCode: decoded.companyCode })
        } else {
            orders = await orderModel.find({ companyCode: decoded.companyCode, status: req.params.statusFilter })
        }
        return res.send(orders)
    } catch (error) {
        console.log(error.message)
    }
}

const updateOrder = async(req, res) => {
    try {
        const { status, orderId } = req.params
        if(status === "Pending") {
            await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: "In progress", startedAt: new Date() } })
        } else if(status === "In progress") {
            await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: "Completed", completedAt: new Date() } })
        }
        return res.send({ success: true })
    } catch (error) {
        console.log(error.message)
    }
}

export default {
    getOrders,
    updateOrder
}