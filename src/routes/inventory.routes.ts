import { Router } from 'express';
import { InventoryController } from '../modules/inventory/inventory.controller';
import { authenticate, authorize } from '../core/middleware/auth';

export const inventoryRouter = Router();
const controller = new InventoryController();

inventoryRouter.use(authenticate);

inventoryRouter.get('/products', controller.getProducts);
inventoryRouter.get('/products/:id', controller.getProduct);
inventoryRouter.post('/products', authorize('admin', 'manager'), controller.createProduct);
inventoryRouter.put('/products/:id', authorize('admin', 'manager'), controller.updateProduct);
inventoryRouter.delete('/products/:id', authorize('admin'), controller.deleteProduct);
inventoryRouter.post('/products/:id/stock', authorize('admin', 'manager'), controller.updateStock);
inventoryRouter.get('/low-stock', controller.getLowStockProducts);
