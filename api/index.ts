import { app } from '../server/app.js';
import type { IncomingMessage, ServerResponse } from 'http';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
