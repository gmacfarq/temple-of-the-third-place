const seedAdmin = require('./seedAdmin');
const seedSacraments = require('./seedSacraments');
const seedTestMembers = require('./seedTestMembers');
const seedDonations = require('./seedDonations');
const pool = require('../database');

async function seedDatabase(isDev = false) {
  try {
    console.log('Checking if database needs seeding...');

    // Check if database is already seeded
    const connection = await pool.getConnection();
    const [adminCheck] = await connection.query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
    const hasAdmin = adminCheck[0].count > 0;

    if (hasAdmin) {
      console.log('Database already has admin user, skipping initial seed');
      connection.release();
      return;
    }

    connection.release();
    console.log('Starting database seeding...');

    // Always seed admin
    await seedAdmin();

    // Only seed test data in development
    if (isDev) {
      await seedSacraments();
      await seedTestMembers();
      await seedDonations();
      console.log('Development data seeded successfully');
    }

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

module.exports = seedDatabase;