import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/turmas';
const campos = ['Numero', 'Semestre', 'DataHora', 'Metodologia', 'Capacidade', 'FK_Disciplina_Codigo'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-turma');
  if (!div) return;
  montarFormulario();
  carregarTurmas();
});


function montarFormulario() {
  const div = document.getElementById('form-turma');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => criarInput(c, c)).join('') +
      `<button id="salvarTurma">Salvar</button><button id="carregarTurma">Carregar</button>`;

  document.getElementById('salvarTurma').onclick = salvarTurma;
  document.getElementById('carregarTurma').onclick = carregarTurmas;
}

async function carregarTurmas() {
  const turmas = await (await fetch(API_URL)).json();

  renderizarTabela(turmas, campos.map(c => c.toLowerCase()),
    (t) => `
      <button onclick='editarTurma(${JSON.stringify(t).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarTurma(${t.numero}, "${t.semestre}")'>Excluir</button>
    `,
    'tabela-turma'
  );
}

window.editarTurma = function(turma) {
  preencherFormulario(campos, turma);
};

window.deletarTurma = async function(numero, semestre) {
  if (!confirm('Deseja realmente excluir?')) return;
  await fetch(`${API_URL}/${numero}/${semestre}`, { method: 'DELETE' });
  carregarTurmas();
};

async function salvarTurma() {
  const turma = {};
  for (const campo of campos) {
    const el = document.getElementById(campo);
    if (!el || el.value.trim() === '') {
      //alert('Preencha todos os campos antes de continuar.');
      //throw new Error('Campo vazio');
    }

    if (el.type === 'number') {
      turma[campo] = Number(el.value);
    } else {
      turma[campo] = el.value.trim();
    }
  }

  // Para turma, chave primária composta (Numero + Semestre), então buscar com ambos
  const urlBusca = `${API_URL}/${turma.Numero}/${turma.Semestre}`;
  const res = await fetch(urlBusca);

  if (res.ok) {
    await fetch(urlBusca, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turma)
    });
  } else {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turma)
    });
  }

  limparFormulario(campos);
  carregarTurmas();
}
