# Descrição Funcional — CRM Insight

**Disciplina:** Tópicos Especiais em Programação  
**Sistema:** CRM Insight  
**Data:** 28/05/2026  

---

## UC-01 — Autenticar-se

| Campo | Valor |
|-------|-------|
| **Ator principal** | Administrador, Vendedor |
| **Descrição** | Realiza login no sistema informando username e senha |
| **Pré-condição** | O usuário deve estar cadastrado no sistema |
| **Pós-condição** | Token JWT gerado e armazenado; usuário redirecionado ao dashboard |
| **Fluxo principal** | 1. Usuário informa username e senha. 2. Sistema valida credenciais. 3. Sistema gera token JWT. 4. Sistema retorna token e dados do usuário. 5. Frontend armazena token e redireciona ao dashboard. |
| **Fluxo alternativo** | (2a) Credenciais inválidas → sistema retorna erro 401 com mensagem "Credenciais inválidas". Frontend exibe o erro no formulário. |

---

## UC-02 — Gerenciar Clientes

| Campo | Valor |
|-------|-------|
| **Ator principal** | Administrador |
| **Descrição** | Cadastrar, listar, editar e excluir clientes |
| **Pré-condição** | Usuário autenticado com role ADMIN |
| **Pós-condição** | Cliente criado/alterado/excluído no banco de dados |
| **Fluxo principal (cadastro)** | 1. Administrador acessa formulário de novo cliente. 2. Informa nome, segmento e data de entrada. 3. Sistema valida os campos. 4. Sistema persiste o cliente com score inicial 0. 5. Sistema retorna confirmação. |
| **Fluxo principal (listagem)** | 1. Administrador acessa listagem de clientes. 2. Sistema exibe tabela com todos os clientes (nome, segmento, score). |
| **Fluxo principal (edição)** | 1. Administrador seleciona cliente na listagem. 2. Sistema exibe formulário preenchido. 3. Administrador altera os dados desejados. 4. Sistema valida e persiste as alterações. |
| **Fluxo principal (exclusão)** | 1. Administrador seleciona cliente na listagem. 2. Sistema solicita confirmação. 3. Administrador confirma. 4. Sistema remove o cliente do banco de dados. |

---

## UC-03 — Gerenciar Vendedores

| Campo | Valor |
|-------|-------|
| **Ator principal** | Administrador |
| **Descrição** | Cadastrar (via criação de usuário VENDEDOR), listar e editar vendedores |
| **Pré-condição** | Usuário autenticado com role ADMIN |
| **Pós-condição** | Vendedor criado/alterado no banco de dados |
| **Fluxo principal (cadastro)** | 1. Administrador acessa formulário de novo usuário. 2. Seleciona role "VENDEDOR". 3. Preenche username, senha e dados do vendedor (nome, matrícula, data admissão, meta mensal, comissão base, rank). 4. Sistema valida os campos. 5. Sistema cria Vendedor e Usuario simultaneamente. 6. Sistema retorna confirmação. |
| **Fluxo principal (listagem)** | 1. Administrador acessa listagem de vendedores. 2. Sistema exibe tabela com todos os vendedores (nome, matrícula, rank). |
| **Fluxo principal (edição)** | 1. Administrador seleciona vendedor na listagem. 2. Sistema exibe formulário preenchido. 3. Administrador altera os dados. 4. Sistema valida e persiste. |
| **Fluxo alternativo** | (3a) Matrícula duplicada → sistema rejeita com erro "Matrícula já cadastrada". |

---

## UC-04 — Gerenciar Usuários

| Campo | Valor |
|-------|-------|
| **Ator principal** | Administrador |
| **Descrição** | Cadastrar, listar e excluir usuários do sistema |
| **Pré-condição** | Usuário autenticado com role ADMIN |
| **Pós-condição** | Usuário criado/excluído no banco de dados |
| **Fluxo principal (cadastro ADMIN)** | 1. Administrador acessa formulário de novo usuário. 2. Seleciona role "ADMIN". 3. Preenche username e senha. 4. Sistema valida e persiste. |
| **Fluxo principal (cadastro VENDEDOR)** | Vide UC-03 (fluxo principal de cadastro). |
| **Fluxo principal (listagem)** | 1. Administrador acessa listagem de usuários. 2. Sistema exibe tabela com username, role e vendedor vinculado. |
| **Fluxo principal (exclusão)** | 1. Administrador seleciona usuário na listagem. 2. Sistema solicita confirmação. 3. Administrador confirma. 4. Sistema remove o usuário. |

---

## UC-05 — Gerenciar Vendas (Administrador)

| Campo | Valor |
|-------|-------|
| **Ator principal** | Administrador |
| **Descrição** | Cadastrar, listar e excluir vendas de qualquer vendedor |
| **Pré-condição** | Usuário autenticado com role ADMIN |
| **Pós-condição** | Venda criada/excluída; score do cliente recalculado se CONCLUIDA |
| **Fluxo principal (cadastro)** | 1. Administrador acessa formulário de nova venda. 2. Informa data, valor, status, comissão paga. 3. Seleciona cliente e vendedor. 4. Sistema valida e persiste. 5. Se status = CONCLUIDA, sistema recalcula score do cliente. |
| **Fluxo principal (listagem)** | 1. Administrador acessa listagem. 2. Sistema exibe todas as vendas com data, valor, status, cliente e vendedor. |
| **Fluxo principal (exclusão)** | 1. Administrador seleciona venda. 2. Confirma exclusão. 3. Sistema remove. |

---

## UC-06 — Gerenciar Interações (Administrador)

| Campo | Valor |
|-------|-------|
| **Ator principal** | Administrador |
| **Descrição** | Cadastrar, listar e excluir interações de qualquer vendedor |
| **Pré-condição** | Usuário autenticado com role ADMIN |
| **Pós-condição** | Interação criada/excluída no banco de dados |
| **Fluxo principal (cadastro)** | 1. Administrador acessa formulário de nova interação. 2. Informa data/hora, canal, duração, avaliação. 3. Seleciona cliente e vendedor. 4. Sistema valida e persiste. |
| **Fluxo principal (listagem)** | 1. Administrador acessa listagem. 2. Sistema exibe todas as interações com data, canal, cliente e vendedor. |
| **Fluxo principal (exclusão)** | 1. Administrador seleciona interação. 2. Confirma exclusão. 3. Sistema remove. |

---

## UC-07 — Visualizar Dashboard Administrativo

| Campo | Valor |
|-------|-------|
| **Ator principal** | Administrador |
| **Descrição** | Visualiza métricas globais do sistema em painel único |
| **Pré-condição** | Usuário autenticado com role ADMIN |
| **Pós-condição** | — |
| **Fluxo principal** | 1. Administrador acessa o dashboard. 2. Sistema carrega dados do endpoint `/api/analitico/resumo-geral`. 3. Sistema exibe: 6 cards (Clientes, Vendedores, Faturamento Total, Faturamento do Mês, Vendas, Interações), 2 gráficos (Vendas por Mês, Vendas por Vendedor), tabelas de últimas vendas e últimas interações, e gráfico pizza de status das vendas. |

---

## UC-08 — Visualizar Analítico

| Campo | Valor |
|-------|-------|
| **Ator principal** | Administrador |
| **Descrição** | Visualiza métricas detalhadas por vendedor ou cliente |
| **Pré-condição** | Usuário autenticado com role ADMIN |
| **Pós-condição** | — |
| **Fluxo principal (vendedor)** | 1. Administrador seleciona aba "Vendedor". 2. Sistema exibe grid com todos os vendedores. 3. Administrador clica em um vendedor. 4. Sistema exibe: taxa de conversão, eficiência, performance vs meta, especialização e gráfico de indicadores. |
| **Fluxo principal (cliente)** | 1. Administrador seleciona aba "Cliente". 2. Sistema exibe grid com todos os clientes. 3. Administrador clica em um cliente. 4. Sistema exibe: ticket médio (30 dias) e risco de churn com barra de progresso. |

---

## UC-09 — Registrar Venda (Vendedor)

| Campo | Valor |
|-------|-------|
| **Ator principal** | Vendedor |
| **Descrição** | Registra uma nova venda com vendedor auto-preenchido |
| **Pré-condição** | Usuário autenticado com role VENDEDOR; usuário possui vendedorId vinculado |
| **Pós-condição** | Venda criada; score do cliente recalculado se CONCLUIDA |
| **Fluxo principal** | 1. Vendedor acessa formulário de nova venda. 2. Informa data, valor, status, comissão paga. 3. Seleciona cliente. 4. Campo vendedor exibe nome do vendedor logado (desabilitado). 5. Sistema valida e persiste com vendedorId auto-preenchido. 6. Se status = CONCLUIDA, sistema recalcula score do cliente. |
| **Fluxo alternativo** | (5a) Vendedor sem vendedorId → sistema retorna erro 403. |

---

## UC-10 — Registrar Interação (Vendedor)

| Campo | Valor |
|-------|-------|
| **Ator principal** | Vendedor |
| **Descrição** | Registra uma nova interação com vendedor auto-preenchido |
| **Pré-condição** | Usuário autenticado com role VENDEDOR; usuário possui vendedorId vinculado |
| **Pós-condição** | Interação criada no banco de dados |
| **Fluxo principal** | 1. Vendedor acessa formulário de nova interação. 2. Informa data/hora, canal, duração, avaliação. 3. Seleciona cliente. 4. Campo vendedor exibe nome do vendedor logado (desabilitado). 5. Sistema valida e persiste com vendedorId auto-preenchido. |
| **Fluxo alternativo** | (5a) Vendedor sem vendedorId → sistema retorna erro 403. |

---

## UC-11 — Visualizar Dashboard Financeiro

| Campo | Valor |
|-------|-------|
| **Ator principal** | Vendedor |
| **Descrição** | Visualiza painel financeiro pessoal com métricas de vendas |
| **Pré-condição** | Usuário autenticado com role VENDEDOR |
| **Pós-condição** | — |
| **Fluxo principal** | 1. Vendedor acessa o dashboard. 2. Sistema carrega vendas do vendedor logado. 3. Sistema computa e exibe: 6 cards (Faturamento do Mês, Total Vendido, Comissão Recebida, Ticket Médio, Vendas Concluídas, Performance vs Meta) e gráfico de vendas por mês (últimos 6 meses). |

---

## UC-12 — Visualizar Meu Desempenho

| Campo | Valor |
|-------|-------|
| **Ator principal** | Vendedor |
| **Descrição** | Visualiza indicadores de desempenho pessoal |
| **Pré-condição** | Usuário autenticado com role VENDEDOR |
| **Pós-condição** | — |
| **Fluxo principal** | 1. Vendedor acessa "Meu Desempenho". 2. Sistema carrega métricas do endpoint `/api/analitico/meu/*`. 3. Sistema exibe: taxa de conversão, eficiência, performance vs meta (cards e gráfico), e especialização (segmento predominante). |

---

## UC-13 — Calcular Score do Cliente

| Campo | Valor |
|-------|-------|
| **Ator principal** | Sistema |
| **Descrição** | Recalcula o score de um cliente automaticamente após venda CONCLUIDA |
| **Pré-condição** | Venda com status CONCLUIDA foi registrada |
| **Pós-condição** | Score do cliente atualizado no banco de dados |
| **Fluxo principal** | 1. Sistema identifica cliente da venda. 2. Consulta total de vendas CONCLUIDAS do cliente. 3. Consulta soma dos valores das vendas CONCLUIDAS do cliente. 4. Calcula score como soma ponderada: número de vendas * 10 + valor total / 100. 5. Persiste score no cliente. |
| **Observação** | Este caso de uso é disparado por `<<include>>` em UC-05 e UC-09. |

---

## UC-14 — Auto-Preencher Vendedor Logado

| Campo | Valor |
|-------|-------|
| **Ator principal** | Sistema |
| **Descrição** | Atribui automaticamente o vendedorId do usuário autenticado à venda ou interação |
| **Pré-condição** | Usuário VENDEDOR autenticado com vendedorId válido |
| **Pós-condição** | Campo vendedor da venda/interação preenchido com o vendedorId do usuário logado |
| **Fluxo principal** | 1. Sistema obtém username do token JWT. 2. Busca Usuario pelo username. 3. Obtém vendedorId do usuario. 4. Sobrescreve o campo vendedorId da requisição com o valor obtido. |
| **Fluxo alternativo** | (3a) vendedorId nulo → sistema retorna erro 403. |
| **Observação** | Este caso de uso é disparado por `<<include>>` em UC-09 e UC-10. |
