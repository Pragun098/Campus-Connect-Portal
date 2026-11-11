const { createHash } = require('node:crypto');
const Session = require('../models/Session');
const User = require('../models/User');
const SESSION_COOKIE = 'campus_session';

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function getSessionToken(req) {
  const cookies = (req.get('cookie') || '').split(';');
  const sessionCookie = cookies
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`));

  return sessionCookie ? sessionCookie.slice(SESSION_COOKIE.length + 1) : null;
}

function setSessionCookie(res, token, maxAgeSeconds) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`
  );
}

async function authenticate(req, res, next) {
  const token = getSessionToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Please sign in to continue.' });
  }

  const session = await Session.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() }
  });

  if (!session) {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }

  const user = await User.findById(session.userId);
  if (!user) {
    await Session.deleteOne({ _id: session._id });
    return res.status(401).json({ message: 'This account is no longer available.' });
  }

  req.user = user;
  req.session = session;
  return next();
}

function requireAdministration(req, res, next) {
  if (req.user.portal !== 'administration') {
    return res.status(403).json({ message: 'Administrator access is required.' });
  }

  return next();
}

module.exports = {
  authenticate,
  hashToken,
  requireAdministration,
  setSessionCookie
};
