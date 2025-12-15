import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../core/middleware/auth';
import { PaymentService } from './payment.service';

export class PaymentController {
  private service: PaymentService;

  constructor() {
    this.service = new PaymentService();
  }

  createStripePaymentIntent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { amount, currency, orderId } = req.body;
      const result = await this.service.createStripePaymentIntent(amount, currency, orderId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  createPayPalOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { amount, currency, orderId } = req.body;
      const result = await this.service.createPayPalOrder(amount, currency, orderId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  createSquarePayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { sourceId, amount, currency, orderId } = req.body;
      const result = await this.service.createSquarePayment(sourceId, amount, currency, orderId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  handleStripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      await this.service.handleStripeWebhook(req.body, signature);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  };

  handlePayPalWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.handlePayPalWebhook(req.body);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  };

  handleSquareWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.handleSquareWebhook(req.body);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  };

  getPaymentHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const payments = await this.service.getPaymentHistory();
      res.json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  };

  getPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const payment = await this.service.getPaymentById(req.params.id);
      res.json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  };
}
