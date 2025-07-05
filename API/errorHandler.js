function errorHandler(err, req, res, next) {
  // Se for erro vindo do PostgreSQL
  if (err.code) {
    const { status, message } = handlePgError(err);
    return res.status(status).json({ erro: message });
  }

  // Outros erros
  console.error(err);
  res.status(500).json({ erro: 'Erro inesperado no servidor' });
}

function handlePgError(err) {
  switch (err.code) {
    case '23505':
      return {
        status: 409,
        message: 'Valor duplicado (violação de UNIQUE ou PK)',
      };
    case '23503':
      return {
        status: 400,
        message: 'Chave estrangeira inválida (FK)',
      };
    case '23502':
      return {
        status: 400,
        message: 'Campo obrigatório ausente (NOT NULL)',
      };
    case '42703':
      return {
        status: 400,
        message: 'Coluna inválida (erro de nome de campo)',
      };
    default:
      return {
        status: 500,
        message: 'Erro interno no banco de dados',
      };
  }
}

module.exports = errorHandler;