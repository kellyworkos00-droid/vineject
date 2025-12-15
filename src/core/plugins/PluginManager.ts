import fs from 'fs';
import path from 'path';
import { Application } from 'express';
import { Plugin, PluginMetadata } from './Plugin';
import { logger } from '../logger';
import { Database } from '../../database/connection';

export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, Plugin>;
  private pluginDir: string;
  private db: Database;

  private constructor() {
    this.plugins = new Map();
    this.pluginDir = process.env.PLUGIN_DIR || path.join(process.cwd(), 'plugins');
    this.db = Database.getInstance();
    this.ensurePluginDirectory();
  }

  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  private ensurePluginDirectory(): void {
    if (!fs.existsSync(this.pluginDir)) {
      fs.mkdirSync(this.pluginDir, { recursive: true });
      logger.info(`Created plugin directory: ${this.pluginDir}`);
    }
  }

  async loadPlugins(app?: Application): Promise<void> {
    try {
      const result = await this.db.query(
        'SELECT * FROM plugins WHERE enabled = true'
      );

      for (const pluginRecord of result.rows) {
        try {
          await this.loadPlugin(pluginRecord.id, app);
        } catch (error: any) {
          logger.error(`Failed to load plugin ${pluginRecord.id}:`, error);
        }
      }

      logger.info(`Loaded ${this.plugins.size} plugins`);
    } catch (error) {
      logger.error('Failed to load plugins:', error);
    }
  }

  async loadPlugin(pluginId: string, app?: Application): Promise<void> {
    const pluginPath = path.join(this.pluginDir, pluginId, 'index.js');

    if (!fs.existsSync(pluginPath)) {
      throw new Error(`Plugin file not found: ${pluginPath}`);
    }

    try {
      // Dynamic import of plugin
      const PluginClass = require(pluginPath).default;
      const plugin: Plugin = new PluginClass();

      // Initialize plugin
      if (app) {
        await plugin.initialize(app);
      }

      this.plugins.set(pluginId, plugin);
      logger.info(`Plugin loaded: ${plugin.metadata.name} v${plugin.metadata.version}`);
    } catch (error: any) {
      logger.error(`Failed to load plugin ${pluginId}:`, error);
      throw error;
    }
  }

  async installPlugin(metadata: PluginMetadata, files: any): Promise<void> {
    try {
      // Create plugin directory
      const pluginPath = path.join(this.pluginDir, metadata.id);
      if (!fs.existsSync(pluginPath)) {
        fs.mkdirSync(pluginPath, { recursive: true });
      }

      // Save plugin files
      // In a real implementation, you would extract uploaded files here

      // Register plugin in database
      await this.db.query(
        `INSERT INTO plugins (id, name, version, description, author, enabled, created_at)
         VALUES ($1, $2, $3, $4, $5, false, NOW())
         ON CONFLICT (id) DO UPDATE
         SET version = $3, updated_at = NOW()`,
        [metadata.id, metadata.name, metadata.version, metadata.description, metadata.author]
      );

      logger.info(`Plugin installed: ${metadata.name}`);
    } catch (error) {
      logger.error('Failed to install plugin:', error);
      throw error;
    }
  }

  async enablePlugin(pluginId: string, app?: Application): Promise<void> {
    await this.db.query(
      'UPDATE plugins SET enabled = true, updated_at = NOW() WHERE id = $1',
      [pluginId]
    );

    if (app) {
      await this.loadPlugin(pluginId, app);
    }

    logger.info(`Plugin enabled: ${pluginId}`);
  }

  async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);

    if (plugin && plugin.destroy) {
      await plugin.destroy();
    }

    this.plugins.delete(pluginId);

    await this.db.query(
      'UPDATE plugins SET enabled = false, updated_at = NOW() WHERE id = $1',
      [pluginId]
    );

    logger.info(`Plugin disabled: ${pluginId}`);
  }

  async uninstallPlugin(pluginId: string): Promise<void> {
    await this.disablePlugin(pluginId);

    const pluginPath = path.join(this.pluginDir, pluginId);
    if (fs.existsSync(pluginPath)) {
      fs.rmSync(pluginPath, { recursive: true, force: true });
    }

    await this.db.query('DELETE FROM plugins WHERE id = $1', [pluginId]);

    logger.info(`Plugin uninstalled: ${pluginId}`);
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  async getPluginMetadata(pluginId?: string): Promise<any> {
    if (pluginId) {
      const result = await this.db.query(
        'SELECT * FROM plugins WHERE id = $1',
        [pluginId]
      );
      return result.rows[0];
    }

    const result = await this.db.query('SELECT * FROM plugins ORDER BY name');
    return result.rows;
  }
}
