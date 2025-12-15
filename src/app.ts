import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { router } from './routes';
import { errorHandler } from './core/middleware/errorHandler';
import { Database } from './database/connection';
import { PluginManager } from './core/plugins/PluginManager';
import { logger } from './core/logger';

dotenv.config();

let initialized = false;

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', router);

  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', service: 'KellyOS ERP', version: '1.0.0' });
  });

  app.use(errorHandler);

  return app;
}

export async function initApp(): Promise<void> {
  if (initialized) return;

  await Database.getInstance().connect();
  logger.info('Database connected successfully');

  if (process.env.ENABLE_PLUGINS === 'true') {
    const pluginManager = PluginManager.getInstance();
    await pluginManager.loadPlugins();
    logger.info('Plugins loaded successfully');
  }

  initialized = true;
}
