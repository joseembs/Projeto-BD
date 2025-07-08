const express = require("express");
const router = express.Router();
const pool = require("./db-setup");
const Joi = require("joi");


const ensinaSchema = Joi.object({
  fk_Prof_Matricula: Joi.string().required(),
  fk_Turma_Codigo: Joi.string().required(),
});


router.post("/", async (req, res) => {
  const { error } = ensinaSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { fk_Prof_Matricula, fk_Turma_Codigo } = req.body;

  try {
    await pool.query(
      "INSERT INTO Ensina (fk_Prof_Matricula, fk_Turma_Codigo) VALUES ($1, $2)",
      [fk_Prof_Matricula, fk_Turma_Codigo]
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


router.get("/turma/:codigo", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Ensina WHERE fk_Turma_Codigo = $1",
      [req.params.codigo]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Nenhuma relação encontrada para esta turma.");
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:fk_Prof_Matricula/:fk_Turma_Codigo", async (req, res, next) => {
  try {
    const { fk_Prof_Matricula, fk_Turma_Codigo } = req.params;

    const result = await pool.query(
      "DELETE FROM Ensina WHERE fk_Prof_Matricula = $1 AND fk_Turma_Codigo = $2",
      [fk_Prof_Matricula, fk_Turma_Codigo]
    );

    if (result.rowCount === 0)
      return res.status(404).send("Nenhuma relação encontrada com esses dados");

    res.send("Relação deletada com sucesso");
  } catch (err) {
    next(err);
  }
});


module.exports = router;