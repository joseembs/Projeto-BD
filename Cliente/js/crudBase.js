export async function salvarOuAtualizar(url, chavePrimaria, objeto) {
  if (!objeto || !chavePrimaria || !objeto[chavePrimaria]) {
    console.warn(`Chave primária "${chavePrimaria}" não foi definida no objeto.`);
    return;
  }
  let method = 'POST';
  let urlFinal = `${url}/${objeto[chavePrimaria]}`;

  try {
    const res = await fetch(urlFinal);
    if (res.ok) {
      method = 'PATCH';
    }
  } catch (err) {
    // Aqui o erro pode ser de rede, não apenas 404
    console.warn('Erro ao verificar existência:', err);
  }

  await fetch(urlFinal, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(objeto)
  });
}


export async function deletar(url, id, confirmar = true) {
  if (confirmar && !confirm('Deseja realmente excluir?')) return;
  await fetch(`${url}/${id}`, { method: 'DELETE' });
}

export function renderizarTabela(lista, colunas, gerarAcoes, idTabela, formatar = (campo, valor) => valor ?? '') {
  const tabela = document.querySelector(`#${idTabela} tbody`);
  tabela.innerHTML = '';

  lista.forEach((item) => {
    const linha = document.createElement('tr');
    linha.innerHTML = colunas.map(c => `<td>${formatar(c, item[c])}</td>`).join('') +
      `<td>${gerarAcoes(item)}</td>`;
    tabela.appendChild(linha);
  });
}

export function criarInput(id, placeholder, type = 'text') {
  return `<input id="${id}" placeholder="${placeholder}" type="${type}" />`;
}

export function preencherFormulario(campos, dados) {
  campos.forEach(c => {
    const el = document.getElementById(c);
    if (el) el.value = dados[c.toLowerCase()] ?? '';
  });
}

export function limparFormulario(campos) {
  campos.forEach(c => {
    const el = document.getElementById(c);
    if (el) el.value = '';
  });
}