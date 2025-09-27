import express from 'express';
import userController from '../controller/user.controller.js'
import messageController from '../controller/message.controller.js'
import { authenticateToken } from '../middleware/tokenValidation.js';
const userRouter = express.Router()

userRouter.get('/ledger', authenticateToken, userController.getLedgers);
userRouter.post('/ledger', authenticateToken, userController.createLedger);
userRouter.get('/ledger/:ledgerId', authenticateToken, userController.getLedger);
userRouter.patch('/ledger/:ledgerId', authenticateToken, userController.updateStatus);

userRouter.get('/transactions/:ledgerId', authenticateToken, userController.getTransactions);
userRouter.post('/transactions/:ledgerId', authenticateToken, userController.createTransactions);
userRouter.get('/transactions/:ledgerId/recent', authenticateToken, userController.getRecentTransactions);

userRouter.get('/users', authenticateToken, userController.getUsers);
userRouter.patch('/add-members', authenticateToken, userController.addMembers);

userRouter.get('/chats', authenticateToken, userController.getChats);
userRouter.get('/current-user', authenticateToken, userController.getCurrentUser);

userRouter.post('/messages', authenticateToken, messageController.sendMessage);
userRouter.get('/messages/:chatId', authenticateToken, messageController.getMessages);
userRouter.get('/unread-count', authenticateToken, messageController.getUnreadCount);

userRouter.get('/run-server', () => console.log("User entered server"));

export default userRouter