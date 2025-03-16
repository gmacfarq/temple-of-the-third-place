const pool = require('../database');

async function addAgreementColumns() {
  const connection = await pool.getConnection();
  try {
    console.log('Checking for agreement columns...');

    // Check if columns already exist
    const [columns] = await connection.query('SHOW COLUMNS FROM users');
    const columnNames = columns.map(col => col.Field);

    if (!columnNames.includes('doctrine_agreed')) {
      console.log('Adding doctrine_agreed column...');
      await connection.query('ALTER TABLE users ADD COLUMN doctrine_agreed BOOLEAN DEFAULT FALSE');
    }

    if (!columnNames.includes('membership_agreed')) {
      console.log('Adding membership_agreed column...');
      await connection.query('ALTER TABLE users ADD COLUMN membership_agreed BOOLEAN DEFAULT FALSE');
    }

    if (!columnNames.includes('medical_agreed')) {
      console.log('Adding medical_agreed column...');
      await connection.query('ALTER TABLE users ADD COLUMN medical_agreed BOOLEAN DEFAULT FALSE');
    }

    if (!columnNames.includes('agreement_timestamp')) {
      console.log('Adding agreement_timestamp column...');
      await connection.query('ALTER TABLE users ADD COLUMN agreement_timestamp DATETIME');
    }

    console.log('Agreement columns added successfully');
  } catch (error) {
    console.error('Error adding agreement columns:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = addAgreementColumns;