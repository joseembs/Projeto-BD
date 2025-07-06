import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/departamentos';
const prefixo = 'departamento-';
const campos = ['Codigo', 'Nome', 'Telefone'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-departamento');
  if (!div) return;
  montarFormulario();
  carregarDepartamentos();
});

function montarFormulario() {
  const div = document.getElementById('form-departamento');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => criarInput(prefixo + c, c)).join('') +
    `<button id="salvarDepartamento">Salvar</button><button id="carregarDepartamento">Carregar</button>`;

  document.getElementById('salvarDepartamento').onclick = salvarDepartamento;
  document.getElementById('carregarDepartamento').onclick = carregarDepartamentos;
}

async function carregarDepartamentos() {
  const departamentos = await (await fetch(API_URL)).json();

  renderizarTabela(
    departamentos,
    campos.map(c => c.toLowerCase()),
    (d) => `
      <button onclick='editarDepartamento(${JSON.stringify(d).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarDepartamento("${d.codigo}")'>Excluir</button>
    `,
    'tabela-departamento'
  );
}

window.editarDepartamento = function (departamento) {
  preencherFormulario(campos, departamento, prefixo);
};

window.deletarDepartamento = function (codigo) {
  deletar(API_URL, codigo, true).then(carregarDepartamentos);
};

async function salvarDepartamento() {
  const departamento = {};
  for (const campo of campos) {
    const el = document.getElementById(prefixo + campo);
    if (el) {
      const valor = el.type === 'number' ? Number(el.value) : el.value.trim();
      if ((typeof valor === 'string' && valor !== '') ||
          (typeof valor === 'number' && !isNaN(valor))) {
        departamento[campo] = valor;
      }
    }
  }

  await salvarOuAtualizar(API_URL, 'Codigo', departamento);
  limparFormulario(campos, prefixo);
  carregarDepartamentos();
}
