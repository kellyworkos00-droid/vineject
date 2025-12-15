import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../core/middleware/auth';
import { SalesService } from './sales.service';

export class SalesController {
  private service: SalesService;

  constructor() {
    this.service = new SalesService();
  }

  getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orders = await this.service.getAllOrders();
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  };

  getOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const order = await this.service.getOrderById(req.params.id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const order = await this.service.createOrder(req.body, req.user!.id);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const order = await this.service.updateOrderStatus(req.params.id, status);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  getInvoices = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const invoices = await this.service.getAllInvoices();
      res.json({ success: true, data: invoices });
    } catch (error) {
      next(error);
    }
  };

  getInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const invoice = await this.service.getInvoiceById(req.params.id);
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  };
}
