function errorHandler(err, req, res, next) {
  console.error('Erro capturado:', err);

  // Se for erro vindo do PostgreSQL
  if (err.code) {
    const { status, message } = handlePgError(err);
    return res.status(status).json({ erro: message });
  }

  // Outros erros
  res.status(500).json({ erro: err.message || "Erro inesperado no servidor" });
}


function handlePgError(err) {
  switch (err.code) {
    case "23505":
      return { status: 409, message: "Valor duplicado de atributo UNIQUE ou PK" };
    case "23503":
      return { status: 400, message: "Chave estrangeira inválida (FK não ligada a uma PK existente)" };
    case "23502":
      return { status: 400, message: "Campo obrigatório nulo (erro de NOT NULL)" };
    case "42703":
      return { status: 400, message: "Coluna inválida (erro de nome de campo)" };
    default:
      console.error('Erro PostgreSQL não tratado:', err);
      return { status: 500, message: "Erro interno no banco de dados" };
  }
}

module.exports = errorHandler;