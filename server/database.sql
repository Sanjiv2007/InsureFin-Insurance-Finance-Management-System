-- =======================================================
-- INSURANCE AND FINANCE MANAGEMENT SYSTEM
-- MySQL Database Schema
-- =======================================================

CREATE DATABASE IF NOT EXISTS insurance_finance;
USE insurance_finance;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STAFF', 'CLIENT') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    date_of_birth DATE,
    address TEXT,
    kyc_status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. STAFF TABLE
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. POLICIES TABLE
CREATE TABLE IF NOT EXISTS policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_number VARCHAR(50) NOT NULL UNIQUE,
    client_id INT NOT NULL,
    policy_type VARCHAR(100) NOT NULL,
    policy_name VARCHAR(150) NOT NULL,
    sum_insured DECIMAL(12, 2) NOT NULL,
    premium_amount DECIMAL(10, 2) NOT NULL,
    premium_frequency ENUM('Monthly', 'Quarterly', 'Half-Yearly', 'Annually') DEFAULT 'Monthly',
    start_date DATE,
    end_date DATE,
    status ENUM('Pending', 'Active', 'Expired', 'Rejected', 'Cancelled') DEFAULT 'Pending',
    assigned_staff INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_staff) REFERENCES staff(id) ON DELETE SET NULL
);

-- 5. POLICY PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS policy_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    client_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Paid',
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 6. CLAIMS TABLE
CREATE TABLE IF NOT EXISTS claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    claim_number VARCHAR(50) NOT NULL UNIQUE,
    policy_id INT NOT NULL,
    client_id INT NOT NULL,
    claim_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    claim_amount DECIMAL(12, 2) NOT NULL,
    incident_date DATE NOT NULL,
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Submitted', 'Under Review', 'Approved', 'Rejected', 'Settled') DEFAULT 'Submitted',
    staff_remark TEXT NULL,
    approved_amount DECIMAL(12, 2) DEFAULT 0.00,
    processed_by INT NULL,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES staff(id) ON DELETE SET NULL
);

-- 7. CLAIM DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS claim_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    claim_id INT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE
);

-- 8. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_type ENUM('Premium', 'Claim Payout', 'Refund') NOT NULL,
    reference_id VARCHAR(100) NOT NULL,
    client_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
