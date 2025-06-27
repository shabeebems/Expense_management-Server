import express from 'express';
import userController from '../controller/userController.js'
import { authenticateToken } from '../middleware/tokenValidation.js';
const userRouter = express.Router()

// User
userRouter.post('/create_order', authenticateToken, userController.createOrder);
userRouter.get('/fetch_orders/:statusFilter', userController.getOrders);
userRouter.get('/fetch_single_order/:orderId', userController.getSingleOrder);
userRouter.post('/add_expense/:orderId', userController.addExpense);
userRouter.post('/add_income/:orderId', userController.addIncome);
userRouter.get('/fetch_income_and_expense/:orderId', userController.fetchIncomeAndExpense);

export default userRouter