import authController from '../controller/authController.js';

import express from 'express';
const authRouter = express.Router()

authRouter.post('/login_check', authController.loginCheck);
authRouter.post('/logout', authController.logout);

export default authRouter