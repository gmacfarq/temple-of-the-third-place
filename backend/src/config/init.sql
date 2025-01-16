-- Initialize core schema for Temple of the Third Place

-- Drop tables if they exist
DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS check_ins;
DROP TABLE IF EXISTS sacraments;
DROP TABLE IF EXISTS users;

-- Users and Authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('member', 'advisor', 'admin') DEFAULT 'member',
    subscription_status ENUM('none', 'active', 'expired') DEFAULT 'none',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Sacraments
CREATE TABLE sacraments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    num_storage INT DEFAULT 0,
    num_active INT DEFAULT 0,
    suggested_donation DECIMAL(10,2),
    batch_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_batch (batch_id)
);

-- Check-ins (simplified)
CREATE TABLE check_ins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    status ENUM('waiting', 'in_progress', 'completed') DEFAULT 'waiting',
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status)
);

-- Donations (simplified to sacrament-only)
CREATE TABLE donations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    sacrament_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sacrament_id) REFERENCES sacraments(id) ON DELETE CASCADE
);

-- Insert initial admin user (password: admin123 - change this in production!)
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES (
    'admin@thirdplace.temple',
    '$2b$10$vCcQBngWM8odVMCjqOZnYuMBuoMnEBZBEPPZuKTlIrIw9JzLnrG62',
    'Temple',
    'Admin',
    'admin'
);