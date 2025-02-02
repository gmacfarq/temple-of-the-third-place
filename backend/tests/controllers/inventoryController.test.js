const request = require('supertest');
const { app } = require('../../src/app');
const testHelper = require('../testHelper');

describe('Inventory Controller', () => {
  let server;
  let connection;
  let adminToken;
  let advisorToken;
  let memberToken;
  let testSacramentId;

  beforeAll(async () => {
    connection = await testHelper.getTestConnection();
    server = await testHelper.startServer(app);
    adminToken = testHelper.generateTestToken('admin');
    advisorToken = testHelper.generateTestToken('advisor');
    memberToken = testHelper.generateTestToken('member');
  });

  beforeEach(async () => {
    await testHelper.clearDatabase(connection);

    // Create test sacrament
    const [sacrament] = await connection.query(
      'INSERT INTO sacraments (name, type, num_storage, num_active) VALUES (?, ?, ?, ?)',
      ['Test Sacrament', 'Test Type', 100, 20]
    );
    testSacramentId = sacrament.insertId;
  });

  afterEach(async () => {
    await testHelper.clearDatabase(connection);
  });

  afterAll(async () => {
    await testHelper.cleanup(server, connection);
  });

  describe('POST /api/inventory/transfer', () => {
    it('should record inventory transfer in', async () => {
      const transferData = {
        sacramentId: testSacramentId,
        quantity: 50,
        type: 'in',
        notes: 'New stock arrival'
      };

      const response = await request(app)
        .post('/api/inventory/transfer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(transferData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Transfer recorded successfully');

      // Verify storage quantity updated
      const [sacrament] = await connection.query(
        'SELECT num_storage FROM sacraments WHERE id = ?',
        [testSacramentId]
      );
      expect(sacrament[0].num_storage).toBe(150); // 100 + 50
    });

    it('should record inventory transfer out', async () => {
      const transferData = {
        sacramentId: testSacramentId,
        quantity: 30,
        type: 'out',
        notes: 'Distribution'
      };

      const response = await request(app)
        .post('/api/inventory/transfer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(transferData);

      expect(response.status).toBe(201);

      // Verify storage and active quantities updated
      const [sacrament] = await connection.query(
        'SELECT num_storage, num_active FROM sacraments WHERE id = ?',
        [testSacramentId]
      );
      expect(sacrament[0].num_storage).toBe(70); // 100 - 30
      expect(sacrament[0].num_active).toBe(50); // 20 + 30
    });
  });

  describe('GET /api/inventory/history', () => {
    beforeEach(async () => {
      // Create test transfer
      await connection.query(
        'INSERT INTO inventory_transfers (sacrament_id, quantity, type, notes) VALUES (?, ?, ?, ?)',
        [testSacramentId, 50, 'in', 'Test transfer']
      );
    });

    it('should return inventory history for admin', async () => {
      const response = await request(app)
        .get('/api/inventory/history')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].quantity).toBe(50);
    });

    it('should return 403 for regular members', async () => {
      const response = await request(app)
        .get('/api/inventory/history')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/inventory/alerts', () => {
    beforeEach(async () => {
      // Create low inventory sacrament
      await connection.query(
        'INSERT INTO sacraments (name, type, num_storage, num_active) VALUES (?, ?, ?, ?)',
        ['Low Stock Item', 'Test Type', 5, 50]
      );
    });

    it('should return low inventory alerts', async () => {
      const response = await request(app)
        .get('/api/inventory/alerts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].name).toBe('Low Stock Item');
    });
  });

  describe('POST /api/inventory/audit', () => {
    it('should record inventory audit', async () => {
      const auditData = {
        sacramentId: testSacramentId,
        actualQuantity: 95,
        notes: 'Regular audit check'
      };

      const response = await request(app)
        .post('/api/inventory/audit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(auditData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Audit recorded successfully');

      // Verify storage quantity updated
      const [sacrament] = await connection.query(
        'SELECT num_storage FROM sacraments WHERE id = ?',
        [testSacramentId]
      );
      expect(sacrament[0].num_storage).toBe(95);
    });

    it('should only allow admins to perform audits', async () => {
      const response = await request(app)
        .post('/api/inventory/audit')
        .set('Authorization', `Bearer ${advisorToken}`)
        .send({});

      expect(response.status).toBe(403);
    });
  });
});