import express from 'express';
import userController from '../controller/userController.js'
import { authenticateToken } from '../middleware/tokenValidation.js';
const userRouter = express.Router()

// User
userRouter.post('/create_order', authenticateToken, userController.createOrder);
userRouter.get('/fetch_orders/:statusFilter', authenticateToken, userController.getOrders);
userRouter.get('/fetch_single_order/:orderId', authenticateToken, userController.getSingleOrder);
userRouter.post('/add_expense/:orderId', authenticateToken, userController.addExpense);
userRouter.post('/add_income/:orderId', authenticateToken, userController.addIncome);
userRouter.get('/fetch_income_and_expense/:orderId', authenticateToken, userController.fetchIncomeAndExpense);

export default userRouter