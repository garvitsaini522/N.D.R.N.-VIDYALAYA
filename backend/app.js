import express from 'express';
import morgan from 'morgan';
import { config } from './config/env.js';
import {
  helmetMiddleware,
  corsMiddleware,
  apiLimiter,
  sanitizeInputs,
} from './middleware/securityMiddleware.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import apiRoutes from './routes/index.js';

const app = express();

// Security HTTP headers
app.use(helmetMiddleware);

// Cross-Origin Resource Sharing
app.use(corsMiddleware);

// HTTP request logging
if (config.env !== 'test') {
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
}

// Body parsers with safe payload limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Input sanitization against NoSQL injection
app.use(sanitizeInputs);

// Rate limiting on all API routes
app.use('/api', apiLimiter);

// Mount API routes
app.use('/api', apiRoutes);

// Root index redirect/info
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'N.D.R.N. Vidyalaya API Server is operational',
    healthCheck: '/api/health',
    version: '1.0.0',
    school: {
      name: 'N.D.R.N. Vidyalaya',
      location: 'Daulatyarpur, Madhoganj, Uttar Pradesh',
      levels: 'Nursery to Class 5',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
