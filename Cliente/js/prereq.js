import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/prereqs';
const prefixo = 'prereq-';
const campos = ['fk_Disciplina', 'fk_Disciplina_Requisito'];

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
  const prereqs = await (await fetch(API_URL)).json();

  renderizarTabela(
    prereqs,
    campos.map(c => c.toLowerCase()),
    (item) => `
      <button onclick='editarPreRequisito(${JSON.stringify(item).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarPreRequisito("${item.fk_disciplina}", "${item.fk_disciplina_requisito}")'>Excluir</button>
    `,
    'tabela-prerequisitos'
  );
}

window.editarPreRequisito = function (item) {
  preencherFormulario(campos, item, prefixo);
};

window.deletarPreRequisito = function (disciplina, prerequisito) {
  deletar(API_URL, `${disciplina}/${prerequisito}`, true).then(carregarPreRequisitos);
};

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

  if (!prereq.fk_Disciplina || !prereq.fk_Disciplina_Requisito) {
    alert('Todos os campos são obrigatórios');
    return;
  }

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prereq)
  });

  limparFormulario(campos, prefixo);
  carregarPreRequisitos();
}
