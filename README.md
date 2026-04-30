# TPV El Jardin

Aplicacion TPV para un solo negocio de restauracion. Monolito modular construido desde cero con Next.js, TypeScript, Prisma y PostgreSQL.

Estado auditado: 2026-04-29.

La base funcional existe y los gates principales ejecutan en verde, pero la aplicacion no queda lista para despliegue real hasta cerrar las fases de correccion C0-C7 descritas en `plan-desarrollo.md`.

## Documentos rectores

- `aplicacion-requisitos.md`: PRD y arquitectura objetivo.
- `plan-desarrollo.md`: plan operativo, auditoria post-Fase 14 y fases de correccion.
- `AGENTS.md`: guia operativa local, prioridades, protocolo y bitacora.
- `docs/checklist-despliegue-mvp.md`: checklist operativo de despliegue y rollback.

## Alcance v1

- Un solo negocio.
- Sin SaaS.
- Sin multiempresa.
- Sin multiestablecimiento.
- Sin `Empresa` como tenant.
- Sin `Establecimiento` como filtro obligatorio.
- API publica de solo lectura para carta, platos, categorias, menu y datos visibles.
- Codigo propio en espanol, salvo librerias, frameworks, APIs externas y funciones nativas.

## Estado actual auditado

Resultado positivo:

- El workspace compila.
- Lint, type-check, tests generales, build, migraciones y tests DB se han ejecutado correctamente.
- No se ha detectado deriva de tenancy v1 en codigo (`Empresa`, `Establecimiento`, `empresaId`, `establecimientoId`).
- La API publica usa proyecciones explicitas y no se ha detectado fuga obvia de campos internos.

Bloqueantes antes de release:

- Realtime SSE no esta garantizado: el servidor emite eventos nombrados y el cliente escucha `onmessage`.
- Cobro, stock, caja y cierre de pedido no son una unidad transaccional unica.
- Cuenta dividida normaliza mal importes parciales.
- Contratos, estados, errores y eventos divergen en varios puntos del PRD.
- `packages/dominio` y `packages/aplicacion` existen, pero parte importante de la logica sigue en `apps/tpv`.
- Auditoria y administracion privada no cubren aun todas las mutaciones y configuraciones criticas.
- Hay tests placeholder en paquetes criticos, por lo que los gates verdes no equivalen a cobertura suficiente.

## Fases de correccion

Antes de considerar liberable el MVP:

| Fase | Objetivo |
| --- | --- |
| C0 | Recuperacion documental y bloqueo de release. |
| C1 | Realtime funcional y contrato de eventos. |
| C2 | Atomicidad de cobro, caja, stock y pedido. |
| C3 | Contratos, estados y errores alineados con PRD. |
| C4 | Modularidad real: dominio, aplicacion, infra y contratos. |
| C5 | Seguridad, auditoria, configuracion y administracion. |
| C6 | QA real, cobertura y pruebas no funcionales. |
| C7 | UX operativa, web publica y accesibilidad final. |

El detalle de hallazgos A-01..A-15 y su asignacion por fase esta en `plan-desarrollo.md`.

## Stack real

- Lenguaje: TypeScript estricto.
- Runtime: Node.js 22 o superior.
- Gestor de paquetes: pnpm 10 con workspaces.
- App: Next.js 16 en `apps/tpv`.
- UI: React 19.
- Base de datos local: PostgreSQL 17 via Docker Compose.
- ORM: Prisma.
- Realtime actual: SSE/EventSource.
- Tests: Vitest.
- Lint: ESLint en app Next.
- Format/check: Biome en paquetes que lo usan.
- Auth: propia, hash con argon2id.

## Estructura

```text
apps/tpv/            # Next.js: UI privada, web publica, API privada y API publica
packages/dominio/    # reglas puras, entidades, value objects, errores y eventos
packages/aplicacion/ # casos de uso, permisos y transacciones
packages/contratos/  # DTOs, schemas, eventos y errores compartidos
packages/infra/      # Prisma, migraciones, repositorios/adaptadores, logger, impresoras
packages/ui/         # componentes reutilizables, formularios y estilos
docs/                # documentos operativos
scripts/             # utilidades de operacion local
```

Nota de auditoria: la estructura modular existe, pero C4 debe mover mas reglas y casos de uso fuera de `apps/tpv` antes de considerar cerrada la arquitectura objetivo.

## Requisitos previos

- Node.js >= 22.0.0.
- pnpm gestionado por Corepack.
- Docker Desktop para PostgreSQL local.
- PowerShell para scripts de backup/restore incluidos.

## Primera ejecucion local

```bash
corepack enable
corepack pnpm install
cp .env.example .env
corepack pnpm db:up
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm dev
```

Advertencia:

- `.env.example` existe en local, pero `.gitignore` ignora `.env*`; antes de preparar un repo limpio hay que decidir si se versiona como excepcion o si se documentan variables de entorno en otro archivo publico.
- No usar datos reales en `.env`, seeds ni logs.

## Scripts principales

| Comando | Uso |
| --- | --- |
| `corepack pnpm dev` | Levanta la app Next en desarrollo. |
| `corepack pnpm build` | Ejecuta build de produccion de todos los paquetes con script. |
| `corepack pnpm lint` | Ejecuta lint recursivo. |
| `corepack pnpm type-check` | Ejecuta TypeScript sin emitir. |
| `corepack pnpm test` | Ejecuta tests recursivos. Incluye placeholders en algunos paquetes. |
| `corepack pnpm test:db` | Ejecuta integracion DB de `apps/tpv`; requiere `RUN_DB_TESTS=1` y `DATABASE_URL`. |
| `corepack pnpm gate:full` | Ejecuta format, lint, type-check, test, test:db y build. Ojo: `format` puede escribir cambios. |
| `corepack pnpm db:up` | Levanta PostgreSQL con Docker Compose. |
| `corepack pnpm db:down` | Apaga los contenedores Docker. |
| `corepack pnpm db:migrate` | Ejecuta Prisma migrate dev. |
| `corepack pnpm db:migrate:deploy` | Aplica migraciones pendientes en modo despliegue. |
| `corepack pnpm db:migrate:status` | Muestra estado de migraciones. |
| `corepack pnpm db:backup` | Crea backup SQL local en `backups/`. |
| `corepack pnpm db:restore` | Restaura backup SQL local. |
| `corepack pnpm db:seed` | Ejecuta seed de desarrollo. |

## Validacion de auditoria

Ejecuciones registradas:

```bash
corepack pnpm -r lint
corepack pnpm -r type-check
corepack pnpm -r test
corepack pnpm -r build
corepack pnpm db:migrate:status
```

Pruebas DB:

```powershell
$env:RUN_DB_TESTS = "1"
$env:DATABASE_URL = "postgresql://tpv:tpv@localhost:5432/tpv"
corepack pnpm test:db
```

Resultado observado: OK. Riesgo residual: los tests DB cubren flujos importantes, pero no todos los bloqueantes detectados en `plan-desarrollo.md`.

## Operacion DB

Estado de migraciones:

```bash
corepack pnpm db:migrate:status
```

Aplicar migraciones en despliegue:

```bash
corepack pnpm db:migrate:deploy
```

Backup local:

```powershell
corepack pnpm db:backup
powershell -ExecutionPolicy Bypass -File scripts/db-backup.ps1 -OutputFile backups/tpv_manual.sql
```

Restore local:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/db-restore.ps1 -InputFile backups/tpv_manual.sql
```

Pendiente de operacion: automatizar backup programado y prueba periodica de restore en entorno controlado.

## Reglas de trabajo

- Leer `aplicacion-requisitos.md`, `plan-desarrollo.md` y `AGENTS.md` antes de tocar arquitectura, fases o documentacion.
- Registrar en la bitacora de `AGENTS.md` cualquier accion que cambie archivos.
- No introducir SaaS, multiempresa, multiestablecimiento, tenancy preventiva ni microservicios.
- No declarar el MVP listo mientras C1, C2 y C3 sigan abiertas.
- Priorizar correcciones de consistencia, seguridad y operacion sobre nuevas funcionalidades.
