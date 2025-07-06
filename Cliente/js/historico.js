import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/historico';
const prefixo = 'historico-';
const campos = [
  'fk_Turma_Numero',
  'fk_Turma_Semestre',
  'fk_Aluno_Matricula',
  'Status',
  'Mencao'
];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-historico');
  if (!div) return;
  montarFormulario();
  carregarHistorico();
});

function montarFormulario() {
  const div = document.getElementById('form-historico');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => {
    const tipo = ['fk_Turma_Numero'].includes(c) ? 'number' : 'text';
    return criarInput(prefixo + c, c, tipo);
  }).join('') +
    `<button id="salvarHistorico">Salvar</button><button id="carregarHistorico">Carregar</button>`;

  document.getElementById('salvarHistorico').onclick = salvarHistorico;
  document.getElementById('carregarHistorico').onclick = carregarHistorico;
}

async function carregarHistorico() {
  const lista = await (await fetch(API_URL)).json();

  renderizarTabela(
    lista,
    campos.map(c => c.toLowerCase()),
    (p) => `
      <button onclick='editarHistorico(${JSON.stringify(p).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarHistorico("${p.fk_Turma_Numero}", "${p.fk_Turma_Semestre}", "${p.fk_Aluno_Matricula}")'>Excluir</button>
    `,
    'tabela-historico'
  );
}

window.editarHistorico = function (item) {
  preencherFormulario(campos, item, prefixo);
};

window.deletarHistorico = async function (fk_Turma_Numero, fk_Turma_Semestre, fk_Aluno_Matricula) {
  if (!confirm('Deseja realmente excluir este histórico?')) return;
  await fetch(`${API_URL}/${fk_Turma_Numero}/${fk_Turma_Semestre}/${fk_Aluno_Matricula}`, {
    method: 'DELETE'
  });
  carregarHistorico();
};

async function salvarHistorico() {
  const historico = {};
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
      historico[campo] = valor;
    }
  }

  // Verificação obrigatória das chaves primárias
  if (
    historico.fk_Turma_Numero === undefined ||
    !historico.fk_Turma_Semestre ||
    !historico.fk_Aluno_Matricula
  ) {
    alert('Todos os campos da chave primária são obrigatórios');
    return;
  }

  const urlBusca = `${API_URL}/${historico.fk_Turma_Numero}/${historico.fk_Turma_Semestre}/${historico.fk_Aluno_Matricula}`;
  const res = await fetch(urlBusca);

  if (res.ok) {
    await fetch(urlBusca, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(historico)
    });
  } else {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(historico)
    });
  }

  limparFormulario(campos, prefixo);
  carregarHistorico();
}
