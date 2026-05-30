const mysql = require('mysql2/promise');

let activePool = null;

function createMysqlPool(mysqlUrl) {
  const connectionUrl = new URL(mysqlUrl);

  return mysql.createPool({
    host: connectionUrl.hostname,
    port: Number(connectionUrl.port) || 3306,
    user: decodeURIComponent(connectionUrl.username),
    password: decodeURIComponent(connectionUrl.password),
    database: connectionUrl.pathname.replace(/^\//, ''),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

const pool = {
  async query(sql, values = []) {
    if (!activePool) {
      throw new Error('Database has not been initialized yet.');
    }

    return activePool.query(sql, values);
  },
  async getConnection() {
    if (!activePool) {
      throw new Error('Database has not been initialized yet.');
    }

    return activePool.getConnection();
  },
};

async function initializeDatabase() {
  const mysqlUrl = process.env.MYSQL_URL;

  if (!mysqlUrl) {
    throw new Error('MYSQL_URL is missing.');
  }

  const mysqlPool = createMysqlPool(mysqlUrl);
  const connection = await mysqlPool.getConnection();

  try {
    await connection.ping();
    activePool = mysqlPool;
    console.log('Connected to MySQL successfully');
  } finally {
    connection.release();
  }
}

async function query(sql, values = []) {
  const [rows] = await pool.query(sql, values);
  return rows;
}

module.exports = {
  pool,
  query,
  initializeDatabase,
};
