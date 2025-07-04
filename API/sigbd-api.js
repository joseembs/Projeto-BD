const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

app.use(express.json());
const professorRoutes = require("./professor-crud");
app.use("/professores", professorRoutes);


app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM aluno');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).send('Erro interno');
  }
});

// joga node API/sigbd-api.js no terminal para rodar
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});