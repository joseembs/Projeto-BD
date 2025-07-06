const express = require("express");
const router = express.Router();
const pool = require("./db-setup");
const Joi = require('joi');
const fs = require('fs');

const alunoSchema = Joi.object({
  Matricula: Joi.string().length(9).pattern(/^\d+$/).required(),
  CPF: Joi.string().length(11).pattern(/^\d+$/).required(),
  Nome: Joi.string().min(2).required(),
  Email: Joi.string().email().required(),
  DataDeNascimento: Joi.date().iso().optional(), // "YYYY-MM-DD"
  Idade: Joi.number().integer().min(0).optional(),
  Status: Joi.string().required(), // ou Joi.string().valid('Ativo', 'Inativo', 'Trancado').required()
  IRA: Joi.number().precision(4).min(0).max(5).optional(),
  Integralizacao: Joi.number().precision(2).min(0).max(100).optional(),
  FotoPerfil: Joi.string().base64().optional(), // ou Joi.binary().optional(),
});

const alunoPatchSchema = alunoSchema.fork(
  Object.keys(alunoSchema.describe().keys),
  field => field.optional()
);

router.post("/", async (req, res, next) => {
  const { error } = alunoSchema.validate(req.body);
  if (error) {
    return next(error);
  }

  const {
    Matricula,
    CPF,
    Nome,
    Email,
    DataDeNascimento,
    Idade,
    Status,
    IRA,
    Integralizacao,
    FotoPerfil,
  } = req.body;

  let FotoBuffer;
  if (FotoPerfil){
    if (typeof FotoPerfil === 'string') {
      FotoBuffer = Buffer.from(FotoPerfil, "base64");
    } else if (FotoPerfil instanceof Buffer) {
      FotoBuffer = FotoPerfil;
    }
  } else {
    const path = require('path');
    FotoBuffer = fs.readFileSync(path.join(__dirname, "../foto_padrao.png"));
  }

  try {
    await pool.query(
      "INSERT INTO Aluno (Matricula, CPF, Nome, Email, DataDeNascimento, Idade, Status, IRA, Integralizacao, FotoPerfil) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
      [Matricula, CPF, Nome, Email, DataDeNascimento, Idade, Status, IRA, Integralizacao, FotoBuffer]
    );
    res.status(201).send("Aluno cadastrado com sucesso");
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT *, encode(FotoPerfil, 'base64') AS FotoPerfil FROM Aluno");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:matricula", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Aluno WHERE Matricula = $1",
      [req.params.matricula]
    );
    if (result.rows.length === 0)
      return res.status(404).send("Nenhum aluno encontrado com essa matrícula");
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:matricula", async (req, res, next) => {
  const { error } = alunoPatchSchema.validate(req.body);
  if (error) {
    return next(error);
  }

  const campos = [];
  const valores = [];
  let i = 1;

  for (const key in req.body) {
    campos.push(`${key}=$${i}`);
    if (key === "FotoPerfil") {
      let FotoPerfil = req.body[key];
      if (typeof FotoPerfil === 'string') {
        FotoPerfil = Buffer.from(FotoPerfil, "base64");
      }
      valores.push(FotoPerfil);
    } else {
      valores.push(req.body[key]);
    }
    i++;
  }
  if (campos.length === 0) {
    return res.status(400).send("Nada para atualizar");
  }
  valores.push(req.params.matricula);

  try {
    const result = await pool.query(
      `UPDATE Aluno SET ${campos.join(", ")} WHERE Matricula=$${i}`,
      valores
    );
    if (result.rowCount === 0)
      return res.status(404).send("Nenhum aluno encontrado com essa matrícula");
    res.send("Dados atualizados com sucesso");
  } catch (err) {
    next(err);
  }
});

router.put("/:matricula/foto", async (req, res, next) => {
  let FotoPerfil = req.body;
  if (typeof FotoPerfil === 'string') {
    FotoPerfil = Buffer.from(FotoPerfil, "base64");
  }
  try {
    const result = await pool.query(
      "UPDATE Aluno SET FotoPerfil = $1 WHERE Matricula = $2",
      [FotoPerfil, req.params.matricula]
    );
    if (result.rowCount === 0)
      return res.status(404).send("Nenhum aluno encontrado com essa matrícula");
    res.status(201).send("Foto do aluno atualizada com sucesso");
  } catch (err) {
    next(err);
  }
});

router.delete("/:matricula", async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM Aluno WHERE Matricula=$1",
      [req.params.matricula]
    );
    if (result.rowCount === 0)
      return res.status(404).send("Nenhum aluno encontrado com essa matrícula");
    res.status(201).send("Aluno deletado com sucesso");
  } catch (err) {
    next(err);
  }
});

module.exports = router;