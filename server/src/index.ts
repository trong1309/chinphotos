import env from './config/env';
import { connectDB } from './config/db';
import app from './app';

const startServer = async (): Promise<void> => {
  // Connect to Database
  await connectDB();

  // Start HTTP Server
  app.listen(env.PORT, () => {
    console.log(`[server] Server listening on http://localhost:${env.PORT}`);
    console.log(`[server] Swagger API documentation: http://localhost:${env.PORT}/api/docs`);
    console.log(`[server] Health check endpoint: http://localhost:${env.PORT}/api/health`);
  });
};

startServer().catch((err) => {
  console.error('[server] Failed to start server:', err);
  process.exit(1);
});
