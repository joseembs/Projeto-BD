import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/prereqs';
const campos = ['fk_Disciplina', 'fk_Disciplina_Requisito'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-prerequisitos');
  if (!div) return;
  montarFormulario();
  carregarPreRequisito();
});

function montarFormulario() {
  const div = document.getElementById('form-prerequisitos');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => criarInput(c, c)).join('') +
      `<button id="salvarPreRequisito">Salvar</button><button id="carregarPreRequisito">Carregar</button>`;

  document.getElementById('salvarPreRequisito').onclick = salvarPreRequisito;
  document.getElementById('carregarPreRequisito').onclick = carregarPreRequisito;
}

async function carregarPreRequisito() {
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

async function salvarPreRequisito() {
  const prereq = {};

 for (const campo of campos) {
    const valor = document.getElementById(campo)?.value?.trim();
    if (!valor) {
      alert('Preencha todos os campos antes de salvar.');
      return;
    }
    prereq[campo] = valor;
  }

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prereq)
    });

    limparFormulario(campos);
    carregarPreRequisito();
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
  carregarPreRequisito();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    montarFormulario();
    carregar();
  });
}
