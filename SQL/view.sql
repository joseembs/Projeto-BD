-- Exemplo de uso: SELECT * FROM Grade;

CREATE OR REPLACE VIEW Grade AS
SELECT Aluno.Nome AS Nome, Aluno.Matricula AS Matricula, Turma.Codigo AS Turma, Disciplina.Nome AS Disciplina
FROM
	HistoricoFazParte
	INNER JOIN Aluno ON HistoricoFazParte.fk_Aluno_Matricula = Aluno.Matricula
	INNER JOIN Turma ON HistoricoFazParte.fk_Turma_Codigo = Turma.Codigo
	INNER JOIN Disciplina ON Turma.fk_Disciplina_Codigo = Disciplina.Codigo
WHERE HistoricoFazParte.Status = 'Matriculado';