import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/professores';
const campos = ['Matricula', 'CPF', 'Nome', 'Email', 'DataNascimento', 'Idade', 'Status', 'Salario'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-professor');
  if (!div) return;
  montarFormulario();
  carregarProfessores();
});


function montarFormulario() {
  const div = document.getElementById('form-professor');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => criarInput(c, c)).join('') +
      `<button id="salvarProfessor">Salvar</button><button id="carregarProfessor">Carregar</button>`;

  document.getElementById('salvarProfessor').onclick = salvar;
  document.getElementById('carregarProfessor').onclick = carregarProfessores;
}

async function carregarProfessores() {
  const professores = await (await fetch(API_URL)).json();

  renderizarTabela(professores, campos.map(c => c.toLowerCase()),
    (p) => `
      <button onclick='editar(${JSON.stringify(p).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarProfessor("${p.matricula}")'>Excluir</button>
    `,
    'tabela-professor'
  );
}

window.editar = function(professor) {
  preencherFormulario(campos, professor);
};

window.deletarProfessor = function(matricula) {
  deletar(API_URL, matricula);
  carregarProfessores();
};

async function salvar() {
  const professor = {};
  campos.forEach(c => {
    const el = document.getElementById(c);
    if(el) {
      if(el.type === 'number') {
        professor[c] = el.value === '' ? null : Number(el.value);
      } else {
        professor[c] = el.value;
      }
    }
  });

  await salvarOuAtualizar(API_URL, 'Matricula', professor);
  limparFormulario(campos);
  carregarProfessores();
}
