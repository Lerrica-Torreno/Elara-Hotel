// Assemble API middleware and route modules into the Express application.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import customerRoutes from './routes/customer.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export const app = express();

// Canonicalize configured frontend URLs before comparing request origins.
function normalizeOrigin(value) {
  try {
    return new URL(value.trim()).origin;
  } catch {
    return '';
  }
}

const allowedOrigins = [
  process.env.CUSTOMER_APP_ORIGIN || 'http://localhost:5174',
  process.env.ADMIN_APP_ORIGIN || 'http://localhost:5173',
  ...(process.env.CORS_ALLOWED_ORIGINS || '').split(',')
]
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

// Apply security, cross-origin, parsing, cookie, and request-logging middleware.
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Limit repeated authentication attempts without rate-limiting normal API traffic.
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false }));

// Expose service health and mount each API area before the 404 and error handlers.
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'elara-hotel-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);
