const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = (process.env.NODE_ENV || 'development').trim().toLowerCase();
const validEnvs = ['development', 'production', 'test'];

if (!validEnvs.includes(nodeEnv)) {
  console.warn(`[CONFIG WARNING] Unknown NODE_ENV="${process.env.NODE_ENV}". Defaulting to "development".`);
}

const rawPort = process.env.PORT || 5000;
const port = parseInt(rawPort, 10);
if (isNaN(port) || port < 1 || port > 65535) {
  throw new Error(`[CONFIG ERROR] Invalid PORT="${rawPort}". Must be a number between 1 and 65535.`);
}

// CORS Origin normalization (supports comma-separated list or single origin)
const rawCorsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawCorsOrigin
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

// Database path resolution and directory validation
const defaultDbPath = path.resolve(__dirname, '../../data/students.db');
const dbPath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : defaultDbPath;

// Prevent placing database inside public or frontend directories
const normalizedDbPath = path.normalize(dbPath);
if (normalizedDbPath.includes(path.join('frontend', 'public')) || normalizedDbPath.includes(path.join('frontend', 'dist'))) {
  throw new Error('[CONFIG ERROR] DB_PATH must not be located within public client-accessible directories.');
}

const config = {
  port,
  nodeEnv: validEnvs.includes(nodeEnv) ? nodeEnv : 'development',
  corsOrigins: allowedOrigins,
  corsOrigin: allowedOrigins[0] || 'http://localhost:5173',
  dbPath,
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 mins
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300, // 300 requests per window
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test'
};

/**
 * Validates configuration at startup and warns about potential misconfigurations
 */
function validateConfig() {
  const issues = [];

  if (config.isProduction) {
    if (config.corsOrigins.some(origin => origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      issues.push('CORS_ORIGIN contains localhost/127.0.0.1 in production mode. Set to production domain.');
    }
  }

  return {
    isValid: true,
    warnings: issues
  };
}

module.exports = {
  ...config,
  validateConfig
};
