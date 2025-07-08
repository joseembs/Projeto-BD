const express = require("express");
const router = express.Router();
const pool = require("../db-setup");
const Joi = require("joi");


const professorSchema = Joi.object({
  Matricula: Joi.string().required(),
  CPF: Joi.string().length(11).pattern(/^\d+$/).required(),
  Nome: Joi.string().min(2).required(),
  Email: Joi.string().email().required(),
  DataNascimento: Joi.date().optional(),
  Idade: Joi.number().integer().min(0).optional(),
  Status: Joi.string().required(),
  Salario: Joi.number().precision(2).optional(),
});

const professorPatchSchema = professorSchema.fork(
  Object.keys(professorSchema.describe().keys),
  (field) => field.optional()
);


router.post("/", async (req, res) => {
  const { error } = professorSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { Matricula, CPF, Nome, Email, DataNascimento, Idade, Status, Salario } = req.body;

  try {
    await pool.query(
      "INSERT INTO Professor (Matricula, CPF, Nome, Email, DataNascimento, Idade, Status, Salario) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [Matricula, CPF, Nome, Email, DataNascimento, Idade, Status, Salario]
    );
    res.status(201).send("Professor criado com sucesso.");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Professor");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:matricula", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Professor WHERE Matricula = $1", [req.params.matricula]);
    if (result.rows.length === 0) {
      return res.status(404).send("Professor não encontrado.");
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.patch("/:matricula", async (req, res) => {
  const { error } = professorPatchSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
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
    return res.status(400).send("Nada para atualizar.");
  }

  valores.push(req.params.matricula);

  try {
    const result = await pool.query(
      `UPDATE Professor SET ${campos.join(", ")} WHERE Matricula=$${i}`,
      valores
    );
    if (result.rowCount === 0) {
      return res.status(404).send("Professor não encontrado.");
    }
    res.send("Dados do professor atualizados com sucesso.");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:matricula", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM Professor WHERE Matricula=$1", [req.params.matricula]);
    if (result.rowCount === 0) {
      return res.status(404).send("Professor não encontrado.");
    }
    res.send("Professor removido com sucesso.");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;