import { Router } from 'express';
import { CRMController } from '../modules/crm/crm.controller';
import { authenticate, authorize } from '../core/middleware/auth';

export const crmRouter = Router();
const controller = new CRMController();

crmRouter.use(authenticate);

crmRouter.get('/customers', controller.getCustomers);
crmRouter.get('/customers/:id', controller.getCustomer);
crmRouter.post('/customers', controller.createCustomer);
crmRouter.put('/customers/:id', controller.updateCustomer);
crmRouter.delete('/customers/:id', authorize('admin'), controller.deleteCustomer);
crmRouter.get('/customers/:id/interactions', controller.getCustomerInteractions);
crmRouter.post('/interactions', controller.createInteraction);
