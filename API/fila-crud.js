const express = require("express");
const router = express.Router();
const pool = require("./db-setup");
const Joi = require("joi");

const filaSchema = Joi.object({
  Codigo: Joi.string().required(),
  Prioridade: Joi.number().integer().required(),
  Posicao: Joi.number().integer().required(),
  Periodo: Joi.string().required(),
  Preferencia: Joi.number().integer().required(),
  fk_Aluno_Matricula: Joi.string().length(9).optional(),
  fk_Turma_Numero: Joi.number().integer().optional(),
  fk_Turma_Semestre: Joi.string().optional(),
});

const filaPatchSchema = filaSchema.fork(
  ["Codigo"],
  (field) => field.forbidden()
).fork(
  ["Prioridade", "Posicao", "Periodo", "Preferencia", "fk_Aluno_Matricula", "fk_Turma_Numero", "fk_Turma_Semestre"],
  (field) => field.optional()
);

router.post("/", async (req, res, next) => {
  const { error } = filaSchema.validate(req.body);
  if (error) return next(error);

  const { Codigo, Prioridade, Posicao, Periodo, Preferencia, fk_Aluno_Matricula, fk_Turma_Numero, fk_Turma_Semestre } = req.body;

  try {
    await pool.query(
      `INSERT INTO FilaSeMatricula 
       (Codigo, Prioridade, Posicao, Periodo, Preferencia, fk_Aluno_Matricula, fk_Turma_Numero, fk_Turma_Semestre) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [Codigo, Prioridade, Posicao, Periodo, Preferencia, fk_Aluno_Matricula, fk_Turma_Numero, fk_Turma_Semestre]
    );
    res.status(201).send("Posição na fila criada com sucesso");
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM FilaSeMatricula");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:Codigo", async (req, res, next) => {
  const { Codigo } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM FilaSeMatricula WHERE Codigo = $1",
      [Codigo]
    );
    if (result.rows.length === 0)
      return res.status(404).send("Posição na fila não encontrada");
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:Codigo", async (req, res, next) => {
  const { error } = filaPatchSchema.validate(req.body);
  if (error) return next(error);

  const campos = [];
  const valores = [];
  let idx = 1;

  for (const key of ["Prioridade", "Posicao", "Periodo", "Preferencia", "fk_Aluno_Matricula", "fk_Turma_Numero", "fk_Turma_Semestre"]) {
    if (key in req.body) {
      campos.push(`${key} = $${idx}`);
      valores.push(req.body[key]);
      idx++;
    }
  }
  if (campos.length === 0)
    return res.status(400).send("Nenhum campo para atualizar");

  valores.push(req.params.Codigo);

  try {
    const result = await pool.query(
      `UPDATE FilaSeMatricula SET ${campos.join(", ")} WHERE Codigo = $${idx}`,
      valores
    );
    if (result.rowCount === 0)
      return res.status(404).send("Posição na fila não encontrada para atualização");
    res.send("Posição na fila atualizada com sucesso");
  } catch (err) {
    next(err);
  }
});

router.delete("/:Codigo", async (req, res, next) => {
  const { Codigo } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM FilaSeMatricula WHERE Codigo = $1",
      [Codigo]
    );
    if (result.rowCount === 0)
      return res.status(404).send("Posição na fila não encontrada para exclusão");
    res.status(200).send("Posição na fila deletada com sucesso");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
