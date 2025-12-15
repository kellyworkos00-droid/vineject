import { Router } from 'express';
import { AnalyticsController } from '../modules/analytics/analytics.controller';
import { authenticate } from '../core/middleware/auth';

export const analyticsRouter = Router();
const controller = new AnalyticsController();

analyticsRouter.use(authenticate);

analyticsRouter.get('/dashboard', controller.getDashboardStats);
analyticsRouter.get('/sales', controller.getSalesAnalytics);
analyticsRouter.get('/inventory', controller.getInventoryAnalytics);
analyticsRouter.get('/customer', controller.getCustomerAnalytics);
analyticsRouter.get('/revenue', controller.getRevenueAnalytics);
