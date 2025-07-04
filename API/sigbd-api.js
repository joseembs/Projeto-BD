const express = require("express");

const port = 3000;
const app = express();

app.use(express.json());

const professorRoutes = require("./professor-crud");
app.use("/professores", professorRoutes);

const alunoRoutes = require("./aluno-crud");
app.use("/alunos", alunoRoutes);

const turmaRoutes = require("./turma-crud");
app.use("/turmas", turmaRoutes);

const monitorRoutes = require("./monitor-crud");
app.use("/monitores", monitorRoutes);

// joga node API/sigbd-api.js no terminal para rodar
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});