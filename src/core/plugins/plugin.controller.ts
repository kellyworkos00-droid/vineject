import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PluginManager } from './PluginManager';

export class PluginController {
  private pluginManager: PluginManager;

  constructor() {
    this.pluginManager = PluginManager.getInstance();
  }

  listPlugins = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const plugins = await this.pluginManager.getPluginMetadata();
      res.json({ success: true, data: plugins });
    } catch (error) {
      next(error);
    }
  };

  getPlugin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const plugin = await this.pluginManager.getPluginMetadata(req.params.id);
      res.json({ success: true, data: plugin });
    } catch (error) {
      next(error);
    }
  };

  installPlugin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { metadata, files } = req.body;
      await this.pluginManager.installPlugin(metadata, files);
      res.json({ success: true, message: 'Plugin installed successfully' });
    } catch (error) {
      next(error);
    }
  };

  enablePlugin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.pluginManager.enablePlugin(req.params.id);
      res.json({ success: true, message: 'Plugin enabled successfully' });
    } catch (error) {
      next(error);
    }
  };

  disablePlugin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.pluginManager.disablePlugin(req.params.id);
      res.json({ success: true, message: 'Plugin disabled successfully' });
    } catch (error) {
      next(error);
    }
  };

  uninstallPlugin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.pluginManager.uninstallPlugin(req.params.id);
      res.json({ success: true, message: 'Plugin uninstalled successfully' });
    } catch (error) {
      next(error);
    }
  };
}
