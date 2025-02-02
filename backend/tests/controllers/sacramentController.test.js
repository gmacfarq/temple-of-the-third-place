const request = require('supertest');
const { app } = require('../../src/app');
const testHelper = require('../testHelper');

describe('Sacrament Controller', () => {
  let server;
  let connection;
  let adminToken;
  let memberToken;
  let testSacramentId;

  beforeAll(async () => {
    connection = await testHelper.getTestConnection();
    server = await testHelper.startServer(app);
    adminToken = testHelper.generateTestToken('admin');
    memberToken = testHelper.generateTestToken('member');
  });

  beforeEach(async () => {
    await testHelper.clearDatabase(connection);
    // Create test sacrament
    const [sacrament] = await connection.query(
      'INSERT INTO sacraments (name, type, description, num_storage, num_active) VALUES (?, ?, ?, ?, ?)',
      ['Test Sacrament', 'Test Type', 'Test Description', 100, 20]
    );
    testSacramentId = sacrament.insertId;
  });

  afterEach(async () => {
    await testHelper.clearDatabase(connection);
  });

  afterAll(async () => {
    await testHelper.cleanup(server, connection);
  });

  describe('GET /api/sacraments', () => {
    it('should return all sacraments', async () => {
      const response = await request(app)
        .get('/api/sacraments')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test Sacrament');
    });
  });

  describe('GET /api/sacraments/:id', () => {
    it('should return sacrament details', async () => {
      const response = await request(app)
        .get(`/api/sacraments/${testSacramentId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Test Sacrament');
      expect(response.body.type).toBe('Test Type');
    });

    it('should return 404 for non-existent sacrament', async () => {
      const response = await request(app)
        .get('/api/sacraments/999')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/sacraments', () => {
    it('should create a new sacrament when admin', async () => {
      const sacramentData = {
        name: 'New Sacrament',
        type: 'New Type',
        description: 'New Description',
        numStorage: 50,
        numActive: 10,
        suggestedDonation: 25.00
      };

      const response = await request(app)
        .post('/api/sacraments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sacramentData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Sacrament created successfully');
      expect(response.body).toHaveProperty('sacramentId');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/sacraments')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({});

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/sacraments/:id', () => {
    it('should update sacrament when admin', async () => {
      const updateData = {
        name: 'Updated Sacrament',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/sacraments/${testSacramentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Sacrament updated successfully');

      // Verify update
      const [sacrament] = await connection.query(
        'SELECT * FROM sacraments WHERE id = ?',
        [testSacramentId]
      );
      expect(sacrament[0].name).toBe('Updated Sacrament');
      expect(sacrament[0].description).toBe('Updated Description');
    });
  });

  describe('GET /api/sacraments/low-inventory', () => {
    beforeEach(async () => {
      // Create low inventory sacrament
      await connection.query(
        'INSERT INTO sacraments (name, type, num_storage, num_active) VALUES (?, ?, ?, ?)',
        ['Low Stock Item', 'Test Type', 5, 50]
      );
    });

    it('should return low inventory sacraments', async () => {
      const response = await request(app)
        .get('/api/sacraments/low-inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].name).toBe('Low Stock Item');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/sacraments/low-inventory')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/sacraments/:id', () => {
    it('should delete sacrament when admin', async () => {
      const response = await request(app)
        .delete(`/api/sacraments/${testSacramentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Sacrament deleted successfully');

      // Verify deletion
      const [sacraments] = await connection.query(
        'SELECT * FROM sacraments WHERE id = ?',
        [testSacramentId]
      );
      expect(sacraments).toHaveLength(0);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/sacraments/${testSacramentId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });
});