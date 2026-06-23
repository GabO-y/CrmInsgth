# Relatório Parcial — Atividade Avaliativa III

**Disciplina:** Tópicos Especiais em Programação  
**Professor:** Francisco Chagas de Lima Júnior  
**Sistema:** CRM Insight  
**Data:** 28/05/2026  

## Membros da Equipe

| Membro | Função |
|--------|--------|
| Gabriel Oliveira | Desenvolvedor Backend |
| Tales Gabriel | Desenvolvedor Frontend |


## 1. Descritivo Técnico das Ferramentas Tecnológicas

### 1.1 Backend

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| Java | 21 | Linguagem principal |
| Spring Boot | 4.0.6 | Framework web e injeção de dependências |
| Maven | 3.x | Gerenciamento de dependências e build |
| Spring Data JPA / Hibernate | 6.x | Mapeamento objeto-relacional (ORM) |
| H2 | 2.x | Banco de dados em memória para desenvolvimento |
| PostgreSQL | 16 | Banco de dados para produção (configurado) |
| Spring Security | 6.x | Autenticação e autorização |
| JWT (jjwt) | 0.12.6 | Tokens de autenticação stateless |
| BCrypt | — | Criptografia de senhas |
| Lombok | 1.18 | Redução de código boilerplate |
| Bean Validation (jakarta) | — | Validação de dados de entrada |

**Estrutura de camadas:** `Controller → Service → Repository → Entity`

### 1.2 Frontend

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| React | 19 | Biblioteca para construção de interfaces |
| TypeScript | 6 | Tipagem estática |
| Vite | 8 | Bundler e servidor de desenvolvimento |
| Tailwind CSS | 4 | Framework de estilização utilitário |
| @tanstack/react-query | 5 | Gerenciamento de cache e requisições HTTP |
| react-hook-form | 7 | Gerenciamento de formulários |
| Zod | 4 | Validação de schemas |
| recharts | 2 | Biblioteca de gráficos |
| lucide-react | — | Ícones |
| react-router-dom | 7 | Roteamento SPA |
| ESLint | 10 | Padronização de código |
| TypeScript ESLint | 8 | Regras de linting para TypeScript |

### 1.3 Ferramentas Gerais

| Ferramenta | Finalidade |
|------------|------------|
| Git | Controle de versão |
| Visual Studio Code | IDE de desenvolvimento |
| PlantUML | Modelagem de diagramas UML |
| Maven Wrapper (./mvnw) | Build sem dependência global do Maven |

## 2. Status da Implementação

### 2.1 Atividades Concluídas

#### Backend (Gabriel Oliveira)

- Modelagem das entidades JPA: `Cliente`, `Vendedor`, `Venda`, `Interacao`, `Usuario`
- Enums: `RankVendedor`, `StatusVenda`, `CanalInteracao`, `RoleUsuario`
- DTOs de requisição e resposta com validação (`@Valid`)
- Repositórios Spring Data JPA com queries customizadas
- Serviços com regras de negócio (cálculo de score, métricas analíticas)
- Controladores REST com `@PreAuthorize` para controle de acesso
- Segurança JWT stateless (filtro, geração e validação de tokens)
- `GlobalExceptionHandler` com respostas JSON padronizadas
- `DataInitializer` para seed de dados de demonstração
- Endpoint de resumo geral para dashboard administrativo

#### Frontend (Tales Gabriel)

- Configuração do projeto React + TypeScript + Vite + Tailwind
- Sistema de autenticação (login, contexto, rotas protegidas)
- Layout com sidebar responsiva (admin vs vendedor)
- CRUD completo de Clientes, Vendedores, Vendas, Interações
- CRUD de Usuários com criação unificada (ADMIN e VENDEDOR)
- Dashboard administrativo com métricas reais, gráficos e tabelas
- Dashboard financeiro do vendedor
- Página "Meu Desempenho" com indicadores do vendedor
- Analítico administrativo com detalhamento por vendedor/cliente
- Componentes reutilizáveis (DataTable, ConfirmDialog, cards)
- Validação de formulários com react-hook-form + zod

### 2.2 Atividades em Execução

- Documentação do sistema
- - minimundo
- - descrição funcional
- - diagramas UML (classes, casos de uso, sequência)

### 2.3 Atividades Pendentes

- Apresentação em seminário

## 3. Cronograma de Execução

- T = Tales Gabriel 
- G = Gabriel Oliveira

| Tarefa | 28/05 | 29/05 | 30/05 | 31/05 | 01/06 | 02/06 | 03/06 | 04/06 |
|--------|-------|-------|-------|-------|-------|-------|-------|-------|
| Relatório parcial | G, T | | | | | | | |
| Alinhamento diagramas UML | G, T | G, T | | | | | | |
| Diagrama de classes | | | T | T | | | | |
| Diagrama de casos de uso | | | T | T | | | | |
| Minimundo | | | | G | G | | | |
| Descrição funcional | | | |G | G |  | | |
| Revisão da documentação | | | | T, G| T, G|T, G | T, G | |
| Apresentação seminário | | | | | | | | G, T |


## 4. Considerações Finais

O sistema encontra-se com todas as funcionalidades previstas implementadas e testadas. As próximas etapas concentram-se na documentação formal e preparação da apresentação final, conforme cronograma acima.
