import express from 'express';
import auth from '../auth/auth.middleware.js';
import * as controller from '../hotel/hotel.controller.js';

const router = express.Router();

router.get('/', auth, controller.getAll);
router.post('/', auth, controller.create);

export default router;
