const { query } = require('../config/database');

async function findByEmail(email) {
  const rows = await query(
    `SELECT id, name, email, password, role, phone, address, city, created_at, updated_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

async function findById(id) {
  const rows = await query(
    `SELECT id, name, email, role, phone, address, city, created_at, updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function create(userData) {
  const { name, email, password, role, phone = null, address = null, city = null } = userData;

  const result = await query(
    `INSERT INTO users (name, email, password, role, phone, address, city)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, password, role, phone, address, city]
  );

  return findById(result.insertId);
}

module.exports = {
  findByEmail,
  findById,
  create,
};