import path from 'path';
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { app } from './server/app.js';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

const PORT = 3000;

async function startServer() {
  // Vite / Frontend serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Selling Ajah server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
