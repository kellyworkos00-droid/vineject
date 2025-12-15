import { Request, Response, NextFunction } from 'express';

export class CRMController {
  getCustomers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, data: [] });
    } catch (err) {
      next(err);
    }
  };

  getCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, data: { id: req.params.id } });
    } catch (err) {
      next(err);
    }
  };

  createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json({ success: true, data: req.body });
    } catch (err) {
      next(err);
    }
  };

  updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, data: { id: req.params.id, ...req.body } });
    } catch (err) {
      next(err);
    }
  };

  deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  getCustomerInteractions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, data: [], customerId: req.params.id });
    } catch (err) {
      next(err);
    }
  };

  createInteraction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json({ success: true, data: req.body });
    } catch (err) {
      next(err);
    }
  };
}
