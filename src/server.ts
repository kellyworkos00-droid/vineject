import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './core/logger';
import { errorHandler } from './core/middleware/errorHandler';
import { router } from './routes';
import { Database } from './database/connection';
import { PluginManager } from './core/plugins/PluginManager';

dotenv.config();

class KellyOSServer {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    this.app.use('/api', router);
    
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'KellyOS ERP', version: '1.0.0' });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Initialize database
      await Database.getInstance().connect();
      logger.info('Database connected successfully');

      // Initialize plugins
      if (process.env.ENABLE_PLUGINS === 'true') {
        const pluginManager = PluginManager.getInstance();
        await pluginManager.loadPlugins();
        logger.info('Plugins loaded successfully');
      }

      // Start server
      this.app.listen(this.port, () => {
        logger.info(`KellyOS ERP server running on port ${this.port}`);
        logger.info(`Environment: ${process.env.NODE_ENV}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new KellyOSServer();
server.start();
