const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const activityRoutes = require('./routes/activityRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Built-in & Third-party Middleware
app.use(cors());
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Root / Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Campus Connect RESTful API Server',
    course: 'CS3301 - Full Stack Development',
    experiment: 'Experiment 6 - Node.js and Express RESTful API',
    endpoints: {
      getAllActivities: 'GET /api/activities',
      getActivityById: 'GET /api/activities/:id',
      createActivity: 'POST /api/activities',
      replaceActivity: 'PUT /api/activities/:id',
      partiallyUpdateActivity: 'PATCH /api/activities/:id',
      deleteActivity: 'DELETE /api/activities/:id'
    }
  });
});

// 3. API Resource Routes
app.use('/api/activities', activityRoutes);

// 4. 404 Route Not Found Middleware (Must be placed after all routes)
app.use(notFoundHandler);

// 5. Global Error Handling Middleware (Must be placed last)
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  Campus Connect Backend API Server is running!    `);
    console.log(`  URL: http://localhost:${PORT}                      `);
    console.log(`  Resource Endpoint: http://localhost:${PORT}/api/activities`);
    console.log(`====================================================`);
  });
}

module.exports = app;
