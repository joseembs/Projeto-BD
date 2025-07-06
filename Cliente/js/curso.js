import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/cursos';
const prefixo = 'curso-';
const campos = [
  'Codigo', 'Nome', 'CargaHorariaTotal', 'MinimoSemestres',
  'MaximoSemestres', 'Turno', 'fk_Departamento_Codigo',
  'fk_Prof_Coord_Matricula', 'BonusSalarial'
];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-curso');
  if (!div) return;
  montarFormulario();
  carregarCursos();
});

function montarFormulario() {
  const div = document.getElementById('form-curso');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => {
    let tipo = 'text';
    if (['CargaHorariaTotal', 'MinimoSemestres', 'MaximoSemestres', 'BonusSalarial'].includes(c)) {
      tipo = 'number';
    }
    return criarInput(prefixo + c, c, tipo);
  }).join('') +
    `<button id="salvarCurso">Salvar</button><button id="carregarCurso">Carregar</button>`;

  document.getElementById('salvarCurso').onclick = salvarCurso;
  document.getElementById('carregarCurso').onclick = carregarCursos;
}

async function carregarCursos() {
  const cursos = await (await fetch(API_URL)).json();

  renderizarTabela(
    cursos,
    campos.map(c => c.toLowerCase()),
    (c) => `
      <button onclick='editarCurso(${JSON.stringify(c).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarCurso("${c.codigo}")'>Excluir</button>
    `,
    'tabela-curso'
  );
}

window.editarCurso = function (curso) {
  preencherFormulario(campos, curso, prefixo);
};

window.deletarCurso = function (codigo) {
  deletar(API_URL, codigo, true).then(carregarCursos);
};

async function salvarCurso() {
  const curso = {};
  for (const campo of campos) {
    const el = document.getElementById(prefixo + campo);
    if (el) {
      const valor = el.type === 'number' ? Number(el.value) : el.value.trim();
      if ((typeof valor === 'string' && valor !== '') ||
          (typeof valor === 'number' && !isNaN(valor))) {
        curso[campo] = valor;
      }
    }
  }

  await salvarOuAtualizar(API_URL, 'Codigo', curso);
  limparFormulario(campos, prefixo);
  carregarCursos();
}
