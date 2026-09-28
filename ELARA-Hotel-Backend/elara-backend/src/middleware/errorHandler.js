import { ZodError } from 'zod';

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    });
  }

  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({
    message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error.' : error.message,
    ...(error.details ? { details: error.details } : {})
  });
}
