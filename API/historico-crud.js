const express = require("express");
const router = express.Router();
const pool = require("./db-setup");
const Joi = require("joi");

const historicoSchema = Joi.object({
  fk_Turma_Numero: Joi.number().integer().required(),
  fk_Turma_Semestre: Joi.string().required(),
  fk_Aluno_Matricula: Joi.string().length(9).required(),
  Status: Joi.string().optional(),
  Mencao: Joi.string().optional(),
});

const historicoPatchSchema = historicoSchema.fork(
  ["fk_Turma_Numero", "fk_Turma_Semestre", "fk_Aluno_Matricula"],
  (field) => field.forbidden()
).fork(
  ["Status", "Mencao"],
  (field) => field.optional()
);

router.post("/", async (req, res, next) => {
  const { error } = historicoSchema.validate(req.body);
  if (error) return next(error);

  const { fk_Turma_Numero, fk_Turma_Semestre, fk_Aluno_Matricula, Status, Mencao } = req.body;

  try {
    await pool.query(
      `INSERT INTO HistoricoFazParte 
       (fk_Turma_Numero, fk_Turma_Semestre, fk_Aluno_Matricula, Status, Mencao) 
       VALUES ($1, $2, $3, $4, $5)`,
      [fk_Turma_Numero, fk_Turma_Semestre, fk_Aluno_Matricula, Status, Mencao]
    );
    res.status(201).send("Registro de histórico criado com sucesso");
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM HistoricoFazParte");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:fk_Turma_Numero/:fk_Turma_Semestre/:fk_Aluno_Matricula", async (req, res, next) => {
  const { fk_Turma_Numero, fk_Turma_Semestre, fk_Aluno_Matricula } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM HistoricoFazParte 
       WHERE fk_Turma_Numero = $1 AND fk_Turma_Semestre = $2 AND fk_Aluno_Matricula = $3`,
      [fk_Turma_Numero, fk_Turma_Semestre, fk_Aluno_Matricula]
    );
    if (result.rows.length === 0)
      return res.status(404).send("Registro de histórico não encontrado");
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:fk_Turma_Numero/:fk_Turma_Semestre/:fk_Aluno_Matricula", async (req, res, next) => {
  const { error } = historicoPatchSchema.validate(req.body);
  if (error) return next(error);

  const campos = [];
  const valores = [];
  let idx = 1;

  for (const key of ["Status", "Mencao"]) {
    if (key in req.body) {
      campos.push(`${key} = $${idx}`);
      valores.push(req.body[key]);
      idx++;
    }
  }
  if (campos.length === 0)
    return res.status(400).send("Nenhum campo para atualizar");

  const { fk_Turma_Numero, fk_Turma_Semestre, fk_Aluno_Matricula } = req.params;
  valores.push(fk_Turma_Numero, fk_Turma_Semestre, fk_Aluno_Matricula);

  try {
    const result = await pool.query(
      `UPDATE HistoricoFazParte SET ${campos.join(", ")}
       WHERE fk_Turma_Numero = $${idx} AND fk_Turma_Semestre = $${idx + 1} AND fk_Aluno_Matricula = $${idx + 2}`,
      valores
    );
    if (result.rowCount === 0)
      return res.status(404).send("Registro de histórico não encontrado para atualização");
    res.send("Registro de histórico atualizado com sucesso");
  } catch (err) {
    next(err);
  }
});

router.delete("/:fk_Turma_Numero/:fk_Turma_Semestre/:fk_Aluno_Matricula", async (req, res, next) => {
  const { fk_Turma_Numero, fk_Turma_Semestre, fk_Aluno_Matricula } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM HistoricoFazParte
       WHERE fk_Turma_Numero = $1 AND fk_Turma_Semestre = $2 AND fk_Aluno_Matricula = $3`,
      [fk_Turma_Numero, fk_Turma_Semestre, fk_Aluno_Matricula]
    );
    if (result.rowCount === 0)
      return res.status(404).send("Registro de histórico não encontrado para exclusão");
    res.status(200).send("Registro de histórico deletado com sucesso");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
