import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/fila';
const prefixo = 'fila-';
const campos = [
  'Codigo',
  'Prioridade',
  'Posicao',
  'Periodo',
  'Preferencia',
  'fk_Aluno_Matricula',
  'fk_Turma_Numero',
  'fk_Turma_Semestre'
];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-fila');
  if (!div) return;
  montarFormulario();
  carregarFila();
});

function montarFormulario() {
  const div = document.getElementById('form-fila');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => {
    const tipo = ['Prioridade', 'Posicao', 'Preferencia', 'fk_Turma_Numero'].includes(c) ? 'number' : 'text';
    return criarInput(prefixo + c, c, tipo);
  }).join('') +
    `<button id="salvarFila">Salvar</button><button id="carregarFila">Carregar</button>`;

  document.getElementById('salvarFila').onclick = salvarFila;
  document.getElementById('carregarFila').onclick = carregarFila;
}

async function carregarFila() {
  const lista = await (await fetch(API_URL)).json();

  renderizarTabela(
    lista,
    campos.map(c => c.toLowerCase()),
    (p) => `
      <button onclick='editarFila(${JSON.stringify(p).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarFila("${p.codigo}")'>Excluir</button>
    `,
    'tabela-fila'
  );
}

window.editarFila = function (item) {
  preencherFormulario(campos, item, prefixo);
};

window.deletarFila = async function (codigo) {
  if (!confirm('Deseja realmente excluir esta entrada da fila?')) return;
  await fetch(`${API_URL}/${codigo}`, { method: 'DELETE' });
  carregarFila();
};

async function salvarFila() {
  const fila = {};
  for (const campo of campos) {
    const el = document.getElementById(prefixo + campo);
    if (el) {
      let valor;
      if (el.type === 'number') {
        valor = Number(el.value);
        if (isNaN(valor)) continue;
      } else {
        valor = el.value.trim();
        if (valor === '') continue;
      }
      fila[campo] = valor;
    }
  }

  if (!fila.Codigo) {
    alert('O campo "Codigo" é obrigatório');
    return;
  }

  const urlBusca = `${API_URL}/${fila.Codigo}`;
  const res = await fetch(urlBusca);

  if (res.ok) {
    await fetch(urlBusca, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fila)
    });
  } else {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fila)
    });
  }

  limparFormulario(campos, prefixo);
  carregarFila();
}
