CREATE TABLE Professor (
    Matricula VARCHAR PRIMARY KEY,
    CPF CHAR(11) UNIQUE NOT NULL,
    Nome VARCHAR NOT NULL,
    Email VARCHAR UNIQUE NOT NULL,
    DataNascimento DATE,
    Idade INTEGER,
    Status VARCHAR NOT NULL,
    Salario DECIMAL(12,2)
);

CREATE TABLE Departamento (
    Codigo VARCHAR PRIMARY KEY,
    Nome VARCHAR NOT NULL,
    Telefone VARCHAR(15)
);

CREATE TABLE Disciplina (
    Codigo VARCHAR PRIMARY KEY,
    Nome VARCHAR NOT NULL,
    CargaHoraria INTEGER,
    fk_Departamento_Codigo VARCHAR,
    FOREIGN KEY (fk_Departamento_Codigo) REFERENCES Departamento (Codigo) ON DELETE CASCADE
);

CREATE TABLE Curso (
    Codigo VARCHAR PRIMARY KEY,
    Nome VARCHAR NOT NULL,
    CargaHorariaTotal INTEGER NOT NULL,
    MinimoSemestres INTEGER,
    MaximoSemestres INTEGER,
    Turno VARCHAR,
    fk_Departamento_Codigo VARCHAR,
    fk_Prof_Coord_Matricula VARCHAR UNIQUE,
    BonusSalarial DECIMAL(12,2),
    FOREIGN KEY (fk_Prof_Coord_Matricula) REFERENCES Professor (Matricula) ON DELETE SET NULL,
    FOREIGN KEY (fk_Departamento_Codigo) REFERENCES Departamento (Codigo) ON DELETE CASCADE
);

CREATE TABLE Aluno (
    Matricula CHAR(9) PRIMARY KEY,
    CPF CHAR(11) UNIQUE NOT NULL,
    Nome VARCHAR NOT NULL,
    Email VARCHAR UNIQUE NOT NULL,
    DataDeNascimento DATE,
    Idade INTEGER,
    Status VARCHAR NOT NULL,
    IRA DECIMAL(5,4),
    Integralizacao DECIMAL(5,2),
    fk_Curso_Codigo VARCHAR,
    FotoPerfil BYTEA,
	FOREIGN KEY (fk_Curso_Codigo) REFERENCES Curso (Codigo) ON DELETE SET NULL
);

CREATE TABLE Monitor (
    Codigo VARCHAR PRIMARY KEY,
    Tipo VARCHAR NOT NULL,
    Salario DECIMAL(12,2),
    fk_Aluno_Matricula CHAR(9),
    FOREIGN KEY (fk_Aluno_Matricula) REFERENCES Aluno (Matricula) ON DELETE CASCADE
);

CREATE TABLE Local (
    Codigo VARCHAR PRIMARY KEY,
    Campus VARCHAR,
    Bloco VARCHAR,
    Sala VARCHAR
);

CREATE TABLE Turma (
    Codigo VARCHAR PRIMARY KEY,
    Semestre VARCHAR NOT NULL,
    DataHora VARCHAR NOT NULL,
    Metodologia VARCHAR,
    Capacidade INTEGER NOT NULL,
    fk_Disciplina_Codigo VARCHAR,
    FOREIGN KEY (fk_Disciplina_Codigo) REFERENCES Disciplina (Codigo) ON DELETE CASCADE
);

CREATE TABLE Ementa (
    Numero INTEGER NOT NULL,
    Detalhes VARCHAR,
    Bibliografia VARCHAR,
    Topicos VARCHAR,
    Modulos VARCHAR,
    Ativa BOOLEAN,
    fk_Disciplina_Codigo VARCHAR NOT NULL,
    PRIMARY KEY (Numero, fk_Disciplina_Codigo),
    FOREIGN KEY (fk_Disciplina_Codigo) REFERENCES Disciplina (Codigo) ON DELETE CASCADE
);

CREATE TABLE ExisteEm (
    fk_Local_Codigo VARCHAR,
    fk_Turma_Codigo VARCHAR,
    PRIMARY KEY (fk_Local_Codigo, fk_Turma_Codigo),
    FOREIGN KEY (fk_Local_Codigo) REFERENCES Local (Codigo) ON DELETE CASCADE,
    FOREIGN KEY (fk_Turma_Codigo) REFERENCES Turma (Codigo) ON DELETE CASCADE
);

CREATE TABLE HistoricoFazParte (
    fk_Turma_Codigo VARCHAR,
    fk_Aluno_Matricula CHAR(9),
    Status VARCHAR,
    Mencao VARCHAR,
    PRIMARY KEY (fk_Turma_Codigo, fk_Aluno_Matricula),
    FOREIGN KEY (fk_Turma_Codigo) REFERENCES Turma (Codigo) ON DELETE SET NULL,
    FOREIGN KEY (fk_Aluno_Matricula) REFERENCES Aluno (Matricula) ON DELETE CASCADE
);

CREATE TABLE FilaSeMatricula (
    Codigo VARCHAR PRIMARY KEY,
    Prioridade INTEGER NOT NULL,
    Posicao INTEGER NOT NULL,
    Periodo VARCHAR NOT NULL,
    Preferencia INTEGER NOT NULL,
    fk_Aluno_Matricula CHAR(9),
    fk_Turma_Codigo VARCHAR,
    FOREIGN KEY (fk_Aluno_Matricula) REFERENCES Aluno (Matricula) ON DELETE CASCADE,
    FOREIGN KEY (fk_Turma_Codigo) REFERENCES Turma (Codigo) ON DELETE CASCADE
);

CREATE TABLE Ensina (
    fk_Prof_Matricula VARCHAR,
    fk_Turma_Codigo VARCHAR,
    PRIMARY KEY (fk_Prof_Matricula, fk_Turma_Codigo),
    FOREIGN KEY (fk_Prof_Matricula) REFERENCES Professor (Matricula) ON DELETE CASCADE,
    FOREIGN KEY (fk_Turma_Codigo) REFERENCES Turma (Codigo) ON DELETE CASCADE
);

CREATE TABLE PreRequisitos (
    fk_Disciplina VARCHAR NOT NULL,
    fk_Disciplina_Requisito VARCHAR NOT NULL,
    PRIMARY KEY (fk_Disciplina, fk_Disciplina_Requisito),
    FOREIGN KEY (fk_Disciplina) REFERENCES Disciplina (Codigo) ON DELETE CASCADE,
    FOREIGN KEY (fk_Disciplina_Requisito) REFERENCES Disciplina (Codigo) ON DELETE CASCADE
);