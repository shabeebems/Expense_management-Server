import express from 'express';
import authController from '../controller/auth.controller.js';
import { validate } from '../middleware/zodValidate.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

const authRouter = express.Router()

authRouter.post('/login', validate(loginSchema), authController.loginCheck);
authRouter.post('/logout', authController.logout);
authRouter.post('/register', validate(registerSchema), authController.register);

export default authRouter