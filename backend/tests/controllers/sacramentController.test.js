const request = require('supertest');
const app = require('../../src/app');
const testHelper = require('../testHelper');

let connection;
let adminToken;
let memberToken;

beforeAll(async () => {
  connection = await testHelper.getTestConnection();
  adminToken = testHelper.generateTestToken('admin');
  memberToken = testHelper.generateTestToken('member');
});

beforeEach(async () => {
  await testHelper.clearDatabase(connection);
});

afterAll(async () => {
  await connection.end();
});

describe('Sacrament Controller', () => {
  describe('GET /api/sacraments', () => {
    it('should return all sacraments', async () => {
      // Create test sacrament
      await connection.query(
        'INSERT INTO sacraments (name, type, description, num_storage) VALUES (?, ?, ?, ?)',
        ['Test Sacrament', 'Test Type', 'Test Description', 10]
      );

      const response = await request(app)
        .get('/api/sacraments')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test Sacrament');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get('/api/sacraments');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/sacraments', () => {
    it('should create a new sacrament when admin', async () => {
      const sacramentData = {
        name: 'New Sacrament',
        type: 'New Type',
        description: 'New Description',
        numStorage: 20,
        suggestedDonation: 10.00
      };

      const response = await request(app)
        .post('/api/sacraments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sacramentData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Sacrament created successfully');
    });

    it('should return 403 when member tries to create', async () => {
      const response = await request(app)
        .post('/api/sacraments')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({});

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/sacraments/low-inventory', () => {
    it('should return low inventory items', async () => {
      // Create test sacraments
      await connection.query(
        'INSERT INTO sacraments (name, type, num_storage) VALUES (?, ?, ?), (?, ?, ?)',
        ['Low Item', 'Type1', 5, 'Normal Item', 'Type2', 20]
      );

      const response = await request(app)
        .get('/api/sacraments/low-inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Low Item');
    });
  });
}); 