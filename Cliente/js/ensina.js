import { renderizarTabela, criarInput, deletar, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/ensina';
const prefixo = 'ensina-';
const campos = ['fk_Prof_Matricula', 'fk_Turma_Codigo'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-ensina');
  if (!div) return;
  montarFormulario();
  carregarEnsina();
});

function montarFormulario() {
  const div = document.getElementById('form-ensina');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => criarInput(prefixo + c, c)).join('') +
    `<button id="salvarEnsina">Salvar</button><button id="carregarEnsina">Carregar</button>`;

  document.getElementById('salvarEnsina').onclick = salvarEnsina;
  document.getElementById('carregarEnsina').onclick = carregarEnsina;
}

async function carregarEnsina() {
  const lista = await (await fetch(API_URL)).json();

  renderizarTabela(
    lista,
    campos.map(c => c.toLowerCase()),
    (item) => `
      <button onclick='editarEnsina(${JSON.stringify(item).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarEnsina("${item.fk_prof_matricula}", "${item.fk_turma_codigo}")'>Excluir</button>
    `,
    'tabela-ensina',
  );
}

window.editarEnsina = function (item) {
  preencherFormulario(campos, item, prefixo);
};

window.deletarEnsina = async function (matricula, codigoTurma) {
  deletar(API_URL, `${matricula}/${codigoTurma}`, true).then(carregarEnsina);
};


async function salvarEnsina() {
  const ensina = {};
  for (const campo of campos) {
    const el = document.getElementById(prefixo + campo);
    if (el) {
      const valor = el.type === 'number' ? Number(el.value) : el.value.trim();
      if ((typeof valor === 'string' && valor !== '') ||
          (typeof valor === 'number' && !isNaN(valor))) {
        ensina[campo] = valor;
      }
    }
  }

  if (!ensina.fk_Prof_Matricula || !ensina.fk_Turma_Codigo) {
    alert('Todos os campos são obrigatórios');
    return;
  }

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ensina)
  });

  limparFormulario(campos, prefixo);
  carregarEnsina();
}
