import express from 'express';
import managerController from '../controller/manager.controller.js'
const managerRouter = express.Router()

managerRouter.get('/fetch_orders/:statusFilter', managerController.getOrders);
managerRouter.patch('/update_order/:orderId/:status', managerController.updateOrder);

export default managerRouter