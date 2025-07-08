const express = require("express");
const router = express.Router();
const pool = require("../db-setup");
const Joi = require('joi');

const nao_achou = "Não existe ementa com o código fornecido";

const ementaSchema = Joi.object({
  Numero: Joi.number().integer().min(1).required(),
  Detalhes: Joi.string().optional(),
  Bibliografia: Joi.string().optional(),
  Topicos: Joi.string().optional(),
  Modulos: Joi.string().optional(),
  Ativa: Joi.boolean().optional(),
  fk_Disciplina_Codigo: Joi.string().required()
});

const ementaPatchSchema = ementaSchema.fork(
  Object.keys(ementaSchema.describe().keys),
  field => field.optional()
);

router.post("/", async (req, res, next) => {
  const { error } = ementaSchema.validate(req.body);
  if (error) {
    return next(error);
  }

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
  if (validateDisciplina.rows.length === 0) {
    return res.status(400).send("Disciplina não encontrada");
  }

  try {
    await pool.query(
      "INSERT INTO Ementa (Numero, Detalhes, Bibliografia, Topicos, Modulos, Ativa, fk_Disciplina_Codigo) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [Numero, Detalhes, Bibliografia, Topicos, Modulos, Ativa, fk_Disciplina_Codigo]
    );
    res.status(201).send("deu bom");
  } catch (err) {
    next(err);
  }
});


router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM Ementa");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});


router.get("/:numero/:disciplina", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Ementa WHERE Numero = $1 AND fk_Disciplina_Codigo = $2",
      [req.params.numero, req.params.disciplina]
    );
    if (result.rows.length === 0)
      return res.status(404).send(nao_achou);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:numero/:disciplina", async (req, res, next) => {
  const { error } = ementaPatchSchema.validate(req.body);
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
    next(err);
  }
});


router.delete("/:numero/:disciplina", async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM Ementa WHERE Numero = $1 AND fk_Disciplina_Codigo = $2",
      [req.params.numero, req.params.disciplina]
    );
    if (result.rowCount === 0)
      return res.status(404).send(nao_achou);
    res.send("Ementa removida com sucesso");
  } catch (err) {
    next(err);
  }
});

module.exports = router;