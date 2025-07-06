import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/professores';
const prefixo = 'professor-';
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
  div.innerHTML = campos.map(c => {
    // Pode adaptar tipos, por exemplo, Idade e Salario como number
    let tipo = 'text';
    if (c === 'Idade' || c === 'Salario') tipo = 'number';
    else if (c === 'DataNascimento') tipo = 'date';
    return criarInput(prefixo + c, c, tipo);
  }).join('') +
    `<button id="salvarProfessor">Salvar</button><button id="carregarProfessor">Carregar</button>`;

  document.getElementById('salvarProfessor').onclick = salvarProfessor;
  document.getElementById('carregarProfessor').onclick = carregarProfessores;
}

async function carregarProfessores() {
  const professores = await (await fetch(API_URL)).json();

  renderizarTabela(
    professores,
    campos.map(c => c.toLowerCase()),
    (p) => `
      <button onclick='editarProfessor(${JSON.stringify(p).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarProfessor("${p.matricula}")'>Excluir</button>
    `,
    'tabela-professor'
  );
}

window.editarProfessor = function(professor) {
  preencherFormulario(campos, professor, prefixo);
};

window.deletarProfessor = function(matricula) {
  deletar(API_URL, matricula, true).then(carregarProfessores);
};

async function salvarProfessor() {
  const professor = {};
  for (const campo of campos) {
    const el = document.getElementById(prefixo + campo);
    if (el) {
      const valor = el.type === 'number' ? Number(el.value) : el.value.trim();
      if ((typeof valor === 'string' && valor !== '') ||
          (typeof valor === 'number' && !isNaN(valor))) {
        professor[campo] = valor;
      }
    }
  }

  await salvarOuAtualizar(API_URL, 'Matricula', professor);
  limparFormulario(campos, prefixo);
  carregarProfessores();
}
