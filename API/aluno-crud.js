const express = require("express");
const router = express.Router();
const pool = require("./db-setup");
const fs = require('fs');

router.post("/", async (req, res) => {
  const {
    Matricula,
    CPF,
    Nome,
    Email,
    DataNascimento,
    Idade,
    Status,
    IRA,
    Integralizacao,
    FotoPerfil,
  } = req.body;

  if (FotoPerfil){
    if (typeof FotoPerfil === 'string') {
      FotoPerfil = Buffer.from(FotoPerfil, "base64");
    }
  } else {
    FotoPerfil = fs.readFileSync("../foto_padrao.png");
  }

  try {
    await pool.query(
      "INSERT INTO Aluno (Matricula, CPF, Nome, Email, DataNascimento, Idade, Status, IRA, Integralizacao, FotoPerfil) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
      [Matricula, CPF, Nome, Email, DataNascimento, Idade, Status, IRA, Integralizacao, FotoPerfil]
    );
    res.status(201).send("Aluno cadastrado com sucesso");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Aluno");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:matricula", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Aluno WHERE Matricula = $1",
      [req.params.matricula]
    );
    if (result.rows.length === 0)
      return res.status(404).send("Nenhum aluno encontrado com essa matrícula");
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:matricula", async (req, res) => {
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
    res.status(400).json({ error: err.message });
  }
});

router.put("/:matricula/foto", async (req, res) => {
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
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:matricula", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM Aluno WHERE Matricula=$1",
      [req.params.matricula]
    );
    if (result.rowCount === 0)
      return res.status(404).send("Nenhum aluno encontrado com essa matrícula");
    res.send(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;