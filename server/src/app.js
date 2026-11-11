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
const Notice = require('./models/Notice');
const Assignment = require('./models/Assignment');
const Attendance = require('./models/Attendance');
const { hashPassword } = require('./utils/passwords');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedClientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedClientOrigins.includes(origin));
  },
  credentials: true
}));
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

async function seedDemoData() {
  const demoUsers = [
    { name: 'Campus Administrator', email: 'admin@campus.edu', pass: 'admin123', portal: 'administration' },
    { name: 'Dr. Sarah Adams', email: 'faculty@campus.edu', pass: 'faculty123', portal: 'faculty' },
    { name: 'Alex Johnson', email: 'student@campus.edu', pass: 'student123', portal: 'student' }
  ];

  const map = {};
  for (const d of demoUsers) {
    let u = await User.findOne({ email: d.email });
    if (!u) {
      const { salt, hash } = await hashPassword(d.pass);
      u = await User.create({
        name: d.name,
        email: d.email,
        passwordHash: hash,
        passwordSalt: salt,
        portal: d.portal
      });
      console.log(`Created default demo user: ${d.email} (${d.portal})`);
    }
    map[d.portal] = u;
  }

  const noticeCount = await Notice.countDocuments();
  if (noticeCount === 0 && map.administration) {
    await Notice.create([
      {
        title: 'Mid-Semester Examination Schedule Announced',
        description: 'The schedule for the upcoming mid-semester examinations has been published on the portal. Please verify your course timings.',
        category: 'Academic',
        createdBy: map.administration._id
      },
      {
        title: 'Annual Tech Innovators Hackathon 2026',
        description: 'Registrations are open for the 48-hour Campus Connect Hackathon. Attractive prizes and incubation opportunities for winning teams.',
        category: 'Event',
        createdBy: map.administration._id
      },
      {
        title: 'Central Library Extended Study Hours',
        description: 'Starting this week, the digital research library and study commons will remain open 24/7 with campus ID card access.',
        category: 'Campus',
        createdBy: map.administration._id
      }
    ]);
  }

  const assignmentCount = await Assignment.countDocuments();
  if (assignmentCount === 0 && map.faculty) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);

    await Assignment.create([
      {
        course: 'CS3301 Full Stack Development',
        title: 'REST API & Authentication Frontend Portal',
        description: 'Implement full-stack authentication flow with JWT or secure sessions and interactive dashboard components.',
        dueDate: nextWeek,
        createdBy: map.faculty._id
      },
      {
        course: 'CS3302 Cloud Computing & DevOps',
        title: 'Containerization and Microservices Deployment',
        description: 'Deploy multi-tier containerized architecture using Docker Compose and configure automated health monitoring.',
        dueDate: twoWeeks,
        createdBy: map.faculty._id
      }
    ]);
  }

  const attendanceCount = await Attendance.countDocuments();
  if (attendanceCount === 0 && map.student && map.faculty) {
    const today = new Date();
    await Attendance.create([
      { student: map.student._id, course: 'CS3301 Full Stack Development', date: today, status: 'present', markedBy: map.faculty._id },
      { student: map.student._id, course: 'CS3302 Cloud Computing', date: today, status: 'present', markedBy: map.faculty._id }
    ]);
  }
}

// 2. Root / Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Campus Connect RESTful API Server',
    course: 'CS3301 - Full Stack Development',
    experiment: 'Experiment 6 - Node.js and Express RESTful API',
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
        await seedDemoData();
      } catch (error) {
        console.error('Unable to create bootstrap/seed data:', error.message);
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
