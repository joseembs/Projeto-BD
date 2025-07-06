import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/locais';
const campos = ['Codigo', 'Campus', 'Bloco', 'Sala'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-local');
  if (!div) return;
  montarFormulario();
  carregarLocais();
});

function montarFormulario() {
  const div = document.getElementById('form-local');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => criarInput(c, c)).join('') +
    `<button id="salvarLocal">Salvar</button><button id="carregarLocal">Carregar</button>`;

  document.getElementById('salvarLocal').onclick = salvarLocal;
  document.getElementById('carregarLocal').onclick = carregarLocais;
}

async function carregarLocais() {
  const locais = await (await fetch(API_URL)).json();

  renderizarTabela(locais, campos.map(c => c.toLowerCase()),
    (l) => `
      <button onclick='editarLocal(${JSON.stringify(l).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarLocal("${l.codigo}")'>Excluir</button>
    `,
    'tabela-local'
  );
}

window.editarLocal = function(local) {
  preencherFormulario(campos, local);
};

window.deletarLocal = function(codigo) {
  deletar(API_URL, codigo);
  carregarLocais();
};

async function salvarLocal() {
  const local = {};
  for (const campo of campos) {
    const valor = document.getElementById(campo)?.value?.trim();
    if (!valor) {
      //alert('Preencha todos os campos antes de continuar.');
      //throw new Error('Campo vazio');
    }
    local[campo] = valor;
  }

  await salvarOuAtualizar(API_URL, 'Codigo', local);
  limparFormulario(campos);
  carregarLocais();
}
