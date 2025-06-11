import express from 'express';
import adminController from '../controller/adminController.js'
const adminRouter = express.Router()

// User
adminRouter.get('/fetch_orders/:statusFilter', adminController.getOrders);
adminRouter.patch('/update_order/:orderId/:status', adminController.updateOrder);

export default adminRouter