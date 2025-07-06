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

  document.getElementById('salvarProfessor').onclick = salvarProfessor;
  document.getElementById('carregarProfessor').onclick = carregarProfessores;
}

async function carregarProfessores() {
  const professores = await (await fetch(API_URL)).json();

  renderizarTabela(professores, campos.map(c => c.toLowerCase()),
    (p) => `
      <button onclick='editarProfessor(${JSON.stringify(p).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarProfessor("${p.matricula}")'>Excluir</button>
    `,
    'tabela-professor'
  );
}

window.editarProfessor = function(professor) {
  preencherFormulario(campos, professor);
};

window.deletarProfessor = function(matricula) {
  deletar(API_URL, matricula);
  carregarProfessores();
};

async function salvarProfessor() {
  const professor = {};
  for (const campo of campos) {
    const el = document.getElementById(campo);
    if (!el || el.value.trim() === '') {
      //alert('Preencha todos os campos antes de continuar.');
      //throw new Error('Campo vazio');
    }

    if (el.type === 'number') {
      professor[campo] = Number(el.value);
    } else {
      professor[campo] = el.value.trim();
    }
  }

  await salvarOuAtualizar(API_URL, 'Matricula', professor);
  limparFormulario(campos);
  carregarProfessores();
}
