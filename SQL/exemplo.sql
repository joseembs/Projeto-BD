-- Professores
INSERT INTO Professor (Matricula, CPF, Nome, Email, DataNascimento, Idade, Status, Salario)
VALUES 
('P001', '41239670869', 'Vitória Monteiro', 'nicolecavalcanti@jesus.com', '1985-01-18', 40, 'Ativo', 5508.00),
('P002', '28146953042', 'Pietra Novaes', 'camilalima@ig.com.br', '1985-01-07', 40, 'Ativo', 13491.00),
('P003', '27961453873', 'Lucca Rodrigues', 'ferreirajoao-gabriel@uol.com.br', '1985-06-21', 40, 'Ativo', 9259.00),
('P004', '90172563895', 'Luiz Fernando Ferreira', 'pedro-miguel98@gmail.com', '1984-09-05', 40, 'Ativo', 14688.00),
('P005', '01956842306', 'Elisa Moura', 'ffernandes@ig.com.br', '1984-08-26', 40, 'Ativo', 5153.00);

-- Departamentos
INSERT INTO Departamento (Codigo, Nome, Telefone)
VALUES 
('CIC', 'Departamento de Ciências da Computação', '61 3255 9644'),
('MAT', 'Departamento de Matemática', '61 1620 2756'),
('EST', 'Departamento de Estatística', '61 9737-8212'),
('ENE', 'Departamento de Engenharia Elétrica', '61 3466 9492'),
('ENC', 'Departamento de Engenharia Civil', '61 2844-7807');

-- Disciplinas
INSERT INTO Disciplina (Codigo, Nome, CargaHoraria, fk_Departamento_Codigo)
VALUES 
('CIC0001', 'Algoritmos e Programação de Computadores', 90, 'CIC'),
('CIC0002', 'Estruturas de Dados', 60, 'CIC'),
('CIC0003', 'Bancos de Dados', 60, 'CIC'),
('CIC0004', 'Organização e Arquitetura de Computadores', 120, 'CIC'),
('MAT0005', 'Cálculo Numérico', 60, 'MAT');

-- Cursos
INSERT INTO Curso (Codigo, Nome, CargaHorariaTotal, MinimoSemestres, MaximoSemestres, Turno, fk_Departamento_Codigo, fk_Prof_Coord_Matricula, BonusSalarial)
VALUES 
('CIC', 'Ciência da Computação', 3000, 8, 12, 'Diurno', 'CIC', 'P001', 1472.00),
('LIC', 'Licenciatura em Computação', 3000, 8, 12, 'Noturno', 'CIC', 'P002', 1319.00),
('ENGCOMP', 'Engenharia de Computação', 3000, 8, 12, 'Diurno', 'CIC', 'P003', 2906.00),
('ENE', 'Engenharia Elétrica', 3000, 8, 12, 'Diurno', 'ENE', 'P004', 1562.00),
('ENC', 'Engenharia Civil', 3000, 8, 12, 'Diurno', 'ENC', 'P005', 1792.00);

-- Alunos
INSERT INTO Aluno (Matricula, CPF, Nome, Email, DataDeNascimento, Idade, Status, IRA, Integralizacao, fk_Curso_Codigo, FotoPerfil)
VALUES 
('222012345', '12345678901', 'Ana Beatriz', 'ana@exemplo.com', '2000-05-20', 24, 'Ativo', 0.9500, 75.25, 'ENC', NULL),
('231018875', '44444444444', 'Elis Rodrigues', 'elisrb@gmail.com', '2004-06-26', 21, 'Ativo', 4.6000, 50.00, 'CIC', NULL),
('231003380', '07819780177', 'José Edson', 'josembs@gmail.com', '2004-11-02', 20, 'Ativo', 4.0000, 50.00, 'CIC', NULL),
('231034841', '01234567890', 'Henrique Sales', 'hsales@gmail.com', '2005-01-17', 20, 'Ativo', 4.0000, 50.00, 'CIC', NULL),
('222000110', '12013456789', 'João Silva', 'joao@email.com', '2004-12-15', 20, 'Ativo', 2.6000, 50.00, 'ENE', NULL),
('222000111', '12013456790', 'Joana Silva', 'joana@email.com', '2004-12-15', 20, 'Ativo', 3.6000, 50.00, 'ENGCOMP', NULL);

-- Monitor
INSERT INTO Monitor (Codigo, Tipo, Salario, fk_Aluno_Matricula)
VALUES 
('M1', 'Remunerado', 600.00, '222012345'),
('M2', 'Remunerado', 700.00, '231018875'),
('M3', 'Voluntário', 0.00, '231003380'),
('M4', 'Remunerado', 650.00, '231034841'),
('M5', 'Voluntário', 0.00, '222000110');

-- Local
INSERT INTO Local (Codigo, Campus, Bloco, Sala)
VALUES 
('L1', 'Darcy Ribeiro', 'PJC', 'BT 061'),
('L2', 'Darcy Ribeiro', 'PJC', 'BT 100'),
('L3', 'Darcy Ribeiro', 'BSAS', 'A2 34/20'),
('L4', 'Darcy Ribeiro', 'BSAN', 'A1 45/10'),
('L5', 'FCTE', 'Bloco 1', 'A1 01/01');

-- Turmas
INSERT INTO Turma (Codigo, Semestre, DataHora, Metodologia, Capacidade, fk_Disciplina_Codigo)
VALUES 
('T1', '2024.2', 'Seg 10:00', 'Presencial', 0, 'CIC0001'),
('T2', '2025.1', 'Ter 14:00', 'Presencial', 5, 'CIC0001'),
('T3', '2025.1', 'Qua 08:00', 'Presencial', 4, 'CIC0002'),
('T4', '2025.1', 'Qui 16:00', 'Presencial', 3, 'CIC0003'),
('T5', '2025.1', 'Sex 10:00', 'Híbrida', 0, 'CIC0004');

-- Ementa
INSERT INTO Ementa (Numero, Detalhes, Bibliografia, Topicos, Modulos, Ativa, fk_Disciplina_Codigo)
VALUES 
(1, 'Detalhes da disciplina 1', 'Bibliografia 1', 'Tópicos 1', 'Módulo 1', TRUE, 'CIC0001'),
(2, 'Detalhes da disciplina 2', 'Bibliografia 2', 'Tópicos 2', 'Módulo 2', TRUE, 'CIC0002'),
(3, 'Detalhes da disciplina 3', 'Bibliografia 3', 'Tópicos 3', 'Módulo 3', TRUE, 'CIC0003'),
(4, 'Detalhes da disciplina 4', 'Bibliografia 4', 'Tópicos 4', 'Módulo 4', TRUE, 'CIC0004'),
(5, 'Detalhes da disciplina 5', 'Bibliografia 5', 'Tópicos 5', 'Módulo 5', TRUE, 'MAT0005');

-- ExisteEm
INSERT INTO ExisteEm (fk_Local_Codigo, fk_Turma_Codigo)
VALUES 
('L1', 'T1'),
('L1', 'T2'),
('L3', 'T3'),
('L4', 'T4'),
('L5', 'T5');

-- HistoricoFazParte
INSERT INTO HistoricoFazParte (fk_Turma_Codigo, fk_Aluno_Matricula, Status, Mencao)
VALUES 
('T1', '222012345', 'Aprovado', 'MM'),
('T1', '231018875', 'Aprovado', 'SS'),
('T1', '231003380', 'Aprovado', 'SS'),
('T1', '231034841', 'Aprovado', 'SS'),
('T1', '222000110', 'Aprovado', 'MM'),
('T1', '222000111', 'Reprovado', 'SR');

-- FilaSeMatricula
INSERT INTO FilaSeMatricula (Codigo, Prioridade, Posicao, Periodo, Preferencia, fk_Aluno_Matricula, fk_Turma_Codigo)
VALUES 
('F1', 1, 1, 'Matrícula', 5, '222012345', 'T2'),
('F2', 2, 2, 'Matrícula', 4, '231018875', 'T2'),
('F3', 3, 3, 'Matrícula', 3, '231003380', 'T2'),
('F4', 4, 4, 'Matrícula', 2, '231034841', 'T2'),
('F5', 5, 5, 'Matrícula', 1, '222000110', 'T2');

-- Ensina
INSERT INTO Ensina (fk_Prof_Matricula, fk_Turma_Codigo)
VALUES 
('P001', 'T1'),
('P002', 'T2'),
('P003', 'T3'),
('P004', 'T4'),
('P005', 'T5');

-- PreRequisitos
INSERT INTO PreRequisitos (fk_Disciplina, fk_Disciplina_Requisito)
VALUES 
('CIC0002', 'CIC0001'),
('CIC0003', 'CIC0002'),
('CIC0004', 'CIC0003'),
('MAT0005', 'CIC0003'),
('MAT0005', 'CIC0004');
