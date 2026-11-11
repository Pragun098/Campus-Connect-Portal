const express = require('express');
const { randomBytes } = require('node:crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');
const {
  authenticate,
  hashToken,
  requireAdministration,
  setSessionCookie
} = require('../middleware/authenticate');
const { hashPassword, verifyPassword } = require('../utils/passwords');

const router = express.Router();
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const VALID_PORTALS = ['student', 'faculty', 'administration'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is unavailable. Start MongoDB and try again.'
    });
  }

  return next();
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    portal: user.portal
  };
}

function validateAccount({ name, email, password }) {
  if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100) {
    return 'Name must be between 1 and 100 characters.';
  }
  if (
    typeof email !== 'string' ||
    email.length > 254 ||
    !EMAIL_PATTERN.test(email.trim())
  ) {
    return 'Enter a valid email address.';
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return 'Password must be between 8 and 128 characters.';
  }
  return null;
}

async function createAccount({ name, email, password, portal }) {
  const { salt, hash } = await hashPassword(password);
  return User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hash,
    passwordSalt: salt,
    portal
  });
}

function handleDuplicateEmail(error, res) {
  if (error.code !== 11000) {
    return false;
  }
  res.status(409).json({ message: 'An account with this email already exists.' });
  return true;
}

router.post('/register', async (req, res) => {
  const { name, email, password, portal } = req.body || {};
  const validationError = validateAccount({ name, email, password });

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  if (portal !== 'student') {
    return res.status(403).json({
      message: 'Faculty and administration accounts must be created by an administrator.'
    });
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is unavailable. Start MongoDB and try again.'
    });
  }

  try {
    const user = await createAccount({ name, email, password, portal });
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (handleDuplicateEmail(error, res)) {
      return undefined;
    }
    throw error;
  }
});

router.post('/login', async (req, res) => {
  const { email, password, portal } = req.body || {};
  if (
    typeof email !== 'string' ||
    email.length > 254 ||
    typeof password !== 'string' ||
    password.length < 1 ||
    password.length > 128
  ) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  if (require('mongoose').connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is unavailable. Start MongoDB and try again.'
    });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() })
    .select('+passwordHash +passwordSalt');
  if (
    !user ||
    !(await verifyPassword(password, user.passwordSalt, user.passwordHash))
  ) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }

  if (portal !== undefined && (!VALID_PORTALS.includes(portal) || portal !== user.portal)) {
    return res.status(403).json({
      message: `This account is registered for the ${user.portal} portal.`
    });
  }

  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await Session.create({
    tokenHash: hashToken(token),
    userId: user._id,
    expiresAt
  });
  setSessionCookie(res, token, SESSION_DURATION_MS / 1000);

  return res.json({
    user: publicUser(user),
    expiresAt: expiresAt.toISOString()
  });
});

router.get('/me', requireDatabase, authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post('/logout', requireDatabase, authenticate, async (req, res) => {
  await Session.deleteOne({ _id: req.session._id });
  setSessionCookie(res, '', 0);
  res.json({ message: 'Signed out successfully.' });
});

router.post('/users', requireDatabase, authenticate, requireAdministration, async (req, res) => {
  const { name, email, password, portal } = req.body || {};
  const validationError = validateAccount({ name, email, password });

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  if (!['faculty', 'administration'].includes(portal)) {
    return res.status(400).json({
      message: 'Administrators can create faculty or administration accounts.'
    });
  }

  try {
    const user = await createAccount({ name, email, password, portal });
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (handleDuplicateEmail(error, res)) {
      return undefined;
    }
    throw error;
  }
});

module.exports = router;
