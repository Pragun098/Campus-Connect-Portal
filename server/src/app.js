const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const logger = require('./middleware/logger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const activityRoutes = require('./routes/activityRoutes');
const noteRoutes = require('./routes/noteRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const User = require('./models/User');
const { hashPassword } = require('./utils/passwords');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function createBootstrapAdministrator() {
  const { BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD } = process.env;
  const configuredValues = [
    BOOTSTRAP_ADMIN_NAME,
    BOOTSTRAP_ADMIN_EMAIL,
    BOOTSTRAP_ADMIN_PASSWORD
  ];

  if (configuredValues.every((value) => !value)) {
    return;
  }
  if (configuredValues.some((value) => !value)) {
    throw new Error('Set all BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_EMAIL, and BOOTSTRAP_ADMIN_PASSWORD values.');
  }
  if (BOOTSTRAP_ADMIN_PASSWORD.length < 8 || BOOTSTRAP_ADMIN_PASSWORD.length > 128) {
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD must be between 8 and 128 characters.');
  }
  if (!BOOTSTRAP_ADMIN_NAME.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(BOOTSTRAP_ADMIN_EMAIL.trim())) {
    throw new Error('Set a valid BOOTSTRAP_ADMIN_NAME and BOOTSTRAP_ADMIN_EMAIL.');
  }

  const email = BOOTSTRAP_ADMIN_EMAIL.trim().toLowerCase();
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.portal !== 'administration') {
      throw new Error('The bootstrap administrator email is already assigned to a non-administrator account.');
    }
    return;
  }

  const { salt, hash } = await hashPassword(BOOTSTRAP_ADMIN_PASSWORD);
  await User.create({
    name: BOOTSTRAP_ADMIN_NAME.trim(),
    email,
    passwordHash: hash,
    passwordSalt: salt,
    portal: 'administration'
  });
  console.log(`Created bootstrap administrator account for ${email}.`);
}

// 2. Root / Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Campus Connect RESTful API Server',
    course: 'CS3301 - Full Stack Development',
    endpoints: {
      authentication: 'POST /api/auth/register | POST /api/auth/login | GET /api/auth/me | POST /api/auth/logout | POST /api/auth/users (administrator only)',
      dashboard: 'GET /api/dashboard/assignments | POST /api/dashboard/assignments (faculty) | GET /api/dashboard/attendance | POST /api/dashboard/attendance (faculty) | GET /api/dashboard/students (faculty) | GET /api/dashboard/notices | POST /api/dashboard/notices (administrator)',
      notes: 'GET /api/notes | POST /api/notes | PUT /api/notes/:id | DELETE /api/notes/:id',
      activities: 'GET /api/activities | POST /api/activities | PUT /api/activities/:id | DELETE /api/activities/:id'
    }
  });
});

// 3. API Resource Routes
app.use('/api/notes', noteRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 4. 404 Route Not Found Middleware (Must be placed after all routes)
app.use(notFoundHandler);

// 5. Global Error Handling Middleware (Must be placed last)
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log('Campus Connect Backend API Server is running at http://localhost:%s', PORT);
  });

  mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_demo_db')
    .then(async () => {
      console.log('Connected to MongoDB.');
      try {
        await createBootstrapAdministrator();
      } catch (error) {
        console.error('Unable to create the bootstrap administrator:', error.message);
      }
    })
    .catch((error) => {
      console.error('Unable to connect to MongoDB; authentication requests will return 503:', error.message);
    });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
  });

  server.on('error', (error) => {
    console.error('Unable to start the API server:', error.message);
    process.exitCode = 1;
  });
}

module.exports = app;
