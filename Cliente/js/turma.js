import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/turmas';
const prefixo = 'turma-';
const campos = ['Codigo', 'Semestre', 'DataHora', 'Metodologia', 'Capacidade', 'FK_Disciplina_Codigo'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-turma');
  if (!div) return;
  montarFormulario();
  carregarTurmas();
});

function montarFormulario() {
  const div = document.getElementById('form-turma');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => {
    // Definindo tipos para campos numéricos e data
    let tipo = 'text';
    if (c === 'Capacidade') tipo = 'number';
    return criarInput(prefixo + c, c, tipo);
  }).join('') +
    `<button id="salvarTurma">Salvar</button><button id="carregarTurma">Carregar</button>`;

  document.getElementById('salvarTurma').onclick = salvarTurma;
  document.getElementById('carregarTurma').onclick = carregarTurmas;
}

async function carregarTurmas() {
  const turmas = await (await fetch(API_URL)).json();

  renderizarTabela(
    turmas,
    campos.map(c => c.toLowerCase()),
    (t) => `
      <button onclick='editarTurma(${JSON.stringify(t).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarTurma(${t.numero}, "${t.semestre}")'>Excluir</button>
    `,
    'tabela-turma'
  );
}

window.editarTurma = function(turma) {
  preencherFormulario(campos, turma, prefixo);
};

window.deletarTurma = function(codigo) {
  deletar(API_URL, codigo, true).then(carregarTurmas);
};

async function salvarTurma() {
  const turma = {};
  for (const campo of campos) {
    const el = document.getElementById(prefixo + campo);
    if (el) {
      const valor = el.type === 'number' ? Number(el.value) : el.value.trim();
      if ((typeof valor === 'string' && valor !== '') ||
          (typeof valor === 'number' && !isNaN(valor))) {
        turma[campo] = valor;
      }
    }
  }

  await salvarOuAtualizar(API_URL, 'Codigo', turma);
  limparFormulario(campos, prefixo);
  carregarTurmas();
}
