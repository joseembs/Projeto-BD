Universidade de Brasília - Departamento de Ciência da Computação

CIC0097 - Bancos de Dados - Turma 01 - 2025/1 

Profª.: Maristela Terto de Holanda

# SIGBD - Sistema Integrado de Gestão de Bancos de Dados

#### Grupo:
Elis Rodrigues Borges - 231018875

Henrique Cerqueira Ramos Sales - 231034841

José Edson Martins Bezerra da Silva - 231003380

## Visão Geral

O SIGBD é um sistema que gerencia a matrícula dentro de uma universidade por meio de bancos de dados relacionais.

## Instruções para execução
### Criando o Banco de Dados:
O banco de dados do SIGBD é gerenciado pelo PostgreSQL, e a conexão entre a aplicação e o banco é feita por meio de variáveis de ambiente.

Os scripts necessários para criar o banco de dados do SIGBD estão no diretório **SQL**, devendo ser executados na seguinte ordem:

1. `SQL-init-SIGBD.sql` para criar as tabelas
2. `procedure.sql` para criar e habilitar o processamento da matrícula por meio da procedure *matricular_alunos*
3. `view.sql` para criar e habilitar a consulta aos dados das matrículas efetuadas no semestre atual por meio da view *Grade*\*
4. `exemplo.sql` (opcional) para popular as tabelas com exemplos
5. `dropall.sql` (opcional) para deletar todas as tabelas, permitindo que elas sejam recriadas

Em seguida, crie um arquivo `.env` contendo as variáveis de configuração do banco criado, no seguinte formato:

```
DB_USER=nephila
DB_PASSWORD=nephilaclavipes
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sigbd
```

Alternativamente, para conectar o SIGBD a um outro banco de dados criado previamente (desde que ele contenha as tabelas definidas no `SQL-init-SIGBD.sql`), basta configurar as variáveis de ambiente de acordo com as configurações do banco a ser utilizado.

\*A view *Grade* não está visível na interface de usuário do SIGBD. Dessa forma, as consultas relacionadas a ela devem ser feitas diretamente no banco de dados.
Para visualizar os dados atuais da view, execute a query: `SELECT * FROM Grade`.

### Inicializando a Aplicação:
Para utilizar a aplicação do SIGBD, é necessario ter o Node.js e o npm instalados em seu sistema e executar no diretório do projeto:

1. `npm install` para instalar as dependências do projeto
2. `npm start` para iniciar o servidor

Em seguida, execute o arquivo `Cliente/index.html` com Live Server para acessar a interface do usuário.
