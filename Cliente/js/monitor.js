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

  document.getElementById('salvarMonitor').onclick = salvarMonitor;
  document.getElementById('carregarMonitor').onclick = carregarMonitores;
}

async function carregarMonitores() {
  const monitores = await (await fetch(API_URL)).json();

  renderizarTabela(monitores, campos.map(c => c.toLowerCase()),
    (m) => `
      <button onclick='editarMonitor(${JSON.stringify(m).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarMonitor("${m.codigo}")'>Excluir</button>
    `,
    'tabela-monitor'
  );
}

window.editarMonitor = function(monitor) {
  preencherFormulario(campos, monitor);
};

window.deletarMonitor = function(codigo) {
  deletar(API_URL, codigo);
  carregarMonitores();
};

async function salvarMonitor() {
  const monitor = {};
  for (const campo of campos) {
    const el = document.getElementById(campo);
    if (!el || el.value.trim() === '') {
      //alert('Preencha todos os campos antes de continuar.');
      //throw new Error('Campo vazio');
    }
    console.log(`Campo: ${campo}, ID encontrado:`, el, 'Valor:', el.value);
    if (el.type === 'number') {
      monitor[campo] = Number(el.value);
    } else {
      monitor[campo] = el.value.trim();
    }
  }

  await salvarOuAtualizar(API_URL, 'Codigo', monitor);
  limparFormulario(campos);
  carregarMonitores();
}
