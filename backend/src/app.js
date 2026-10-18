const express = require('express');
const { 
  configureHelmet, 
  configureCors, 
  configureRateLimiter, 
  enforceJsonContentType, 
  restrictHttpMethods 
} = require('./middleware/security');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const studentRoutes = require('./routes/studentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Trust reverse proxy if running behind Nginx, Render, Fly.io, etc.
app.set('trust proxy', 1);

// 1. Restrict unsupported HTTP methods
app.use(restrictHttpMethods);

// 2. Security Headers via Helmet
app.use(configureHelmet());

// 3. Strict CORS Origin Policy
app.use(configureCors());

// 4. Rate Limiting
app.use('/api', configureRateLimiter());

// 5. Content-Type Enforcement for mutations
app.use(enforceJsonContentType);

// 6. Request Body Parsing with strict limits
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 7. API Routes
app.use('/api/health', healthRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 8. 404 Route Handler
app.use(notFoundHandler);

// 9. Centralized Error Handler
app.use(errorHandler);

module.exports = app;
