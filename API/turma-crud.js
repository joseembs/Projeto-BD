const express = require("express");
const router = express.Router();
const pool = require("./db-setup");

router.post("/", async (req, res) => {
  const {
    Numero,
    Semestre,
    DataHora,
    Metodologia,
    Capacidade,
    FK_Disciplina_Codigo,
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO Turma (Numero, Semestre, DataHora, Metodologia, Capacidade, FK_Disciplina_Codigo) VALUES ($1,$2,$3,$4,$5,$6)",
      [Numero, Semestre, DataHora, Metodologia, Capacidade, FK_Disciplina_Codigo]
    );
    res.status(201).send("Turma cadastrada com sucesso");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Turma");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:numero/:semestre", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Turma WHERE Numero = $1 AND Semestre = $2",
      [req.params.numero, req.params.semestre]
    );
    if (result.rows.length === 0)
      return res.status(404).send("Nenhuma turma encontrada com esses dados");
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:numero/:semestre", async (req, res) => {
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
  valores.push(req.params.numero, req.params.semestre);

  try {
    const result = await pool.query(
      `UPDATE Turma SET ${campos.join(", ")} WHERE Numero=$${i} AND Semestre=$${i + 1}`,
      valores
    );
    if (result.rowCount === 0)
      return res.status(404).send("Nenhuma turma encontrada com esses dados");
    res.send("Dados atualizados com sucesso");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:numero/:semestre", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM Turma WHERE Numero = $1 AND Semestre = $2",
      [req.params.numero, req.params.semestre]
    );
    if (result.rowCount === 0)
      return res.status(404).send("Nenhuma turma encontrada com esses dados");
    res.send("Turma deletada com sucesso");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;