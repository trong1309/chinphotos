import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import env from './config/env';
import { swaggerSpec } from './config/swagger';
import { apiRateLimiter } from './middleware/rateLimit.middleware';
import errorHandler from './middleware/errorHandler.middleware';
import routes from './routes';
import { getUploadDirectory } from './services/storage/local';
import { getSitemapXml } from './controllers/sitemap.controller';

const app = express();

// Trust first reverse proxy (Render, Caddy, Nginx) for accurate IP rate-limiting & secure cookies
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI and local images to load
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows client/admin to load uploaded images
  }),
);

// CORS Configuration
const allowedOrigins = [env.CLIENT_URL, env.ADMIN_URL];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: This origin is not allowed'));
    },
    credentials: true,
  }),
);

// Parsers
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files Statically
app.use('/uploads', express.static(getUploadDirectory()));

// Dynamic Sitemap Endpoint
app.get('/sitemap.xml', getSitemapXml);

// Global API Rate Limiter
app.use('/api', apiRateLimiter);

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    message: 'Server is healthy',
  });
});

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api', routes);

// 404 Handler for undefined API routes
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
