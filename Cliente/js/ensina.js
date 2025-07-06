import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/ensina';
const campos = ['fk_Prof_Coord_Matricula', 'fk_Turma_Numero', 'fk_Turma_Semestre'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-ensina');
  if (!div) return;
  montarFormulario();
  carregarEnsina();
});

function montarFormulario() {
  const div = document.getElementById('form-ensina');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => criarInput(c, c)).join('') +
    `<button id="salvarEnsina">Salvar</button><button id="carregarEnsina">Carregar</button>`;

  document.getElementById('salvarEnsina').onclick = salvarEnsina;
  document.getElementById('carregarEnsina').onclick = carregarEnsina;
}

export async function carregarEnsina() {
  const lista = await fetch(API_URL).then(r => r.json()).catch(() => []);
  renderizarTabela(
    lista,
    ['fk_prof_coord_matricula', 'fk_turma_numero', 'fk_turma_semestre'],
    (item) => `
      <button onclick='editarEnsina(${JSON.stringify(item).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarEnsina(${JSON.stringify(item).replace(/"/g, '&quot;')})'>Excluir</button>
    `,
    'tabela-ensina'
  );
}

async function salvarEnsina() {
  const ensina = {};
  for (const campo of campos) {
    const valor = document.getElementById(campo)?.value?.trim();
    if (!valor) {
      alert('Preencha todos os campos antes de salvar.');
      return;
    }
    if (campo === 'fk_Turma_Numero') {
      valor = parseInt(valor);
    }
    ensina[campo] = valor;
  }

  // Montar a URL para buscar se o registro existe (por chave composta)
  const urlBusca = `${API_URL}/${ensina.fk_Prof_Coord_Matricula}/${ensina.fk_Turma_Numero}/${ensina.fk_Turma_Semestre}`;
  const res = await fetch(urlBusca);

  if (res.ok) {
    await fetch(urlBusca, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ensina)
    });
  } else {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ensina)
    });
  }

  limparFormulario(['fk_Prof_Coord_Matricula', 'fk_Turma_Numero', 'fk_Turma_Semestre']);
  carregarEnsina();
}

window.editarEnsina = function (item) {
  preencherFormulario(
    ['fk_Prof_Coord_Matricula', 'fk_Turma_Numero', 'fk_Turma_Semestre'],
    item
  );
};

window.deletarEnsina = async function (item) {
  await deletar(API_URL, '', false); // evita /undefined na URL

  await fetch(API_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });

  carregarEnsina();
};
