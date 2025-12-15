import { Router } from 'express';
import { authRouter } from './auth.routes';
import { inventoryRouter } from './inventory.routes';
import { salesRouter } from './sales.routes';
import { crmRouter } from './crm.routes';
import { accountingRouter } from './accounting.routes';
import { hrRouter } from './hr.routes';
import { analyticsRouter } from './analytics.routes';
import { paymentRouter } from './payment.routes';
import { pluginRouter } from './plugin.routes';

export const router = Router();

// Core module routes
router.use('/auth', authRouter);
router.use('/inventory', inventoryRouter);
router.use('/sales', salesRouter);
router.use('/crm', crmRouter);
router.use('/accounting', accountingRouter);
router.use('/hr', hrRouter);
router.use('/analytics', analyticsRouter);

// Integration routes
router.use('/payments', paymentRouter);

// Plugin management
router.use('/plugins', pluginRouter);

// API info
router.get('/', (req, res) => {
  res.json({
    service: 'KellyOS ERP API',
    version: '1.0.0',
    endpoints: [
      '/auth',
      '/inventory',
      '/sales',
      '/crm',
      '/accounting',
      '/hr',
      '/analytics',
      '/payments',
      '/plugins'
    ]
  });
});
