import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';

export class AnalyticsController {
  private service: AnalyticsService;

  constructor() {
    this.service = new AnalyticsService();
  }

  getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getDashboardStats();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getSalesAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { range, channel } = req.query as { range?: string; channel?: string };
      const data = await this.service.getSalesAnalytics(range, channel);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getInventoryAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { range } = req.query as { range?: string };
      const data = await this.service.getInventoryAnalytics(range);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getCustomerAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { range } = req.query as { range?: string };
      const data = await this.service.getCustomerAnalytics(range);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getRevenueAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { range, channel } = req.query as { range?: string; channel?: string };
      const data = await this.service.getRevenueAnalytics(range, channel);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
