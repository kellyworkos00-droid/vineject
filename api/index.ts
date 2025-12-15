import serverless from 'serverless-http';
import { createApp, initApp } from '../src/app';

const app = createApp();
const ready = initApp();
const handler = serverless(app);

export default async function vercelHandler(req: any, res: any) {
  await ready;
  return handler(req, res);
}
