const express = require("express");
const router = express.Router();
const pool = require("../db-setup");
const Joi = require("joi");

const existeEmSchema = Joi.object({
  fk_Local_Codigo: Joi.string().required(),
  fk_Turma_Codigo: Joi.string().required(),
});

const existeEmPatchSchema = existeEmSchema.fork(
  ["fk_Local_Codigo", "fk_Turma_Codigo"],
  (field) => field.forbidden()
);

router.post("/", async (req, res, next) => {
  const { error } = existeEmSchema.validate(req.body);
  if (error) return next(error);

  const { fk_Local_Codigo, fk_Turma_Codigo } = req.body;

  try {
    await pool.query(
      `INSERT INTO ExisteEm (fk_Local_Codigo, fk_Turma_COdigo) VALUES ($1, $2)`,
      [fk_Local_Codigo, fk_Turma_Codigo]
    );
    res.status(201).send("Relação criada com sucesso");
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM ExisteEm");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:fk_Local_Codigo/:fk_Turma_Codigo", async (req, res, next) => {
  const { fk_Local_Codigo, fk_Turma_Codigo } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM ExisteEm WHERE fk_Local_Codigo = $1 AND fk_Turma_Codigo = $2`,
      [fk_Local_Codigo, fk_Turma_Codigo]
    );
    if (result.rows.length === 0)
      return res.status(404).send("Relação não encontrada");
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:fk_Local_Codigo/:fk_Turma_Codigo", async (req, res, next) => {
  // Como não há outros campos, bloqueamos atualização
  return res.status(400).send("Atualização não suportada para esta tabela");
});

router.delete("/:fk_Local_Codigo/:fk_Turma_Codigo", async (req, res, next) => {
  const { fk_Local_Codigo, fk_Turma_Codigo } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ExisteEm WHERE fk_Local_Codigo = $1 AND fk_Turma_Codigo = $2`,
      [fk_Local_Codigo, fk_Turma_Codigo]
    );
    if (result.rowCount === 0)
      return res.status(404).send("Nenhuma relação encontrada com essas chaves para exclusão");
    res.status(200).send("Relação deletada com sucesso");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
