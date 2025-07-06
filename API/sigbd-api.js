const express = require("express");
const errorHandler = require('./errorHandler');
const cors = require('cors');

const port = 3000;
const app = express();

app.use(cors());

app.use(express.json());

const professorRoutes = require("./professor-crud");
app.use("/professores", professorRoutes);

const alunoRoutes = require("./aluno-crud");
app.use("/alunos", alunoRoutes);

const turmaRoutes = require("./turma-crud");
app.use("/turmas", turmaRoutes);

const monitorRoutes = require("./monitor-crud");
app.use("/monitores", monitorRoutes);

const cursoRoutes = require("./curso-crud");
app.use("/cursos", cursoRoutes);

const departamentoRoutes = require("./departamento-crud");
app.use("/departamentos", departamentoRoutes);

const disciplinaRoutes = require("./disciplina-crud");
app.use("/disciplinas", disciplinaRoutes);

const ementaRoutes = require("./ementa-crud");
app.use("/ementas", ementaRoutes);

// joga node API/sigbd-api.js no terminal para rodar
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// middleware para tratamento de erros, deve ser o último "use"
app.use(errorHandler);