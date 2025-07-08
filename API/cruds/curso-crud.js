const express = require("express");
const router = express.Router();
const pool = require("../db-setup");
const Joi = require('joi');

const nao_achou = "Não existe curso com o código fornecido";

const cursoSchema = Joi.object({
  Codigo: Joi.string().required(),
  Nome: Joi.string().required(),
  CargaHorariaTotal: Joi.number().integer().min(1).required(),
  MinimoSemestres: Joi.number().integer().min(1).optional(),
  MaximoSemestres: Joi.number().integer().min(1).optional(),
  Turno: Joi.string().valid("Diurno", "Noturno").optional(),
  fk_Departamento_Codigo: Joi.string().optional(),
  fk_Prof_Coord_Matricula: Joi.string().optional(),
  BonusSalarial: Joi.number().precision(2).min(0).optional()
});

const cursoPatchSchema = cursoSchema.fork(
  Object.keys(cursoSchema.describe().keys),
  field => field.optional()
);

router.post("/", async (req, res, next) => {
  const { error } = cursoSchema.validate(req.body);
  if (error) {
    return next(error);
  }

  const {
    Codigo,
    Nome,
    CargaHorariaTotal,
    MinimoSemestres,
    MaximoSemestres,
    Turno,
    fk_Departamento_Codigo,
    fk_Prof_Coord_Matricula,
    BonusSalarial
  } = req.body;

  try {
    const validateDepartamento = await pool.query("SELECT 1 FROM Departamento WHERE Codigo = $1", [fk_Departamento_Codigo]);
    if (fk_Departamento_Codigo && validateDepartamento.rows.length === 0) return res.status(400).send("Departamento não encontrado");

    const validateCoordenador = await pool.query("SELECT 1 FROM Professor WHERE Matricula = $1", [fk_Prof_Coord_Matricula]);
    if (fk_Prof_Coord_Matricula && validateCoordenador.rows.length === 0) return res.status(400).send("Professor Coordenador não encontrado");
    
    await pool.query(
      "INSERT INTO Curso (Codigo, Nome, CargaHorariaTotal, MinimoSemestres, MaximoSemestres, Turno, fk_Departamento_Codigo, fk_Prof_Coord_Matricula, BonusSalarial) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [Codigo, Nome, CargaHorariaTotal, MinimoSemestres, MaximoSemestres, Turno, fk_Departamento_Codigo, fk_Prof_Coord_Matricula, BonusSalarial]
    );
    res.status(201).send("deu bom");
  } catch (err) {
    next(err);
  }
});


router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM Curso");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});


router.get("/:codigo", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Curso WHERE Codigo = $1",
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
  const { error } = cursoPatchSchema.validate(req.body);
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
      `UPDATE Curso SET ${campos.join(", ")} WHERE Codigo=$${i}`,
      valores
    );
    if (result.rowCount === 0)
      return res.status(404).send(nao_achou);
    res.send("Dados do curso atualizados com sucesso");
  } catch (err) {
    next(err);
  }
});


router.delete("/:codigo", async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM Curso WHERE Codigo=$1",
      [req.params.codigo]
    );
    if (result.rowCount === 0)
      return res.status(404).send(nao_achou);
    res.send("Curso removido com sucesso");
  } catch (err) {
    next(err);
  }
});

module.exports = router;