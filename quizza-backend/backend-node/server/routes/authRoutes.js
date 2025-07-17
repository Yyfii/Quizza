//Authentication Routes

import express from 'express';
import { getUserInfo, isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

//Endpoints User
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account',userAuth, verifyEmail);
authRouter.get('/is-auth', userAuth, isAuthenticated);
authRouter.post('/sent-reset-otp',  sendResetOtp);
authRouter.post('/reset-password',  resetPassword);
authRouter.get('/user', userAuth, getUserInfo)

export default authRouter
