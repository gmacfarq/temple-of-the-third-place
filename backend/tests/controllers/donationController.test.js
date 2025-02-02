const request = require('supertest');
const { app } = require('../../src/app');
const testHelper = require('../testHelper');

describe('Donation Controller', () => {
  let server;
  let connection;
  let adminToken;
  let memberToken;
  let testMemberId;
  let testSacramentId;

  beforeAll(async () => {
    connection = await testHelper.getTestConnection();
    server = await testHelper.startServer(app);
    adminToken = testHelper.generateTestToken('admin');
    memberToken = testHelper.generateTestToken('member');
  });

  beforeEach(async () => {
    await testHelper.clearDatabase(connection);
    testMemberId = await testHelper.createTestUser(connection);

    // Create test sacrament
    const [sacrament] = await connection.query(
      'INSERT INTO sacraments (name, type, description) VALUES (?, ?, ?)',
      ['Test Sacrament', 'Test Type', 'Test Description']
    );
    testSacramentId = sacrament.insertId;
  });

  afterEach(async () => {
    await testHelper.clearDatabase(connection);
  });

  afterAll(async () => {
    await testHelper.cleanup(server, connection);
  });

  describe('POST /api/donations', () => {
    it('should create a new donation', async () => {
      const donationData = {
        memberId: testMemberId,
        sacramentId: testSacramentId,
        amount: 50.00,
        notes: 'Test donation'
      };

      const response = await request(app)
        .post('/api/donations')
        .set('Authorization', `Bearer ${memberToken}`)
        .send(donationData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Donation recorded successfully');
      expect(response.body).toHaveProperty('donationId');
    });

    it('should return 400 for invalid donation data', async () => {
      const response = await request(app)
        .post('/api/donations')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ amount: -50 }); // Invalid amount

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/donations', () => {
    beforeEach(async () => {
      // Create test donation
      await connection.query(
        'INSERT INTO donations (member_id, sacrament_id, amount, notes) VALUES (?, ?, ?, ?)',
        [testMemberId, testSacramentId, 100.00, 'Test donation']
      );
    });

    it('should return all donations for admin', async () => {
      const response = await request(app)
        .get('/api/donations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].amount).toBe('100.00');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/donations')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/donations/member/:memberId', () => {
    it('should return member\'s donation history', async () => {
      // Create multiple donations
      await connection.query(
        'INSERT INTO donations (member_id, sacrament_id, amount) VALUES (?, ?, ?), (?, ?, ?)',
        [testMemberId, testSacramentId, 50.00, testMemberId, testSacramentId, 75.00]
      );

      const response = await request(app)
        .get(`/api/donations/member/${testMemberId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/donations/stats', () => {
    it('should return donation statistics for admin', async () => {
      // Create test donations
      await connection.query(
        'INSERT INTO donations (member_id, sacrament_id, amount) VALUES (?, ?, ?), (?, ?, ?)',
        [testMemberId, testSacramentId, 50.00, testMemberId, testSacramentId, 75.00]
      );

      const response = await request(app)
        .get('/api/donations/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total_donations');
      expect(response.body).toHaveProperty('total_amount');
      expect(response.body).toHaveProperty('average_amount');
    });
  });
});