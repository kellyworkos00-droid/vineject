import { Router } from 'express';
import { AccountingController } from '../modules/accounting/accounting.controller';
import { authenticate, authorize } from '../core/middleware/auth';

export const accountingRouter = Router();
const controller = new AccountingController();

accountingRouter.use(authenticate);

accountingRouter.get('/transactions', controller.getTransactions);
accountingRouter.get('/transactions/:id', controller.getTransaction);
accountingRouter.post('/transactions', authorize('admin', 'accountant'), controller.createTransaction);
accountingRouter.get('/reports/balance-sheet', authorize('admin', 'accountant'), controller.getBalanceSheet);
accountingRouter.get('/reports/income-statement', authorize('admin', 'accountant'), controller.getIncomeStatement);
