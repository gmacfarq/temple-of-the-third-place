const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function initTestDatabase() {
  try {
    // Read database configuration from .env.test
    require('dotenv').config({ path: '.env.test' });

    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.TEST_DB_NAME,
      multipleStatements: true // Enable running multiple SQL statements
    });

    console.log('Connected to database');

    // Create all necessary tables
    const createTables = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role ENUM('member', 'advisor', 'admin') DEFAULT 'member',
        subscription_status ENUM('none', 'active', 'expired') DEFAULT 'none',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_check_in TIMESTAMP NULL,
        INDEX idx_email (email)
      );
      
      CREATE TABLE IF NOT EXISTS sacraments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        strain VARCHAR(100),
        description TEXT,
        num_storage INT DEFAULT 0,
        num_active INT DEFAULT 0,
        suggested_donation DECIMAL(10,2),
        batch_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_batch (batch_id)
      );


      CREATE TABLE IF NOT EXISTS donations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        member_id INT,
        sacrament_id INT,
        amount DECIMAL(10,2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES users(id),
        FOREIGN KEY (sacrament_id) REFERENCES sacraments(id),
        INDEX idx_member (member_id),
        INDEX idx_sacrament (sacrament_id)
      );

      CREATE TABLE IF NOT EXISTS inventory_transfers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sacrament_id INT,
        quantity INT NOT NULL,
        type ENUM('in', 'out') NOT NULL,
        notes TEXT,
        recorded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sacrament_id) REFERENCES sacraments(id),
        FOREIGN KEY (recorded_by) REFERENCES users(id),
        INDEX idx_sacrament (sacrament_id)
      );

      CREATE TABLE IF NOT EXISTS inventory_audits (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sacrament_id INT,
        actual_quantity INT NOT NULL,
        notes TEXT,
        audited_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sacrament_id) REFERENCES sacraments(id),
        FOREIGN KEY (audited_by) REFERENCES users(id),
        INDEX idx_sacrament (sacrament_id)
      );
    `;

    // Execute table creation
    await connection.query(createTables);
    console.log('Tables created successfully');

    await connection.end();
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initTestDatabase();