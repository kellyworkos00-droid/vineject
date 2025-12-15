import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../core/middleware/auth';
import { InventoryService } from './inventory.service';

export class InventoryController {
  private service: InventoryService;

  constructor() {
    this.service = new InventoryService();
  }

  getProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const products = await this.service.getAllProducts();
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  };

  getProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await this.service.getProductById(req.params.id);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await this.service.createProduct(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await this.service.updateProduct(req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteProduct(req.params.id);
      res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
      next(error);
    }
  };

  updateStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { quantity, operation } = req.body;
      const result = await this.service.updateStock(req.params.id, quantity, operation);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getLowStockProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const products = await this.service.getLowStockProducts();
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  };
}
