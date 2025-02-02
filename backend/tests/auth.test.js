const request = require('supertest');
const { app } = require('../src/app');
const testHelper = require('./testHelper');
const config = require('../src/config/test.config');
const jwt = require('jsonwebtoken');

describe('Authentication', () => {
  let server;
  let connection;
  let testUserId;

  beforeAll(async () => {
    connection = await testHelper.getTestConnection();
    server = await testHelper.startServer(app);
  });

  beforeEach(async () => {
    await testHelper.clearDatabase(connection);
    testUserId = await testHelper.createTestUser(connection, 'admin');
  });

  afterEach(async () => {
    await testHelper.clearDatabase(connection);
  });

  afterAll(async () => {
    await testHelper.cleanup(server, connection);
  });

  it('should allow access with valid token', async () => {
    // Create token with specific payload
    const payload = {
      userId: testUserId,
      email: 'test@example.com',
      role: 'admin'
    };

    const token = jwt.sign(payload, config.jwt.secret);

    console.log('Test Configuration:', {
      secret: config.jwt.secret,
      token: token,
      payload: payload
    });

    // Verify token can be decoded
    const decoded = jwt.verify(token, config.jwt.secret);
    console.log('Decoded token:', decoded);

    const response = await request(app)
      .get('/api/members')
      .set('Authorization', `Bearer ${token}`);

    console.log('Response:', {
      status: response.status,
      body: response.body
    });

    expect(response.status).not.toBe(401);
  });

  it('should reject invalid tokens', async () => {
    const response = await request(app)
      .get('/api/members')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });
});