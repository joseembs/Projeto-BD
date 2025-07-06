import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/alunos';
const campos = ['Matricula', 'CPF', 'Nome', 'Email', 'DataDeNascimento', 'Idade', 'Status', 'IRA', 'Integralizacao', 'FotoPerfil'];

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
      return `<input id="FotoPerfil" type="file" accept="image/*" />`;
    }

    let tipo = 'text';
    if (c === 'DataDeNascimento') tipo = 'date';
    else if (c === 'Idade' || c === 'IRA' || c === 'Integralizacao') tipo = 'number';

    return criarInput(c, c, tipo);
  }).join('') +
    `<button id="salvarAluno">Salvar</button><button id="carregarAluno">Carregar</button>`;

  document.getElementById('salvarAluno').onclick = salvar;
  document.getElementById('carregarAluno').onclick = carregarAlunos;
}

async function carregarAlunos() {
  const lista = await (await fetch(API_URL)).json();

  renderizarTabela(lista, campos.map(c => c.toLowerCase()),
    (t) => `
      <button onclick='editar(${JSON.stringify(t).replace(/"/g, '&quot;')})'>Editar</button>
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

window.editar = function (aluno) {
  preencherFormulario(campos.filter(c => c !== 'FotoPerfil'), aluno);
};

window.deletarAluno = function (matricula) {
  deletar(API_URL, matricula, true).then(carregarAlunos);
};

async function salvar() {
  const aluno = {};
  const fileInput = document.getElementById('FotoPerfil');
  const file = fileInput?.files?.[0];

  campos.forEach(c => {
    if (c !== 'FotoPerfil') {
      aluno[c] = document.getElementById(c).value;
    }
  });

  if (file) {
    aluno.FotoPerfil = await toBase64(file);
  }

  await salvarOuAtualizar(API_URL, 'Matricula', aluno);
  limparFormulario(campos);
  carregarAlunos();
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // retorna já com data:image/...
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}
