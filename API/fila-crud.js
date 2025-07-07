const express = require("express");
const router = express.Router();
const pool = require("./db-setup");
const Joi = require("joi");

const filaSchema = Joi.object({
  Codigo: Joi.string().required(),
  Prioridade: Joi.number().integer().required(),
  Posicao: Joi.number().integer().required(),
  Periodo: Joi.string().required(),
  Preferencia: Joi.number().integer().required(),
  fk_Aluno_Matricula: Joi.string().length(9).optional(),
  fk_Turma_Numero: Joi.number().integer().optional(),
  fk_Turma_Semestre: Joi.string().optional(),
});

const filaPatchSchema = filaSchema.fork(
  ["Codigo"],
  (field) => field.forbidden()
).fork(
  ["Prioridade", "Posicao", "Periodo", "Preferencia", "fk_Aluno_Matricula", "fk_Turma_Numero", "fk_Turma_Semestre"],
  (field) => field.optional()
);

router.post("/", async (req, res, next) => {
  const { error } = filaSchema.validate(req.body);
  if (error) return next(error);

  const { Codigo, Prioridade, Posicao, Periodo, Preferencia, fk_Aluno_Matricula, fk_Turma_Numero, fk_Turma_Semestre } = req.body;

  try {
    await pool.query(
      `INSERT INTO FilaSeMatricula 
       (Codigo, Prioridade, Posicao, Periodo, Preferencia, fk_Aluno_Matricula, fk_Turma_Numero, fk_Turma_Semestre) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [Codigo, Prioridade, Posicao, Periodo, Preferencia, fk_Aluno_Matricula, fk_Turma_Numero, fk_Turma_Semestre]
    );

    reorganizarFilaDaTurma(req.body.fk_Turma_Numero, req.body.fk_Turma_Semestre)

    res.status(201).send("Posição na fila criada com sucesso");
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM FilaSeMatricula");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:Codigo", async (req, res, next) => {
  const { Codigo } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM FilaSeMatricula WHERE Codigo = $1",
      [Codigo]
    );
    if (result.rows.length === 0)
      return res.status(404).send("Posição na fila não encontrada");
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:Codigo", async (req, res, next) => {
  const { error } = filaPatchSchema.validate(req.body);
  if (error) return next(error);

  const campos = [];
  const valores = [];
  let idx = 1;

  for (const key of ["Prioridade", "Posicao", "Periodo", "Preferencia", "fk_Aluno_Matricula", "fk_Turma_Numero", "fk_Turma_Semestre"]) {
    if (key in req.body) {
      campos.push(`${key} = $${idx}`);
      valores.push(req.body[key]);
      idx++;
    }
  }
  if (campos.length === 0)
    return res.status(400).send("Nenhum campo para atualizar");

  valores.push(req.params.Codigo);

  try {
    const result = await pool.query(
      `UPDATE FilaSeMatricula SET ${campos.join(", ")} WHERE Codigo = $${idx}`,
      valores
    );
    if (result.rowCount === 0)
      return res.status(404).send("Posição na fila não encontrada para atualização");

    reorganizarFilaDaTurma(req.body.fk_Turma_Numero, req.body.fk_Turma_Semestre)

    res.send("Posição na fila atualizada com sucesso");
  } catch (err) {
    next(err);
  }
});

router.delete("/:Codigo", async (req, res, next) => {
  const { Codigo } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM FilaSeMatricula WHERE Codigo = $1",
      [Codigo]
    );
    if (result.rowCount === 0)
      return res.status(404).send("Posição na fila não encontrada para exclusão");
    res.status(200).send("Posição na fila deletada com sucesso");
  } catch (err) {
    next(err);
  }
});

async function reorganizarFilaDaTurma(numero, semestre) {
  try {
    // Buscar entradas da Fila da turma com dados do aluno
    const { rows: filas } = await pool.query(`
      SELECT f.*, a.Integralizacao, a.IRA
      FROM FilaSeMatricula f
      LEFT JOIN Aluno a ON f.fk_Aluno_Matricula = a.Matricula
      WHERE f.fk_Turma_Numero = $1 AND f.fk_Turma_Semestre = $2
    `, [numero, semestre]);

    if (filas.length === 0) return;

    // Ordenar por: Prioridade > Preferência > Integralização > IRA
    filas.sort((a, b) => {
      const priA = a.prioridade ?? 0;
      const priB = b.prioridade ?? 0;
      if (priA !== priB) return priB - priA;

      const prefA = a.preferencia ?? 0;
      const prefB = b.preferencia ?? 0;
      if (prefA !== prefB) return prefB - prefA;

      const intA = a.integralizacao ?? 0;
      const intB = b.integralizacao ?? 0;
      if (intA !== intB) return intB - intA;

      const iraA = a.ira ?? 0;
      const iraB = b.ira ?? 0;
      return iraB - iraA;
    });

    // Atualizar posições se necessário
    for (let i = 0; i < filas.length; i++) {
      const novaPosicao = i + 1;
      const entrada = filas[i];

      if (entrada.posicao !== novaPosicao) {
        await pool.query(`
          UPDATE FilaSeMatricula
          SET Posicao = $1
          WHERE Codigo = $2
        `, [novaPosicao, entrada.codigo]);
      }
    }

    console.log(`Fila da turma ${numero}/${semestre} reorganizada.`);
  } catch (err) {
    console.error('Erro ao reorganizar fila:', err);
  }
}

module.exports = router;