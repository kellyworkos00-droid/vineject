import { Router } from 'express';
import { PluginController } from '../core/plugins/plugin.controller';
import { authenticate, authorize } from '../core/middleware/auth';

export const pluginRouter = Router();
const controller = new PluginController();

pluginRouter.use(authenticate);

pluginRouter.get('/', controller.listPlugins);
pluginRouter.get('/:id', controller.getPlugin);
pluginRouter.post('/install', authorize('admin'), controller.installPlugin);
pluginRouter.post('/:id/enable', authorize('admin'), controller.enablePlugin);
pluginRouter.post('/:id/disable', authorize('admin'), controller.disablePlugin);
pluginRouter.delete('/:id', authorize('admin'), controller.uninstallPlugin);
