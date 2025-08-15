import express from 'express';
import userController from '../controller/user.controller.js'
import { authenticateToken } from '../middleware/tokenValidation.js';
const userRouter = express.Router()

userRouter.get('/run-server', () => console.log("User entered server"));

userRouter.get('/ledger', authenticateToken, userController.getLedgers);
userRouter.post('/ledger', authenticateToken, userController.createLedger);
userRouter.get('/ledger/:ledgerId', authenticateToken, userController.getLedger);

userRouter.get('/transactions/:ledgerId', authenticateToken, userController.getTransactions);
userRouter.post('/transactions/:ledgerId', authenticateToken, userController.createTransactions);

export default userRouter