const express = require("express");
const router = express.Router();
const pool = require("./db-setup");

const nao_achou = "Não existe ementa com o código fornecido";


router.post("/", async (req, res) => {
  const {
    Numero,
    Detalhes,
    Bibliografia,
    Topicos,
    Modulos,
    Ativa,
    fk_Disciplina_Codigo
  } = req.body;

  const validateDisciplina = await pool.query("SELECT 1 FROM Disciplina WHERE Codigo = $1", [fk_Disciplina_Codigo]);
  if (fk_Disciplina_Codigo && validateDisciplina.rows.length === 0) {
    return res.status(400).send("Disciplina não encontrada");
  }

  try {
    await pool.query(
      "INSERT INTO Ementa (Numero, Detalhes, Bibliografia, Topicos, Modulos, Ativa, fk_Disciplina_Codigo) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [Numero, Detalhes, Bibliografia, Topicos, Modulos, Ativa, fk_Disciplina_Codigo]
    );
    res.status(201).send("deu bom");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Ementa");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:numero/:disciplina", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Ementa WHERE Numero = $1 AND fk_Disciplina_Codigo = $2",
      [req.params.numero, req.params.disciplina]
    );
    if (result.rows.length === 0)
      return res.status(404).send(nao_achou);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:numero/:disciplina", async (req, res) => {
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
  valores.push(req.params.numero, req.params.disciplina);

  try {
    const result = await pool.query(
      `UPDATE Ementa SET ${campos.join(", ")} WHERE Numero=$${i} AND fk_Disciplina_Codigo=$${i + 1}`,
      valores
    );
    if (result.rowCount === 0)
      return res.status(404).send(nao_achou);
    res.send("Dados da ementa atualizados com sucesso");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete("/:numero/:disciplina", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM Ementa WHERE Numero = $1 AND fk_Disciplina_Codigo = $2",
      [req.params.numero, req.params.disciplina]
    );
    if (result.rowCount === 0)
      return res.status(404).send(nao_achou);
    res.send("Ementa removida com sucesso");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;