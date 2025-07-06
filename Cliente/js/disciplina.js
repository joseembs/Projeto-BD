import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/disciplinas';
const prefixo = 'disciplina-';
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
  div.innerHTML = campos.map(c => {
    const tipo = (c === 'CargaHoraria') ? 'number' : 'text';
    return criarInput(prefixo + c, c, tipo);
  }).join('') +
    `<button id="salvarDisciplina">Salvar</button><button id="carregarDisciplina">Carregar</button>`;

  document.getElementById('salvarDisciplina').onclick = salvarDisciplina;
  document.getElementById('carregarDisciplina').onclick = carregarDisciplinas;
}

async function carregarDisciplinas() {
  const disciplinas = await (await fetch(API_URL)).json();

  renderizarTabela(
    disciplinas,
    campos.map(c => c.toLowerCase()),
    (d) => `
      <button onclick='editarDisciplina(${JSON.stringify(d).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarDisciplina("${d.codigo}")'>Excluir</button>
    `,
    'tabela-disciplina'
  );
}

window.editarDisciplina = function (disciplina) {
  preencherFormulario(campos, disciplina, prefixo);
};

window.deletarDisciplina = function (codigo) {
  deletar(API_URL, codigo, true).then(carregarDisciplinas);
};

async function salvarDisciplina() {
  const disciplina = {};
  for (const campo of campos) {
    const el = document.getElementById(prefixo + campo);
    if (el) {
      const valor = el.type === 'number' ? Number(el.value) : el.value.trim();
      if ((typeof valor === 'string' && valor !== '') ||
          (typeof valor === 'number' && !isNaN(valor))) {
        disciplina[campo] = valor;
      }
    }
  }

  await salvarOuAtualizar(API_URL, 'Codigo', disciplina);
  limparFormulario(campos, prefixo);
  carregarDisciplinas();
}
