import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/monitores';
const prefixo = 'monitor-';
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
  div.innerHTML = campos.map(c => {
    const tipo = (c === 'Salario') ? 'number' : 'text';
    return criarInput(prefixo + c, c, tipo);
  }).join('') +
    `<button id="salvarMonitor">Salvar</button><button id="carregarMonitor">Carregar</button>`;

  document.getElementById('salvarMonitor').onclick = salvarMonitor;
  document.getElementById('carregarMonitor').onclick = carregarMonitores;
}

async function carregarMonitores() {
  const monitores = await (await fetch(API_URL)).json();

  renderizarTabela(
    monitores,
    campos.map(c => c.toLowerCase()),
    (m) => `
      <button onclick='editarMonitor(${JSON.stringify(m).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarMonitor("${m.codigo}")'>Excluir</button>
    `,
    'tabela-monitor'
  );
}

window.editarMonitor = function(monitor) {
  preencherFormulario(campos, monitor, prefixo);
};

window.deletarMonitor = function(codigo) {
  deletar(API_URL, codigo, true).then(carregarMonitores);
};

async function salvarMonitor() {
  const monitor = {};
  for (const campo of campos) {
    const el = document.getElementById(prefixo + campo);
    if (el) {
      const valor = el.type === 'number' ? Number(el.value) : el.value.trim();
      if ((typeof valor === 'string' && valor !== '') ||
          (typeof valor === 'number' && !isNaN(valor))) {
        monitor[campo] = valor;
      }
    }
  }

  await salvarOuAtualizar(API_URL, 'Codigo', monitor);
  limparFormulario(campos, prefixo);
  carregarMonitores();
}
