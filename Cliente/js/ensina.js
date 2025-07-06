import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/ensina';
const campos = ['Professor', 'Turma', 'Semestre'];

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

  document.getElementById('salvarEnsina').onclick = salvar;
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

async function salvar() {
  const objeto = {
    fk_Prof_Coord_Matricula: document.getElementById('fk_Prof_Coord_Matricula').value,
    fk_Turma_Numero: parseInt(document.getElementById('fk_Turma_Numero').value),
    fk_Turma_Semestre: document.getElementById('fk_Turma_Semestre').value,
  };

  await salvarOuAtualizar(API_URL, 'fk_Prof_Coord_Matricula', objeto); // A chave primária é composta, então tratamos apenas a principal
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
