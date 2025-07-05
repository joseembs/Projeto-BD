const express = require("express");
const router = express.Router();
const pool = require("./db-setup");
const Joi = require("joi");


const coordenadorSchema = Joi.object({
  Codigo: Joi.string().required(),
  BonusSalarial: Joi.number().precision(2).optional(),
  fk_Professor_Matricula: Joi.string().required(),
});

const coordenadorPatchSchema = coordenadorSchema.fork(
  Object.keys(coordenadorSchema.describe().keys),
  (field) => field.optional()
);


router.post("/", async (req, res) => {
  const { error } = coordenadorSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { Codigo, BonusSalarial, fk_Professor_Matricula } = req.body;

  try {
    await pool.query(
      "INSERT INTO Coordenador (Codigo, BonusSalarial, fk_Professor_Matricula) VALUES ($1, $2, $3)",
      [Codigo, BonusSalarial, fk_Professor_Matricula]
    );
    res.status(201).send("Coordenador criado com sucesso.");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Coordenador");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:codigo", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Coordenador WHERE Codigo = $1", [req.params.codigo]);
    if (result.rows.length === 0) {
      return res.status(404).send("Coordenador não encontrado.");
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.patch("/:codigo", async (req, res) => {
  const { error } = coordenadorPatchSchema.validate(req.body);
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

  valores.push(req.params.codigo);

  try {
    const result = await pool.query(
      `UPDATE Coordenador SET ${campos.join(", ")} WHERE Codigo=$${i}`,
      valores
    );
    if (result.rowCount === 0) {
      return res.status(404).send("Coordenador não encontrado.");
    }
    res.send("Dados do coordenador atualizados com sucesso.");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:codigo", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM Coordenador WHERE Codigo=$1", [req.params.codigo]);
    if (result.rowCount === 0) {
      return res.status(404).send("Coordenador não encontrado.");
    }
    res.send("Coordenador removido com sucesso.");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;