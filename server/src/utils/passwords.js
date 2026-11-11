const { promisify } = require('node:util');
const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');

const scryptAsync = promisify(scrypt);
const HASH_LENGTH = 64;

async function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = await scryptAsync(password, salt, HASH_LENGTH);
  return {
    salt,
    hash: hash.toString('hex')
  };
}

async function verifyPassword(password, salt, expectedHash) {
  const { hash } = await hashPassword(password, salt);
  const actual = Buffer.from(hash, 'hex');
  const expected = Buffer.from(expectedHash, 'hex');

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

module.exports = { hashPassword, verifyPassword };
