# Hooks necesarios

Estado: hooks documentales implementados en `.codex/settings.json`.
Fecha: 2026-04-28 10:48.

## 1. Objetivo

Definir hooks locales para que Codex trabaje en sintonia con el PRD actual:

- TPV para un solo negocio.
- Monolito modular.
- Codigo propio en espanol.
- Sin SaaS, multiempresa, multiestablecimiento ni tenancy preventiva.
- API publica segura para carta, platos, categorias, menu y datos visibles del negocio.
- UI reutilizable y sin reglas de negocio en componentes.

El directorio `.codex/hooks` contiene el diseno. La primera fase ya esta conectada en `.codex/settings.json`.

## 2. Estado observado

- `.codex/hooks` estaba vacio.
- `.codex/settings.json` ya contiene hooks, pero estan desalineados:
  - mencionan `CLAUDE.md` como actualizacion objetivo;
  - mantienen tracker hacia `plan-refactorizacion.md` de otro path;
  - usan referencias antiguas de refactorizacion;
  - no protegen la decision actual de un solo negocio;
  - no validan API publica de carta/menu.

Conclusion: esos hooks fueron reemplazados por una bateria nueva y pequena para fase documental.

## 3. Hooks prioritarios

| Hook | Evento | Prioridad | Proposito |
| --- | --- | --- | --- |
| `orquestador-prd` | `UserPromptSubmit` | Alta | Leer intencion del usuario y sugerir agente/skill sin ruido. |
| `guardian-alcance-prd` | `PostToolUse` sobre ediciones | Alta | Detectar deriva hacia SaaS, multiempresa, multiestablecimiento o tenancy. |
| `guardian-codigo-espanol` | `PostToolUse` sobre codigo | Alta | Detectar codigo propio nuevo con nombres/comentarios/mensajes en ingles. |
| `guardian-api-publica` | `PostToolUse` sobre API/contratos | Alta | Evitar exposicion de coste, stock interno, ventas, caja, auditoria, proveedor o datos personales. |
| `guardian-modularidad` | `PostToolUse` sobre app/packages | Alta | Detectar reglas de negocio en UI/API, imports cruzados y acoplamiento. |
| `guardian-agentes` | `PostToolUse` sobre `.codex/agents` | Media | Asegurar que agentes siguen PRD actual y no vuelven a `CLAUDE.md` como fuente superior. |
| `guardian-bitacora` | `PostToolUse` sobre docs | Media | Recordar actualizar bitacora de `AGENTS.md` al cambiar documentacion. |
| `guardian-db` | `PostToolUse` sobre schema/migrations | Media | Revisar indices, constraints, auditoria y ausencia de tenancy v1. |
| `guardian-ui` | `PostToolUse` sobre UI | Media | Revisar reutilizacion, a11y, estados y ausencia de `fetch` directo. |
| `sugeridor-qa-security` | `PostToolUse` sobre cambios sensibles | Media | Sugerir QA/Security cuando cambien auth, permisos, caja, stock, API publica o datos. |

## 4. Hooks por fase

### Fase documental actual

Implementar primero:

1. `orquestador-prd`
2. `guardian-alcance-prd`
3. `guardian-agentes`
4. `guardian-bitacora`

Razon:

- Ahora el repo contiene principalmente PRD, agentes y configuracion.
- No hay app real en `apps/tpv` ni paquetes `packages/*` para validar codigo.
- Evita ruido prematuro.

Estado: implementado en `.codex/settings.json`.

### Fase de scaffold

Activar al crear `apps/tpv` y `packages/*`:

1. `guardian-codigo-espanol`
2. `guardian-modularidad`
3. `guardian-ui`
4. `guardian-db`

### Fase de API publica y operacion

Activar al implementar carta/menu, auth, caja, stock y realtime:

1. `guardian-api-publica`
2. `sugeridor-qa-security`

## 5. Especificacion de hooks

### 5.1 `orquestador-prd`

Evento: `UserPromptSubmit`.

Mision:

- Clasificar prompt.
- Sugerir agente local.
- Sugerir skills locales.
- Mantener silencio si tarea es trivial.

Reglas:

- Fuente: `AGENTS.md` + `aplicacion-requisitos.md`.
- Si hay conflicto, prevalece PRD actual.
- No mencionar `CLAUDE.md` salvo como contexto adicional si existe.
- No sugerir SaaS, multiempresa, multiestablecimiento ni microservicios.

Salida:

```json
{
  "systemMessage": "FASE: ...\nAGENTE: ...\nSKILLS: ...\nOBJETIVO: ...\nSIGUIENTE: ..."
}
```

### 5.2 `guardian-alcance-prd`

Evento: `PostToolUse`.
Matcher: `Write|Edit|MultiEdit`.

Dispara si se editan:

- `aplicacion-requisitos.md`
- `AGENTS.md`
- `.codex/agents/*.md`
- `.codex/settings.json`
- `.codex/orchestration-config.json`

Detecta:

- `Empresa` como tenant obligatorio.
- `Establecimiento` como filtro obligatorio.
- `empresaId` o `establecimientoId` en requisitos v1 salvo como prohibicion explicita.
- billing SaaS en alcance inicial.
- microservicios en v1.
- selector de empresa o establecimiento.
- `CLAUDE.md` como fuente superior al PRD.

Salida:

- Silencio si no hay deriva.
- Aviso bloqueante si contradice decisiones cerradas.

### 5.3 `guardian-codigo-espanol`

Evento: `PostToolUse`.
Matcher: `Write|Edit|MultiEdit`.

Dispara si se editan:

- `apps/**/*.ts`
- `apps/**/*.tsx`
- `packages/**/*.ts`
- `packages/**/*.tsx`
- `prisma/schema.prisma`

Detecta:

- Identificadores propios en ingles.
- Comentarios propios en ingles.
- Mensajes de error propios en ingles.
- Estados, permisos o eventos hardcodeados.
- `any` sin justificacion.

No bloquea:

- Keywords del lenguaje.
- APIs externas.
- Librerias.
- Nombres obligados por framework.

### 5.4 `guardian-api-publica`

Evento: `PostToolUse`.
Matcher: `Write|Edit|MultiEdit`.

Dispara si se editan:

- rutas bajo `api/publico`;
- contratos publicos;
- DTOs de carta/menu/productos;
- consultas de carta/menu;
- cache publica.

Detecta exposicion de:

- coste;
- margen;
- stock interno;
- proveedor;
- ventas;
- caja;
- auditoria;
- datos personales;
- DTO interno sin proyeccion explicita.

Tambien revisa:

- rate-limit;
- cache deliberado;
- errores sin detalles internos;
- solo datos publicados y activos.

### 5.5 `guardian-modularidad`

Evento: `PostToolUse`.
Matcher: `Write|Edit|MultiEdit`.

Dispara si se editan:

- `apps/tpv/**`
- `packages/dominio/**`
- `packages/aplicacion/**`
- `packages/contratos/**`
- `packages/infra/**`
- `packages/ui/**`

Detecta:

- UI importando infra.
- Dominio importando Prisma, Next.js, Socket.IO o cache.
- Handlers HTTP con reglas de negocio.
- Componentes con reglas de stock/caja/permisos.
- Acceso directo a tablas de otro modulo sin repositorio/caso de uso.
- Duplicacion clara de componentes o validaciones.

### 5.6 `guardian-agentes`

Evento: `PostToolUse`.
Matcher: `Write|Edit|MultiEdit`.

Dispara si se editan:

- `.codex/agents/*.md`

Detecta:

- agente que ignora `AGENTS.md` o `aplicacion-requisitos.md`;
- agente que vuelve a exigir `CLAUDE.md` como fuente de verdad;
- agente que propone SaaS/tenancy/microservicios por defecto;
- solape fuerte entre agentes sin frontera clara.

### 5.7 `guardian-bitacora`

Evento: `PostToolUse`.
Matcher: `Write|Edit|MultiEdit`.

Dispara si se editan:

- `AGENTS.md`
- `aplicacion-requisitos.md`
- `.codex/agents/*.md`
- `.codex/hooks/*.md`

Detecta:

- cambios documentales sin entrada nueva en bitacora de `AGENTS.md`.

Salida:

- Recordatorio, no autoedicion.

### 5.8 `guardian-db`

Evento: `PostToolUse`.
Matcher: `Write|Edit|MultiEdit`.

Dispara si se editan:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `packages/infra/prisma/**`
- docs de modelo de datos.

Detecta:

- falta de `onDelete` explicito;
- importes no decimales;
- estados sin constraint o tipo;
- indices ausentes en `estado`, `fecha`, `mesaId`, `categoriaId`, `usuarioId`, `slug` cuando aplique;
- datos publicos mezclados con internos;
- tenancy preventiva.

### 5.9 `guardian-ui`

Evento: `PostToolUse`.
Matcher: `Write|Edit|MultiEdit`.

Dispara si se editan:

- `apps/tpv/app/**`
- `apps/tpv/src/pantallas/**`
- `apps/tpv/src/hooks/**`
- `packages/ui/**`

Detecta:

- `fetch` directo en componentes;
- componentes sin estados de carga/error/vacio;
- formularios complejos pegados a pantalla;
- texto largo sin estrategia responsive;
- falta de accesibilidad basica;
- duplicacion de patrones comunes.

### 5.10 `sugeridor-qa-security`

Evento: `PostToolUse`.
Matcher: `Write|Edit|MultiEdit`.

Dispara si se editan:

- auth;
- permisos;
- PIN;
- sesiones;
- API publica;
- caja/cobros;
- stock;
- auditoria;
- datos personales;
- migraciones.

Salida:

- Recomienda `security-auditor` si hay riesgo de datos/acceso.
- Recomienda `qa-test-executor` si toca flujo critico.
- Silencio si cambio trivial.

## 6. Implementacion recomendada

Paso 1:

- Reemplazar hooks obsoletos de `.codex/settings.json`. Estado: hecho.
- Quitar tracker de `plan-refactorizacion.md`. Estado: hecho.
- Quitar referencia a `CLAUDE.md` como actualizacion objetivo. Estado: hecho.

Paso 2:

- Conectar solo hooks documentales:
  - `orquestador-prd`;
  - `guardian-alcance-prd`;
  - `guardian-agentes`;
  - `guardian-bitacora`.

Estado: hecho.

Paso 3:

- Al crear codigo real, activar hooks de codigo:
  - `guardian-codigo-espanol`;
  - `guardian-modularidad`;
  - `guardian-db`;
  - `guardian-ui`;
  - `guardian-api-publica`;
  - `sugeridor-qa-security`.

## 7. Criterio de silencio

Todo hook debe devolver silencio si:

- cambio es typo o formato menor;
- archivo no entra en su responsabilidad;
- no hay riesgo real;
- ya existe validacion equivalente en la misma respuesta.

Objetivo: hooks ayudan, no meten ruido.

## 8. Decision pendiente

Antes de modificar `.codex/settings.json`, decidir si los hooks seran:

1. prompts inline dentro de `settings.json`;
2. prompts documentados aqui y copiados a `settings.json`;
3. scripts locales invocados por hooks.

Decision aplicada: prompts inline pequenos en `.codex/settings.json`. Pasar a scripts solo cuando haya codigo real y validaciones repetibles.
