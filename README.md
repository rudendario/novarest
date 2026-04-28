# TPV El Jardin

Aplicacion TPV para un solo negocio de restauracion. Monolito modular construido desde cero.

Documentos rectores:

- `aplicacion-requisitos.md` — PRD y arquitectura objetivo.
- `plan-desarrollo.md` — plan operativo por fases.
- `AGENTS.md` — guia operativa, decisiones cerradas y bitacora.
- `CLAUDE.md` — contexto adicional para agentes IA.

## Stack confirmado (2026-04-28)

- **Lenguaje**: TypeScript estricto.
- **Runtime**: Node.js 22 LTS.
- **Gestor paquetes**: pnpm + pnpm workspaces (monorepo).
- **App**: Next.js (en `apps/tpv`).
- **Base de datos**: PostgreSQL 16 via Docker Compose en desarrollo.
- **ORM**: Prisma.
- **Realtime**: socket.io.
- **Tests**: Vitest.
- **Lint/Format**: Biome.
- **Auth**: propia, hash con argon2id.
- **Pagina publica**: dentro de `apps/tpv` bajo `app/(publico)`.

## Convencion de scripts (raiz)

- `pnpm dev` — levantar app en desarrollo.
- `pnpm build` — build de produccion.
- `pnpm lint` — Biome lint.
- `pnpm format` — Biome format.
- `pnpm type-check` — TypeScript sin emitir.
- `pnpm test` — Vitest.
- `pnpm db:up` — levantar Postgres en Docker.
- `pnpm db:down` — apagar Docker.
- `pnpm db:migrate` — Prisma migrate dev.
- `pnpm db:seed` — seed de desarrollo.

## Requisitos previos

- Node.js >= 22.0.0
- pnpm >= 9
- Docker Desktop (Postgres local)

## Primera ejecucion

```bash
pnpm install
cp .env.example .env
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Restricciones v1 (no negociables)

- Un solo negocio. Sin SaaS, multiempresa ni multiestablecimiento.
- Sin `Empresa` como tenant ni `Establecimiento` como filtro.
- Codigo propio en espanol total.
- Monolito modular. Sin microservicios.
- API publica solo lectura para carta/menu. Nunca expone datos internos.

## Estructura

```
apps/tpv/            # Next.js: UI privada, web publica, API privada y publica
packages/dominio/    # reglas puras, entidades, value objects, errores, eventos
packages/aplicacion/ # casos de uso, permisos, transacciones
packages/contratos/  # DTOs, schemas, eventos, errores
packages/infra/      # Prisma, realtime, impresoras, logger, cache
packages/ui/         # componentes reutilizables, formularios, estilos
```
# novarest
# novarest
