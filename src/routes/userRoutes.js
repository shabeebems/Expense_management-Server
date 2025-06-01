import express from 'express';
import userController from '../controller/userController.js'
const userRouter = express.Router()

// User
userRouter.post('/create_order', userController.createOrder);
userRouter.get('/fetch_orders', userController.getOrders);
userRouter.get('/fetch_single_order/:orderId', userController.getSingleOrder);
userRouter.post('/add_expense/:orderId', userController.addExpense);
userRouter.get('/fetch_income_and_expense/:orderId', userController.fetchIncomeAndExpense);

export default userRouter