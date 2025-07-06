import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/departamentos';
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
  div.innerHTML = campos.map(c => criarInput(c, c)).join('') +
    `<button id="salvarDepartamento">Salvar</button><button id="carregarDepartamento">Carregar</button>`;

  document.getElementById('salvarDepartamento').onclick = salvar;
  document.getElementById('carregarDepartamento').onclick = carregarDepartamentos;
}

async function carregarDepartamentos() {
  const departamentos = await (await fetch(API_URL)).json();

  renderizarTabela(departamentos, campos.map(c => c.toLowerCase()),
    (d) => `
      <button onclick='editar(${JSON.stringify(d).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarDepartamento("${d.codigo}")'>Excluir</button>
    `,
    'tabela-departamento'
  );
}

window.editar = function(departamento) {
  preencherFormulario(campos, departamento);
};

window.deletarDepartamento = function(codigo) {
  deletar(API_URL, codigo);
  carregarDepartamentos();
};

async function salvar() {
  const departamento = {};
  campos.forEach(c => {
    departamento[c] = document.getElementById(c).value;
  });

  await salvarOuAtualizar(API_URL, 'Codigo', departamento);
  limparFormulario(campos);
  carregarDepartamentos();
}
