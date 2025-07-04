const express = require("express");
const router = express.Router();
const pool = require("./db-setup");

const nao_achou = "Não existe departamento com o código fornecido";


router.post("/", async (req, res) => {
  const {
    Codigo,
    Nome,
    Telefone
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO Departamento (Codigo, Nome, Telefone) VALUES ($1,$2,$3)",
      [Codigo, Nome, Telefone]
    );
    res.status(201).send("deu bom");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Departamento");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:codigo", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Departamento WHERE Codigo = $1",
      [req.params.codigo]
    );
    if (result.rows.length === 0)
      return res.status(404).send(nao_achou);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:codigo", async (req, res) => {
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
  valores.push(req.params.codigo);

  try {
    const result = await pool.query(
      `UPDATE Departamento SET ${campos.join(", ")} WHERE Codigo=$${i}`,
      valores
    );
    if (result.rowCount === 0)
      return res.status(404).send(nao_achou);
    res.send("Dados do departamento atualizados com sucesso");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete("/:codigo", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM Departamento WHERE Codigo=$1",
      [req.params.codigo]
    );
    if (result.rowCount === 0)
      return res.status(404).send(nao_achou);
    res.send("Departamento removido com sucesso");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;