const express = require("express");
const router = express.Router();
const pool = require("./db-setup");
const Joi = require('joi');

const nao_achou = "Não existe disciplina com o código fornecido";

const disciplinaSchema = Joi.object({
  Codigo: Joi.string().required(),
  Nome: Joi.string().required(),
  CargaHoraria: Joi.number().integer().min(1).optional(),
  fk_Departamento_Codigo: Joi.string().optional()
});

const disciplinaPatchSchema = disciplinaSchema.fork(
  Object.keys(disciplinaSchema.describe().keys),
  field => field.optional()
);

router.post("/", async (req, res, next) => {
  const { error } = disciplinaSchema.validate(req.body);
  if (error) {
    return next(error);
  }

  const {
    Codigo,
    Nome,
    CargaHoraria,
    fk_Departamento_Codigo
  } = req.body;

  try {
    if (fk_Departamento_Codigo) {
      const validateDepartamento = await pool.query("SELECT 1 FROM Departamento WHERE Codigo = $1", [fk_Departamento_Codigo]);
      if (validateDepartamento.rows.length === 0) return res.status(400).send("Departamento não encontrado");
    }

    await pool.query(
      "INSERT INTO Disciplina (Codigo, Nome, CargaHoraria, fk_Departamento_Codigo) VALUES ($1,$2,$3,$4)",
      [Codigo, Nome, CargaHoraria, fk_Departamento_Codigo]
    );

    res.status(201).send("deu bom");
  } catch (err) {
    next(err);
  }
});


router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM Disciplina");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});


router.get("/:codigo", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Disciplina WHERE Codigo = $1",
      [req.params.codigo]
    );
    if (result.rows.length === 0)
      return res.status(404).send(nao_achou);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:codigo", async (req, res, next) => {
  const { error } = disciplinaPatchSchema.validate(req.body);
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
      `UPDATE Disciplina SET ${campos.join(", ")} WHERE Codigo=$${i}`,
      valores
    );
    if (result.rowCount === 0)
      return res.status(404).send(nao_achou);
    res.send("Dados da disciplina atualizados com sucesso");
  } catch (err) {
    next(err);
  }
});


router.delete("/:codigo", async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM Disciplina WHERE Codigo=$1",
      [req.params.codigo]
    );
    if (result.rowCount === 0)
      return res.status(404).send(nao_achou);
    res.send("Disciplina removida com sucesso");
  } catch (err) {
    next(err);
  }
});

module.exports = router;