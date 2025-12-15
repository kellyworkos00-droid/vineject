import Stripe from 'stripe';
import axios from 'axios';
import { Database } from '../../database/connection';
import { AppError } from '../../core/middleware/errorHandler';
import { logger } from '../../core/logger';

export class PaymentService {
  private stripe: Stripe;
  private db: Database;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-11-20.acacia',
    });
    this.db = Database.getInstance();
  }

  // Stripe Integration
  async createStripePaymentIntent(amount: number, currency: string = 'usd', orderId?: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: { orderId: orderId || '' },
      });

      await this.recordPayment({
        gateway: 'stripe',
        transaction_id: paymentIntent.id,
        amount,
        currency,
        status: 'pending',
        order_id: orderId,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: any) {
      logger.error('Stripe payment intent creation failed:', error);
      throw new AppError(error.message || 'Failed to create payment intent', 500);
    }
  }

  async handleStripeWebhook(rawBody: any, signature: string) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      logger.info('Stripe webhook received:', { type: event.type });

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.updatePaymentStatus(paymentIntent.id, 'completed');
          if (paymentIntent.metadata.orderId) {
            await this.updateOrderPaymentStatus(paymentIntent.metadata.orderId, 'paid');
          }
          break;

        case 'payment_intent.payment_failed':
          const failedIntent = event.data.object as Stripe.PaymentIntent;
          await this.updatePaymentStatus(failedIntent.id, 'failed');
          break;

        default:
          logger.info('Unhandled Stripe event type:', event.type);
      }
    } catch (error: any) {
      logger.error('Stripe webhook handling failed:', error);
      throw new AppError('Webhook verification failed', 400);
    }
  }

  // PayPal Integration
  async createPayPalOrder(amount: number, currency: string = 'USD', orderId?: string) {
    try {
      const accessToken = await this.getPayPalAccessToken();

      const response = await axios.post(
        `https://api-m.${process.env.PAYPAL_MODE}.paypal.com/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            reference_id: orderId,
          }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await this.recordPayment({
        gateway: 'paypal',
        transaction_id: response.data.id,
        amount,
        currency,
        status: 'pending',
        order_id: orderId,
      });

      return {
        orderId: response.data.id,
        approvalUrl: response.data.links.find((link: any) => link.rel === 'approve')?.href,
      };
    } catch (error: any) {
      logger.error('PayPal order creation failed:', error);
      throw new AppError(error.response?.data?.message || 'Failed to create PayPal order', 500);
    }
  }

  private async getPayPalAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      `https://api-m.${process.env.PAYPAL_MODE}.paypal.com/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  }

  async handlePayPalWebhook(body: any) {
    try {
      logger.info('PayPal webhook received:', { type: body.event_type });

      switch (body.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          const captureId = body.resource.id;
          await this.updatePaymentStatus(captureId, 'completed');
          break;

        case 'PAYMENT.CAPTURE.DENIED':
          const deniedId = body.resource.id;
          await this.updatePaymentStatus(deniedId, 'failed');
          break;

        default:
          logger.info('Unhandled PayPal event type:', body.event_type);
      }
    } catch (error: any) {
      logger.error('PayPal webhook handling failed:', error);
      throw new AppError('Webhook processing failed', 500);
    }
  }

  // Square Integration
  async createSquarePayment(sourceId: string, amount: number, currency: string = 'USD', orderId?: string) {
    try {
      const response = await axios.post(
        `https://connect.${process.env.SQUARE_ENVIRONMENT === 'production' ? '' : 'sandbox.'}squareup.com/v2/payments`,
        {
          source_id: sourceId,
          amount_money: {
            amount: Math.round(amount * 100),
            currency,
          },
          idempotency_key: `${Date.now()}-${Math.random()}`,
          reference_id: orderId,
        },
        {
          headers: {
            'Square-Version': '2024-11-20',
            Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await this.recordPayment({
        gateway: 'square',
        transaction_id: response.data.payment.id,
        amount,
        currency,
        status: response.data.payment.status === 'COMPLETED' ? 'completed' : 'pending',
        order_id: orderId,
      });

      return {
        paymentId: response.data.payment.id,
        status: response.data.payment.status,
      };
    } catch (error: any) {
      logger.error('Square payment creation failed:', error);
      throw new AppError(error.response?.data?.errors?.[0]?.detail || 'Failed to create Square payment', 500);
    }
  }

  async handleSquareWebhook(body: any) {
    try {
      logger.info('Square webhook received:', { type: body.type });

      switch (body.type) {
        case 'payment.updated':
          const payment = body.data.object.payment;
          if (payment.status === 'COMPLETED') {
            await this.updatePaymentStatus(payment.id, 'completed');
          } else if (payment.status === 'FAILED') {
            await this.updatePaymentStatus(payment.id, 'failed');
          }
          break;

        default:
          logger.info('Unhandled Square event type:', body.type);
      }
    } catch (error: any) {
      logger.error('Square webhook handling failed:', error);
      throw new AppError('Webhook processing failed', 500);
    }
  }

  // Database operations
  private async recordPayment(data: any) {
    await this.db.query(
      `INSERT INTO payments (gateway, transaction_id, amount, currency, status, order_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [data.gateway, data.transaction_id, data.amount, data.currency, data.status, data.order_id]
    );
  }

  private async updatePaymentStatus(transactionId: string, status: string) {
    await this.db.query(
      'UPDATE payments SET status = $1, updated_at = NOW() WHERE transaction_id = $2',
      [status, transactionId]
    );
  }

  private async updateOrderPaymentStatus(orderId: string, status: string) {
    await this.db.query(
      'UPDATE orders SET payment_status = $1, updated_at = NOW() WHERE id = $2',
      [status, orderId]
    );
  }

  async getPaymentHistory() {
    const result = await this.db.query(
      'SELECT * FROM payments ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async getPaymentById(id: string) {
    const result = await this.db.query(
      'SELECT * FROM payments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Payment not found', 404);
    }

    return result.rows[0];
  }
}
