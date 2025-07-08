const express = require("express");
const router = express.Router();
const pool = require("../db-setup");
const Joi = require("joi");

const localSchema = Joi.object({
  Codigo: Joi.string().required(),
  Campus: Joi.string().required(),
  Bloco: Joi.string().required(),
  Sala: Joi.string().required(),
});

const localPatchSchema = localSchema.fork(
  Object.keys(localSchema.describe().keys),
  (field) => field.optional()
);

router.post("/", async (req, res) => {
  const { error } = localSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { Codigo, Campus, Bloco, Sala } = req.body;

  try {
    await pool.query(
      "INSERT INTO Local (Codigo, Campus, Bloco, Sala) VALUES ($1, $2, $3, $4)",
      [Codigo, Campus, Bloco, Sala]
    );
    res.status(201).send("Local criado com sucesso.");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Local");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:codigo", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Local WHERE Codigo = $1", [req.params.codigo]);
    if (result.rows.length === 0) {
      return res.status(404).send("Local não encontrado.");
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:codigo", async (req, res) => {
  const { error } = localPatchSchema.validate(req.body);
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
      `UPDATE Local SET ${campos.join(", ")} WHERE Codigo=$${i}`,
      valores
    );
    if (result.rowCount === 0) {
      return res.status(404).send("Local não encontrado.");
    }
    res.send("Dados do local atualizados com sucesso.");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:codigo", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM Local WHERE Codigo=$1", [req.params.codigo]);
    if (result.rowCount === 0) {
      return res.status(404).send("Local não encontrado.");
    }
    res.send("Local removido com sucesso.");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;