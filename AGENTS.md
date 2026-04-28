# AGENTS.md

Guia operativa local para trabajar en este repo de requisitos de `tpv-el-jardin`.

---

## 1. Fuente de contexto obligatoria

Antes de editar documentacion:

1. Leer `aplicacion-requisitos.md`.
2. Leer `plan-desarrollo.md` cuando exista y la tarea toque implementacion, fases, backlog, epicas o priorizacion.
3. Revisar `.codex/agents/tech-lead.md` cuando la tarea cambie arquitectura, modulos, contratos o decisiones de producto.
4. Revisar `.codex/skills/check-modularidad/SKILL.md.md` cuando la tarea toque modularidad, responsabilidades o estructura.
5. Revisar `.codex/skills/handoff-agente/SKILL.md.md` cuando la entrega deba servir a otro agente o implementador.
6. Revisar `.codex/skills/find-skills/SKILL.md.md` cuando se busque extender capacidades del ecosistema.


---

## 2. Mision actual

Mantener `aplicacion-requisitos.md` como especificacion PRD + arquitectura para una nueva aplicacion TPV construida desde cero.

Objetivo de producto:

- Un solo negocio en v1.
- Sin SaaS, multi-empresa ni multi-establecimiento en el alcance inicial.
- Sin `Empresa` como tenant ni `Establecimiento` como filtro obligatorio.
- API publica de solo lectura para mostrar carta, platos y menu en la pagina web.
- Codigo propio en espanol total, salvo librerias, frameworks, APIs externas y funciones nativas.
- Arquitectura monolitica modular, testeable, escalable y sin deuda heredada.

---

## 3. Estado local observado

Referencia local: 2026-04-28 09:55.

- Root actual contiene `.codex/`, `.git`, `AGENTS.md`, `README.md` y `aplicacion-requisitos.md`.
- `git status --short` funciona.
- Estado git observado tras esta reestructuracion: `M AGENTS.md`, `M aplicacion-requisitos.md`.
- `aplicacion-requisitos.md` existe y contiene el PRD monolitico modular para un solo negocio.
- `plan-desarrollo.md` existe como plan operativo por fases para convertir el PRD en proyecto real.

---

## 4. Prioridad vigente

1. Mantener `aplicacion-requisitos.md` como PRD para un solo negocio.
2. Evitar complejidad SaaS salvo nueva decision explicita de producto:
   - Sin multi-empresa.
   - Sin multi-establecimiento.
   - Sin billing SaaS.
   - Sin tenancy obligatoria en cada query.
3. Mantener arquitectura recomendada:
   - Monolito modular.
   - `apps/tpv` para UI Next.js, API privada, API publica y pagina publica si aplica.
   - `packages/dominio` para reglas puras.
   - `packages/aplicacion` para casos de uso, permisos y transacciones.
   - `packages/contratos` para DTOs, eventos y schemas.
   - `packages/infra` para Prisma/ORM, realtime, cache, logger e impresoras.
   - `packages/ui` para componentes reutilizables.
4. Mantener fuera de alcance inicial:
   - Billing SaaS.
   - Multi-empresa y multi-establecimiento.
   - Multi-pais/fiscalidad compleja.
   - Microservicios.
   - Marketplace/plugins.
5. Siguiente paso natural: convertir PRD en backlog de epicas o contratos tecnicos.
6. Mantener `plan-desarrollo.md` como plan operativo cuando cambie el orden de implementacion.

---

## 5. Protocolo operativo por tarea

1. Leer contexto obligatorio.
2. Entender alcance real de la peticion.
3. Hacer cambios documentales minimos y coherentes.
4. Validar consistencia del documento:
   - No contradicciones entre un solo negocio, modulos y arquitectura.
   - Cada modulo mantiene responsabilidad clara y bajo acoplamiento.
   - La API publica no expone datos internos.
   - No quedan decisiones criticas abiertas si el usuario pidio cerrarlas.
5. Registrar entrada en bitacora.
6. Entregar resumen con cambios, validacion y pendientes.

---

## 6. Regla de estado

Cada accion que cambie archivos debe registrar estado en esta bitacora.

Formato:

```md
### [YYYY-MM-DD HH:mm] Accion
- Objetivo:
- Cambio aplicado:
- Archivos:
- Validacion:
- Estado del plan:
- Riesgos / pendientes:
```

---

## 7. Criterios tecnicos no negociables

- Documentacion en espanol.
- Usar ASCII salvo necesidad clara.
- Mantener requisitos accionables, no texto generico.
- Distinguir producto, arquitectura, datos, API, realtime, seguridad, calidad y fuera de alcance.
- No mezclar decisiones abiertas con requisitos ya decididos.
- No introducir complejidad SaaS, tenancy o multi-establecimiento mientras el alcance sea un solo negocio.
- No borrar contexto util sin sustituirlo por una version mejor.
- No modificar archivos ajenos al alcance pedido.

---

## 8. Decisiones ya tomadas

- La nueva aplicacion se especifica para un solo negocio en v1.
- SaaS, multi-empresa y multi-establecimiento quedan fuera del alcance inicial.
- No se usara `Empresa` como tenant ni `Establecimiento` como filtro obligatorio en el MVP.
- La aplicacion debe exponer API publica de solo lectura para carta, platos y menu de la web.
- El MVP sigue siendo TPV operativo.
- El idioma de codigo propio debe ser espanol total.
- La salida documental deseada es PRD + arquitectura.

---

## 9. Agentes locales

Los agentes locales siguen activos y se ajustan al PRD monolitico modular para un solo negocio. Ninguno se descarta por ahora; cada uno aporta una responsabilidad distinta.

| Agente | Archivo | Estado | Uso principal |
| --- | --- | --- | --- |
| Tech Lead | `.codex/agents/tech-lead.md` | Activo | Coordinar arquitectura, modulos, contratos, decisiones y handoff. |
| Backend Developer | `.codex/agents/backend-developer.md` | Activo | Implementar casos de uso, API privada, API publica, permisos, auditoria y realtime. |
| Database Designer | `.codex/agents/database-designer.md` | Activo | Disenar modelo de datos, constraints, indices, auditoria e historial sin tenancy v1. |
| Disenador UX/UI | `.codex/agents/diseñador-ux-ui.md` | Activo | Definir flujos, pantallas, componentes reutilizables y estados. |
| Frontend Developer | `.codex/agents/frontend-developer.md` | Activo | Implementar UI privada, web publica, hooks, cliente API y componentes. |
| QA Test Executor | `.codex/agents/qa-test-executor.md` | Activo | Validar flujos criticos, regresion, API publica, permisos, stock, caja y realtime. |
| Security Auditor | `.codex/agents/security-auditor.md` | Activo | Auditar auth, permisos, API publica, datos, secretos, DB e infraestructura. |

Reglas de sintonia:

- Todos leen `AGENTS.md` y `aplicacion-requisitos.md`.
- `CLAUDE.md`, si reaparece, sera contexto adicional, no fuente superior al PRD actual.
- Ningun agente debe introducir SaaS, multi-empresa, multi-establecimiento, tenancy preventiva ni microservicios sin nueva decision explicita.
- Tech Lead coordina conflictos entre agentes.
- QA y Security validan antes de considerar cerrada una entrega sensible.

---

## 10. Bitacora de acciones

### [2026-04-28 19:03] Cerrar Fase 0 - decisiones de stack y CLAUDE.md
- Objetivo: cerrar Fase 0 del `plan-desarrollo.md` registrando decisiones de stack confirmadas por el usuario y dejando contexto operativo para futuras sesiones de Claude Code.
- Cambio aplicado: creado `CLAUDE.md` apuntando a `AGENTS.md` y `aplicacion-requisitos.md` como fuentes superiores, listando restricciones v1 y arquitectura objetivo; actualizado `README.md` con stack confirmado (Node 22 LTS, pnpm workspaces, Next.js, TypeScript, PostgreSQL 16 via Docker, Prisma, socket.io, Vitest, Biome, auth propia con argon2id, pagina publica dentro de `apps/tpv`), convencion de scripts y primera ejecucion. Tarea interrumpida por el usuario antes de empezar Fase 1 (scaffold).
- Archivos: `CLAUDE.md`, `README.md`, `AGENTS.md`.
- Validacion: `Get-Date -Format 'yyyy-MM-dd HH:mm'` -> `2026-04-28 19:03`; leidos `AGENTS.md`, `aplicacion-requisitos.md`, `plan-desarrollo.md`, `README.md`, `.codex/agents/`, `.codex/skills/`; confirmacion explicita del usuario sobre defaults de stack antes de escribir; sin codigo creado todavia, no aplican gates de lint/type-check/build.
- Estado del plan: Fase 0 cerrada (README + decisiones + bitacora). Fase 1 (scaffold monorepo) preparada como siguiente paso pero no iniciada.
- Riesgos / pendientes: pendientes no bloqueantes del PRD siguen abiertos (proveedor final de imagenes, politica exacta de cache publica, fiscalidad local, integracion de pagos); Fase 1 debe arrancar creando `package.json` raiz, `pnpm-workspace.yaml`, `tsconfig.base.json`, `biome.json`, `docker-compose.yml`, `.env.example` y skeleton de `apps/tpv` + `packages/{dominio,aplicacion,contratos,infra,ui}`.

### [2026-04-28 16:46] Crear plan de desarrollo por fases
- Objetivo: convertir `aplicacion-requisitos.md` en un plan operativo para construir el proyecto real desde cero.
- Cambio aplicado: creado `plan-desarrollo.md` con fases desde preparacion del repo hasta hardening MVP, incluyendo entregables, tareas, agentes responsables, gates, riesgos y handoff inicial; enlazado el plan desde `aplicacion-requisitos.md`; actualizado `AGENTS.md` para tratar `plan-desarrollo.md` como contexto obligatorio cuando la tarea toque implementacion, fases, backlog, epicas o priorizacion.
- Archivos: `plan-desarrollo.md`, `aplicacion-requisitos.md`, `AGENTS.md`.
- Validacion: `Get-Date -Format 'yyyy-MM-dd HH:mm'` -> `2026-04-28 16:46`; leidos `aplicacion-requisitos.md`, `AGENTS.md`, `.codex/agents/tech-lead.md`, `.codex/skills/check-modularidad/SKILL.md.md` y `.codex/skills/handoff-agente/SKILL.md.md`; busqueda final solo encontro menciones intencionales de `empresaId`/`establecimientoId` como prohibicion v1 y selectores como ausencia explicita; `git diff --check` sin errores, solo avisos LF/CRLF de Windows; `git status --short` muestra `plan-desarrollo.md` nuevo junto a cambios documentales previos.
- Estado del plan: plan operativo inicial creado.
- Riesgos / pendientes: convertir fases en epicas/issues; cerrar decisiones tecnicas de Fase 0 antes de scaffold.

### [2026-04-28 10:48] Implementar hooks documentales
- Objetivo: reemplazar hooks obsoletos de `.codex/settings.json` por los hooks documentales propuestos para el PRD actual.
- Cambio aplicado: sustituida configuracion anterior de hooks, eliminando tracker hacia `plan-refactorizacion.md` externo y referencia a `CLAUDE.md` como actualizacion objetivo; conectados `orquestador-prd`, `guardian-alcance-prd`, `guardian-agentes` y `guardian-bitacora`; actualizado `.codex/hooks/README.md` para marcar la primera fase como implementada.
- Archivos: `.codex/settings.json`, `.codex/hooks/README.md`, `AGENTS.md`.
- Validacion: `Get-Date -Format 'yyyy-MM-dd HH:mm'` -> `2026-04-28 10:48`; leido `.codex/settings.json` previo; `.codex/settings.json` parsea correctamente con `ConvertFrom-Json`; no quedan referencias en settings a `plan-refactorizacion`, `TRACKER DEL PLAN`, `Actualizar CLAUDE`, `tech-lead-revisor`, `frontend-developer-es` ni `devops-infrastructure-engineer`; `git diff --check` sin errores, solo avisos LF/CRLF de Windows.
- Estado del plan: hooks documentales conectados; hooks de codigo quedan pendientes hasta crear `apps/tpv` y `packages/*`.
- Riesgos / pendientes: validar formato JSON y ajustar prompts si generan ruido en uso real.

### [2026-04-28 10:43] Proponer hooks locales
- Objetivo: pensar y documentar los hooks necesarios para `.codex/hooks`, alineados con el PRD actual y la orquestacion local.
- Cambio aplicado: creado `.codex/hooks/README.md` con propuesta de hooks por prioridad y fase: orquestador PRD, guardian de alcance, codigo en espanol, API publica, modularidad, agentes, bitacora, DB, UI y sugeridor QA/Security; detectado que `.codex/settings.json` mantiene hooks antiguos con referencias a `CLAUDE.md`, `plan-refactorizacion.md` y path externo.
- Archivos: `.codex/hooks/README.md`, `AGENTS.md`.
- Validacion: `Get-Date -Format 'yyyy-MM-dd HH:mm'` -> `2026-04-28 10:43`; listado `.codex/hooks` vacio antes del cambio; leidos `AGENTS.md`, `aplicacion-requisitos.md`, `.codex/settings.json`, `.codex/settings.local.json` y `.codex/orchestration-config.json`.
- Estado del plan: propuesta documentada; no se conectaron hooks en `settings.json` todavia.
- Riesgos / pendientes: reemplazar hooks obsoletos de `.codex/settings.json` cuando se apruebe implementacion; decidir si se usan prompts inline o scripts locales.

### [2026-04-28 10:13] Alinear agentes locales con PRD monolitico
- Objetivo: ajustar agentes locales para trabajar en sintonia con el enfoque actual: TPV para un solo negocio, monolito modular, UI reutilizable y API publica de carta/menu/platos.
- Cambio aplicado: reescritos `backend-developer`, `database-designer`, `diseñador-ux-ui`, `frontend-developer`, `qa-test-executor`, `security-auditor` y `tech-lead`; todos pasan a leer `AGENTS.md` y `aplicacion-requisitos.md`, abandonan dependencia obligatoria de `CLAUDE.md`, declaran estado activo y prohiben introducir SaaS/tenancy preventiva; documentada matriz de agentes en `AGENTS.md` y `aplicacion-requisitos.md`.
- Archivos: `.codex/agents/backend-developer.md`, `.codex/agents/database-designer.md`, `.codex/agents/diseñador-ux-ui.md`, `.codex/agents/frontend-developer.md`, `.codex/agents/qa-test-executor.md`, `.codex/agents/security-auditor.md`, `.codex/agents/tech-lead.md`, `AGENTS.md`, `aplicacion-requisitos.md`.
- Validacion: leidos `aplicacion-requisitos.md`, `AGENTS.md`, agentes locales, `.codex/skills/check-modularidad/SKILL.md.md`, `.codex/skills/handoff-agente/SKILL.md.md`; `Get-Date -Format 'yyyy-MM-dd HH:mm'` -> `2026-04-28 10:13`; busqueda final solo encontro menciones intencionales de `empresaId`/`establecimientoId` como prohibicion v1; `git diff --check` sin errores, solo avisos LF/CRLF de Windows; `git status --short` muestra los siete agentes, `AGENTS.md` y `aplicacion-requisitos.md` modificados.
- Estado del plan: agentes alineados; ninguno descartado por ahora porque todos cubren una responsabilidad distinta.
- Riesgos / pendientes: no se descarta ningun agente por ahora; si alguno duplica salida en la fase de implementacion, marcarlo como pausado antes de eliminarlo.

### [2026-04-28 09:55] Reorientar PRD a un solo negocio
- Objetivo: reestructurar `aplicacion-requisitos.md` para abandonar la complejidad SaaS por ahora y centrar el producto en un TPV para un solo negocio.
- Cambio aplicado: reemplazado el PRD SaaS-ready por una especificacion de monolito modular con roles internos, modulos operativos, UI reutilizable, API publica de carta/menu/platos, modelo de datos sin tenancy, realtime sin canales por empresa/establecimiento, roadmap y criterios de aceptacion ajustados al nuevo alcance; sincronizadas mision, prioridad y decisiones de `AGENTS.md`.
- Archivos: `aplicacion-requisitos.md`, `AGENTS.md`.
- Validacion: `Get-Date -Format 'yyyy-MM-dd HH:mm'` -> `2026-04-28 09:55`; leidos `aplicacion-requisitos.md`, `.codex/agents/tech-lead.md`, `.codex/skills/check-modularidad/SKILL.md.md`, `.codex/skills/handoff-agente/SKILL.md.md`; `git status --short` observado -> `M AGENTS.md`, `M aplicacion-requisitos.md`.
- Estado del plan: PRD reorientado a un solo negocio y guia local sincronizada.
- Riesgos / pendientes: queda pendiente convertir el PRD en backlog de epicas o contratos tecnicos; confirmar si la pagina publica vivira dentro de `apps/tpv` o como frontend externo consumidor de la API.

### [2026-04-27 15:39] Corregir AGENTS tras conectar git
- Objetivo: corregir estado abierto de `AGENTS.md` antes de `git push`, alineandolo con repo actual y PRD ya aplicado.
- Cambio aplicado: actualizado estado local para reflejar `.git` presente, `git status --short` operativo y `aplicacion-requisitos.md` ya convertido en PRD SaaS-ready; prioridad vigente cambiada de reescritura pendiente a mantenimiento/refinado; anadida entrada faltante de PRD SaaS-ready.
- Archivos: `AGENTS.md`.
- Validacion: `Get-Date -Format 'yyyy-MM-dd HH:mm'` -> `2026-04-27 15:39`; revision previa detecto PRD existente en `aplicacion-requisitos.md`; `git status --short` final -> `M AGENTS.md`.
- Estado del plan: AGENTS queda sincronizado para push.
- Riesgos / pendientes: queda pendiente commit/push de `AGENTS.md`.

### [2026-04-27 15:18] PRD SaaS-ready
- Objetivo: convertir `aplicacion-requisitos.md` en especificacion PRD + arquitectura para SaaS multi-empresa y multi-establecimiento.
- Cambio aplicado: reemplazado el documento por una especificacion estructurada con resumen ejecutivo, alcance, modelo SaaS, roles/permisos, modulos por ambito, arquitectura monorepo, modelo de datos, API, realtime, frontend, seguridad, calidad, roadmap, criterios de aceptacion, decisiones cerradas y pendientes no bloqueantes.
- Archivos: `aplicacion-requisitos.md`, `AGENTS.md`.
- Validacion: leidos `AGENTS.md`, `.codex/agents/tech-lead.md`, `.codex/skills/check-modularidad/SKILL.md.md`, `.codex/skills/handoff-agente/SKILL.md.md`; confirmado `.git` presente y `git status --short` operativo; revisado que cada modulo declara ambito empresa/establecimiento/ambos y que SaaS base no queda como decision abierta.
- Estado del plan: PRD SaaS-ready aplicado; siguiente paso natural seria crear backlog de epicas o contratos tecnicos.
- Riesgos / pendientes: repo actual mantiene cambios documentales pendientes de commit/push; no hay codigo fuente de app en este repo para validar contra implementacion real.

### [2026-04-27 13:57] Crear AGENTS local
- Objetivo: crear una guia operativa local para este repo/documentacion.
- Cambio aplicado: creado `AGENTS.md` con contexto obligatorio, mision, estado local, prioridades, protocolo, criterios, decisiones y bitacora.
- Archivos: `AGENTS.md`.
- Validacion: confirmado root actual con `.codex/` y `aplicacion-requisitos.md`; `git status` indica que el directorio actual no es repo git; no se encontraron `CLAUDE.md` ni `plan-refactorizacion.md`.
- Estado del plan: preparada base local para continuar conversion de `aplicacion-requisitos.md` a PRD SaaS-ready.
- Riesgos / pendientes: falta ejecutar la reescritura del PRD; si el codigo fuente original vuelve a estar disponible, debe revalidarse contra repo real.
