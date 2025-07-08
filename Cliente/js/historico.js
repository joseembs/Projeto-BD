import {
  renderizarTabela,
  criarInput,
  preencherFormulario,
  limparFormulario,
  deletar
} from './crudBase.js';

const API_URL = 'http://localhost:3000/historico';
const prefixo = 'historico-';
const campos = [
  'fk_Turma_Codigo',
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
  div.innerHTML = campos.map(c => criarInput(prefixo + c, c)).join('') +
    `<button id="salvarHistorico">Salvar</button><button id="carregarHistorico">Carregar</button>`;

  document.getElementById('salvarHistorico').onclick = salvarHistorico;
  document.getElementById('carregarHistorico').onclick = carregarHistorico;
}

async function carregarHistorico() {
  const lista = await fetch(API_URL).then(r => r.json()).catch(() => []);

  renderizarTabela(
    lista,
    campos.map(c => c.toLowerCase()),
    (p) => `
      <button onclick='editarHistorico(${JSON.stringify(p).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarHistorico("${p.fk_turma_codigo}", "${p.fk_aluno_matricula}")'>Excluir</button>
    `,
    'tabela-historico'
  );
}

window.editarHistorico = function (item) {
  preencherFormulario(campos, item, prefixo);
};

window.deletarHistorico = async function (fk_Turma_Codigo, fk_Aluno_Matricula) {
  deletar(API_URL, `${fk_Turma_Codigo}/${fk_Aluno_Matricula}`, true).then(carregarHistorico);
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

  const urlBusca = `${API_URL}/${historico.fk_Turma_Codigo}/${historico.fk_Aluno_Matricula}`;
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
