import dotenv from 'dotenv';
import { createApp, initApp } from './app';
import { logger } from './core/logger';

dotenv.config();

const app = createApp();
const port = parseInt(process.env.PORT || '3000', 10);

initApp()
  .then(() => {
    app.listen(port, () => {
      logger.info(`KellyOS ERP server running on port ${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
