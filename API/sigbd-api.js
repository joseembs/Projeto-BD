const express = require("express");
const errorHandler = require('./errorHandler');
const cors = require('cors');

const port = 3000;
const app = express();

app.use(cors());

app.use(express.json());

const crudModules = [
  { path: "/alunos", file: "aluno-crud" },
  { path: "/cursos", file: "curso-crud" },
  { path: "/departamentos", file: "departamento-crud" },
  { path: "/disciplinas", file: "disciplina-crud" },
  { path: "/ementas", file: "ementa-crud" },
  { path: "/ensina", file: "ensina-crud" },
  { path: "/existeem", file: "existeem-crud" },
  { path: "/fila", file: "fila-crud" },
  { path: "/historico", file: "historico-crud" },
  { path: "/locais", file: "local-crud" },
  { path: "/monitores", file: "monitor-crud" },
  { path: "/prereqs", file: "prereq-crud" },
  { path: "/professores", file: "professor-crud" },
  { path: "/turmas", file: "turma-crud" },
];

crudModules.forEach(({path, file}) => {
  app.use(path, require(`./cruds/${file}`));
});

// joga node API/sigbd-api.js no terminal para rodar
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// middleware para tratamento de erros, deve ser o último "use"
app.use(errorHandler);