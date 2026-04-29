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

### [2026-04-29 10:37] Avanzar Fase 13 - desgloses por producto/categoria/turno con permisos
- Objetivo: continuar Fase 13 del `plan-desarrollo.md` ampliando informes con vistas agregadas por ejes operativos clave y permisos por tipo.
- Cambio aplicado: creados endpoints `GET /api/privado/informes/desglose-producto` y `GET /api/privado/informes/desglose-categoria` protegidos por `puedeVerAnalitica` y endpoint `GET /api/privado/informes/desglose-turno` protegido por `puedeVerInformes`; ampliado cliente API con tipos y funciones para los tres desgloses; extendida UI `/informes` con selector de rango temporal, tarjetas de ventas por producto/categoria/turno y recarga unificada junto con auditoria filtrable.
- Archivos: `apps/tpv/app/api/privado/informes/desglose-producto/route.ts`, `apps/tpv/app/api/privado/informes/desglose-categoria/route.ts`, `apps/tpv/app/api/privado/informes/desglose-turno/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/informes/panel-informes.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas de desglose activas.
- Estado del plan: Fase 13 progresa con informes desagregados y separacion inicial de permisos (`informes` vs `analitica`).
- Riesgos / pendientes: falta granularidad por dispositivo/usuario y comparativas historicas (periodo vs periodo); pendiente exportacion CSV/PDF y tablero de tendencias para cierre de fase.

### [2026-04-29 10:34] Iniciar Fase 13 - auditoria consultable e informe resumen operativo
- Objetivo: arrancar Fase 13 del `plan-desarrollo.md` con trazabilidad consultable y primer dashboard agregado interno.
- Cambio aplicado: creado endpoint `GET /api/privado/auditoria` con filtros basicos (`entidad`, `accion`, `limite`) protegido por permiso `puedeVerAuditoria`; creado endpoint `GET /api/privado/informes/resumen` protegido por `puedeVerInformes`, agregando ventas (pagos), caja (entradas/salidas manuales) y stock (consumo/recepciones) en un rango temporal; extendido cliente API con `obtenerAuditoria` y `obtenerInformeResumen`; creada pantalla privada `/informes` con panel de resumen y lista de auditoria filtrable; agregado acceso `Informes` en navegacion privada.
- Archivos: `apps/tpv/app/api/privado/auditoria/route.ts`, `apps/tpv/app/api/privado/informes/resumen/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/informes/page.tsx`, `apps/tpv/app/(privado)/informes/panel-informes.tsx`, `apps/tpv/app/(privado)/layout.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas `/api/privado/auditoria`, `/api/privado/informes/resumen` y `/informes` activas.
- Estado del plan: Fase 13 iniciada con base de auditoria e informes operativos internos.
- Riesgos / pendientes: faltan informes desglosados por producto/categoria/turno y permisos mas granulares por tipo de informe; pendiente exportacion y metricas historicas para cierre de fase.

### [2026-04-29 10:30] Avanzar Fase 12 - normalizacion de unidades y estrategia de coste
- Objetivo: continuar Fase 12 del `plan-desarrollo.md` mejorando precision de coste/margen en escandallos.
- Cambio aplicado: extendido modelo con `ProductoProveedor.unidadesPorCompra` y `LineaEscandallo.unidadUso` (migracion SQL fase 12); ampliado `esquemaVincularProductoProveedor` y `esquemaAnadirLineaEscandallo` para capturar normalizacion de unidades; mejorado `calcularCosteReceta` con estrategia seleccionable `ultimo` o `promedio` sobre historico de precios y conversion a coste unitario por `unidadesPorCompra`; actualizado endpoint `GET /api/privado/escandallos/:id/coste` para aceptar query `estrategia`; extendido cliente API y UI `/compras` con selector de estrategia y visualizacion de unidades por compra.
- Archivos: `packages/infra/prisma/schema.prisma`, `packages/infra/prisma/migrations/20260429111500_fase12_unidades_coste_estrategia/migration.sql`, `apps/tpv/src/api/privado/compras/compras-servicio.ts`, `apps/tpv/app/api/privado/escandallos/[id]/coste/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/compras/panel-compras.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm --filter @el-jardin/infra db:generate` OK; `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK.
- Estado del plan: Fase 12 consolida el bloque de coste interno con una base mas realista de unidades y estrategia de valoracion.
- Riesgos / pendientes: conversion de unidades sigue simple (entero por compra) y no contempla escalas complejas (g/ml/kg/l); pendiente incorporar reporte agregado de coste/margen por categoria/periodo en Fase 13.

### [2026-04-29 10:27] Avanzar Fase 12 - recetas/escandallos y coste-margen base
- Objetivo: continuar Fase 12 del `plan-desarrollo.md` incorporando escandallos y calculo interno de coste/margen por producto.
- Cambio aplicado: extendido modelo de datos con `RecetaEscandallo` y `LineaEscandallo` (migracion SQL fase 12); ampliado servicio de compras con `crearRecetaEscandallo`, `anadirLineaEscandallo` y `calcularCosteReceta` tomando como base el ultimo `precioActualCentimos` de proveedor por ingrediente y aplicando merma/porciones; implementados endpoints `GET/POST /api/privado/escandallos`, `POST /api/privado/escandallos/:id/lineas` y `GET /api/privado/escandallos/:id/coste`; extendido cliente API y UI `/compras` para crear receta, anadir ingredientes y calcular coste/porcion + margen.
- Archivos: `packages/infra/prisma/schema.prisma`, `packages/infra/prisma/migrations/20260429110000_fase12_escandallos_base/migration.sql`, `apps/tpv/src/api/privado/compras/compras-servicio.ts`, `apps/tpv/app/api/privado/escandallos/route.ts`, `apps/tpv/app/api/privado/escandallos/[id]/lineas/route.ts`, `apps/tpv/app/api/privado/escandallos/[id]/coste/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/compras/panel-compras.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm --filter @el-jardin/infra db:generate` OK; `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas `api/privado/escandallos*` activas.
- Estado del plan: Fase 12 gana cobertura de costes internos y margen estimado, alineada con objetivo de escandallos.
- Riesgos / pendientes: coste actual usa ultimo precio proveedor simple (pendiente estrategia de coste medio/ponderado y conversion de unidades); falta reporte agregado de margen por periodo para enlazar con fase de informes.

### [2026-04-29 10:23] Avanzar Fase 12 - pedido de compra y recepcion con impacto en stock
- Objetivo: continuar Fase 12 del `plan-desarrollo.md` incorporando ciclo base de compras con recepcion de mercancia y reflejo automatico en inventario.
- Cambio aplicado: extendido modelo de datos con `PedidoCompra`, `LineaPedidoCompra`, `RecepcionCompra` y `LineaRecepcionCompra` (enum `EstadoPedidoCompra` + migracion SQL); ampliado servicio de compras con `crearPedidoCompra` y `recepcionarPedidoCompra` validando pendientes por linea; implementados endpoints `GET/POST /api/privado/pedidos-compra` y `POST /api/privado/pedidos-compra/:id/recepcionar`; en recepcion se incrementa `StockFisico` y se registra `MovimientoStock` tipo `recepcion_compra`; ampliado cliente API y UI `/compras` para crear pedido y recepcionar lineas desde panel operativo.
- Archivos: `packages/infra/prisma/schema.prisma`, `packages/infra/prisma/migrations/20260429104500_fase12_pedidos_compra_recepciones/migration.sql`, `apps/tpv/src/api/privado/compras/compras-servicio.ts`, `apps/tpv/app/api/privado/pedidos-compra/route.ts`, `apps/tpv/app/api/privado/pedidos-compra/[id]/recepcionar/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/compras/panel-compras.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm --filter @el-jardin/infra db:generate` OK; `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas `api/privado/pedidos-compra*` activas.
- Estado del plan: Fase 12 progresa con flujo end-to-end minimo de compra -> recepcion -> aumento de stock.
- Riesgos / pendientes: pendiente recepcion por unidades de conversion/mermas y conciliacion de coste medio; falta bloque de recetas/escandallos y vistas de coste/margen para cierre funcional de fase.

### [2026-04-29 10:19] Iniciar Fase 12 - proveedores, vinculacion y historial de precios
- Objetivo: arrancar Fase 12 del `plan-desarrollo.md` con la base de compras (proveedores, producto-proveedor e historial de precios).
- Cambio aplicado: extendido modelo de datos con `Proveedor`, `ProductoProveedor` y `HistorialPrecioProveedor` (incluida migracion SQL); creada capa de servicio de compras con validaciones para alta de vinculacion y registro automatico de primer precio; implementada API privada `GET/POST /api/privado/proveedores`, `GET/POST /api/privado/productos-proveedor` y `POST /api/privado/productos-proveedor/:id/precio`; ampliado cliente API privado con operaciones de compras; creada UI privada `/compras` para alta de proveedor, vinculacion producto-proveedor y actualizacion de precio con traza historica; agregada entrada `Compras` en navegacion privada.
- Archivos: `packages/infra/prisma/schema.prisma`, `packages/infra/prisma/migrations/20260429103000_fase12_proveedores_base/migration.sql`, `apps/tpv/src/api/privado/compras/compras-servicio.ts`, `apps/tpv/app/api/privado/proveedores/route.ts`, `apps/tpv/app/api/privado/productos-proveedor/route.ts`, `apps/tpv/app/api/privado/productos-proveedor/[id]/precio/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/compras/page.tsx`, `apps/tpv/app/(privado)/compras/panel-compras.tsx`, `apps/tpv/app/(privado)/layout.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm --filter @el-jardin/infra db:generate` OK; `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas `api/privado/{proveedores,productos-proveedor}` y pagina `/compras` activas.
- Estado del plan: Fase 12 iniciada con capacidad operativa minima para gestionar proveedores y precios de compra.
- Riesgos / pendientes: falta modelar `PedidoCompra` y `RecepcionCompra` con impacto directo en `MovimientoStock`; pendiente calculo de coste/margen derivado y bloque de recetas/escandallos para completar fase.

### [2026-04-29 10:15] Avanzar Fase 11 - reintentos de cola de impresion
- Objetivo: continuar Fase 11 del `plan-desarrollo.md` endureciendo la operativa de impresion con reprocesado de trabajos fallidos/pendientes.
- Cambio aplicado: ampliado `servicio-impresion` con motor de reprocesado (`reprocesarTrabajoImpresion`) y procesamiento por lote (`procesarTrabajosPendientes`) con limite de intentos; creado endpoint `POST /api/privado/impresion/trabajos/:id/reintentar` para reintento manual y endpoint `POST /api/privado/impresion/procesar-pendientes` para reprocesar cola en bloque; extendido cliente API con `reintentarTrabajoImpresion` y `procesarPendientesImpresion`; actualizada UI `/impresoras` con botones de `Reprocesar cola` y `Reintentar` por trabajo en error/pendiente.
- Archivos: `apps/tpv/src/api/privado/impresion/servicio-impresion.ts`, `apps/tpv/app/api/privado/impresion/trabajos/[id]/reintentar/route.ts`, `apps/tpv/app/api/privado/impresion/procesar-pendientes/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/impresoras/panel-impresoras.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas `api/privado/impresion/{procesar-pendientes,trabajos/[id]/reintentar}` activas.
- Estado del plan: Fase 11 gana resiliencia operativa en impresion sin bloquear flujo de sala/caja.
- Riesgos / pendientes: reintentos aun son manuales/on-demand (pendiente scheduler periodico real); falta metrica agregada de tasa de fallo por impresora para observabilidad.

### [2026-04-29 10:10] Avanzar Fase 11 - impresoras por zona, tickets y registro de fallos
- Objetivo: continuar Fase 11 del `plan-desarrollo.md` implementando capa base de impresoras y tickets de cocina/barra/precuenta/recibo sin bloquear operacion ante fallos.
- Cambio aplicado: extendido modelo de datos con `Impresora` y `TrabajoImpresion` (enums `TipoTicketImpresion`, `EstadoTrabajoImpresion`) y migracion SQL; creado servicio de impresion con adaptador reemplazable y regla de resiliencia (si falla envio, se registra `estado=error` y no se bloquea el flujo); creada API privada de gestion (`GET/POST /api/privado/impresoras`, `GET/POST /api/privado/impresion/trabajos`); creados endpoints de impresion operativa `POST /api/privado/pedidos/:id/imprimir-precuenta`, `POST /api/privado/pedidos/:id/imprimir-recibo`, `POST /api/privado/pedidos/:id/imprimir-produccion`; ampliado cliente API y UI privada con nueva pagina `/impresoras`; integrada accion desde `/sala` para imprimir precuenta/recibo/cocina/barra.
- Archivos: `packages/infra/prisma/schema.prisma`, `packages/infra/prisma/migrations/20260429101500_fase11_impresoras_trabajos/migration.sql`, `apps/tpv/src/api/privado/impresion/servicio-impresion.ts`, `apps/tpv/app/api/privado/impresoras/route.ts`, `apps/tpv/app/api/privado/impresion/trabajos/route.ts`, `apps/tpv/app/api/privado/pedidos/[id]/imprimir-precuenta/route.ts`, `apps/tpv/app/api/privado/pedidos/[id]/imprimir-recibo/route.ts`, `apps/tpv/app/api/privado/pedidos/[id]/imprimir-produccion/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/impresoras/page.tsx`, `apps/tpv/app/(privado)/impresoras/panel-impresoras.tsx`, `apps/tpv/app/(privado)/layout.tsx`, `apps/tpv/app/(privado)/sala/panel-sala.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm --filter @el-jardin/infra db:generate` OK; `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas de impresion e interfaz `/impresoras` activas.
- Estado del plan: Fase 11 progresa con impresoras por zona y trazabilidad de impresion (incluido registro de errores no bloqueantes).
- Riesgos / pendientes: adaptador actual es basico/simulado (pendiente integracion real de driver/protocolo de impresoras); falta politica de reintentos automáticos/backoff y cola durable distribuida para despliegues multiinstancia.

### [2026-04-29 10:03] Avanzar Fase 11 - flujo guiado reserva sentada con apertura de pedido
- Objetivo: continuar Fase 11 del `plan-desarrollo.md` conectando la transicion `sentada` con operativa real de sala.
- Cambio aplicado: creado endpoint `POST /api/privado/reservas/:id/sentar` que valida estado de reserva, exige mesa asignada y, si la mesa no tiene pedido activo, abre pedido automaticamente reutilizando `abrirPedidoEnMesa`; si la mesa ya tiene pedido activo utilizable, lo reutiliza; al final marca la reserva como `sentada` y devuelve `pedidoId`; actualizado cliente API con `sentarReservaConApertura`; ajustada UI `/reservas` para que el boton `Sentar` dispare el nuevo flujo guiado en lugar de solo cambiar estado.
- Archivos: `apps/tpv/app/api/privado/reservas/[id]/sentar/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/reservas/panel-reservas.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con ruta `api/privado/reservas/[id]/sentar` activa.
- Estado del plan: Fase 11 progresa con enlace funcional entre reservas y flujo operativo de sala.
- Riesgos / pendientes: pendiente UX de redireccion opcional al pedido abierto/reutilizado tras sentar; falta cubrir QA de concurrencia cuando dos operadores intentan sentar la misma reserva en paralelo.

### [2026-04-29 10:01] Avanzar Fase 11 - asignacion de mesa y validacion de solapamientos
- Objetivo: continuar Fase 11 del `plan-desarrollo.md` con asignacion operativa de mesas en reservas y control de disponibilidad por franja horaria.
- Cambio aplicado: ampliado `reservas-servicio` con validacion de solapamiento por franja (+/- 120 min) para estados activos (`pendiente`, `confirmada`, `sentada`), validacion de capacidad de mesa y bloqueo de asignacion en reservas cerradas; reforzada creacion de reserva para validar mesa activa + conflicto de franja cuando se informa `mesaId`; creado endpoint `POST /api/privado/reservas/:id/asignar-mesa`; actualizado cliente API con `asignarMesaAReserva`; extendida UI `/reservas` para cargar mesas activas y asignarlas por reserva.
- Archivos: `apps/tpv/src/api/privado/reservas/reservas-servicio.ts`, `apps/tpv/app/api/privado/reservas/[id]/asignar-mesa/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/reservas/panel-reservas.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con ruta `api/privado/reservas/[id]/asignar-mesa` activa.
- Estado del plan: Fase 11 progresa con primera capa de disponibilidad de mesas en reservas (asignacion + conflictos por franja).
- Riesgos / pendientes: la franja de 120 min es fija y debe parametrizarse por negocio/servicio; falta enlazar transicion `reserva sentada` con apertura guiada de mesa/pedido y cubrir QA de concurrencia de asignaciones simultaneas.

### [2026-04-29 09:58] Iniciar Fase 11 - clientes, reservas y lista de espera (base funcional)
- Objetivo: arrancar Fase 11 del `plan-desarrollo.md` con el primer bloque operativo de gestion diaria alrededor del servicio.
- Cambio aplicado: extendido modelo de datos con `Cliente`, `Reserva` y `EntradaEspera` (incluyendo enums `EstadoReserva` y `EstadoListaEspera` + migracion SQL); creada capa API privada para `clientes`, `reservas` y `lista-espera` con alta/listado/cambio de estado; anadido servicio de validacion `reservas-servicio`; ampliado cliente API privado y creada nueva UI `/reservas` para alta rapida y operativa de estados de reservas/espera; agregado acceso `Reservas` en navegacion privada.
- Archivos: `packages/infra/prisma/schema.prisma`, `packages/infra/prisma/migrations/20260429095500_fase11_reservas_clientes_espera/migration.sql`, `apps/tpv/src/api/privado/reservas/reservas-servicio.ts`, `apps/tpv/app/api/privado/clientes/route.ts`, `apps/tpv/app/api/privado/reservas/route.ts`, `apps/tpv/app/api/privado/reservas/[id]/estado/route.ts`, `apps/tpv/app/api/privado/lista-espera/route.ts`, `apps/tpv/app/api/privado/lista-espera/[id]/estado/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/reservas/page.tsx`, `apps/tpv/app/(privado)/reservas/panel-reservas.tsx`, `apps/tpv/app/(privado)/layout.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm --filter @el-jardin/infra db:generate` OK; `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas `api/privado/{clientes,reservas,lista-espera}` y pagina `/reservas` activas.
- Estado del plan: Fase 11 iniciada con base de datos + API + UI operativa minima para clientes, reservas y espera.
- Riesgos / pendientes: pendiente asignacion de reserva a mesa con validacion de disponibilidad horaria, integracion con impresoras para tickets de cocina/barra/precuenta/recibo y endurecimiento QA de transiciones de estado.

### [2026-04-29 09:47] Avanzar Fase 10 - ticket basico de recibo en API privada y sala
- Objetivo: continuar Fase 10 del `plan-desarrollo.md` completando entregable de `Tickets/precuenta basicos` con recibo operativo de pedido cobrado.
- Cambio aplicado: agregado servicio `obtenerTicketPedidoBasico` para construir ticket con negocio, mesa, lineas, resumen de cobro y detalle de pagos (incluyendo divisiones cuando aplica); creado endpoint `GET /api/privado/pedidos/:id/ticket`; extendido cliente API privado con `obtenerTicketPedido`; integrada accion `Ver ticket` en `/sala` para consulta rapida del recibo tras cobro.
- Archivos: `apps/tpv/src/api/privado/caja/caja-servicio.ts`, `apps/tpv/app/api/privado/pedidos/[id]/ticket/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/sala/panel-sala.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con ruta `api/privado/pedidos/[id]/ticket` activa.
- Estado del plan: Fase 10 sigue avanzando y ya cubre precuenta basica + ticket basico + cobro normal/mixto/dividido + informe/movimientos de caja.
- Riesgos / pendientes: impresion fisica y adaptador de impresoras quedan para Fase 11; pendiente QA funcional de escenarios de ticket con multiples pagos divididos y cierre de caja descuadrada.

### [2026-04-29 09:40] Avanzar Fase 10 - cuenta dividida y precuenta basica
- Objetivo: continuar Fase 10 del `plan-desarrollo.md` incorporando soporte de cuenta dividida y precuenta operativa.
- Cambio aplicado: extendido modelo de pagos con `SesionPago` y `PagoDividido` (incluida migracion SQL) para registrar cobros divididos de forma trazable; ampliado `esquemaCobroCaja` y `registrarCobroEnCaja` para aceptar `divisiones[]` y validar suma exacta del total; agregado endpoint `GET /api/privado/pedidos/:id/precuenta` con lineas activas y resumen de total; actualizado endpoint de cobro para propagar divisiones; integrado en UI de sala opcion de cuenta dividida simple (partes iguales) y accion de `Ver precuenta`.
- Archivos: `packages/infra/prisma/schema.prisma`, `packages/infra/prisma/migrations/20260429094000_fase10_sesion_pago_dividido/migration.sql`, `apps/tpv/src/api/privado/caja/caja-servicio.ts`, `apps/tpv/app/api/privado/pedidos/[id]/precuenta/route.ts`, `apps/tpv/app/api/privado/pedidos/[id]/cobrar/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/sala/panel-sala.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm --filter @el-jardin/infra db:generate` OK; `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con ruta `api/privado/pedidos/[id]/precuenta` activa.
- Estado del plan: Fase 10 avanza con cobertura de cuenta dividida y precuenta basica en backend+UI.
- Riesgos / pendientes: ticket/impresion de precuenta y recibo final siguen pendientes para fases siguientes; faltan pruebas QA de edge-cases de divisiones mixtas manuales.

### [2026-04-29 09:28] Avanzar Fase 10 - movimientos manuales e informe de caja
- Objetivo: continuar Fase 10 del `plan-desarrollo.md` anadiendo operativa de caja mas completa para turno real.
- Cambio aplicado: ampliado `caja-servicio` con `esquemaMovimientoManualCaja`, `registrarMovimientoManualCaja` y `obtenerInformeCajaActiva`; creados endpoints `POST /api/privado/caja/movimiento-manual` y `GET /api/privado/caja/informe`; extendido cliente API con `registrarMovimientoManualCaja` y `obtenerInformeCaja`; actualizada UI `/caja` para registrar entradas/salidas manuales (efectivo/tarjeta) y mostrar resumen de informe de turno (pagos, movimientos, saldo esperado).
- Archivos: `apps/tpv/src/api/privado/caja/caja-servicio.ts`, `apps/tpv/app/api/privado/caja/movimiento-manual/route.ts`, `apps/tpv/app/api/privado/caja/informe/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/caja/panel-caja.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas `api/privado/caja/informe` y `api/privado/caja/movimiento-manual` activas.
- Estado del plan: Fase 10 progresa con caja operativa ampliada (apertura/cobro/cierre + movimientos manuales + informe de turno).
- Riesgos / pendientes: pendiente cuenta dividida completa y tickets/precuenta para cerrar fase; recomendable QA sobre combinaciones de cobro mixto + salida manual + cierre descuadrado.

### [2026-04-29 09:22] Iniciar Fase 10 - caja y cobros (efectivo/tarjeta/mixto)
- Objetivo: arrancar Fase 10 del `plan-desarrollo.md` incorporando apertura/cierre de caja y cobro de pedido con metodos efectivo, tarjeta y mixto.
- Cambio aplicado: extendido esquema Prisma con `EstadoCaja`, `MetodoPago`, `Caja`, `MovimientoCaja` y `PagoPedido` (con migracion SQL fase 10); creado servicio de caja con `abrirCaja`, `obtenerCajaActiva`, `cerrarCaja` y `registrarCobroEnCaja` validando que cobro mixto sume exacto; creados endpoints privados `GET /api/privado/caja/estado`, `POST /api/privado/caja/apertura`, `POST /api/privado/caja/cierre`; actualizado `POST /api/privado/pedidos/:id/cobrar` para exigir formato de cobro, consolidar stock y registrar pago/movimientos de caja; creada UI privada `/caja` para apertura, estado y cierre; actualizado flujo de cobro en `/sala` con seleccion de metodo (efectivo/tarjeta/mixto) y montos mixtos; anadido acceso de navegacion a `Caja`.
- Archivos: `packages/infra/prisma/schema.prisma`, `packages/infra/prisma/migrations/20260429092000_fase10_caja_cobros/migration.sql`, `apps/tpv/src/api/privado/caja/caja-servicio.ts`, `apps/tpv/app/api/privado/caja/{estado,apertura,cierre}/route.ts`, `apps/tpv/app/api/privado/pedidos/[id]/cobrar/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/caja/{panel-caja.tsx,page.tsx}`, `apps/tpv/app/(privado)/sala/panel-sala.tsx`, `apps/tpv/app/(privado)/layout.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm --filter @el-jardin/infra db:generate` OK; `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas `/caja` y `api/privado/caja/*` activas.
- Estado del plan: Fase 10 iniciada con caja operativa base y cobro integrado al flujo de pedidos/stock.
- Riesgos / pendientes: faltan escenarios avanzados de caja (movimientos manuales, cuenta dividida completa, pre-cuenta/tickets) y validacion QA de cobro mixto/cierre descuadrado antes de cierre formal de fase.

### [2026-04-28 22:15] Avanzar Fase 9 - validacion de invariantes y consolidacion visible en UI
- Objetivo: reforzar Fase 9 con controles operativos de consistencia y visibilidad en interfaz privada.
- Cambio aplicado: extendido cliente API con `validarInvariantesStock`, `cobrarPedido` y tipos de resultado de invariantes; actualizado panel de sala con accion de `Cobrar y consolidar stock` para ejecutar flujo de consolidacion al cierre de pedido; ampliado panel de stock con boton `Validar invariantes` y visualizacion de incidencias por producto; agregado endpoint privado `GET /api/privado/stock/invariantes` y navegacion a `Stock` ya integrada.
- Archivos: `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/sala/panel-sala.tsx`, `apps/tpv/app/(privado)/stock/panel-stock.tsx`, `apps/tpv/app/api/privado/stock/invariantes/route.ts`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con ruta `api/privado/stock/invariantes` activa.
- Estado del plan: Fase 9 se consolida con control de invariantes y flujo visible de cobro+stock desde UI privada.
- Riesgos / pendientes: pendiente cubrir pruebas QA de concurrencia real sobre reservas simultaneas (dos terminales sobre mismo producto) y preparar entrada a Fase 10 (caja/cobros detallados) sin perder estas invariantes.

### [2026-04-28 22:12] Avanzar Fase 9 - UI de stock y cobro operativo desde sala
- Objetivo: continuar Fase 9 del `plan-desarrollo.md` cerrando ciclo operativo de stock en UI privada y consolidacion en flujo de sala.
- Cambio aplicado: extendido cliente API privado con `cobrarPedido`, `obtenerDisponibilidadStock` y `ajustarStock`; anadida accion de `Cobrar y consolidar stock` en la pantalla `/sala` para ejecutar `POST /api/privado/pedidos/:id/cobrar`; creada nueva pantalla privada `/stock` con tabla de disponibilidad (fisico/reservado/libre) y ajustes manuales por producto; incorporado acceso `Stock` en navegacion privada.
- Archivos: `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/sala/panel-sala.tsx`, `apps/tpv/app/(privado)/stock/panel-stock.tsx`, `apps/tpv/app/(privado)/stock/page.tsx`, `apps/tpv/app/(privado)/layout.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con ruta `/stock` activa.
- Estado del plan: Fase 9 progresa con operativa end-to-end en backend+UI (reservar, liberar, ajustar y consolidar al cobro).
- Riesgos / pendientes: faltan pruebas de concurrencia de reservas en escenarios de alta simultaneidad y cobertura QA de flujos mixtos (cancelacion + cobro + ajuste) antes de considerar cierre formal de fase.

### [2026-04-28 22:10] Iniciar Fase 9 - stock operativo con reserva/liberacion/consolidacion
- Objetivo: arrancar Fase 9 del `plan-desarrollo.md` implementando coherencia base entre pedidos y stock fisico.
- Cambio aplicado: extendido modelo Prisma con `StockFisico`, `ReservaStock` y `MovimientoStock` (incluida migracion SQL fase 9); creado servicio de stock con reglas de `reservarStockLinea`, `liberarReservaLinea`, `consolidarReservasPedido`, `obtenerDisponibilidadStock` y `ajustarStock`; integrado flujo de stock en `sala-servicio` (reserva al anadir linea, liberacion al cancelar linea por cualquier via); creados endpoints privados `GET /api/privado/stock/disponibilidad`, `POST /api/privado/stock/ajustes` y `POST /api/privado/pedidos/:id/cobrar` (cobro con validacion de lineas pendientes/preparacion + consolidacion de reservas).
- Archivos: `packages/infra/prisma/schema.prisma`, `packages/infra/prisma/migrations/20260428221500_fase9_stock_operativo/migration.sql`, `apps/tpv/src/api/privado/stock/stock-servicio.ts`, `apps/tpv/src/api/privado/sala-servicio.ts`, `apps/tpv/app/api/privado/stock/disponibilidad/route.ts`, `apps/tpv/app/api/privado/stock/ajustes/route.ts`, `apps/tpv/app/api/privado/pedidos/[id]/cobrar/route.ts`, `AGENTS.md`.
- Validacion: `corepack pnpm --filter @el-jardin/infra db:generate` OK; `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas de stock/cobro activas.
- Estado del plan: Fase 9 iniciada y funcional en backend con invariantes base de reservas y consolidacion en cobro.
- Riesgos / pendientes: falta UI privada dedicada de stock (ajustes/disponibilidad) y pruebas funcionales de concurrencia en reservas; consolidacion de stock en cobro se implementa ya para cumplir invariantes de fase, pero caja completa sigue siendo Fase 10.

### [2026-04-28 22:06] Avanzar Fase 8 - idempotencia cliente realtime y cola UI de cancelaciones
- Objetivo: reforzar cierre de Fase 8 mejorando reconexion/idempotencia de eventos y operacion administrativa en tiempo real.
- Cambio aplicado: endurecida deduplicacion en cliente realtime (`conectarRealtime`) para ignorar eventos con `id <= ultimoId` tanto en backlog como en stream SSE; ampliado cliente de sala con API de solicitudes de cancelacion (`obtenerSolicitudesCancelacion`, `resolverSolicitudCancelacion`); creada nueva pantalla privada `/cancelaciones` con panel operativo para aprobar/rechazar solicitudes y refresco realtime por canales `admin`/`sala`; anadido acceso de navegacion a `Cancelaciones` en layout privado.
- Archivos: `apps/tpv/src/cliente-api/realtime.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/cancelaciones/panel-cancelaciones.tsx`, `apps/tpv/app/(privado)/cancelaciones/page.tsx`, `apps/tpv/app/(privado)/layout.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con ruta `/cancelaciones` activa.
- Estado del plan: Fase 8 queda mas robusta en reconexion/eventos y operacion diaria de cancelaciones desde UI privada.
- Riesgos / pendientes: bus realtime en memoria sigue siendo monoinstancia (suficiente para desarrollo), faltan pruebas QA formales de reconexion prolongada y duplicidad bajo carga para cierre completo de fase.

### [2026-04-28 22:03] Avanzar Fase 8 - cliente realtime y pantallas cocina/barra en vivo
- Objetivo: continuar Fase 8 del `plan-desarrollo.md` conectando consumo realtime en frontend y habilitando superficies operativas de cocina/barra.
- Cambio aplicado: ampliado endpoint privado de mesas para incluir `destinoPreparacion` por linea; creado cliente realtime con SSE + recuperacion de backlog (`conectarRealtime`) consumiendo `stream` y `backlog`; integrado realtime en panel de sala para refresco automatico por eventos de canal `sala`; creadas pantallas privadas `/cocina` y `/barra` con panel de produccion en vivo que filtra lineas por destino (`cocina`/`barra`) y permite avanzar estado de linea; actualizada navegacion privada con accesos directos a sala/cocina/barra.
- Archivos: `apps/tpv/app/api/privado/mesas/route.ts`, `apps/tpv/src/cliente-api/realtime.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/sala/panel-sala.tsx`, `apps/tpv/app/(privado)/cocina/panel-produccion.tsx`, `apps/tpv/app/(privado)/cocina/page.tsx`, `apps/tpv/app/(privado)/barra/page.tsx`, `apps/tpv/app/(privado)/layout.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas `/cocina` y `/barra` activas.
- Estado del plan: Fase 8 progresa con backend realtime + consumo frontend operativo en sala/cocina/barra.
- Riesgos / pendientes: realtime actual usa bus en memoria (valido para desarrollo monoinstancia); falta endurecer idempotencia visual avanzada por `evento.id` en cliente y pruebas QA de reconexion prolongada.

### [2026-04-28 21:58] Iniciar Fase 8 - realtime base, canales y reconexion por API
- Objetivo: arrancar Fase 8 del `plan-desarrollo.md` con infraestructura realtime funcional para sala/cocina/barra/admin y recuperacion de eventos.
- Cambio aplicado: creada capa realtime en memoria (`servidor-realtime`) con canales permitidos, suscripcion por canal, emision de eventos versionados y backlog acotado; agregado stream SSE autenticado `GET /api/privado/realtime/stream?canales=...` con validacion de permisos por canal (`sala`, `cocina`, `barra`, `admin`, `mesa:*`, `pedido:*`); agregado endpoint de recuperacion `GET /api/privado/realtime/backlog?canales=...&desdeId=...` para reconexion; conectada emision de eventos desde casos de uso de sala/pedidos (crear pedido, anadir linea, enviar, cancelar, transferir, fusionar, avanzar estado de linea y resolver cancelaciones).
- Archivos: `apps/tpv/src/realtime/servidor-realtime.ts`, `apps/tpv/app/api/privado/realtime/stream/route.ts`, `apps/tpv/app/api/privado/realtime/backlog/route.ts`, `apps/tpv/src/api/privado/sala-servicio.ts`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas realtime privadas activas.
- Estado del plan: Fase 8 iniciada con backend realtime operativo y mecanismo de reconexion por backlog API.
- Riesgos / pendientes: falta cliente realtime en UI de sala/cocina/barra para consumo en vivo y manejo de deduplicacion/idempotencia en frontend; falta pantalla dedicada de cocina y barra para cerrar entregables de Fase 8.

### [2026-04-28 21:56] Avanzar Fase 7 - estados de linea y resolucion de cancelaciones
- Objetivo: completar mas nucleo operativo de Fase 7 incorporando progreso de lineas de pedido y circuito de aprobacion/rechazo de cancelaciones.
- Cambio aplicado: extendido `sala-servicio` con `actualizarEstadoLineaPedido` (transiciones validas `confirmada -> en_preparacion -> lista -> servida`, soporte cancelacion y ajuste de estado de pedido a `parcialmente_servido/servido`) y `resolverSolicitudCancelacion` (aprobar/rechazar con auditoria y cancelacion efectiva al aprobar); creados endpoints `POST /api/privado/pedidos/:id/lineas/:lineaId/estado`, `GET /api/privado/solicitudes-cancelacion`, `POST /api/privado/solicitudes-cancelacion/:id/resolver`; ampliado cliente API de sala y UI `/sala` con accion `Avanzar` por linea.
- Archivos: `apps/tpv/src/api/privado/sala-servicio.ts`, `apps/tpv/app/api/privado/pedidos/[id]/lineas/[lineaId]/estado/route.ts`, `apps/tpv/app/api/privado/solicitudes-cancelacion/route.ts`, `apps/tpv/app/api/privado/solicitudes-cancelacion/[id]/resolver/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/sala/panel-sala.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas nuevas activas.
- Estado del plan: Fase 7 reforzada en backend+UI con flujo de estados de produccion y gobierno de cancelaciones.
- Riesgos / pendientes: falta UI dedicada para cola de aprobacion de cancelaciones (actualmente via API), y falta canal realtime para sincronizar cocina/barra/sala al instante antes de considerar entrada formal a Fase 8 completa.

### [2026-04-28 21:53] Avanzar Fase 7 - transferir y fusionar mesas
- Objetivo: continuar Fase 7 del `plan-desarrollo.md` cubriendo casos de uso operativos de transferir mesa y fusionar mesas.
- Cambio aplicado: extendido `sala-servicio` con validaciones y casos de uso `transferirPedidoMesa` y `fusionarMesas` (solo sobre pedidos abiertos para evitar incoherencias en cocina/cobro), incluyendo auditoria y recalculo de total tras fusion; creados endpoints `POST /api/privado/mesas/:id/transferir` y `POST /api/privado/mesas/:id/fusionar`; ampliado cliente API privado de sala con ambas acciones; actualizada UI `/sala` para seleccionar mesa destino y ejecutar transfer/fusion desde cada mesa con pedido activo.
- Archivos: `apps/tpv/src/api/privado/sala-servicio.ts`, `apps/tpv/app/api/privado/mesas/[id]/transferir/route.ts`, `apps/tpv/app/api/privado/mesas/[id]/fusionar/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/sala/panel-sala.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas `.../transferir` y `.../fusionar` activas.
- Estado del plan: Fase 7 avanza en backend+UI con transfer/fusion de mesas operativos sobre flujo privado.
- Riesgos / pendientes: la fusion actual restringe a pedidos abiertos (no fusiona pedidos ya enviados) para mantener seguridad operativa en esta iteracion; faltan estados de preparacion/servido en pantallas de cocina/barra para entrada formal a Fase 8 realtime.

### [2026-04-28 21:49] Avanzar Fase 7 - UI privada inicial de sala/pedidos
- Objetivo: continuar Fase 7 del `plan-desarrollo.md` incorporando primera interfaz operativa privada para sala y pedidos.
- Cambio aplicado: creado cliente API privado de sala (`obtenerMesas`, `obtenerProductos`, `abrirPedidoMesa`, `anadirLinea`, `enviarPedido`, `solicitarCancelacionLinea`); implementada pagina privada `/sala` con panel tablet-first para ver mesas por zona, abrir pedido, anadir lineas, enviar pedido y solicitar cancelacion de linea; enlazada navegacion a sala desde `/inicio` y header privado.
- Archivos: `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/sala/page.tsx`, `apps/tpv/app/(privado)/sala/panel-sala.tsx`, `apps/tpv/app/(privado)/inicio/page.tsx`, `apps/tpv/app/(privado)/layout.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con ruta `/sala` activa.
- Estado del plan: Fase 7 progresa en UI privada con flujo base operativo conectado al backend ya implementado.
- Riesgos / pendientes: faltan vistas y casos de uso de transferir/fusionar mesas, estados cocina/barra en vivo y reglas de bloqueo previas a cobro para cierre completo de fase; pendiente historico de Fase 2 sobre `migrate dev` en DB limpia por `Schema engine error` local.

### [2026-04-28 21:46] Iniciar Fase 7 - base de sala, mesas y pedidos
- Objetivo: arrancar Fase 7 del `plan-desarrollo.md` con nucleo operativo inicial de sala/mesas/pedidos en backend privado.
- Cambio aplicado: extendido modelo Prisma con `Zona`, `Mesa`, `Pedido`, `LineaPedido`, `SolicitudCancelacion` y enums `EstadoPedido`/`EstadoLineaPedido`; anadida migracion SQL de fase; implementado servicio `sala-servicio` con invariantes base (una mesa no puede abrir segundo pedido activo, lineas solo en pedido abierto, no enviar sin lineas activas, cancelacion directa vs solicitud y recalculo de total); creados endpoints privados `GET/POST /api/privado/zonas`, `GET/POST /api/privado/mesas`, `POST /api/privado/mesas/:id/abrir-pedido`, `GET /api/privado/pedidos/:id`, `POST /api/privado/pedidos/:id/lineas`, `POST /api/privado/pedidos/:id/enviar`, `POST /api/privado/pedidos/:id/lineas/:lineaId/cancelar`, todos con guard de sesion/permisos.
- Archivos: `packages/infra/prisma/schema.prisma`, `packages/infra/prisma/migrations/20260428212500_fase7_sala_pedidos/migration.sql`, `apps/tpv/src/api/privado/sala-servicio.ts`, `apps/tpv/app/api/privado/zonas/route.ts`, `apps/tpv/app/api/privado/mesas/route.ts`, `apps/tpv/app/api/privado/mesas/[id]/abrir-pedido/route.ts`, `apps/tpv/app/api/privado/pedidos/[id]/route.ts`, `apps/tpv/app/api/privado/pedidos/[id]/lineas/route.ts`, `apps/tpv/app/api/privado/pedidos/[id]/enviar/route.ts`, `apps/tpv/app/api/privado/pedidos/[id]/lineas/[lineaId]/cancelar/route.ts`, `AGENTS.md`.
- Validacion: `corepack pnpm --filter @el-jardin/infra db:generate` OK; `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas privadas de sala/pedidos activas.
- Estado del plan: Fase 7 iniciada y funcional en backend/API privada con invariantes principales.
- Riesgos / pendientes: falta UI tablet-first para sala, transferir/fusionar mesas y estados de preparacion/servido para completar fase; pendiente historico de Fase 2 sobre `migrate dev` en DB limpia por `Schema engine error` local.

### [2026-04-28 21:21] Completar Fase 6 frontend - experiencia de sesion privada
- Objetivo: cerrar el tramo frontend pendiente de Fase 6 del `plan-desarrollo.md` en flujo de sesion privada.
- Cambio aplicado: integrado `BotonLogout` cliente en el layout privado para cierre de sesion no bloqueante con feedback de carga/error; retirado submit form directo en header privado y unificada salida a `/login` via cliente.
- Archivos: `apps/tpv/app/(privado)/layout.tsx`, `apps/tpv/app/(privado)/boton-logout.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas `/login` y `/inicio` activas.
- Estado del plan: Fase 6 extendida tambien en frontend de sesion (login existente + layout privado protegido + logout UX).
- Riesgos / pendientes: gestion completa de usuarios/roles/dispositivos en UI administrativa sigue pendiente dentro de Fase 6 ampliada; pendiente historico de Fase 2 sobre `migrate dev` en DB limpia por `Schema engine error` local.

### [2026-04-28 21:16] Ejecutar Fase 6 - auth, sesiones, guard y middleware/proxy privado
- Objetivo: avanzar Fase 6 del `plan-desarrollo.md` habilitando operacion privada segura con login, sesion y proteccion de API privada.
- Cambio aplicado: integrado hashing/verificacion con argon2id (`@node-rs/argon2`) y servicio de auth en `apps/tpv/src/api/privado/auth/servicio-auth.ts` (login rate-limit, sesion por token hash, resolucion de permisos, `exigirSesion`, auditoria de login, cierre de sesion); creados endpoints `POST /api/privado/auth/login`, `POST /api/privado/auth/pin`, `POST /api/privado/auth/logout`, `GET /api/privado/auth/sesion`; protegidas rutas privadas de categorias/productos/menu con guard de sesion/permisos; anadido `proxy.ts` para exigir token en `/api/privado/*` salvo `/api/privado/auth/*`.
- Archivos: `apps/tpv/package.json`, `apps/tpv/src/api/privado/auth/servicio-auth.ts`, `apps/tpv/app/api/privado/auth/{login,pin,logout,sesion}/route.ts`, `apps/tpv/app/api/privado/{categorias,productos,menu-dia}/*`, `apps/tpv/proxy.ts`, `pnpm-lock.yaml`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm --filter @el-jardin/tpv build` OK con rutas auth privadas activas.
- Estado del plan: Fase 6 implementada en backend/API (login email/password, login PIN, sesiones, proteccion de API privada y proxy de entrada).
- Riesgos / pendientes: falta UI de login/seleccion de modo (parte de Fase 6 frontend) y flujo operativo completo de gestion de usuarios/dispositivos; el auto-rehash de hashes legacy se mantiene como compatibilidad temporal hasta normalizar seed/migraciones; pendiente historico de Fase 2 sobre `migrate dev` en DB limpia por `Schema engine error` local.

### [2026-04-28 21:11] Ejecutar Fase 5 - sistema UI y web publica inicial
- Objetivo: implementar Fase 5 del `plan-desarrollo.md` con componentes reutilizables en `packages/ui` y primera superficie publica consumiendo API.
- Cambio aplicado: creado kit UI base en `packages/ui` (`Boton`, `Tarjeta`, `BadgeEstado`, `EstadoVacio`, `Skeleton`, `Campo`, `Input`, `tokensColor`) con exports unificados; conectado `apps/tpv` a `@el-jardin/ui` y configurado `transpilePackages`; creado cliente API publico tipado en `apps/tpv/src/cliente-api/publico.ts`; implementado layout publico y paginas `/carta` y `/menu-dia` bajo `app/(publico)` con filtros por categoria/alergeno, estados vacio/error y render responsive; actualizada home (`/`) para enlazar a carta y menu.
- Archivos: `packages/ui/package.json`, `packages/ui/tsconfig.json`, `packages/ui/src/{componentes/*,formularios/*,estilos/tokens.ts,index.ts}`, `apps/tpv/package.json`, `apps/tpv/next.config.ts`, `apps/tpv/src/cliente-api/publico.ts`, `apps/tpv/app/(publico)/{layout.tsx,page.tsx,carta/page.tsx,menu-dia/page.tsx}`, `apps/tpv/app/page.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm -r build` OK; build Next incluye rutas publicas `/carta` y `/menu-dia`.
- Estado del plan: Fase 5 completada en capa web publica y sistema UI base.
- Riesgos / pendientes: filtros de carta se implementan por query-string con enlaces server-render (sin estado cliente avanzado por ahora); autenticacion/permisos privados siguen pendientes para Fase 6; pendiente historico de Fase 2 sobre `migrate dev` en DB limpia por `Schema engine error` local.

### [2026-04-28 21:05] Completar Fase 4 - CRUD privado, publicacion y rate-limit publico
- Objetivo: cerrar los pendientes directos de Fase 4 segun `plan-desarrollo.md`: CRUD privado de carta/menu, publicacion con auditoria y rate-limit publico.
- Cambio aplicado: implementado modulo privado `apps/tpv/src/api/privado/carta-servicio.ts` con validaciones Zod, creacion transaccional de menu del dia y helper de auditoria de publicacion; creados endpoints privados `GET/POST /api/privado/categorias`, `PATCH/DELETE /api/privado/categorias/:id`, `GET/POST /api/privado/productos`, `PATCH/DELETE /api/privado/productos/:id`, `GET/POST /api/privado/menu-dia`, `PATCH /api/privado/menu-dia/:id/publicacion`; anadido rate-limit en memoria para API publica (`apps/tpv/src/api/publico/rate-limit.ts`) y aplicado a los seis endpoints `publico/*` con respuesta `429` y header `Retry-After`; mantenida validacion de salida publica con contratos y sin exposicion de datos internos.
- Archivos: `apps/tpv/src/api/publico/rate-limit.ts`, `apps/tpv/src/api/privado/carta-servicio.ts`, `apps/tpv/app/api/privado/{categorias,productos,menu-dia}/route.ts`, `apps/tpv/app/api/privado/{categorias/[id],productos/[id],menu-dia/[id]/publicacion}/route.ts`, `apps/tpv/app/api/publico/{negocio,carta,categorias,platos,platos/[slug],menu-dia}/route.ts`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm -r build` OK; build de Next detecta rutas privadas/publicas esperadas.
- Estado del plan: Fase 4 completada en backend/API (publico + privado base).
- Riesgos / pendientes: rate-limit actual es in-memory y no distribuido (valido para desarrollo, pendiente endurecer en despliegue); autenticacion/permisos de rutas privadas quedan para Fase 6; pendiente historico de Fase 2 sobre migracion en DB limpia por `Schema engine error` local.

### [2026-04-28 21:00] Ejecutar Fase 4 - API publica de carta/menu/platos
- Objetivo: avanzar Fase 4 del `plan-desarrollo.md` implementando endpoints publicos seguros con contratos separados.
- Cambio aplicado: creada capa de consulta/proyeccion publica en `apps/tpv/src/api/publico/consultas-publicas.ts` y helpers de respuesta en `apps/tpv/src/api/publico/respuestas.ts`; implementados endpoints `GET /api/publico/negocio`, `GET /api/publico/carta`, `GET /api/publico/categorias`, `GET /api/publico/platos`, `GET /api/publico/platos/:slug`, `GET /api/publico/menu-dia`; validacion de salida con schemas Zod de `packages/contratos`; aplicados headers de cache publica y errores API sin fuga de detalles internos; conectado `apps/tpv` a `@el-jardin/infra` y `@el-jardin/contratos` via workspace deps.
- Archivos: `apps/tpv/package.json`, `apps/tpv/src/api/publico/{consultas-publicas.ts,respuestas.ts}`, `apps/tpv/app/api/publico/{negocio/categorias/platos/platos/[slug]/carta/menu-dia}/route.ts`, `pnpm-lock.yaml`, `AGENTS.md`.
- Validacion: `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm -r build` OK; build de `apps/tpv` lista rutas dinamicas publicas esperadas.
- Estado del plan: Fase 4 iniciada y cubierta en capa publica de lectura; contratos publicos activos y separados de DTOs internos.
- Riesgos / pendientes: CRUD privado de categorias/productos/menu y auditoria de publicacion (parte restante de Fase 4) quedan pendientes; rate-limit publico aun no implementado; pendiente arrastre de Fase 2 sobre `migrate dev` en DB limpia por `Schema engine error` local.

### [2026-04-28 20:54] Ejecutar Fase 3 - contratos y dominio base
- Objetivo: implementar lenguaje compartido segun Fase 3 del plan (estados, permisos, eventos, errores, DTOs separados y resultado con eventos).
- Cambio aplicado: en `packages/contratos` se crearon constantes tipadas de permisos y estados, eventos realtime v1, `ErrorApi` y codigos, DTOs publicos/privados separados y schemas Zod para contratos publicos y enums clave; en `packages/aplicacion` se implemento `ResultadoConEventos<T>` con helper de creacion; en `packages/dominio` se agregaron value objects iniciales `Slug` y `DineroCentimos`; se actualizo export surface de los tres paquetes y se anadio `zod` a contratos.
- Archivos: `packages/contratos/src/{constantes/permisos.ts,constantes/estados.ts,eventos/realtime.ts,errores/error-api.ts,dto/publico.ts,dto/privado.ts,schemas/base.ts,index.ts}`, `packages/aplicacion/src/{modelos/resultado-con-eventos.ts,index.ts}`, `packages/dominio/src/{value-objects/slug.ts,value-objects/dinero-centimos.ts,index.ts}`, `packages/contratos/package.json`, `pnpm-lock.yaml`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm -r build` OK.
- Estado del plan: Fase 3 implementada y validada en codigo.
- Riesgos / pendientes: falta conectar estos contratos a casos de uso/API de Fase 4; el pendiente de Fase 2 sobre ejecucion de migracion en DB limpia sigue abierto por `Schema engine error` local.

### [2026-04-28 20:49] Ejecutar Fase 2 - modelo de datos base (parcial por entorno local)
- Objetivo: implementar Fase 2 del `plan-desarrollo.md` como unica verdad: schema inicial, seed, repositorios base y validacion tecnica.
- Cambio aplicado: integrado Prisma en `packages/infra` con `prisma/schema.prisma` cubriendo entidades iniciales (`ConfiguracionNegocio`, `Usuario`, `RolUsuario`, `PermisoUsuario`, `Dispositivo`, `Sesion`, `CategoriaProducto`, `Producto`, `Alergeno`, `ImagenProducto`, `MenuDia`, `CursoMenuDia`, `PlatoMenuDia`, `RegistroAuditoria`), enums de estados internos/publicos, slugs unicos, relacion N:M de alergenos, baja logica y `onDelete` explicito; creado seed de desarrollo (`prisma/seed.mjs`) con negocio base, admin, carta ejemplo y menu del dia; creado cliente Prisma compartido (`src/prisma/cliente-prisma.ts`) y repositorios base (`RepositorioConfiguracionNegocioPrisma`, `RepositorioProductoPrisma`); generado migracion SQL versionada desde esquema en `prisma/migrations/20260428204816_fase2_modelo_base/migration.sql`; configurados scripts reales `db:generate`, `db:migrate`, `db:seed`.
- Archivos: `packages/infra/package.json`, `packages/infra/prisma/schema.prisma`, `packages/infra/prisma/seed.mjs`, `packages/infra/prisma/migrations/20260428204816_fase2_modelo_base/migration.sql`, `packages/infra/src/prisma/cliente-prisma.ts`, `packages/infra/src/repositorios/repositorio-configuracion-negocio-prisma.ts`, `packages/infra/src/repositorios/repositorio-producto-prisma.ts`, `packages/infra/src/index.ts`, `packages/infra/.env`, `.env`, `pnpm-lock.yaml`, `AGENTS.md`.
- Validacion: `corepack pnpm --filter @el-jardin/infra db:generate` OK (Prisma Client v6.18.0); `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm -r build` OK; `npx prisma validate --schema prisma/schema.prisma` OK.
- Estado del plan: Fase 2 implementada en codigo y contratos de persistencia; pendiente cerrar gate de ejecucion completa de migracion/seed en DB limpia por bloqueo de entorno.
- Riesgos / pendientes: `docker` no esta disponible en PATH local y `prisma migrate dev`/`prisma db push` fallan con `Schema engine error` contra `localhost:5432`; falta ejecutar `migrate dev` + `seed` sobre Postgres limpio para cerrar formalmente el gate "Migracion aplica en limpio".

### [2026-04-28 20:40] Desbloquear entorno pnpm y validar scaffold Fase 1
- Objetivo: ejecutar siguiente paso tras scaffold, habilitando toolchain real y pasando gates tecnicos base.
- Cambio aplicado: habilitado uso de pnpm via `corepack pnpm` (sin instalacion global), instaladas dependencias del workspace, corregidos archivos mal serializados en `packages/*` (`package.json` con escapes invalidos y `src/index.ts` placeholder), normalizados finales de linea y salto final para cumplir Biome; ejecutados y aprobados `build`, `lint` y `type-check` recursivos.
- Archivos: `pnpm-lock.yaml`, `packages/aplicacion/package.json`, `packages/contratos/package.json`, `packages/dominio/package.json`, `packages/ui/package.json`, `packages/*/src/index.ts`, `packages/*/tsconfig.json`, `packages/infra/package.json`, `AGENTS.md`.
- Validacion: `corepack pnpm install` OK; `corepack pnpm -r build` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; timestamp `2026-04-28 20:40`.
- Estado del plan: Fase 1 operativa y validada en entorno local.
- Riesgos / pendientes: `pnpm` queda dependiente de invocacion via `corepack pnpm` en esta maquina (sin binario global); siguiente paso natural es Fase 2 (Prisma + Docker + migracion inicial + seed base).

### [2026-04-28 20:29] Iniciar Fase 1 - scaffold monorepo
- Objetivo: arrancar construccion real segun `plan-desarrollo.md` creando base tecnica de monorepo modular.
- Cambio aplicado: migrada app Next.js existente de raiz a `apps/tpv`; creada configuracion raiz (`package.json` con scripts orquestados por workspace, `pnpm-workspace.yaml`, `tsconfig.base.json`, `biome.json`, `docker-compose.yml`, `.env.example`); creado skeleton inicial de `packages/dominio`, `packages/aplicacion`, `packages/contratos`, `packages/infra` y `packages/ui` con `package.json`, `tsconfig.json` y `src/index.ts`; actualizada `.gitignore` para estructura monorepo y eliminado `package-lock.json` para alinear con pnpm.
- Archivos: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `biome.json`, `docker-compose.yml`, `.env.example`, `.gitignore`, `apps/tpv/*`, `packages/*`, `AGENTS.md`.
- Validacion: `Get-Date -Format 'yyyy-MM-dd HH:mm'` -> `2026-04-28 20:29`; intentos de `npm run build` y `npm run lint` fallan por entorno: `\"pnpm\" no se reconoce como un comando interno o externo`; scaffold estructural completado sin errores de movimiento de archivos.
- Estado del plan: Fase 1 iniciada y base de estructura creada; pendiente instalar/habilitar pnpm para ejecutar gates de build/lint/type-check/test.
- Riesgos / pendientes: sin pnpm en PATH no se pueden validar gates ni instalar dependencias del nuevo monorepo; falta siguiente paso de Fase 1: bootstrap de dependencias y primer arranque en `apps/tpv`.

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

### [2026-04-29 10:40] Ejecutar Fase 13 - comparativa temporal y exportacion CSV en informes
- Objetivo: continuar Fase 13 del `plan-desarrollo.md` anadiendo comparativa entre periodos y exportacion de informes para operativa interna.
- Cambio aplicado: creados endpoints privados `GET /api/privado/informes/comparativa` (resumen actual vs previo con `deltaCentimos` y `deltaPct`) y `GET /api/privado/informes/export/csv` (export de pagos + agregado por categoria en CSV), ambos protegidos con `puedeVerInformes`; extendido cliente API de sala con `InformeComparativa`, `obtenerInformeComparativa` y `descargarInformeCsv`; actualizado panel `/informes` para cargar comparativa junto al resto de desgloses y permitir descarga CSV desde el rango seleccionado.
- Archivos: `apps/tpv/app/api/privado/informes/comparativa/route.ts`, `apps/tpv/app/api/privado/informes/export/csv/route.ts`, `apps/tpv/src/cliente-api/sala.ts`, `apps/tpv/app/(privado)/informes/panel-informes.tsx`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK (tras limpiar `apps/tpv/.next` por tipos generados obsoletos); `corepack pnpm -r build` OK con rutas nuevas `/api/privado/informes/comparativa` y `/api/privado/informes/export/csv` activas en build.
- Estado del plan: Fase 13 ampliada con analitica comparativa y exportacion operativa.
- Riesgos / pendientes: export CSV actual no escapa comas/comillas en texto de categoria (pendiente endurecer serializacion CSV si aparecen nombres complejos); pendiente historico de Fase 2 sobre `migrate dev` en DB limpia por `Schema engine error` local.

### [2026-04-29 10:43] Endurecer Fase 13 - serializacion CSV robusta en exportacion
- Objetivo: continuar Fase 13 reforzando la exportacion de informes para evitar CSV invalido ante textos con comas, comillas o saltos de linea.
- Cambio aplicado: actualizado `GET /api/privado/informes/export/csv` incorporando utilidades locales `escaparCampoCsv` y `lineaCsv` para serializar columnas de forma segura (escape RFC basico con doble comilla y encapsulado condicional); aplicado el serializador tanto en cabecera como en filas de pagos y agregados por categoria.
- Archivos: `apps/tpv/app/api/privado/informes/export/csv/route.ts`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm -r build` OK.
- Estado del plan: Fase 13 sigue avanzando con hardening de informes/exportacion en API privada.
- Riesgos / pendientes: el repo aun no tiene framework de tests activo en `apps/tpv` (`test` actual es placeholder), por lo que la cobertura automatizada especifica de CSV queda pendiente de introducir en una siguiente iteracion del plan.

### [2026-04-29 10:45] Continuar Fase 13 - activar tests reales en informes (comparativa y CSV)
- Objetivo: avanzar el gate de calidad del plan activando pruebas automatizadas reales en `apps/tpv` para la logica de informes incorporada en Fase 13.
- Cambio aplicado: extraida logica pura de comparativa a `src/informes/comparativa.ts` (`inicioDiaLocal`, `calcularRangoPrevio`, `calcularDeltaComparativa`) y logica de serializacion CSV a `src/informes/csv.ts` (`escaparCampoCsv`, `lineaCsv`); rutas privadas de informes actualizadas para reutilizar dichas utilidades; habilitado runner de pruebas en `apps/tpv` con `vitest` y script `test`; anadidas pruebas `csv.test.ts` y `comparativa.test.ts` con 6 asserts cubriendo escape de comillas/comas y calculos de delta/rango previo.
- Archivos: `apps/tpv/package.json`, `apps/tpv/src/informes/comparativa.ts`, `apps/tpv/src/informes/csv.ts`, `apps/tpv/src/informes/comparativa.test.ts`, `apps/tpv/src/informes/csv.test.ts`, `apps/tpv/app/api/privado/informes/comparativa/route.ts`, `apps/tpv/app/api/privado/informes/export/csv/route.ts`, `pnpm-lock.yaml`, `AGENTS.md`.
- Validacion: `corepack pnpm install` OK; `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm -r test` OK (apps/tpv: 2 archivos, 6 tests verdes); `corepack pnpm -r build` OK en ejecucion previa inmediata sin regresiones.
- Estado del plan: Fase 13 reforzada con cobertura automatizada real en modulo de informes.
- Riesgos / pendientes: el resto de paquetes (`dominio`, `aplicacion`, `contratos`, `infra`, `ui`) siguen con placeholder de tests y requieren expansion progresiva para cerrar cobertura transversal del MVP.

### [2026-04-29 10:48] Continuar Fase 13 - pruebas de endpoint para comparativa y export CSV
- Objetivo: reforzar calidad de Fase 13 con pruebas automatizadas de API privada en informes, incluyendo permisos y forma de respuesta.
- Cambio aplicado: anadidos tests de endpoint `GET /api/privado/informes/comparativa` y `GET /api/privado/informes/export/csv` con mocks de `exigirSesion` y `clientePrisma`, cubriendo caso no autorizado (`401`) y caso exitoso con validacion de payload/csv; creada configuracion `vitest.config.ts` para resolver alias `@/` en entorno de pruebas; mantenidos tests unitarios previos de utilidades de comparativa/csv.
- Archivos: `apps/tpv/app/api/privado/informes/comparativa/route.test.ts`, `apps/tpv/app/api/privado/informes/export/csv/route.test.ts`, `apps/tpv/vitest.config.ts`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm -r test` OK (apps/tpv: 4 archivos, 10 tests verdes); `corepack pnpm -r build` OK.
- Estado del plan: Fase 13 avanza con cobertura automatizada de endpoints criticos de informes privados.
- Riesgos / pendientes: quedan sin cobertura de endpoint en esta fase `auditoria`, `resumen`, `desglose-producto`, `desglose-categoria` y `desglose-turno`; recomendable continuar en ese orden por criticidad operativa.

### [2026-04-29 10:51] Continuar Fase 13 - cobertura de endpoints restantes de informes y auditoria
- Objetivo: completar cobertura automatizada de API privada en Fase 13 para endpoints pendientes de auditoria e informes operativos.
- Cambio aplicado: anadidos tests para `GET /api/privado/auditoria`, `GET /api/privado/informes/resumen`, `GET /api/privado/informes/desglose-producto`, `GET /api/privado/informes/desglose-categoria` y `GET /api/privado/informes/desglose-turno`; cada suite cubre al menos caso `401` sin sesion y caso exitoso con verificacion de agregaciones/campos esperados usando mocks de `exigirSesion` y `clientePrisma`.
- Archivos: `apps/tpv/app/api/privado/auditoria/route.test.ts`, `apps/tpv/app/api/privado/informes/resumen/route.test.ts`, `apps/tpv/app/api/privado/informes/desglose-producto/route.test.ts`, `apps/tpv/app/api/privado/informes/desglose-categoria/route.test.ts`, `apps/tpv/app/api/privado/informes/desglose-turno/route.test.ts`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm -r test` OK (apps/tpv: 9 archivos, 20 tests verdes); `corepack pnpm -r build` OK.
- Estado del plan: Fase 13 fortalecida con cobertura de endpoints privados clave de auditoria e informes.
- Riesgos / pendientes: la cobertura sigue siendo de tipo unit/integration con mocks; queda pendiente una capa de pruebas E2E con DB real para validar filtros por rango temporal y coherencia con datos seed en entorno controlado.

### [2026-04-29 10:55] Continuar Fase 13 - base de pruebas de integracion DB real para informes
- Objetivo: avanzar desde pruebas con mocks hacia validacion E2E/integracion real de informes privados sin bloquear entornos locales sin Postgres.
- Cambio aplicado: creado `integracion-db.test.ts` para rutas privadas de informes/auditoria (`resumen`, `desglose-producto`, `desglose-categoria`, `desglose-turno`, `auditoria`) con flujo real de autenticacion por sesion (token hash en DB), fixtures temporales de negocio (usuario/dispositivo/sesion/zona/mesa/pedido/caja/pago/linea/movimientos/auditoria) y limpieza al finalizar; ejecucion condicionada por `DATABASE_URL` + `RUN_DB_TESTS=1` para evitar falsos rojos en maquinas sin DB activa; agregado script `test:db` en `apps/tpv/package.json` para ejecutar esta suite de forma explicita.
- Archivos: `apps/tpv/app/api/privado/informes/integracion-db.test.ts`, `apps/tpv/package.json`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm -r test` OK (apps/tpv: 9 suites verdes + 1 suite DB marcada como `skipped` cuando no hay `RUN_DB_TESTS=1`); `corepack pnpm -r build` OK.
- Estado del plan: Fase 13 fortalecida con capa de integracion real preparada para ejecucion controlada en entorno con Postgres.
- Riesgos / pendientes: la suite DB no corre por defecto (decision intencional); para cerrar gate de integracion real en CI/local dedicado falta ejecutar `RUN_DB_TESTS=1 corepack pnpm --filter @el-jardin/tpv test:db` con Postgres limpio y migraciones aplicadas.

### [2026-04-29 10:57] Continuar Fase 13 - estandarizar ejecucion de pruebas DB en scripts raiz
- Objetivo: hacer repetible el gate de integracion DB real de informes para cualquier agente/equipo siguiendo el plan sin pasos ambiguos.
- Cambio aplicado: agregado script raiz `test:db` que delega a `@el-jardin/tpv`; actualizado `README.md` en la seccion de scripts y uso para documentar ejecucion de pruebas DB con `RUN_DB_TESTS=1` (PowerShell/Bash) y dependencia de `DATABASE_URL` valida.
- Archivos: `package.json`, `README.md`, `AGENTS.md`.
- Validacion: `corepack pnpm -r format` OK; `corepack pnpm -r lint` OK; `corepack pnpm -r type-check` OK; `corepack pnpm -r test` OK (suite DB sigue `skipped` sin `RUN_DB_TESTS=1`); `corepack pnpm -r build` OK.
- Estado del plan: Fase 13 queda mejor preparada para validacion de integracion real en entorno DB dedicado.
- Riesgos / pendientes: pendiente ejecutar `RUN_DB_TESTS=1 pnpm test:db` contra Postgres operativo y migrado para cerrar evidencia de integracion real en este entorno concreto.

### [2026-04-29 11:01] Ejecutar gate DB real de Fase 13 y diagnosticar bloqueo de entorno
- Objetivo: intentar cierre de evidencia real de integracion DB para informes (`test:db`) siguiendo el plan operativo.
- Cambio aplicado: ejecutado `RUN_DB_TESTS=1` sobre la suite de integracion DB; resultado bloqueado por `PrismaClientInitializationError` de autenticacion (`DATABASE_URL` con credenciales no validas); ajustado script raiz `test:db` para usar `corepack pnpm` internamente y evitar dependencia de `pnpm` global en PATH.
- Archivos: `package.json`, `AGENTS.md`.
- Validacion: `corepack pnpm test:db` OK en modo por defecto (suite DB `skipped` sin flag); `RUN_DB_TESTS=1 corepack pnpm --filter @el-jardin/tpv test:db` falla por credenciales DB invalidas (no por logica de test/ruta).
- Estado del plan: gate de integracion DB preparado tecnicamente pero pendiente de cierre por configuracion de credenciales/entorno de base de datos.
- Riesgos / pendientes: actualizar `DATABASE_URL` valida y confirmar Postgres operativo; luego re-ejecutar `RUN_DB_TESTS=1 corepack pnpm test:db` para cerrar evidencia real.

### [2026-04-29 11:03] Reintentar cierre de gate DB real - bloqueo por infraestructura local
- Objetivo: continuar Fase 13 cerrando evidencia real de pruebas DB (`RUN_DB_TESTS=1`).
- Cambio aplicado: verificados `.env`, `.env.example`, `packages/infra/.env` y `docker-compose.yml` (credenciales alineadas `tpv:tpv@localhost:5432/tpv`); reintentado levantar infraestructura y migracion para ejecutar integracion real.
- Archivos: `AGENTS.md`.
- Validacion: `docker` no disponible en PATH (`The term 'docker' is not recognized`), por lo que no se puede levantar Postgres local desde este entorno; `corepack pnpm --filter @el-jardin/infra db:migrate` sigue fallando con `Schema engine error`; en intento previo `RUN_DB_TESTS=1` falla por autenticacion DB invalida.
- Estado del plan: gate DB de Fase 13 pendiente exclusivamente por infraestructura/credenciales del entorno, no por logica de aplicacion.
- Riesgos / pendientes: instalar/habilitar Docker Desktop (o proveer PostgreSQL accesible con credenciales validas), ejecutar `corepack pnpm db:migrate`, `corepack pnpm db:seed` y finalmente `RUN_DB_TESTS=1 corepack pnpm test:db`.
