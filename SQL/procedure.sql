-- Exemplo de uso: CALL matricular_alunos('T2');

CREATE OR REPLACE PROCEDURE matricular_alunos(codigo_turma VARCHAR)
LANGUAGE plpgsql
AS $$
DECLARE
	max_alunos INT;
	atual_alunos INT;
	capacidade_turma INT;
BEGIN
	SELECT Capacidade INTO max_alunos FROM Turma WHERE Codigo = codigo_turma;
	SELECT COUNT(*) INTO atual_alunos FROM HistoricoFazParte
	WHERE fk_Turma_Codigo = codigo_turma AND Status = 'Matriculado';
	capacidade_turma := max_alunos - atual_alunos;
	
	IF capacidade_turma > 0 THEN
		WITH selecao AS (
			SELECT Fila.fk_Turma_Codigo, Fila.fk_Aluno_Matricula FROM FilaSeMatricula Fila
			WHERE Fila.fk_Turma_Codigo = codigo_turma ORDER BY Fila.Prioridade ASC LIMIT capacidade_turma
		)
		INSERT INTO HistoricoFazParte(fk_Turma_Codigo, fk_Aluno_Matricula, Status)
		SELECT fk_Turma_Codigo, fk_Aluno_Matricula, 'Matriculado' FROM selecao;

		WITH selecao AS (
			SELECT Fila.fk_Turma_Codigo, Fila.fk_Aluno_Matricula FROM FilaSeMatricula Fila
			WHERE Fila.fk_Turma_Codigo = codigo_turma ORDER BY Fila.Prioridade ASC LIMIT capacidade_turma
		)
		DELETE FROM FilaSeMatricula USING selecao
		WHERE FilaSeMatricula.fk_Turma_Codigo = selecao.fk_Turma_Codigo
		AND FilaSeMatricula.fk_Aluno_Matricula = selecao.fk_Aluno_Matricula;
	END IF;	
END;
$$;