const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME     || 'mecanica_pro',
  user:     process.env.DB_USER     || 'mecanica_user',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: '-05:00',          // Lima, Perú (UTC-5)
  charset: 'utf8mb4',
});

// Helper idéntico a pg para no cambiar llamadas.
// Usamos pool.query (no execute) porque execute envía LIMIT/OFFSET como string
// y MariaDB/MySQL 8.0.22+ lo rechaza con ER_WRONG_ARGUMENTS en mysqld_stmt_execute.
const db = {
  query: async (sql, params = []) => {
    const [rows] = await pool.query(sql, params);
    return { rows };
  },
  getConnection: () => pool.getConnection(),
  pool,
};

module.exports = db;
