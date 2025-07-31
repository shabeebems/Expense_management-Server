import express from 'express';
import staffController from '../controller/staff.controller.js'
import { authenticateToken } from '../middleware/tokenValidation.js';
const staffRouter = express.Router()

// User
staffRouter.post('/create_order', authenticateToken, staffController.createOrder);
staffRouter.get('/fetch_orders/:statusFilter', authenticateToken, staffController.getOrders);
staffRouter.get('/fetch_single_order/:orderId', authenticateToken, staffController.getSingleOrder);
staffRouter.post('/add_expense/:orderId', authenticateToken, staffController.addExpense);
staffRouter.post('/add_income/:orderId', authenticateToken, staffController.addIncome);
staffRouter.get('/fetch_income_and_expense/:orderId', authenticateToken, staffController.fetchIncomeAndExpense);

staffRouter.get('/run-server', () => console.log("User entered server"));

export default staffRouter