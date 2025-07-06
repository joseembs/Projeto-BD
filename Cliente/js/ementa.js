import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/ementas';
const prefixo = 'ementa-';
const campos = ['Numero', 'Detalhes', 'Bibliografia', 'Topicos', 'Modulos', 'Ativa', 'fk_Disciplina_Codigo'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-ementa');
  if (!div) return;
  montarFormulario();
  carregarEmentas();
});

function montarFormulario() {
  const div = document.getElementById('form-ementa');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => criarInput(prefixo + c, c)).join('') +
    `<button id="salvarEmenta">Salvar</button><button id="carregarEmenta">Carregar</button>`;

  document.getElementById('salvarEmenta').onclick = salvarEmenta;
  document.getElementById('carregarEmenta').onclick = carregarEmentas;
}

async function carregarEmentas() {
  const ementas = await (await fetch(API_URL)).json();

  renderizarTabela(
    ementas,
    campos.map(c => c.toLowerCase()),
    (e) => `
      <button onclick='editarEmenta(${JSON.stringify(e).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarEmenta("${e.numero}", "${e.fk_disciplina_codigo}")'>Excluir</button>
    `,
    'tabela-ementa'
  );
}

window.editarEmenta = function (ementa) {
  preencherFormulario(campos, ementa, prefixo);
};

window.deletarEmenta = async function (numero, disciplina) {
  deletar(`${API_URL}/${numero}/${disciplina}`, '', false).then(carregarEmentas);
};

async function salvarEmenta() {
  const ementa = {};
  for (const campo of campos) {
    const el = document.getElementById(prefixo + campo);
    if (el) {
      const valor = el.type === 'number' ? Number(el.value) : el.value.trim();
      if ((typeof valor === 'string' && valor !== '') ||
          (typeof valor === 'number' && !isNaN(valor))) {
        ementa[campo] = valor;
      }
    }
  }

  const urlBusca = `${API_URL}/${ementa.Numero}/${ementa.fk_Disciplina_Codigo}`;
  const res = await fetch(urlBusca);

  if (res.ok) {
    await fetch(urlBusca, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ementa)
    });
  } else {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ementa)
    });
  }

  limparFormulario(campos, prefixo);
  carregarEmentas();
}
