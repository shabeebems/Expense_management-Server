import express from 'express';
import userController from '../controller/user.controller.js'
import { authenticateToken } from '../middleware/tokenValidation.js';
const userRouter = express.Router()

userRouter.get('/ledger', authenticateToken, userController.getLedgers);
userRouter.post('/ledger', authenticateToken, userController.createLedger);
userRouter.put('/ledger/:ledgerId', authenticateToken, userController.updateLedger);
userRouter.get('/ledger/:ledgerId', authenticateToken, userController.getLedger);

userRouter.get('/transactions/:ledgerId', authenticateToken, userController.getTransactions);
userRouter.post('/transactions/:ledgerId', authenticateToken, userController.createTransactions);
userRouter.put('/transactions/:ledgerId/:transactionId', authenticateToken, userController.updateTransaction);
userRouter.delete('/transactions/:ledgerId/:transactionId', authenticateToken, userController.deleteTransaction);

userRouter.get('/run-server', (_req, res) => res.send({ ok: true }));

export default userRouter
