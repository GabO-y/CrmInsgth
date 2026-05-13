# AGENTS.md

## Repository structure

```
/
├── backend/crminsight/    # Spring Boot 4.0.6 + Java 21 (Maven)
│   ├── pom.xml
│   └── src/main/java/com/uern/tep/crminsight/
│       ├── CrminsightApplication.java    # entrypoint
│       ├── controller/
│       │   ├── ClienteController.java    # CRUD /api/clientes
│       │   ├── VendedorController.java   # CRUD /api/vendedores
│       │   ├── VendaController.java      # CRUD /api/vendas
│       │   ├── InteracaoController.java  # CRUD /api/interacoes
│       │   └── AnaliticoController.java  # GET /api/analitico/*
│       ├── model/
│       │   ├── entity/
│       │   │   ├── Cliente.java
│       │   │   ├── Vendedor.java
│       │   │   ├── Venda.java
│       │   │   └── Interacao.java
│       │   ├── dto/request/  (records com @Valid)
│       │   ├── dto/response/ (records)
│       │   └── enums/ (RankVendedor, StatusVenda, CanalInteracao)
│       ├── repository/ (Spring Data JPA)
│       └── service/
│           ├── ClienteService.java
│           ├── VendedorService.java
│           ├── VendaService.java
│           ├── InteracaoService.java
│           ├── ScoreService.java      # score automático do cliente
│           └── AnaliticoService.java  # 6 métricas calculadas
└── frontend/crminsight/   # React 19 + TypeScript 6 + Vite 8
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx       # SPA entrypoint
        └── App.tsx
```

## Key commands

### Frontend (`frontend/crminsight/`)
| Command | Action |
|---------|--------|
| `npm run dev` | Start Vite dev server (HMR) |
| `npm run build` | `tsc -b && vite build` (typecheck first, then bundle) |
| `npm run lint` | `eslint .` (flat config; eslint 10, typescript-eslint 8) |
| `npm run preview` | Preview production build |

### Backend (`backend/crminsight/`)
```sh
./mvnw spring-boot:run       # dev server
./mvnw test                   # run all tests
./mvnw test -Dtest=TestClassName  # single test class
./mvnw clean install          # full build (skipITs if integration tests exist)
```

## Framework quirks

- **Frontend build fails if `tsc` errors** — `npm run build` runs `tsc -b` before `vite build`. Always run `tsc --noEmit` to check types first.
- **TypeScript 6** — uses `erasableSyntaxOnly` (no `enum`, no `namespace`); `verbatimModuleSyntax` (must use `import type`).
- **ESLint flat config** — `eslint.config.js` at root; no `.eslintrc`. Lint scope is entire project excluding `dist/`.
- **Backend uses Spring Boot 4 + Java 21** — Lombok annotation processing is configured via `maven-compiler-plugin`. No `application.yml` yet, only `application.properties`.
- **Dual DB** — H2 (runtime scope) and PostgreSQL (runtime scope) are both declared. Either can be activated via Spring profile or classpath. No profile config exists yet.
- **Maven wrapper** — use `./mvnw`, not system `mvn`.
- **No monorepo tool** — frontend and backend are independent projects sharing a root directory. No workspace config linking them.

## .vscode/settings.json

Enables `java.compile.nullAnalysis.mode: "automatic"` — relevant if editing Java nullability annotations.

## What is NOT in this repo

- No Docker / docker-compose / infra config
- No CI workflows
- No integration test fixtures or service dependencies
- No database migration tooling (JPA auto-DDL assumed)
- No git history yet (no `.git/` directory)
