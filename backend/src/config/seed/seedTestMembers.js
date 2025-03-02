const pool = require('../database');
const bcrypt = require('bcryptjs');

const testMembers = [
  { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
  { firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com' },
  { firstName: 'Alice', lastName: 'Williams', email: 'alice@example.com' },
  { firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com' }
];

async function seedTestMembers() {
  const connection = await pool.getConnection();
  try {
    const defaultPassword = await bcrypt.hash('DefaultPass123!', 10);

    for (const member of testMembers) {
      // Insert member with proper password hash
      await connection.query(`
        INSERT INTO users (first_name, last_name, email, password_hash, role)
        VALUES (?, ?, ?, ?, 'member')
        ON DUPLICATE KEY UPDATE email = email
      `, [member.firstName, member.lastName, member.email, defaultPassword]);

      // Get the member's ID for check-ins
      const [memberResult] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [member.email]
      );
      const memberId = memberResult[0].id;

      // Create some check-ins for this member
      await connection.query(`
        INSERT INTO check_ins (user_id, timestamp)
        VALUES
          (?, NOW()),
          (?, DATE_SUB(NOW(), INTERVAL 1 DAY))
      `, [memberId, memberId]);
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