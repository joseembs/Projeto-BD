import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/monitores';
const campos = ['Codigo', 'Tipo', 'Salario', 'fk_Aluno_Matricula'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-monitor');
  if (!div) return;
  montarFormulario();
  carregarMonitores();
});

function montarFormulario() {
  const div = document.getElementById('form-monitor');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => criarInput(c, c)).join('') +
    `<button id="salvarMonitor">Salvar</button><button id="carregarMonitor">Carregar</button>`;

  document.getElementById('salvarMonitor').onclick = salvar;
  document.getElementById('carregarMonitor').onclick = carregarMonitores;
}

async function carregarMonitores() {
  const monitores = await (await fetch(API_URL)).json();

  renderizarTabela(monitores, campos.map(c => c.toLowerCase()), 
    (m) => `
      <button onclick='editar(${JSON.stringify(m).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarMonitor("${m.codigo}")'>Excluir</button>
    `,
    'tabela-monitor'
  );
}

window.editar = function(monitor) {
  preencherFormulario(campos, monitor);
};

window.deletarMonitor = function(codigo) {
  deletar(API_URL, codigo);
  carregarMonitores();
};

async function salvar() {
  const monitor = {};
  campos.forEach(c => {
    const el = document.getElementById(c);
    if(el.type === 'number') {
      monitor[c] = el.value ? parseFloat(el.value) : null;
    } else {
      monitor[c] = el.value;
    }
  });

  await salvarOuAtualizar(API_URL, 'Codigo', monitor);
  limparFormulario(campos);
  carregarMonitores();
}
