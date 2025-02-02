const request = require('supertest');
const { app } = require('../../src/app');
const testHelper = require('../testHelper');

describe('Member Controller', () => {
  let server;
  let connection;
  let adminToken;
  let memberToken;
  let testMemberId;

  beforeAll(async () => {
    connection = await testHelper.getTestConnection();
    server = await testHelper.startServer(app);
    adminToken = testHelper.generateTestToken('admin');
    memberToken = testHelper.generateTestToken('member');
  });

  beforeEach(async () => {
    await testHelper.clearDatabase(connection);
    testMemberId = await testHelper.createTestUser(connection);
  });

  afterEach(async () => {
    await testHelper.clearDatabase(connection);
  });

  afterAll(async () => {
    await testHelper.cleanup(server, connection);
  });

  describe('GET /api/members', () => {
    it('should return all members when admin', async () => {
      const response = await request(app)
        .get('/api/members')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].email).toBe('test@example.com');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/members')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/members/:id', () => {
    it('should return member details', async () => {
      const response = await request(app)
        .get(`/api/members/${testMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');
    });

    it('should return 404 for non-existent member', async () => {
      const response = await request(app)
        .get('/api/members/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/members/:id', () => {
    it('should update member details', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/api/members/${testMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Member updated successfully');

      // Verify update
      const [member] = await connection.query(
        'SELECT * FROM users WHERE id = ?',
        [testMemberId]
      );
      expect(member[0].first_name).toBe('Updated');
      expect(member[0].email).toBe('updated@example.com');
    });
  });

  describe('DELETE /api/members/:id', () => {
    it('should delete member', async () => {
      const response = await request(app)
        .delete(`/api/members/${testMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Member deleted successfully');

      // Verify deletion
      const [members] = await connection.query(
        'SELECT * FROM users WHERE id = ?',
        [testMemberId]
      );
      expect(members).toHaveLength(0);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/members/${testMemberId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });
});