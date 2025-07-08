import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/existeem';
const prefixo = 'existeem-';
const campos = ['fk_Local_Codigo', 'fk_Turma_Codigo'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-existeem');
  if (!div) return;
  montarFormulario();
  carregarExisteEm();
});

function montarFormulario() {
  const div = document.getElementById('form-existeem');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => {
    const tipo = (c === 'fk_Turma_Numero') ? 'number' : 'text';
    return criarInput(prefixo + c, c);
  }).join('') +
    `<button id="salvarExisteEm">Salvar</button><button id="carregarExisteEm">Carregar</button>`;

  document.getElementById('salvarExisteEm').onclick = salvarExisteEm;
  document.getElementById('carregarExisteEm').onclick = carregarExisteEm;
}

async function carregarExisteEm() {
  const lista = await (await fetch(API_URL)).json();
  renderizarTabela(
    lista,
    campos.map(c => c.toLowerCase()),
    (item) => `
      <button onclick='editarExisteEm(${JSON.stringify(item).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarExisteEm("${item.fk_local_codigo}", "${item.fk_turma_codigo}")'>Excluir</button>
    `,
    'tabela-existeem'
  );
}

window.editarExisteEm = function (item) {
  preencherFormulario(campos, item, prefixo);
};

window.deletarExisteEm = async function (fk_Local_Codigo, fk_Turma_Codigo) {
  deletar(API_URL, `${fk_Local_Codigo}/${fk_Turma_Codigo}`, true).then(carregarExisteEm);
};

async function salvarExisteEm() {
  const registro = {};
  for (const campo of campos) {
    const el = document.getElementById(prefixo + campo);
    if (el) {
      const valor = el.value.trim();
      if (valor === '') continue;
      registro[campo] = valor;
    }
  }

  if (!registro.fk_Local_Codigo || !registro.fk_Turma_Codigo) {
    alert('Todos os campos são obrigatórios');
    return;
  }

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registro),
  });

  limparFormulario(campos, prefixo);
  carregarExisteEm();
}

