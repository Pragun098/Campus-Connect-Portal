const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');

process.env.NODE_ENV = 'test';
const app = require('../src/app');
const { hashPassword, verifyPassword } = require('../src/utils/passwords');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('password hashes verify without storing the original password', async () => {
  const { salt, hash } = await hashPassword('campus-password');

  assert.notEqual(hash, 'campus-password');
  assert.equal(await verifyPassword('campus-password', salt, hash), true);
  assert.equal(await verifyPassword('incorrect-password', salt, hash), false);
});

test('public registration only permits student accounts', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Faculty',
      email: 'faculty@example.edu',
      password: 'campus-password',
      portal: 'faculty'
    })
  });

  assert.equal(response.status, 403);
  assert.match((await response.json()).message, /created by an administrator/i);
});

test('student registration reports when MongoDB is unavailable', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Student',
      email: 'student@example.edu',
      password: 'campus-password',
      portal: 'student'
    })
  });

  assert.equal(response.status, 503);
  assert.match((await response.json()).message, /database is unavailable/i);
});

test('protected profile endpoint reports an unavailable database', async () => {
  const response = await fetch(`${baseUrl}/api/auth/me`);

  assert.equal(response.status, 503);
});

test('staff account creation reports an unavailable database', async () => {
  const response = await fetch(`${baseUrl}/api/auth/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'New Faculty',
      email: 'new-faculty@example.edu',
      password: 'campus-password',
      portal: 'faculty'
    })
  });

  assert.equal(response.status, 503);
});
