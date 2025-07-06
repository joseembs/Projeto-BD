import { renderizarTabela, criarInput, preencherFormulario, limparFormulario } from './crudBase.js';

const API_URL = 'http://localhost:3000/ensina';
const prefixo = 'ensina-';
const campos = ['fk_Prof_Matricula', 'fk_Turma_Numero', 'fk_Turma_Semestre'];

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('form-ensina');
  if (!div) return;
  montarFormulario();
  carregarEnsina();
});

function montarFormulario() {
  const div = document.getElementById('form-ensina');
  div.classList.add('form-grid');
  div.innerHTML = campos.map(c => criarInput(prefixo + c, c)).join('') +
    `<button id="salvarEnsina">Salvar</button><button id="carregarEnsina">Carregar</button>`;

  document.getElementById('salvarEnsina').onclick = salvarEnsina;
  document.getElementById('carregarEnsina').onclick = carregarEnsina;
}

export async function carregarEnsina() {
  const lista = await fetch(API_URL).then(r => r.json()).catch(() => []);
  renderizarTabela(
    lista,
    campos.map(c => c.toLowerCase()),
    (item) => `
      <button onclick='editarEnsina(${JSON.stringify(item).replace(/"/g, '&quot;')})'>Editar</button>
      <button onclick='deletarEnsina(${JSON.stringify(item).replace(/"/g, '&quot;')})'>Excluir</button>
    `,
    'tabela-ensina'
  );
}

window.editarEnsina = function (item) {
  preencherFormulario(campos, item, prefixo);
};

window.deletarEnsina = async function (item) {
  await fetch(API_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  carregarEnsina();
};

async function salvarEnsina() {
  const ensina = {};
  const prefixo = 'ensina-';

  for (const campo of campos) {
    const el = document.getElementById(prefixo + campo);
    if (el) {
      let valor;
      if (campo === 'fk_Turma_Numero') {
        valor = Number(el.value);
        if (isNaN(valor)) continue;
      } else {
        valor = el.value.trim();
        if (valor === '') continue;
      }
      ensina[campo] = valor;
    }
  }

  console.log("Objeto enviado para o POST:", ensina);

  const urlBusca = `${API_URL}/${ensina.fk_Prof_Matricula}/${ensina.fk_Turma_Numero}/${ensina.fk_Turma_Semestre}`;
  
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ensina)
  });

  limparFormulario(campos, prefixo);
  carregarEnsina();
}



