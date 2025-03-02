-- First drop tables in correct order to avoid foreign key conflicts
DROP TABLE IF EXISTS donation_items;
DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS inventory_audits;
DROP TABLE IF EXISTS inventory_transfers;
DROP TABLE IF EXISTS check_ins;
DROP TABLE IF EXISTS sacraments;
DROP TABLE IF EXISTS users;

-- Then create tables in correct order
CREATE TABLE users (
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

-- Sacraments
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

-- Check-ins (simplified)
CREATE TABLE IF NOT EXISTS check_ins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Donations
CREATE TABLE donations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES users(id)
);

-- Donation Items
CREATE TABLE donation_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    donation_id INT NOT NULL,
    sacrament_id INT NOT NULL,
    quantity INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (donation_id) REFERENCES donations(id),
    FOREIGN KEY (sacrament_id) REFERENCES sacraments(id)
);

-- Inventory Transfers
CREATE TABLE IF NOT EXISTS inventory_transfers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sacrament_id INT,
    quantity INT NOT NULL,
    type ENUM('in', 'out') NOT NULL,
    notes TEXT,
    recorded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sacrament_id) REFERENCES sacraments(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    INDEX idx_sacrament (sacrament_id)
);

-- Inventory Audits
CREATE TABLE IF NOT EXISTS inventory_audits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sacrament_id INT,
    actual_quantity INT NOT NULL,
    notes TEXT,
    audited_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sacrament_id) REFERENCES sacraments(id) ON DELETE CASCADE,
    FOREIGN KEY (audited_by) REFERENCES users(id),
    INDEX idx_sacrament (sacrament_id)
);

-- INSERT INTO users (first_name, last_name, email, phone, role) VALUES
-- ('John', 'Doe', 'john@example.com', '555-0101', 'member'),
-- ('Jane', 'Smith', 'jane@example.com', '555-0102', 'member'),
-- ('Bob', 'Johnson', 'bob@example.com', '555-0103', 'member'),
-- ('Alice', 'Williams', 'alice@example.com', '555-0104', 'member'),
-- ('Charlie', 'Brown', 'charlie@example.com', '555-0105', 'member');

-- Remove the SOURCE command, we'll handle seeding in JavaScript