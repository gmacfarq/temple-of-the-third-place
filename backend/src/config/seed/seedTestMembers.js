const pool = require('../database');
const bcrypt = require('bcryptjs');

const testMembers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    birthDate: '1990-01-15',
    phoneNumber: '555-123-4567',
    membershipType: 'Starter',
    membershipStatus: 'Active'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    birthDate: '1985-05-20',
    phoneNumber: '555-987-6543',
    membershipType: 'Lovely',
    membershipStatus: 'Active'
  },
  {
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
    birthDate: '2005-11-10', // Under 21
    phoneNumber: '555-555-5555',
    membershipType: 'Exploratory',
    membershipStatus: 'Pending'
  },
  {
    firstName: 'Alice',
    lastName: 'Williams',
    email: 'alice@example.com',
    birthDate: '1992-08-30',
    phoneNumber: null,
    membershipType: 'Starter',
    membershipStatus: 'Active'
  },
  {
    firstName: 'Charlie',
    lastName: 'Brown',
    email: 'charlie@example.com',
    birthDate: '1988-03-25',
    phoneNumber: '555-111-2222',
    membershipType: 'Exploratory',
    membershipStatus: 'Expired'
  }
];

async function seedTestMembers() {
  const connection = await pool.getConnection();
  try {
    const defaultPassword = await bcrypt.hash('DefaultPass123!', 10);

    // Calculate expiration date (1 year from now)
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    const formattedExpirationDate = expirationDate.toISOString().split('T')[0];

    for (const member of testMembers) {
      // Insert member with proper password hash and new fields
      await connection.query(`
        INSERT INTO users (
          first_name,
          last_name,
          email,
          password_hash,
          role,
          birth_date,
          phone_number,
          membership_type,
          membership_status,
          membership_expiration
        )
        VALUES (?, ?, ?, ?, 'member', ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE email = email
      `, [
        member.firstName,
        member.lastName,
        member.email,
        defaultPassword,
        member.birthDate,
        member.phoneNumber,
        member.membershipType,
        member.membershipStatus,
        member.membershipStatus === 'Active' ? formattedExpirationDate : null
      ]);

    }

    console.log('Test members and check-ins seeded successfully');
  } catch (error) {
    console.error('Error seeding test members:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = seedTestMembers;