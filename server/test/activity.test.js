const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');

process.env.NODE_ENV = 'test';
const app = require('../src/app');

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

test('activities API supports CRUD and reports invalid requests', async () => {
  const healthResponse = await fetch(`${baseUrl}/`);
  assert.equal(healthResponse.status, 200);
  const health = await healthResponse.json();
  assert.equal(health.experiment, 'Experiment 6 - Node.js and Express RESTful API');

  const listResponse = await fetch(`${baseUrl}/api/activities`);
  assert.equal(listResponse.status, 200);
  const initialList = await listResponse.json();
  assert.ok(initialList.count >= 1);

  const invalidIdResponse = await fetch(`${baseUrl}/api/activities/not-an-id`);
  assert.equal(invalidIdResponse.status, 400);

  const invalidCreateResponse = await fetch(`${baseUrl}/api/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: 'Technical' })
  });
  assert.equal(invalidCreateResponse.status, 400);

  const createResponse = await fetch(`${baseUrl}/api/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Lab 6 Test Activity',
      category: 'Technical',
      date: '2026-11-20',
      status: 'Upcoming'
    })
  });
  assert.equal(createResponse.status, 201);
  const created = (await createResponse.json()).data;
  assert.equal(created.title, 'Lab 6 Test Activity');

  const incompleteReplaceResponse = await fetch(
    `${baseUrl}/api/activities/${created.id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Incomplete Replacement' })
    }
  );
  assert.equal(incompleteReplaceResponse.status, 400);

  const getResponse = await fetch(`${baseUrl}/api/activities/${created.id}`);
  assert.equal(getResponse.status, 200);
  assert.equal((await getResponse.json()).data.id, created.id);

  const replaceResponse = await fetch(`${baseUrl}/api/activities/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Replacement Activity',
      category: 'Culture',
      date: '2026-12-01',
      status: 'Confirmed'
    })
  });
  assert.equal(replaceResponse.status, 200);
  assert.equal((await replaceResponse.json()).data.title, 'Replacement Activity');

  const patchResponse = await fetch(`${baseUrl}/api/activities/${created.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Completed' })
  });
  assert.equal(patchResponse.status, 200);
  const patched = (await patchResponse.json()).data;
  assert.equal(patched.status, 'Completed');
  assert.equal(patched.title, 'Replacement Activity');

  const malformedJsonResponse = await fetch(`${baseUrl}/api/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"title":'
  });
  assert.equal(malformedJsonResponse.status, 400);
  assert.equal(
    (await malformedJsonResponse.json()).message,
    'Invalid JSON request body.'
  );

  const deleteResponse = await fetch(`${baseUrl}/api/activities/${created.id}`, {
    method: 'DELETE'
  });
  assert.equal(deleteResponse.status, 200);

  const missingResponse = await fetch(`${baseUrl}/api/activities/${created.id}`);
  assert.equal(missingResponse.status, 404);

  const unknownRouteResponse = await fetch(`${baseUrl}/api/unknown`);
  assert.equal(unknownRouteResponse.status, 404);
});
