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
    membershipStatus: 'Active',
    doctrineAgreed: true,
    membershipAgreed: true,
    medicalAgreed: true,
    agreementTimestamp: '2023-01-01 12:00:00'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    birthDate: '1985-05-20',
    phoneNumber: '555-987-6543',
    membershipType: 'Lovely',
    membershipStatus: 'Active',
    doctrineAgreed: true,
    membershipAgreed: true,
    medicalAgreed: true,
    agreementTimestamp: '2023-02-15 14:30:00'
  },
  {
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
    birthDate: '2005-11-10', // Under 21
    phoneNumber: '555-555-5555',
    membershipType: 'Exploratory',
    membershipStatus: 'Pending',
    doctrineAgreed: true,
    membershipAgreed: true,
    medicalAgreed: true,
    agreementTimestamp: '2023-03-20 09:15:00'
  },
  {
    firstName: 'Alice',
    lastName: 'Williams',
    email: 'alice@example.com',
    birthDate: '1992-08-30',
    phoneNumber: null,
    membershipType: 'Starter',
    membershipStatus: 'Active',
    doctrineAgreed: true,
    membershipAgreed: true,
    medicalAgreed: true,
    agreementTimestamp: '2023-04-10 16:45:00'
  },
  {
    firstName: 'Charlie',
    lastName: 'Brown',
    email: 'charlie@example.com',
    birthDate: '1988-03-25',
    phoneNumber: '555-111-2222',
    membershipType: 'Exploratory',
    membershipStatus: 'Expired',
    doctrineAgreed: true,
    membershipAgreed: true,
    medicalAgreed: true,
    agreementTimestamp: '2023-05-05 11:30:00'
  }
];

async function seedTestMembers() {
  try {
    const connection = await pool.getConnection();

    // Check if members already exist
    const [existingMembers] = await connection.query('SELECT COUNT(*) as count FROM users WHERE role = "member"');

    if (existingMembers[0].count > 0) {
      console.log('Test members already exist, skipping seed');
      connection.release();
      return;
    }

    // Check if the agreement columns exist in the users table
    const [columns] = await connection.query('SHOW COLUMNS FROM users');
    const columnNames = columns.map(col => col.Field);

    const hasAgreementColumns =
      columnNames.includes('doctrine_agreed') &&
      columnNames.includes('membership_agreed') &&
      columnNames.includes('medical_agreed') &&
      columnNames.includes('agreement_timestamp');

    // Default password for all test members
    const defaultPassword = await bcrypt.hash('password123', 10);

    // Calculate expiration date (1 year from now)
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    const formattedExpirationDate = expirationDate.toISOString().split('T')[0];

    for (const member of testMembers) {
      if (hasAgreementColumns) {
        // Insert member with agreement fields
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
            membership_expiration,
            doctrine_agreed,
            membership_agreed,
            medical_agreed,
            agreement_timestamp
          )
          VALUES (?, ?, ?, ?, 'member', ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          member.membershipStatus === 'Active' ? formattedExpirationDate : null,
          member.doctrineAgreed ? 1 : 0,
          member.membershipAgreed ? 1 : 0,
          member.medicalAgreed ? 1 : 0,
          member.agreementTimestamp
        ]);
      } else {
        // Insert member without agreement fields
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
    }

    console.log('Test members seeded successfully');
    connection.release();
  } catch (error) {
    console.error('Error seeding test members:', error);
    throw error;
  }
}

module.exports = seedTestMembers;