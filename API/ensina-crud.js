const express = require("express");
const router = express.Router();
const pool = require("./db-setup");
const Joi = require("joi");


const ensinaSchema = Joi.object({
  fk_Prof_Matricula: Joi.string().required(),
  fk_Turma_Numero: Joi.number().integer().required(),
  fk_Turma_Semestre: Joi.string().required(),
});


router.post("/", async (req, res) => {
  const { error } = ensinaSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { fk_Prof_Matricula, fk_Turma_Numero, fk_Turma_Semestre } = req.body;

  try {
    await pool.query(
      "INSERT INTO Ensina (fk_Prof_Matricula, fk_Turma_Numero, fk_Turma_Semestre) VALUES ($1, $2, $3)",
      [fk_Prof_Matricula, fk_Turma_Numero, fk_Turma_Semestre]
    );
    res.status(201).send("Relação criada com sucesso.");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Ensina");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/professor/:matricula", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Ensina WHERE fk_Prof_Matricula = $1",
      [req.params.matricula]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Nenhuma relação encontrada para este professor.");
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/turma/:numero/:semestre", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Ensina WHERE fk_Turma_Numero = $1 AND fk_Turma_Semestre = $2",
      [req.params.numero, req.params.semestre]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Nenhuma relação encontrada para esta turma.");
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/", async (req, res) => {
  const { error } = ensinaSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { fk_Prof_Matricula, fk_Turma_Numero, fk_Turma_Semestre } = req.body;

  try {
    const result = await pool.query(
      "DELETE FROM Ensina WHERE fk_Prof_Matricula = $1 AND fk_Turma_Numero = $2 AND fk_Turma_Semestre = $3",
      [fk_Prof_Matricula, fk_Turma_Numero, fk_Turma_Semestre]
    );
    if (result.rowCount === 0) {
      return res.status(404).send("Nenhuma relação encontrada para excluir.");
    }
    res.send("Relação removida com sucesso.");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;