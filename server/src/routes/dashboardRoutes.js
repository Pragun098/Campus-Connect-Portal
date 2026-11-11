const express = require('express');
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const Notice = require('../models/Notice');
const User = require('../models/User');
const { authenticate, requireAdministration } = require('../middleware/authenticate');

const router = express.Router();
const NOTICE_CATEGORIES = ['Academic', 'Campus', 'Event', 'General'];

router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is unavailable. Start MongoDB and try again.'
    });
  }
  return next();
}, authenticate);

function requireFaculty(req, res, next) {
  if (!['faculty', 'administration'].includes(req.user.portal)) {
    return res.status(403).json({ message: 'Faculty access is required.' });
  }
  return next();
}

function cleanText(value, maxLength) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
}

router.get('/assignments', async (req, res) => {
  const assignments = await Assignment.find()
    .sort({ dueDate: 1, createdAt: -1 })
    .limit(200)
    .populate('createdBy', 'name');

  res.json({ assignments });
});

router.post('/assignments', requireFaculty, async (req, res) => {
  const { course, title, description = '', dueDate } = req.body || {};
  const parsedDueDate = new Date(dueDate);

  if (!cleanText(course, 120) || !cleanText(title, 160)) {
    return res.status(400).json({ message: 'Course and assignment title are required.' });
  }
  if (typeof description !== 'string' || description.length > 2000) {
    return res.status(400).json({ message: 'Description must be at most 2000 characters.' });
  }
  if (!dueDate || Number.isNaN(parsedDueDate.getTime())) {
    return res.status(400).json({ message: 'Enter a valid assignment due date.' });
  }

  const assignment = await Assignment.create({
    course: course.trim(),
    title: title.trim(),
    description: description.trim(),
    dueDate: parsedDueDate,
    createdBy: req.user._id
  });

  res.status(201).json({ assignment });
});

router.get('/attendance', async (req, res) => {
  const query = req.user.portal === 'student' ? { student: req.user._id } : {};
  const attendance = await Attendance.find(query)
    .sort({ date: -1, course: 1 })
    .limit(500)
    .populate('student', 'name email');

  res.json({ attendance });
});

router.get('/students', requireFaculty, async (req, res) => {
  const students = await User.find({ portal: 'student' })
    .select('name email')
    .sort({ name: 1 })
    .limit(500);

  res.json({
    students: students.map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email
    }))
  });
});

router.post('/attendance', requireFaculty, async (req, res) => {
  const { studentId, course, date, status } = req.body || {};
  const parsedDate = new Date(date);

  if (!mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({ message: 'Select a valid student.' });
  }
  if (!cleanText(course, 120)) {
    return res.status(400).json({ message: 'Course name is required.' });
  }
  if (!date || Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: 'Enter a valid attendance date.' });
  }
  if (!['present', 'absent'].includes(status)) {
    return res.status(400).json({ message: 'Attendance status must be present or absent.' });
  }

  const student = await User.findOne({ _id: studentId, portal: 'student' });
  if (!student) {
    return res.status(404).json({ message: 'Student account was not found.' });
  }

  const attendance = await Attendance.findOneAndUpdate(
    {
      student: student._id,
      course: course.trim(),
      date: parsedDate
    },
    {
      $set: { status, markedBy: req.user._id }
    },
    {
      returnDocument: 'after',
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  ).populate('student', 'name email');

  res.status(200).json({ attendance });
});

router.get('/notices', async (req, res) => {
  const notices = await Notice.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('createdBy', 'name');

  res.json({ notices });
});

router.post('/notices', requireAdministration, async (req, res) => {
  const { title, description, category } = req.body || {};

  if (!cleanText(title, 160) || !cleanText(description, 2000)) {
    return res.status(400).json({
      message: 'Notice title and description are required and must be within the character limits.'
    });
  }
  if (!NOTICE_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: 'Choose a valid notice category.' });
  }

  const notice = await Notice.create({
    title: title.trim(),
    description: description.trim(),
    category,
    createdBy: req.user._id
  });

  res.status(201).json({ notice });
});

module.exports = router;
