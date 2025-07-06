const express = require("express");
const router = express.Router();
const pool = require("./db-setup");
const Joi = require('joi');

const monitorSchema = Joi.object({
  Codigo: Joi.string().required(),
  Tipo: Joi.string().valid('Não remunerado', 'Remunerado').required(),
  Salario: Joi.number().precision(2).min(0).optional(),
  fk_Aluno_Matricula: Joi.string().length(9).pattern(/^\d+$/).required(),
});

const monitorPatchSchema = monitorSchema.fork(
  Object.keys(monitorSchema.describe().keys),
  field => field.optional()
);

router.post("/", async (req, res, next) => {
  const { error } = monitorSchema.validate(req.body);
  if (error) {
    return next(error);
  }

  const {
    Codigo,
    Tipo,
    Salario,
    fk_Aluno_Matricula   
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO Monitor (Codigo, Tipo, Salario, fk_Aluno_Matricula) VALUES ($1,$2,$3,$4)",
      [Codigo, Tipo, Salario, fk_Aluno_Matricula]
    );
    res.status(201).send("Monitor cadastrado com sucesso");
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Monitor");
    res.json(result.rows);
  } catch (err) {
    next(err);
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
    next(err);
  }
});

router.patch("/:codigo", async (req, res) => {
  const { error } = monitorPatchSchema.validate(req.body);
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
  valores.push(req.params.codigo);

  try {
    const result = await pool.query(
      `UPDATE Monitor SET ${campos.join(", ")} WHERE Codigo=$${i}`,
      valores
    );
    if (result.rowCount === 0)
      return res.status(404).send("Nenhum Monitor encontrado com esse código");
    res.status(201).send("Monitor atualizado com sucesso");
  } catch (err) {
    next(err);
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
    res.status(201).send("Monitor deletado com sucesso");
  } catch (err) {
    next(err);
  }
});

module.exports = router;