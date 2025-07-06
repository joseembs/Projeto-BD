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

  document.getElementById('salvarDepartamento').onclick = salvarDepartamento;
  document.getElementById('carregarDepartamento').onclick = carregarDepartamentos;
}

async function carregarDepartamentos() {
  const departamentos = await (await fetch(API_URL)).json();

  renderizarTabela(departamentos, campos.map(c => c.toLowerCase()),
    (d) => `
      <button onclick='editarDepartamento(${JSON.stringify(d).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarDepartamento("${d.codigo}")'>Excluir</button>
    `,
    'tabela-departamento'
  );
}

window.editarDepartamento = function(departamento) {
  preencherFormulario(campos, departamento);
};

window.deletarDepartamento = function(codigo) {
  deletar(API_URL, codigo);
  carregarDepartamentos();
};

async function salvarDepartamento() {
  const departamento = {};
  for (const campo of campos) {
    const valor = document.getElementById(campo)?.value?.trim();
    if (!valor) {
      //console.error(`Campo ${campo} não preenchido.`);
      //alert('Preencha todos os campos antes de salvar.');
      //return;
    }
    departamento[campo] = valor;
  }

  await salvarOuAtualizar(API_URL, 'Codigo', departamento);
  limparFormulario(campos);
  carregarDepartamentos();
}
