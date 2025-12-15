import { Router } from 'express';
import { PaymentController } from '../modules/payments/payment.controller';
import { authenticate } from '../core/middleware/auth';

export const paymentRouter = Router();
const controller = new PaymentController();

// Payment processing
paymentRouter.post('/stripe/create-payment-intent', authenticate, controller.createStripePaymentIntent);
paymentRouter.post('/paypal/create-order', authenticate, controller.createPayPalOrder);
paymentRouter.post('/square/create-payment', authenticate, controller.createSquarePayment);

// Webhooks (no authentication required)
paymentRouter.post('/webhooks/stripe', controller.handleStripeWebhook);
paymentRouter.post('/webhooks/paypal', controller.handlePayPalWebhook);
paymentRouter.post('/webhooks/square', controller.handleSquareWebhook);

// Payment history
paymentRouter.get('/history', authenticate, controller.getPaymentHistory);
paymentRouter.get('/:id', authenticate, controller.getPayment);
