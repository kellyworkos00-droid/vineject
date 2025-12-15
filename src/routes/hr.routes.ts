import { Router } from 'express';
import { HRController } from '../modules/hr/hr.controller';
import { authenticate, authorize } from '../core/middleware/auth';

export const hrRouter = Router();
const controller = new HRController();

hrRouter.use(authenticate);

hrRouter.get('/employees', controller.getEmployees);
hrRouter.get('/employees/:id', controller.getEmployee);
hrRouter.post('/employees', authorize('admin', 'hr'), controller.createEmployee);
hrRouter.put('/employees/:id', authorize('admin', 'hr'), controller.updateEmployee);
hrRouter.delete('/employees/:id', authorize('admin'), controller.deleteEmployee);
hrRouter.get('/payroll', authorize('admin', 'hr'), controller.getPayrollRecords);
hrRouter.post('/payroll', authorize('admin', 'hr'), controller.createPayrollRecord);
