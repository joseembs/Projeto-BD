const express = require("express");
const router = express.Router();
const pool = require("./db-setup");
const Joi = require('joi');

const turmaSchema = Joi.object({
  Numero: Joi.number().integer().min(1).required(),
  Semestre: Joi.string().required(),
  DataHora: Joi.string().required(), // YYYY-MM-DD
  Metodologia: Joi.string().optional(),
  Capacidade: Joi.number().integer().min(1).required(),
  FK_Disciplina_Codigo: Joi.string().required()
});

const turmaPatchSchema = turmaSchema.fork(
  Object.keys(turmaSchema.describe().keys),
  field => field.optional()
);

router.post("/", async (req, res, next) => {
  const { error } = turmaSchema.validate(req.body);
  if (error) {
    return next(error);
  }

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
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM Turma");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:numero/:semestre", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Turma WHERE Numero = $1 AND Semestre = $2",
      [req.params.numero, req.params.semestre]
    );
    if (result.rows.length === 0)
      return res.status(404).send("Nenhuma turma encontrada com esses dados");
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:numero/:semestre", async (req, res, next) => {
  const { error } = turmaPatchSchema.validate(req.body);
  if (error) {
    return next(error);
  }

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
    next(err);
  }
});

router.delete("/:numero/:semestre", async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM Turma WHERE Numero = $1 AND Semestre = $2",
      [req.params.numero, req.params.semestre]
    );
    if (result.rowCount === 0)
      return res.status(404).send("Nenhuma turma encontrada com esses dados");
    res.send("Turma deletada com sucesso");
  } catch (err) {
    next(err);
  }
});

module.exports = router;