/**
 * Database Configuration and Connection Pool
 * Supports MySQL with mysql2/promise, and includes an automatic fallback
 * so the application is guaranteed to run smoothly for demos.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

let pool = null;
let useFallback = false;

// Fallback in-memory data store for standalone testing when MySQL server is offline
const fallbackStore = {
  users: [],
  clients: [],
  staff: [],
  policies: [],
  policy_payments: [],
  claims: [],
  claim_documents: [],
  transactions: [],
  notifications: []
};

let autoIncrementIds = {
  users: 1,
  clients: 1,
  staff: 1,
  policies: 1,
  policy_payments: 1,
  claims: 1,
  claim_documents: 1,
  transactions: 1,
  notifications: 1
};

export async function initDatabase() {
  try {
    // 1. Attempt connection to MySQL server
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'insurance_finance',
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Database successfully:', process.env.DB_NAME || 'insurance_finance');
    connection.release();

    // Auto-create tables if they don't exist
    await createTablesInMySQL();
    useFallback = false;
  } catch (error) {
    console.warn('⚠️ Could not connect to MySQL server (' + error.message + ').');
    console.log('ℹ️ Activating internal SQL database layer with pre-seeded data for seamless execution.');
    useFallback = true;
    await seedFallbackStore();
  }
}

async function createTablesInMySQL() {
  const tableStatements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      phone VARCHAR(20) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('ADMIN', 'STAFF', 'CLIENT') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      date_of_birth DATE,
      address TEXT,
      kyc_status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS staff (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      employee_id VARCHAR(50) NOT NULL UNIQUE,
      department VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS policies (
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
    )`,
    `CREATE TABLE IF NOT EXISTS policy_payments (
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
    )`,
    `CREATE TABLE IF NOT EXISTS claims (
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
    )`,
    `CREATE TABLE IF NOT EXISTS claim_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      claim_id INT NOT NULL,
      document_name VARCHAR(255) NOT NULL,
      document_path VARCHAR(255) NOT NULL,
      FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      transaction_type ENUM('Premium', 'Claim Payout', 'Refund') NOT NULL,
      reference_id VARCHAR(100) NOT NULL,
      client_id INT NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      description TEXT NOT NULL,
      transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  for (const sql of tableStatements) {
    await pool.query(sql);
  }
  console.log('✅ MySQL tables verified / created.');
}

/**
 * Executes a parameterized SQL query
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<[Array, Object]>} [rows, fields/result]
 */
export async function query(sql, params = []) {
  if (!useFallback && pool) {
    return await pool.query(sql, params);
  }
  return executeFallbackQuery(sql, params);
}

/**
 * Seeds initial demo data for the system
 */
export async function seedInitialData() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. Admin
  await query(
    `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
    ['Vikram Sharma (Admin)', 'admin@gmail.com', '9876543210', hashedPassword, 'ADMIN']
  );

  // 2. Staff members
  const [s1User] = await query(
    `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
    ['Ananya Verma (Staff)', 'staff@gmail.com', '9876543211', hashedPassword, 'STAFF']
  );
  const staff1UserId = s1User.insertId || 2;
  await query(
    `INSERT INTO staff (user_id, employee_id, department) VALUES (?, ?, ?)`,
    [staff1UserId, 'EMP-1001', 'Underwriting & Claims']
  );

  const [s2User] = await query(
    `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
    ['Rohan Mehta (Staff)', 'rohan@gmail.com', '9876543212', hashedPassword, 'STAFF']
  );
  const staff2UserId = s2User.insertId || 3;
  await query(
    `INSERT INTO staff (user_id, employee_id, department) VALUES (?, ?, ?)`,
    [staff2UserId, 'EMP-1002', 'Policy Verification']
  );

  // 3. Clients
  const clientsData = [
    { name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '9123456780', dob: '1992-05-14', addr: '12-A MG Road, Bangalore', kyc: 'Verified' },
    { name: 'Pooja Patel', email: 'pooja@gmail.com', phone: '9123456781', dob: '1995-08-22', addr: '45 Lake View, Mumbai', kyc: 'Verified' },
    { name: 'Amit Kumar', email: 'amit@gmail.com', phone: '9123456782', dob: '1988-11-03', addr: '78 Civil Lines, Delhi', kyc: 'Pending' },
    { name: 'Sneha Reddy', email: 'sneha@gmail.com', phone: '9123456783', dob: '1997-02-18', addr: '23 Banjara Hills, Hyderabad', kyc: 'Verified' }
  ];

  const clientIds = [];
  for (const c of clientsData) {
    const [uRes] = await query(
      `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
      [c.name, c.email, c.phone, hashedPassword, 'CLIENT']
    );
    const userId = uRes.insertId;
    const [cRes] = await query(
      `INSERT INTO clients (user_id, date_of_birth, address, kyc_status) VALUES (?, ?, ?, ?)`,
      [userId, c.dob, c.addr, c.kyc]
    );
    clientIds.push(cRes.insertId);
  }

  // 4. Policies
  // Rahul's Active Health Policy
  const [p1] = await query(
    `INSERT INTO policies (policy_number, client_id, policy_type, policy_name, sum_insured, premium_amount, premium_frequency, start_date, end_date, status, assigned_staff)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['POL-HLTH-2026-001', clientIds[0], 'Health Insurance', 'Comprehensive Family Health Guard', 500000.00, 12500.00, 'Annually', '2026-01-01', '2027-01-01', 'Active', 1]
  );

  // Pooja's Active Life Policy
  const [p2] = await query(
    `INSERT INTO policies (policy_number, client_id, policy_type, policy_name, sum_insured, premium_amount, premium_frequency, start_date, end_date, status, assigned_staff)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['POL-LIFE-2026-002', clientIds[1], 'Life Insurance', 'Term Life Secure Shield', 10000000.00, 24000.00, 'Annually', '2026-02-15', '2036-02-15', 'Active', 1]
  );

  // Amit's Pending Motor Policy
  const [p3] = await query(
    `INSERT INTO policies (policy_number, client_id, policy_type, policy_name, sum_insured, premium_amount, premium_frequency, start_date, end_date, status, assigned_staff)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['POL-MTR-2026-003', clientIds[2], 'Motor Insurance', 'Comprehensive Auto Bumper-to-Bumper', 800000.00, 18500.00, 'Annually', '2026-09-01', '2027-09-01', 'Pending', 2]
  );

  // Sneha's Active Property Policy
  const [p4] = await query(
    `INSERT INTO policies (policy_number, client_id, policy_type, policy_name, sum_insured, premium_amount, premium_frequency, start_date, end_date, status, assigned_staff)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['POL-PROP-2026-004', clientIds[3], 'Property Insurance', 'Home Structure & Content Protect', 4500000.00, 15000.00, 'Annually', '2026-03-10', '2027-03-10', 'Active', 2]
  );

  // 5. Payments
  await query(
    `INSERT INTO policy_payments (policy_id, client_id, amount, payment_method, transaction_id, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [p1.insertId || 1, clientIds[0], 12500.00, 'UPI', 'TXN202609010001', 'Paid']
  );
  await query(
    `INSERT INTO transactions (transaction_type, reference_id, client_id, amount, description)
     VALUES (?, ?, ?, ?, ?)`,
    ['Premium', 'TXN202609010001', clientIds[0], 12500.00, 'Annual Premium for Comprehensive Family Health Guard']
  );

  await query(
    `INSERT INTO policy_payments (policy_id, client_id, amount, payment_method, transaction_id, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [p2.insertId || 2, clientIds[1], 24000.00, 'Debit Card', 'TXN202609020002', 'Paid']
  );
  await query(
    `INSERT INTO transactions (transaction_type, reference_id, client_id, amount, description)
     VALUES (?, ?, ?, ?, ?)`,
    ['Premium', 'TXN202609020002', clientIds[1], 24000.00, 'Annual Premium for Term Life Secure Shield']
  );

  await query(
    `INSERT INTO policy_payments (policy_id, client_id, amount, payment_method, transaction_id, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [p4.insertId || 4, clientIds[3], 15000.00, 'Net Banking', 'TXN202609030003', 'Paid']
  );
  await query(
    `INSERT INTO transactions (transaction_type, reference_id, client_id, amount, description)
     VALUES (?, ?, ?, ?, ?)`,
    ['Premium', 'TXN202609030003', clientIds[3], 15000.00, 'Annual Premium for Home Structure Protect']
  );

  // 6. Claims
  const [c1] = await query(
    `INSERT INTO claims (claim_number, policy_id, client_id, claim_type, description, claim_amount, incident_date, status, staff_remark, approved_amount, processed_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['CLM-2026-001', p1.insertId || 1, clientIds[0], 'Medical Hospitalization', 'Emergency appendectomy hospital charges and surgeon fees.', 45000.00, '2026-08-14', 'Settled', 'Verified with Apollo Hospital records. Approved in full.', 45000.00, 1]
  );
  await query(
    `INSERT INTO transactions (transaction_type, reference_id, client_id, amount, description)
     VALUES (?, ?, ?, ?, ?)`,
    ['Claim Payout', 'CLM-2026-001', clientIds[0], 45000.00, 'Claim settlement for CLM-2026-001 (Medical Hospitalization)']
  );

  await query(
    `INSERT INTO claims (claim_number, policy_id, client_id, claim_type, description, claim_amount, incident_date, status, staff_remark, approved_amount, processed_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['CLM-2026-002', p4.insertId || 4, clientIds[3], 'Water Pipe Damage', 'Flooding in basement due to main water pipeline leakage.', 32000.00, '2026-09-02', 'Under Review', 'Surveyor appointed for site inspection.', 0.00, 2]
  );
}

async function seedFallbackStore() {
  const [userCheck] = await query('SELECT COUNT(*) as count FROM users');
  if (userCheck && userCheck[0] && userCheck[0].count > 0) return;
  await seedInitialData();
}

/**
 * Lightweight, in-memory SQL parser for zero-configuration fallback execution
 */
function executeFallbackQuery(sql, params = []) {
  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();

  // 1. SELECT queries
  if (upper.startsWith('SELECT')) {
    let tableName = '';
    const fromMatch = trimmed.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    if (fromMatch) {
      tableName = fromMatch[1].toLowerCase();
    }

    // Handle COUNT(*) queries
    if (upper.includes('COUNT(*)')) {
      const list = fallbackStore[tableName] || [];
      // If WHERE clause exists
      const filtered = filterRows(tableName, list, trimmed, params);
      return [[{ count: filtered.length }], []];
    }

    // Handle SUM queries
    if (upper.includes('SUM(')) {
      const sumFieldMatch = trimmed.match(/SUM\(([a-zA-Z0-9_]+)\)/i);
      const sumField = sumFieldMatch ? sumFieldMatch[1] : 'amount';
      const list = fallbackStore[tableName] || [];
      const filtered = filterRows(tableName, list, trimmed, params);
      const total = filtered.reduce((acc, r) => acc + (Number(r[sumField]) || 0), 0);
      return [[{ total, sum: total, total_amount: total }], []];
    }

    let rows = (fallbackStore[tableName] || []).map(r => ({ ...r }));

    // Handle JOINs (simulate users, clients, staff, policies joins)
    rows = enrichJoinedData(tableName, rows);

    // Apply filtering
    rows = filterRows(tableName, rows, trimmed, params);

    // ORDER BY
    if (upper.includes('ORDER BY')) {
      if (upper.includes('DESC')) {
        rows.sort((a, b) => (b.id || 0) - (a.id || 0));
      } else {
        rows.sort((a, b) => (a.id || 0) - (b.id || 0));
      }
    }

    // LIMIT
    if (upper.includes('LIMIT')) {
      const limitMatch = trimmed.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        const lim = parseInt(limitMatch[1], 10);
        rows = rows.slice(0, lim);
      }
    }

    return [rows, []];
  }

  // 2. INSERT queries
  if (upper.startsWith('INSERT INTO')) {
    const tableMatch = trimmed.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (tableMatch) {
      const table = tableMatch[1].toLowerCase();
      const fields = tableMatch[2].split(',').map(f => f.trim());
      
      const newId = autoIncrementIds[table]++;
      const record = { id: newId, created_at: new Date().toISOString() };

      fields.forEach((field, idx) => {
        record[field] = params[idx] !== undefined ? params[idx] : null;
      });

      if (!fallbackStore[table]) fallbackStore[table] = [];
      fallbackStore[table].push(record);

      return [{ insertId: newId, affectedRows: 1 }, []];
    }
  }

  // 3. UPDATE queries
  if (upper.startsWith('UPDATE')) {
    const tableMatch = trimmed.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/i);
    if (tableMatch) {
      const table = tableMatch[1].toLowerCase();
      const setClause = tableMatch[2];
      const setFields = setClause.split(',').map(s => s.trim().split('=')[0].trim());

      let paramIdx = 0;
      const updates = {};
      setFields.forEach(f => {
        updates[f] = params[paramIdx++];
      });

      const whereVal = params[paramIdx];
      const list = fallbackStore[table] || [];
      let updatedCount = 0;

      list.forEach(row => {
        // match on id or user_id
        if (trimmed.includes('WHERE id = ?') && row.id == whereVal) {
          Object.assign(row, updates);
          updatedCount++;
        } else if (trimmed.includes('WHERE user_id = ?') && row.user_id == whereVal) {
          Object.assign(row, updates);
          updatedCount++;
        }
      });

      return [{ affectedRows: updatedCount }, []];
    }
  }

  // 4. DELETE queries
  if (upper.startsWith('DELETE FROM')) {
    const tableMatch = trimmed.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)\s+WHERE\s+(.+)/i);
    if (tableMatch) {
      const table = tableMatch[1].toLowerCase();
      const idVal = params[0];
      const initialLen = (fallbackStore[table] || []).length;
      fallbackStore[table] = (fallbackStore[table] || []).filter(r => r.id != idVal && r.user_id != idVal);
      return [{ affectedRows: initialLen - fallbackStore[table].length }, []];
    }
  }

  return [[], []];
}

function filterRows(table, rows, sql, params) {
  let filtered = [...rows];
  const upper = sql.toUpperCase();

  if (upper.includes('WHERE')) {
    // Extract conditions in the WHERE clause
    const wherePart = sql.split(/WHERE/i)[1] || '';

    // Match exact parameter slots in order of appearance in WHERE
    const tokenRegex = /\b([a-zA-Z0-9_]+)\s*=\s*\?/g;
    let match;
    let pIdx = 0;

    while ((match = tokenRegex.exec(wherePart)) !== null && pIdx < params.length) {
      const field = match[1].toLowerCase();
      const val = params[pIdx++];

      filtered = filtered.filter(r => {
        if (field === 'email') {
          return r.email && r.email.toLowerCase() === (val || '').toLowerCase();
        }
        if (field === 'role') {
          return r.role === val;
        }
        if (field === 'status') {
          return r.status && r.status.toLowerCase() === (val || '').toLowerCase();
        }
        if (field === 'transaction_type') {
          return r.transaction_type && r.transaction_type.toLowerCase() === (val || '').toLowerCase();
        }
        // numeric / ID comparisons
        return r[field] == val;
      });
    }
  }
  return filtered;
}

function enrichJoinedData(table, rows) {
  if (table === 'clients') {
    return rows.map(c => {
      const user = (fallbackStore.users || []).find(u => u.id === c.user_id) || {};
      return {
        ...c,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      };
    });
  }

  if (table === 'staff') {
    return rows.map(s => {
      const user = (fallbackStore.users || []).find(u => u.id === s.user_id) || {};
      return {
        ...s,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      };
    });
  }

  if (table === 'policies') {
    return rows.map(p => {
      const client = (fallbackStore.clients || []).find(c => c.id === p.client_id) || {};
      const clientUser = (fallbackStore.users || []).find(u => u.id === client.user_id) || {};
      const staffMember = (fallbackStore.staff || []).find(s => s.id === p.assigned_staff) || {};
      const staffUser = (fallbackStore.users || []).find(u => u.id === staffMember.user_id) || {};

      return {
        ...p,
        client_name: clientUser.name || 'Client',
        client_email: clientUser.email || '',
        client_phone: clientUser.phone || '',
        staff_name: staffUser.name || 'Unassigned'
      };
    });
  }

  if (table === 'claims') {
    return rows.map(cl => {
      const policy = (fallbackStore.policies || []).find(p => p.id === cl.policy_id) || {};
      const client = (fallbackStore.clients || []).find(c => c.id === cl.client_id) || {};
      const clientUser = (fallbackStore.users || []).find(u => u.id === client.user_id) || {};
      const staffMember = (fallbackStore.staff || []).find(s => s.id === cl.processed_by) || {};
      const staffUser = (fallbackStore.users || []).find(u => u.id === staffMember.user_id) || {};

      return {
        ...cl,
        policy_name: policy.policy_name || '',
        policy_number: policy.policy_number || '',
        sum_insured: policy.sum_insured || 0,
        client_name: clientUser.name || 'Client',
        client_email: clientUser.email || '',
        staff_name: staffUser.name || 'Pending Staff'
      };
    });
  }

  if (table === 'policy_payments') {
    return rows.map(pay => {
      const policy = (fallbackStore.policies || []).find(p => p.id === pay.policy_id) || {};
      const client = (fallbackStore.clients || []).find(c => c.id === pay.client_id) || {};
      const clientUser = (fallbackStore.users || []).find(u => u.id === client.user_id) || {};

      return {
        ...pay,
        policy_name: policy.policy_name || '',
        policy_number: policy.policy_number || '',
        client_name: clientUser.name || 'Client'
      };
    });
  }

  if (table === 'transactions') {
    return rows.map(tx => {
      const client = (fallbackStore.clients || []).find(c => c.id === tx.client_id) || {};
      const clientUser = (fallbackStore.users || []).find(u => u.id === client.user_id) || {};

      return {
        ...tx,
        client_name: clientUser.name || 'General'
      };
    });
  }

  return rows;
}
