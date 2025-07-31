import authController from '../controller/auth.controller.js';

import express from 'express';
const authRouter = express.Router()

authRouter.post('/login_check', authController.loginCheck);
authRouter.post('/logout', authController.logout);
authRouter.post('/register', authController.register);

export default authRouter