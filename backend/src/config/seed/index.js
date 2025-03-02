const seedAdmin = require('./seedAdmin');
const seedSacraments = require('./seedSacraments');
const seedTestMembers = require('./seedTestMembers');
const seedDonations = require('./seedDonations');

async function seedDatabase(isDev = false) {
  try {
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