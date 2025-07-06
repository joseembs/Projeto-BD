export async function salvarOuAtualizar(url, chavePrimaria, objeto) {
  console.log(`url: ${url}, chave encontrado:`, chavePrimaria, 'Valor:', objeto[chavePrimaria]);
  if (!objeto[chavePrimaria]) {
    console.log(`Chave primária "${chavePrimaria}" não foi definida ou está vazia.`);
    return;
  }

  let method = 'POST';
  let urlFinal = url;

  try {
    const res = await fetch(`${url}/${objeto[chavePrimaria]}`);
    if (res.status !== 404) {
      method = 'PATCH';
      urlFinal = `${url}/${objeto[chavePrimaria]}`;
    }
  } catch (err) {
    console.warn('Erro ao verificar existência do recurso:', err);
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

export function preencherFormulario(campos, dados, prefixo = '') {
  campos.forEach(c => {
    const el = document.getElementById(prefixo + c);
    if (el) el.value = dados[c.toLowerCase()] ?? '';
  });
}

export function limparFormulario(campos, prefixo = '') {
  campos.forEach(c => {
    const el = document.getElementById(prefixo + c);
    if (el) el.value = '';
  });
}