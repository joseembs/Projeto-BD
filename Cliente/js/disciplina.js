import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/disciplinas';
const campos = ['Codigo', 'Nome', 'CargaHoraria', 'fk_Departamento_Codigo'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-disciplina');
  if (!div) return;
  montarFormulario();
  carregarDisciplinas();
});

function montarFormulario() {
  const div = document.getElementById('form-disciplina');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => criarInput(c, c)).join('') +
    `<button id="salvarDisciplina">Salvar</button><button id="carregarDisciplina">Carregar</button>`;

  document.getElementById('salvarDisciplina').onclick = salvar;
  document.getElementById('carregarDisciplina').onclick = carregarDisciplinas;
}

async function carregarDisciplinas() {
  const disciplinas = await (await fetch(API_URL)).json();

  renderizarTabela(disciplinas, campos.map(c => c.toLowerCase()),
    (d) => `
      <button onclick='editar(${JSON.stringify(d).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarDisciplina("${d.codigo}")'>Excluir</button>
    `,
    'tabela-disciplina'
  );
}

window.editar = function(disciplina) {
  preencherFormulario(campos, disciplina);
};

window.deletarDisciplina = function(codigo) {
  deletar(API_URL, codigo);
  carregarDisciplinas();
};

async function salvar() {
  const disciplina = {};
  campos.forEach(c => {
    disciplina[c] = document.getElementById(c).value;
  });

  await salvarOuAtualizar(API_URL, 'Codigo', disciplina);
  limparFormulario(campos);
  carregarDisciplinas();
}
