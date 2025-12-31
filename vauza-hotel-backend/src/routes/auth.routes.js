import express from 'express';
import * as authController from '../auth/auth.controller.js';

const router = express.Router();

router.post('/login', authController.login);

export default router;
