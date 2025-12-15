import { Application } from 'express';

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies?: string[];
}

export interface Plugin {
  metadata: PluginMetadata;
  initialize(app: Application): Promise<void>;
  destroy?(): Promise<void>;
}

export abstract class BasePlugin implements Plugin {
  abstract metadata: PluginMetadata;

  async initialize(app: Application): Promise<void> {
    // Override in plugin implementation
  }

  async destroy(): Promise<void> {
    // Override if cleanup is needed
  }
}
