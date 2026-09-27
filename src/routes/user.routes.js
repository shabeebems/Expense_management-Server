import express from 'express';
import userController from '../controller/user.controller.js'
import { authenticateToken } from '../middleware/tokenValidation.js';
import { purgeExpiredLedgers } from '../jobs/purgeExpiredLedgers.js';
const userRouter = express.Router()

userRouter.get('/ledger', authenticateToken, userController.getLedgers);
userRouter.get('/ledger/deleted', authenticateToken, userController.getDeletedLedgers);
userRouter.post('/ledger', authenticateToken, userController.createLedger);
userRouter.put('/ledger/:ledgerId', authenticateToken, userController.updateLedger);
userRouter.delete('/ledger/:ledgerId/permanent', authenticateToken, userController.permanentlyDeleteLedger);
userRouter.delete('/ledger/:ledgerId', authenticateToken, userController.deleteLedger);
userRouter.post('/ledger/:ledgerId/restore', authenticateToken, userController.restoreLedger);
userRouter.get('/ledger/:ledgerId', authenticateToken, userController.getLedger);

userRouter.get('/categories/:ledgerId', authenticateToken, userController.getCategories);
userRouter.post('/categories/:ledgerId', authenticateToken, userController.createCategory);

userRouter.get('/transactions/:ledgerId', authenticateToken, userController.getTransactions);
userRouter.post('/transactions/:ledgerId', authenticateToken, userController.createTransactions);
userRouter.put('/transactions/:ledgerId/:transactionId', authenticateToken, userController.updateTransaction);
userRouter.delete('/transactions/:ledgerId/:transactionId', authenticateToken, userController.deleteTransaction);

userRouter.get('/run-server', async (_req, res) => {
    try {
        const purged = await purgeExpiredLedgers();
        console.log(`Server is running. Purged ${purged} expired ledgers`);
        res.send({ ok: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error" });
    }
});

export default userRouter
