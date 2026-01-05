import express from 'express';
import * as nusukController from '../reservation/nusuk.controller.js';

const router = express.Router();

router.get('/', nusukController.getAll);
router.post('/update', nusukController.update);

export default router;
