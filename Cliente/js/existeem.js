import { salvarOuAtualizar, deletar, renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/existeem';
const prefixo = 'existeem-';
const campos = ['fk_Local_Codigo', 'fk_Turma_Numero', 'fk_Turma_Semestre'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-existeem');
  if (!div) return;
  montarFormulario();
  carregarExisteEm();
});

function montarFormulario() {
  const div = document.getElementById('form-existeem');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => {
    const tipo = (c === 'fk_Turma_Numero') ? 'number' : 'text';
    return criarInput(prefixo + c, c);
  }).join('') +
    `<button id="salvarExisteEm">Salvar</button><button id="carregarExisteEm">Carregar</button>`;

  document.getElementById('salvarExisteEm').onclick = salvarExisteEm;
  document.getElementById('carregarExisteEm').onclick = carregarExisteEm;
}

async function carregarExisteEm() {
  const lista = await (await fetch(API_URL)).json();
  renderizarTabela(
      lista,
      campos.map(c => c.toLowerCase()),
      (t) => `
        <button onclick='editarExisteEm(${JSON.stringify(t).replace(/"/g, '&quot;')})'>Editar</button>
        <button onclick='deletarExisteEm("${t.fk_Local_Codigo}", ${t.fk_Turma_Numero}, "${t.fk_Turma_Semestre}")'>Excluir</button>
      `,
      'tabela-existeem'
    );
}

window.editarExisteEm = function (item) {
  preencherFormulario(campos, item, prefixo);
};

window.deletarExisteEm = async function (fk_Local_Codigo, fk_Turma_Numero, fk_Turma_Semestre) {
  if (!confirm('Deseja realmente excluir?')) return;
  await fetch(`${API_URL}/${fk_Local_Codigo}/${fk_Turma_Numero}/${fk_Turma_Semestre}`, {
    method: 'DELETE',
  });
  carregarExisteEm();
};

async function salvarExisteEm() {
  const registro = {};
  for (const campo of campos) {
    const el = document.getElementById(prefixo + campo);
    if (el) {
      let valor;
      if (el.type === 'number') {
        valor = Number(el.value);
        if (isNaN(valor)) continue; // Ignorar número inválido
      } else {
        valor = el.value.trim();
        if (valor === '') continue; // Ignorar string vazia
      }
      registro[campo] = valor;
    }
  }

  // Validação: todos os campos da chave primária são obrigatórios
  if (!registro.fk_Local_Codigo || registro.fk_Turma_Numero === undefined || !registro.fk_Turma_Semestre) {
    alert('Todos os campos da chave primária são obrigatórios');
    return;
  }

  const urlBusca = `${API_URL}/${registro.fk_Local_Codigo}/${registro.fk_Turma_Numero}/${registro.fk_Turma_Semestre}`;
  const res = await fetch(urlBusca);

  if (res.ok) {
    // Registro existe: faz PATCH
    await fetch(urlBusca, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registro),
    });
  } else {
    // Registro não existe: faz POST
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registro),
    });
  }

  limparFormulario(campos, prefixo);
  carregarExisteEm();
}

