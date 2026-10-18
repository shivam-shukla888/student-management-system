const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Configure Helmet security headers
 */
function configureHelmet() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", ...config.corsOrigins]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  });
}

/**
 * Configure CORS with explicit, validated allowed origins
 */
function configureCors() {
  const allowed = new Set(config.corsOrigins);
  // Always include standard local dev variations in development
  if (!config.isProduction) {
    allowed.add('http://localhost:5173');
    allowed.add('http://127.0.0.1:5173');
    allowed.add('http://localhost:3000');
    allowed.add('http://127.0.0.1:3000');
  }

  return cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (such as same-origin requests, curl, mobile native or postman)
      if (!origin) {
        return callback(null, true);
      }
      
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (allowed.has(normalizedOrigin)) {
        return callback(null, true);
      } else {
        const err = new Error(`CORS blocked: Origin "${origin}" is not authorized.`);
        err.statusCode = 403;
        return callback(err);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    maxAge: 86400 // Cache preflight for 24 hours
  });
}

/**
 * Rate limiting to prevent brute-force and Denial-of-Service attacks
 */
function configureRateLimiter() {
  return rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.isTest ? 1000 : config.rateLimitMax,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    message: {
      success: false,
      error: 'Too many requests from this IP address. Please try again later.'
    },
    skip: () => config.isTest // Skip in automated test runner
  });
}

/**
 * Enforce Content-Type application/json on mutations with a body
 */
function enforceJsonContentType(req, res, next) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > 0 || req.headers['transfer-encoding']) {
      const contentType = req.headers['content-type'] || '';
      if (!contentType.includes('application/json')) {
        return res.status(415).json({
          success: false,
          error: 'Unsupported Media Type: Content-Type must be application/json'
        });
      }
    }
  }
  next();
}

/**
 * Reject dangerous or unhandled HTTP methods
 */
function restrictHttpMethods(req, res, next) {
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'];
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({
      success: false,
      error: `HTTP method ${req.method} is not allowed.`
    });
  }
  next();
}

module.exports = {
  configureHelmet,
  configureCors,
  configureRateLimiter,
  enforceJsonContentType,
  restrictHttpMethods
};
