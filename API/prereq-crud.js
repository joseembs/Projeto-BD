const express = require("express");
const router = express.Router();
const pool = require("./db-setup");
const Joi = require("joi");

const preRequisitosSchema = Joi.object({
  fk_Disciplina: Joi.string().required(),
  fk_Disciplina_Requisito: Joi.string().required(),
});

router.post("/", async (req, res) => {
  const { error } = preRequisitosSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { fk_Disciplina, fk_Disciplina_Requisito } = req.body;

  try {
    await pool.query(
      "INSERT INTO PreRequisitos (fk_Disciplina, fk_Disciplina_Requisito) VALUES ($1, $2)",
      [fk_Disciplina, fk_Disciplina_Requisito]
    );
    res.status(201).send("Pré-requisito adicionado com sucesso.");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM PreRequisitos");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:disciplina", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM PreRequisitos WHERE fk_Disciplina = $1",
      [req.params.disciplina]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Nenhum pré-requisito encontrado para esta disciplina.");
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/requisito/:disciplina", async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM PreRequisitos WHERE fk_Disciplina_Requisito = $1",
        [req.params.disciplina]
      );
      if (result.rows.length === 0) {
        return res.status(404).send("Nenhuma disciplina encontrada que tenha esta como pré-requisito.");
      }
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

router.delete("/", async (req, res) => {
  const { error } = preRequisitosSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { fk_Disciplina, fk_Disciplina_Requisito } = req.body;

  try {
    const result = await pool.query(
      "DELETE FROM PreRequisitos WHERE fk_Disciplina = $1 AND fk_Disciplina_Requisito = $2",
      [fk_Disciplina, fk_Disciplina_Requisito]
    );
    if (result.rowCount === 0) {
      return res.status(404).send("Nenhum pré-requisito encontrado para excluir.");
    }
    res.send("Pré-requisito removido com sucesso.");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;