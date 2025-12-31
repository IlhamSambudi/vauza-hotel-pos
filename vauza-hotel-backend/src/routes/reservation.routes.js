import express from 'express';
import auth from '../auth/auth.middleware.js';
import * as controller from '../reservation/reservation.controller.js';

const router = express.Router();

router.post('/', auth, controller.create);
router.get('/', auth, controller.getAll);
router.put('/:no_rsv/payment', auth, controller.updatePayment);
router.get('/:no_rsv/rooms', auth, controller.getRooms);
router.post('/:no_rsv/rooms', auth, controller.addRoom);
router.get('/:no_rsv', auth, controller.getDetail);
router.delete('/:no_rsv', auth, controller.deleteReservation);

export default router;
