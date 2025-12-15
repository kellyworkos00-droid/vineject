import { Router } from 'express';
import { SalesController } from '../modules/sales/sales.controller';
import { authenticate, authorize } from '../core/middleware/auth';

export const salesRouter = Router();
const controller = new SalesController();

salesRouter.use(authenticate);

salesRouter.get('/orders', controller.getOrders);
salesRouter.get('/orders/:id', controller.getOrder);
salesRouter.post('/orders', controller.createOrder);
salesRouter.put('/orders/:id/status', authorize('admin', 'manager'), controller.updateOrderStatus);
salesRouter.get('/invoices', controller.getInvoices);
salesRouter.get('/invoices/:id', controller.getInvoice);
