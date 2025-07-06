import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/prereqs';
const prefixo = 'prereq-';
const campos = ['fk_Disciplina_Codigo', 'fk_PreRequisito_Codigo'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-prerequisitos');
  if (!div) return;
  montarFormulario();
  carregarPreRequisitos();
});

function montarFormulario() {
  const div = document.getElementById('form-prerequisitos');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => criarInput(prefixo + c, c)).join('') +
    `<button id="salvarPreRequisito">Salvar</button><button id="carregarPreRequisito">Carregar</button>`;

  document.getElementById('salvarPreRequisito').onclick = salvarPreRequisito;
  document.getElementById('carregarPreRequisito').onclick = carregarPreRequisitos;
}

async function carregarPreRequisitos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(await res.text());
    const lista = await res.json();

    renderizarTabela(
      lista,
      campos.map(c => c.toLowerCase()),
      (item) => `
        <button onclick='editarPreRequisito(${JSON.stringify(item).replace(/"/g, '&quot;')})'>Editar</button>
        <button onclick='deletarPreRequisito(${JSON.stringify(item).replace(/"/g, '&quot;')})'>Excluir</button>
      `,
      'tabela-prerequisitos'
    );
  } catch (err) {
    console.error('Erro ao carregar pré-requisitos:', err);
  }
}

async function salvarPreRequisito() {
  const prereq = {};
  for (const campo of campos) {
    const el = document.getElementById(prefixo + campo);
    if (el) {
      const valor = el.type === 'number' ? Number(el.value) : el.value.trim();
      if ((typeof valor === 'string' && valor !== '') ||
          (typeof valor === 'number' && !isNaN(valor))) {
        prereq[campo] = valor;
      }
    }
  }

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prereq)
    });

    limparFormulario(campos, prefixo);
    carregarPreRequisitos();
  } catch (err) {
    console.error('Erro ao salvar pré-requisito:', err);
  }
}

window.editarPreRequisito = function (item) {
  preencherFormulario(campos, item, prefixo);
};

window.deletarPreRequisito = async function (item) {
  try {
    await fetch(API_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fk_Disciplina_Codigo: item.fk_Disciplina_Codigo,
        fk_PreRequisito_Codigo: item.fk_PreRequisito_Codigo
      })
    });
    carregarPreRequisitos();
  } catch (err) {
    console.error('Erro ao deletar pré-requisito:', err);
  }
};
