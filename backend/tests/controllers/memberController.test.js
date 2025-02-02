const request = require('supertest');
const app = require('../../src/app');
const testHelper = require('../testHelper');

let connection;
let adminToken;
let memberToken;
let testMemberId;

beforeAll(async () => {
  connection = await testHelper.getTestConnection();
  adminToken = testHelper.generateTestToken('admin');
  memberToken = testHelper.generateTestToken('member');
});

beforeEach(async () => {
  await testHelper.clearDatabase(connection);
  testMemberId = await testHelper.createTestUser(connection);
});

afterAll(async () => {
  await connection.end();
});

describe('Member Controller', () => {
  describe('GET /api/members', () => {
    it('should return all members when admin', async () => {
      const response = await request(app)
        .get('/api/members')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].email).toBe('test@example.com');
    });

    it('should return 403 when member tries to access', async () => {
      const response = await request(app)
        .get('/api/members')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/members/:id/checkin', () => {
    it('should update member check-in time', async () => {
      const response = await request(app)
        .put(`/api/members/${testMemberId}/checkin`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Check-in recorded successfully');

      // Verify database update
      const [members] = await connection.query(
        'SELECT last_check_in FROM users WHERE id = ?',
        [testMemberId]
      );
      expect(members[0].last_check_in).not.toBeNull();
    });
  });

  describe('GET /api/members/stats', () => {
    it('should return member statistics for admin', async () => {
      const response = await request(app)
        .get('/api/members/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total_members');
      expect(response.body).toHaveProperty('active_subscriptions');
    });
  });
}); 