import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import routes from './routes/index.js';
import { errorHandler, notFound, apiLimiter } from './middlewares/index.js';
import logger from './utils/logger.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  next();
});

// API routes
app.use(`/api/${process.env.API_VERSION || 'v1'}`, routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to AuthFlow API',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      health: `/api/${process.env.API_VERSION || 'v1'}/health`,
      docs: 'Coming soon',
    },
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
