const express = require("express");
const router = express.Router();
const pool = require("../db-setup");
const Joi = require("joi");

const filaSchema = Joi.object({
  Codigo: Joi.string().required(),
  Prioridade: Joi.number().integer().required(),
  Posicao: Joi.number().integer().required(),
  Periodo: Joi.string().required(),
  Preferencia: Joi.number().integer().required(),
  fk_Aluno_Matricula: Joi.string().length(9).optional(),
  fk_Turma_Codigo: Joi.string().optional(),
});

const filaPatchSchema = filaSchema.fork(
  ["Codigo"],
  (field) => field.optional()
).fork(
  ["Prioridade", "Posicao", "Periodo", "Preferencia", "fk_Aluno_Matricula", "fk_Turma_Codigo"],
  (field) => field.optional()
);

router.post("/", async (req, res, next) => {
  const { error } = filaSchema.validate(req.body);
  if (error) return next(error);

  const { Codigo, Prioridade, Posicao, Periodo, Preferencia, fk_Aluno_Matricula, fk_Turma_Codigo } = req.body;

  try {
    const podeMatricular = await verificarPreRequisitos(pool, fk_Aluno_Matricula, fk_Turma_Codigo);
    if (!podeMatricular) {
      return res.status(400).send("Aluno não cumpre os pré-requisitos para esta turma.");
    }

    await pool.query(
      `INSERT INTO FilaSeMatricula 
       (Codigo, Prioridade, Posicao, Periodo, Preferencia, fk_Aluno_Matricula, fk_Turma_Codigo) 
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [Codigo, Prioridade, Posicao, Periodo, Preferencia, fk_Aluno_Matricula, fk_Turma_Codigo]
    );

    reorganizarFilaDaTurma(req.body.fk_Turma_Codigo)

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

  for (const key of ["Prioridade", "Posicao", "Periodo", "Preferencia", "fk_Aluno_Matricula", "fk_Turma_Codigo"]) {
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

    reorganizarFilaDaTurma(req.body.fk_Turma_Codigo)

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

async function verificarPreRequisitos(pool, matricula, codigoTurma) {
  // Obter a disciplina da turma
  const turma = await pool.query(
    `SELECT fk_Disciplina_Codigo FROM Turma WHERE Codigo = $1`,
    [codigoTurma]
  );
  if (turma.rows.length === 0) throw new Error('Turma não encontrada');
  const disciplinaCodigo = turma.rows[0].fk_disciplina_codigo;

  // Obter os pré-requisitos da disciplina
  const prereqs = await pool.query(
    `SELECT fk_Disciplina_Requisito FROM PreRequisitos WHERE fk_Disciplina = $1`,
    [disciplinaCodigo]
  );
  const codigosRequisitos = prereqs.rows.map(r => r.fk_disciplina_requisito);

  if (codigosRequisitos.length === 0) return true; // Sem pré-requisitos

  // Verificar se o aluno foi aprovado nas disciplinas requisito
  const historico = await pool.query(
    `SELECT T.fk_Disciplina_Codigo AS disciplina, H.Mencao
     FROM HistoricoFazParte H
     JOIN Turma T ON H.fk_Turma_Codigo = T.Codigo
     WHERE H.fk_Aluno_Matricula = $1`,
    [matricula]
  );

  const mencoesPorDisciplina = {};
  historico.rows.forEach(({ disciplina, mencao }) => {
    if (!mencoesPorDisciplina[disciplina]) {
      mencoesPorDisciplina[disciplina] = [];
    }
    mencoesPorDisciplina[disciplina].push(mencao);
  });

  for (const codigo of codigosRequisitos) {
    const mencoes = mencoesPorDisciplina[codigo] || [];
    if (!mencoes.some(m => mencoesValidas.includes(m))) {
      return false; // Não cumpriu o requisito
    }
  }

  return true;
}

async function reorganizarFilaDaTurma(codigo) {
  try {
    // Buscar entradas da Fila da turma com dados do aluno
    const { rows: filas } = await pool.query(`
      SELECT f.*, a.Integralizacao, a.IRA
      FROM FilaSeMatricula f
      LEFT JOIN Aluno a ON f.fk_Aluno_Matricula = a.Matricula
      WHERE f.fk_Turma_Codigo = $1
    `, [codigo]);

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

    console.log(`Fila da turma ${codigo} reorganizada.`);
  } catch (err) {
    console.error('Erro ao reorganizar fila:', err);
  }
}

router.post("/matricular", async (req, res) => {
  const { codigo_turma } = req.body;
  if (!codigo_turma) {
    return res.status(400).send("Código da turma é obrigatório.");
  }

  try {
    await pool.query(`CALL matricular_alunos($1)`, [codigo_turma]);
    res.status(200).send("Alunos matriculados com sucesso.");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;