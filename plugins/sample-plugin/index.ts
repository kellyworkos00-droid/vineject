import { BasePlugin, PluginMetadata } from '../../core/plugins/Plugin';
import { Application, Router } from 'express';

export default class SamplePlugin extends BasePlugin {
  metadata: PluginMetadata = {
    id: 'sample-plugin',
    name: 'Sample Plugin',
    version: '1.0.0',
    description: 'A sample plugin demonstrating the plugin system',
    author: 'KellyOS Team',
  };

  async initialize(app: Application): Promise<void> {
    const router = Router();

    router.get('/hello', (req, res) => {
      res.json({
        message: 'Hello from Sample Plugin!',
        plugin: this.metadata.name,
        version: this.metadata.version,
      });
    });

    app.use('/api/plugins/sample', router);

    console.log(`${this.metadata.name} initialized successfully`);
  }

  async destroy(): Promise<void> {
    console.log(`${this.metadata.name} destroyed`);
  }
}
