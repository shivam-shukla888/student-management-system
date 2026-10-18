const config = require('../config');

/**
 * Custom application error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found route handler
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

/**
 * Centralized global error handling middleware
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Handle SQLite constraint errors gracefully
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || (err.message && err.message.includes('UNIQUE constraint failed'))) {
    statusCode = 409;
    if (err.message.includes('students.email')) {
      message = 'A student with this email address already exists. Duplicate emails are not allowed.';
      details = [{ field: 'email', message: 'Email address is already in use.' }];
    } else {
      message = 'A record with these unique details already exists.';
    }
  }

  // Handle invalid JSON body syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload in request body';
  }

  const response = {
    success: false,
    error: message
  };

  if (details) {
    response.details = details;
  }

  // Include stack trace only in non-production environments
  if (config.nodeEnv !== 'production' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler
};
