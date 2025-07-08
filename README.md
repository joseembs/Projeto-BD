Universidade de Brasília - Departamento de Ciência da Computação

CIC0097 - Bancos de Dados - Turma 01 - 2025/1 

Profª.: Maristela Terto de Holanda

# SIGBD - Sistema Integrado de Gestão de Bancos de Dados

#### Grupo:
Elis Rodrigues Borges - 231018875

Henrique Cerqueira Ramos Sales - 231034841

José Edson Martins Bezerra da Silva - 231003380

## Instruções para execução:
### Criação do Banco de Dados
O banco de dados do SIGBD foi feito utilizando PostgreSQL. Os scripts utilizados para criar o banco estão no diretório **SQL**, devendo ser executados na seguinte ordem:

1. `SQL-init-SIGBD.sql` para criar as tabelas
2. `procedure.sql` para criar e habilitar o processamento da matrícula por meio da procedure *matricular_alunos*
3. `view.sql` para criar e habilitar a consulta aos dados das matrículas efetuadas no semestre atual por meio da view *Grade*\*
4. `exemplo.sql` (opcional) para popular as tabelas com exemplos
5. `dropall.sql` (opcional) para deletar todas as tabelas, permitindo que elas sejam recriadas

\* A view *Grade* não está visível na interface de usuário do SIGBD. Dessa forma, as consultas relacionadas a ela devem ser feitas diretamente no banco de dados.
Para visualizar os dados atuais da view, execute a query: `SELECT * FROM Grade`.
