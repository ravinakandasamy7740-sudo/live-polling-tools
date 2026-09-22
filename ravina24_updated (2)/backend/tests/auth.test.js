import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../server.js';

test('signup with valid payload creates a user', async () => {
  const response = await request(app)
    .post('/api/auth/signup')
    .send({
      name: 'Test User',
      email: 'test.user@example.com',
      password: 'Password123!'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.user);
});

test('login with valid credentials returns a token', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test.user@example.com',
      password: 'Password123!'
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.token);
});
