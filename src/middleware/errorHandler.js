import { AppError } from '../utils/appError.js';

export function notFound(_req, res, _next) {
  res.status(404).json({ success: false, message: 'Not Found' });
}

export function errorHandler(err, _req, res, _next) {
  const isKnown = err instanceof AppError;
  const status = isKnown ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  const details = isKnown ? err.details : undefined;

  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', err);
  }

  res.status(status).json({ success: false, message, details });
} 