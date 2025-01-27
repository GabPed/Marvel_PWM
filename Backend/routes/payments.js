import express from 'express';
import {createPayment, successPayment, cancelPayment, getPayment, getPaymentByPaymentId} from '../controllers/payments.js'

const router = express.Router();

router.get('/', getPayment)
router.get('/:paymentId', getPaymentByPaymentId)
router.post('/', createPayment)
router.patch('/success', successPayment)
router.patch('/cancel', cancelPayment)

export default router;