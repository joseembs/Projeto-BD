import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/prereqs';
const campos = ['fk_Disciplina', 'fk_Disciplina_Requisito'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-prerequisitos');
  if (!div) return;
  montarFormulario();
  carregar();
});

function montarFormulario() {
  const div = document.getElementById('form-prerequisitos');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => criarInput(c, c)).join('') +
      `<button id="salvarPrereq">Salvar</button><button id="carregarPrereq">Carregar</button>`;

  document.getElementById('salvarPrereq').onclick = salvar;
  document.getElementById('carregarPrereq').onclick = carregar;
}

async function carregar() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(await res.text());
    const lista = await res.json();

    renderizarTabela(lista, ['fk_disciplina', 'fk_disciplina_requisito'], (item) => `
      <button onclick='editarPreRequisito(${JSON.stringify(item)})'>Editar</button>
      <button onclick='deletarPreRequisito(${JSON.stringify(item)})'>Excluir</button>
    `, 'tabela-prerequisitos');
  } catch (err) {
    console.error('Erro ao carregar pré-requisitos:', err);
  }
}

async function salvar() {
  const objeto = {
    fk_Disciplina: document.getElementById('fk_Disciplina').value,
    fk_Disciplina_Requisito: document.getElementById('fk_Disciplina_Requisito').value
  };

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(objeto)
    });

    limparFormulario(campos);
    carregar();
  } catch (err) {
    console.error('Erro ao salvar pré-requisito:', err);
  }
}

window.editarPreRequisito = function (item) {
  preencherFormulario(campos, item);
};

window.deletarPreRequisito = async function (item) {
  try {
    await deletar(API_URL, '', false); // força a requisição com body
    await fetch(API_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fk_Disciplina: item.fk_disciplina,
        fk_Disciplina_Requisito: item.fk_disciplina_requisito
      })
    });
    carregar();
  } catch (err) {
    console.error('Erro ao deletar pré-requisito:', err);
  }
};


// Execução inicial
if (document.readyState !== 'loading') {
  montarFormulario();
  carregar();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    montarFormulario();
    carregar();
  });
}
