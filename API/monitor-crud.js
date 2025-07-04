const express = require("express");
const router = express.Router();
const pool = require("./db-setup");

router.post("/", async (req, res) => {
  const {
    Codigo,
    Tipo,
    Salario,   
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO Monitor (Codigo, Tipo, Salario) VALUES ($1,$2,$3)",
      [Codigo, Tipo, Salario]
    );
    res.status(201).send("Monitor cadastrado com sucesso");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Monitor");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:codigo", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Monitor WHERE Codigo = $1",
      [req.params.codigo]
    );
    if (result.rows.length === 0)
      return res.status(404).send("Nenhum monitor encontrado com esse código");
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:matricula", async (req, res) => {
  const campos = [];
  const valores = [];
  let i = 1;

  for (const key in req.body) {
    campos.push(`${key}=$${i}`);
    valores.push(req.body[key]);
    i++;
  }
  if (campos.length === 0) {
    return res.status(400).send("Nada para atualizar");
  }
  valores.push(req.params.matricula);

  try {
    const result = await pool.query(
      `UPDATE Monitor SET ${campos.join(", ")} WHERE Codigo=$${i}`,
      valores
    );
    if (result.rowCount === 0)
      return res.status(404).send("Nenhum Monitor encontrado com essa matrícula");
    res.send("Dados atualizados com sucesso");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:codigo", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM Monitor WHERE Codigo=$1",
      [req.params.codigo]
    );
    if (result.rowCount === 0)
      return res.status(404).send("Nenhum Monitor encontrado com esse código");
    res.send(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;