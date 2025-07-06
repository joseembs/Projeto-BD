const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});
/*
const originalQuery = pool.query.bind(pool);

pool.query = async (...args) => {
  const [sql, params] = args;
  console.log('SQL EXECUTADO:', sql);
  if (params) console.log('PARAMETROS:', params);
  return originalQuery(...args);
};
*/
module.exports = pool;