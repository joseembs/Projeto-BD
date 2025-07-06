import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/alunos';
const prefixo = 'aluno-';
const campos = ['Matricula', 'CPF', 'Nome', 'Email', 'DataDeNascimento', 'Idade', 'Status', 'IRA', 'Integralizacao', 'fk_Curso_Codigo', 'FotoPerfil'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-aluno');
  if (!div) return;
  montarFormulario();
  carregarAlunos();
});

function montarFormulario() {
  const div = document.getElementById('form-aluno');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => {
    if (c === 'FotoPerfil') {
      return `<input id="${prefixo}FotoPerfil" type="file" accept="image/*" />`;
    }

    let tipo = 'text';
    if (c === 'DataDeNascimento') tipo = 'date';
    else if (c === 'Idade' || c === 'IRA' || c === 'Integralizacao') tipo = 'number';

    return criarInput(prefixo + c, c, tipo);
  }).join('') +
    `<button id="salvarAluno">Salvar</button><button id="carregarAluno">Carregar</button>`;

  document.getElementById('salvarAluno').onclick = salvarAluno;
  document.getElementById('carregarAluno').onclick = carregarAlunos;
}

async function carregarAlunos() {
  const lista = await (await fetch(API_URL)).json();

  renderizarTabela(lista, campos.map(c => c.toLowerCase()),
    (t) => `
      <button onclick='editarAluno(${JSON.stringify(t).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarAluno("${t.matricula}")'>Excluir</button>
    `,
    'tabela-aluno',
    (campo, valor) => {
      if (campo === 'fotoperfil' && valor) {
        return `<img src="data:image/png;base64,${valor}" alt="Foto" style="max-width:50px; max-height:50px"/>`;
      }
      return valor ?? '';
    }
  );
}

window.editarAluno = function (aluno) {
  preencherFormulario(campos.filter(c => c !== 'FotoPerfil'), aluno, prefixo);
};

window.deletarAluno = function (matricula) {
  deletar(API_URL, matricula, true).then(carregarAlunos);
};

async function salvarAluno() {
  const aluno = {};
  const fileInput = document.getElementById(prefixo + 'FotoPerfil');
  const file = fileInput?.files?.[0];

  for (const campo of campos) {
    const el = document.getElementById(prefixo + campo);
    if (el && campo !== 'FotoPerfil') {
      const valor = el.type === 'number' ? Number(el.value) : el.value.trim();
      if ((typeof valor === 'string' && valor !== '') ||
          (typeof valor === 'number' && !isNaN(valor))) {
        aluno[campo] = valor;
      }
    }
  }

  if (file) {
    let base64String = await toBase64(file);
    base64String = base64String.replace(/^data:image\/\w+;base64,/, '');
    aluno.FotoPerfil = base64String;
  }

  await salvarOuAtualizar(API_URL, 'Matricula', aluno);
  limparFormulario(campos, prefixo);
  carregarAlunos();
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}
