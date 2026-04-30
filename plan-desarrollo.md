# Plan de desarrollo - TPV El Jardin

Fecha: 2026-04-29 22:45.
Estado: auditado post-Fase 14. La aplicacion compila y los gates principales estan verdes, pero no se considera lista para despliegue real hasta cerrar las fases de correccion C0-C7.

## 1. Objetivo

Convertir `aplicacion-requisitos.md` en una aplicacion TPV real, construida desde cero, para un solo negocio de restauracion.

Principios obligatorios:

- Monolito modular.
- Un solo negocio en v1.
- Sin SaaS, multiempresa, multiestablecimiento, tenancy preventiva ni microservicios.
- Codigo propio en espanol.
- Dominio puro, aplicacion orquestadora e infraestructura como adaptador.
- UI reutilizable.
- API publica segura y solo lectura para carta, platos, categorias, menu y datos visibles del negocio.
- Tests y gates desde la primera fase.
- Trazabilidad, seguridad, atomicidad y contratos estables antes de liberar operacion real.

## 2. Estado auditado

Auditoria ejecutada contra:

- `aplicacion-requisitos.md`.
- Arquitectura y codigo actual del workspace.
- Fases implementadas en el plan hasta Fase 14.
- Scripts de calidad, build, migraciones y pruebas DB.

Evidencia tecnica recogida:

- `corepack pnpm -r lint`: OK.
- `corepack pnpm -r type-check`: OK.
- `corepack pnpm -r test`: OK, con tests placeholder en varios paquetes.
- `corepack pnpm -r build`: OK.
- `RUN_DB_TESTS=1 corepack pnpm test:db`: OK.
- `corepack pnpm db:migrate:status`: OK, esquema actualizado; Prisma avisa de deprecacion de `package.json#prisma`.
- Busqueda de tenancy v1 (`Empresa`, `Establecimiento`, `empresaId`, `establecimientoId`): sin deriva funcional detectada.

Conclusion:

- El MVP tiene una base amplia implementada, pero la auditoria encontro bloqueantes funcionales y arquitectonicos.
- Fase 14 queda como "hardening inicial completado" pero no como cierre de entrega.
- Antes de despliegue real deben ejecutarse las fases de correccion C0-C7.

## 3. Gates globales

Ninguna fase se considera cerrada si falla alguno:

- `lint` limpio.
- `type-check` limpio.
- tests de la fase verdes.
- build verde cuando exista app.
- sin `any` sin justificacion.
- sin `fetch` directo en componentes.
- sin reglas de negocio en UI ni handlers HTTP.
- sin DTOs internos como respuesta publica.
- sin estados, permisos o eventos como strings magicos dispersos.
- sin referencias de tenancy v1 (`Empresa`, `Establecimiento`, `empresaId`, `establecimientoId`) salvo prohibicion documentada.
- sin mutaciones criticas fuera de transaccion cuando afecten a pedido, caja, stock, auditoria o realtime.
- sin tests placeholder como unica evidencia para paquetes criticos.
- sin contrato publico, error API o evento realtime divergente del PRD sin decision documentada.

## 4. Orden de trabajo actualizado

Orden historico implementado:

1. Fase 0 - Preparacion del repositorio.
2. Fase 1 - Scaffold monolitico modular.
3. Fase 2 - Modelo de datos base.
4. Fase 3 - Contratos y dominio base.
5. Fase 4 - Carta, menu y API publica.
6. Fase 5 - Sistema UI y web publica.
7. Fase 6 - Auth, usuarios, roles, permisos y dispositivos.
8. Fase 7 - Sala, mesas y pedidos.
9. Fase 8 - Cocina, barra y realtime.
10. Fase 9 - Stock operativo.
11. Fase 10 - Caja, cobros y cierre.
12. Fase 11 - Reservas, clientes e impresoras.
13. Fase 12 - Compras, proveedores y escandallos.
14. Fase 13 - Auditoria, informes y analitica.
15. Fase 14 - Hardening y entrega MVP.

Orden obligatorio post-auditoria:

1. C0 - Recuperacion documental y bloqueo de release.
2. C1 - Realtime funcional y contrato de eventos.
3. C2 - Atomicidad de cobro, caja, stock y pedido.
4. C3 - Contratos, estados y errores alineados con PRD.
5. C4 - Modularidad real: dominio, aplicacion, infra y contratos.
6. C5 - Seguridad, auditoria, configuracion y administracion.
7. C6 - QA real, cobertura y pruebas no funcionales.
8. C7 - UX operativa, web publica y accesibilidad final.

## 5. Matriz de hallazgos

| ID | Gravedad | Area | Encontrado | Riesgo | Correccion |
| --- | --- | --- | --- | --- | --- |
| A-01 | Critica | Realtime | El servidor SSE emite eventos nombrados con `event: ...`, pero el cliente solo usa `onmessage`. | Cocina, barra y sala pueden no actualizar en vivo. | C1 |
| A-02 | Critica | Cobro/stock/caja | Cobro, consolidacion de stock, caja y cierre de pedido no se ejecutan en una unica transaccion. | Estados parciales y descuadres contables/inventario. | C2 |
| A-03 | Critica | Cuenta dividida | La normalizacion de cobros divididos usa el total del pedido por cada division e ignora importes parciales. | Sobrecobros, cierres incorrectos y datos de caja falsos. | C2 |
| A-04 | Alta | Arquitectura | `packages/dominio` y `packages/aplicacion` existen pero gran parte de la logica vive en rutas/servicios de `apps/tpv`. | Monolito modular solo parcial, mas acoplamiento y menor testeabilidad. | C4 |
| A-05 | Alta | Contratos | DTO publico usa `precioCentimos`; PRD exige contrato minimo con `precio: string`. | API publica no cumple especificacion pactada. | C3 |
| A-06 | Alta | Estados | Estados Prisma divergen del PRD en reservas, lista de espera y pedidos de compra. | Casos de uso y UI pueden representar estados incorrectos. | C3 |
| A-07 | Alta | Errores/API | `ErrorApi` no coincide del todo con PRD: codigos, `detalles` y `requestId` requerido. | Observabilidad y contratos cliente inconsistentes. | C3 |
| A-08 | Alta | Eventos | Eventos realtime usan nombres `.v1` y `payload`; PRD define nombres y forma distinta. | Clientes acoplados a contrato no documentado. | C1/C3 |
| A-09 | Alta | Auditoria | Mutaciones criticas no registran `RegistroAuditoria` de forma uniforme. | Falta trazabilidad legal/operativa. | C5 |
| A-10 | Alta | Auth/dispositivos/config | Faltan UI/API privadas completas para usuarios, dispositivos y configuracion; login puede auto-crear dispositivo activo. | Administracion incompleta y superficie de seguridad debil. | C5 |
| A-11 | Media | QA | Gates verdes conviven con tests placeholder en paquetes criticos. | Falsa sensacion de cobertura. | C6 |
| A-12 | Media | Infra realtime/rate-limit | Rate-limit y backlog realtime viven en memoria de proceso. | No resiste reinicios ni multiples instancias. | C1/C5 |
| A-13 | Media | UX/a11y | Flujos usan `window.prompt`/`alert`; navegacion privada no se filtra por permisos; faltan auditorias axe/Lighthouse. | Operacion pobre y accesibilidad incompleta. | C7 |
| A-14 | Media | Web publica | La web publica no renderiza imagenes aunque existe `imagenUrl`; metadata sigue generica. | Entrega publica incompleta y SEO pobre. | C7 |
| A-15 | Media | Operacion | README apuntaba a `socket.io` y PostgreSQL 16, aunque el repo usa SSE y Docker Compose con PostgreSQL 17. | Documentacion enganosa para nuevos agentes/desarrolladores. | C0 |

## 6. Estado de fases 0-14 tras auditoria

| Fase | Estado auditado | Lo encontrado | Correccion asociada |
| --- | --- | --- | --- |
| 0 - Preparacion | Parcial | Documentacion operativa quedo desactualizada frente al estado real. | C0 |
| 1 - Scaffold | Parcial | La estructura existe, pero la separacion modular no se aplica de forma consistente. | C4 |
| 2 - Modelo de datos | Parcial | Modelo amplio, pero estados no coinciden completamente con PRD. | C3 |
| 3 - Contratos/dominio | Parcial | Contratos existen, pero hay divergencias en DTO publico, errores y eventos. | C3/C4 |
| 4 - Carta/API publica | Parcial | Proyeccion publica segura en general, pero contrato de precio no coincide con PRD. | C3 |
| 5 - UI publica/UI base | Parcial | Base creada, pero faltan imagenes publicas, metadata final y revision accesible completa. | C7 |
| 6 - Auth/usuarios/dispositivos | Parcial | Auth base existe; faltan gestion privada, secret validation y politica de dispositivos cerrada. | C5 |
| 7 - Sala/mesas/pedidos | Parcial | Flujo base existe, pero depende de realtime y mutaciones atomicas aun debiles. | C1/C2 |
| 8 - Cocina/barra/realtime | Bloqueada | Contrato SSE servidor/cliente no encaja. | C1 |
| 9 - Stock | Parcial | Flujo existe, pero consolidacion ligada al cobro no es atomica. | C2 |
| 10 - Caja/cobros/cierre | Bloqueada | Cuenta dividida y transaccion de cobro tienen riesgos criticos. | C2 |
| 11 - Reservas/clientes/impresoras | Parcial | Estados de reservas/lista espera divergen; impresion base correcta pero requiere observabilidad final. | C3/C7 |
| 12 - Compras/proveedores/escandallos | Parcial | Pedido compra usa estado distinto al PRD; faltan pruebas y auditoria uniforme. | C3/C5/C6 |
| 13 - Auditoria/informes | Parcial | Informes base existen; auditoria no cubre todas las mutaciones criticas. | C5 |
| 14 - Hardening/entrega | Reabierta | Gates verdes, pero con bloqueantes funcionales y cobertura enganosa. | C0-C7 |

## 7. Fases de correccion post-auditoria

### C0 - Recuperacion documental y bloqueo de release

Objetivo:

- Dejar claro que el MVP no queda liberable hasta cerrar correcciones criticas.
- Alinear `plan-desarrollo.md`, `README.md` y `AGENTS.md` con el estado real.

Hallazgos cubiertos:

- A-15 y estado global post-auditoria.

Entregables:

- Plan de correccion documentado por fases.
- README reescrito con estado auditado, stack real, comandos y limitaciones.
- AGENTS reescrito con protocolo operativo, prioridades y bitacora.
- Nota explicita: Fase 14 no equivale a release final.

Validacion:

- Revision documental contra `aplicacion-requisitos.md`.
- `git diff --check`.
- No tocar codigo de producto en esta fase salvo correcciones documentales.

### C1 - Realtime funcional y contrato de eventos

Objetivo:

- Garantizar que sala, cocina, barra, caja e informes reciben eventos en vivo de forma verificable.

Hallazgos cubiertos:

- A-01, A-08, A-12.

Entregables:

- Decidir y documentar una sola convencion SSE:
  - O bien todos los eventos van por `message`.
  - O bien el cliente registra listeners para eventos nombrados.
- Alinear nombres y payload con `aplicacion-requisitos.md` o actualizar PRD con decision explicita.
- Prueba automatizada que reproduzca un evento servidor y demuestre recepcion cliente.
- Backlog/replay con `desdeId` probado tras reconexion.
- Estrategia definida para multiinstancia o limitacion documentada si se mantiene memoria local.

Validacion:

- Tests unitarios de cliente realtime.
- Test de integracion de endpoint SSE.
- Smoke manual: crear pedido, enviar cocina/barra y ver cambio sin recargar.

Agentes:

- Backend Developer.
- Frontend Developer.
- QA Test Executor.

### C2 - Atomicidad de cobro, caja, stock y pedido

Objetivo:

- Hacer indivisible el flujo critico: pedido -> cobro -> caja -> stock -> auditoria -> realtime.

Hallazgos cubiertos:

- A-02, A-03.

Entregables:

- Caso de uso de aplicacion para cobrar pedido dentro de una transaccion DB.
- Consolidacion de reservas de stock, registro de pagos, cierre de pedido y auditoria en la misma unidad de trabajo.
- Validacion estricta de cobro dividido:
  - minimo 2 divisiones.
  - maximo operativo documentado.
  - suma exacta del total.
  - cada division conserva su importe parcial real.
  - no permitir formas de pago negativas o cero salvo regla expresa.
- Pruebas DB para fallos intermedios simulados y rollback.
- Reconciliacion basica para detectar pedidos cerrados sin pago, pagos sin pedido cerrado o stock consolidado sin cobro.

Validacion:

- `RUN_DB_TESTS=1 corepack pnpm test:db`.
- Tests especificos de cuenta dividida y cobro mixto.
- Revision de datos tras fallo forzado.

Agentes:

- Tech Lead.
- Backend Developer.
- Database Designer.
- QA Test Executor.

### C3 - Contratos, estados y errores alineados con PRD

Objetivo:

- Cerrar la divergencia entre PRD, Prisma, DTOs, schemas, API y clientes.

Hallazgos cubiertos:

- A-05, A-06, A-07, A-08.

Entregables:

- Matriz PRD -> Prisma -> Zod -> DTO -> UI para:
  - estados de reservas.
  - estados de lista de espera.
  - estados de pedido de compra.
  - error API.
  - eventos realtime.
  - DTO publico de plato/carta/menu.
- Migraciones o adaptadores necesarios para estados divergentes.
- Decision documentada si se prefiere cambiar PRD en vez de codigo.
- Tests contractuales para API publica y errores.

Validacion:

- Tests de contratos en `packages/contratos`.
- Tests de endpoints publicos.
- Revision de OpenAPI/documentacion si se genera en una fase posterior.

Agentes:

- Tech Lead.
- Backend Developer.
- Frontend Developer.
- QA Test Executor.

### C4 - Modularidad real: dominio, aplicacion, infra y contratos

Objetivo:

- Hacer que la arquitectura monolitica modular sea real, no solo una estructura de carpetas.

Hallazgos cubiertos:

- A-04, A-11.

Entregables:

- Casos de uso criticos movidos a `packages/aplicacion`.
- Reglas puras movidas a `packages/dominio`.
- Acceso Prisma encapsulado en `packages/infra`.
- Handlers HTTP finos: parsean entrada, llaman caso de uso, devuelven respuesta.
- Tests reales para dominio y aplicacion; eliminar scripts placeholder como evidencia de cierre.
- Regla de dependencias documentada:
  - `dominio` no importa infra ni Next.
  - `aplicacion` orquesta dominio e interfaces.
  - `infra` implementa puertos.
  - `apps/tpv` compone UI/API.

Validacion:

- `corepack pnpm -r lint`.
- `corepack pnpm -r type-check`.
- Tests de dominio/aplicacion con cobertura minima acordada.
- Revision con skill/local de modularidad.

Agentes:

- Tech Lead.
- Backend Developer.
- Database Designer.
- QA Test Executor.

### C5 - Seguridad, auditoria, configuracion y administracion

Objetivo:

- Completar la operacion privada segura para usuarios, roles, dispositivos, configuracion y trazabilidad.

Hallazgos cubiertos:

- A-09, A-10, A-12.

Entregables:

- UI/API privadas para usuarios, roles/permisos, dispositivos y configuracion de negocio.
- Politica de alta de dispositivos: no auto-activar tokens desconocidos en produccion.
- Validacion de secretos al arrancar:
  - `SESSION_SECRET`.
  - variables de DB.
  - origenes permitidos.
  - flags de entorno.
- Auditoria uniforme para mutaciones criticas:
  - caja.
  - stock.
  - pedidos.
  - compras.
  - carta/menu.
  - usuarios/dispositivos.
  - configuracion.
- `requestId` obligatorio en errores y auditoria cuando el request pasa por API.
- Rate-limit persistente o limitacion operacional documentada para despliegue single-instance.

Validacion:

- Tests de permisos por rol.
- Tests de auditoria por mutacion critica.
- Security review posterior a cambios.

Agentes:

- Security Auditor.
- Backend Developer.
- Frontend Developer.
- QA Test Executor.

### C6 - QA real, cobertura y pruebas no funcionales

Objetivo:

- Convertir los gates verdes en evidencia real de calidad, no solo ejecucion correcta de scripts.

Hallazgos cubiertos:

- A-11 y pendientes de Fase 14.

Entregables:

- Sustituir tests placeholder en paquetes criticos por suites reales o marcar explicitamente "sin alcance critico".
- Matriz QA final con:
  - login email/PIN.
  - apertura de caja.
  - mesa/pedido.
  - cocina/barra.
  - cobro mixto/dividido.
  - stock.
  - cierre caja.
  - informes.
  - API publica.
  - permisos.
  - realtime.
- Prueba de carga basica para API publica con p95/p99.
- Auditoria automatizada a11y con axe/Lighthouse.
- Smoke de backup/restore en entorno controlado.

Validacion:

- `corepack pnpm -r lint`.
- `corepack pnpm -r type-check`.
- `corepack pnpm -r test`.
- `RUN_DB_TESTS=1 corepack pnpm test:db`.
- `corepack pnpm -r build`.
- Informe de cobertura y riesgos residuales.

Agentes:

- QA Test Executor.
- Security Auditor.
- Tech Lead.

### C7 - UX operativa, web publica y accesibilidad final

Objetivo:

- Cerrar la experiencia de uso de sala/caja/admin y la web publica visible para clientes.

Hallazgos cubiertos:

- A-13, A-14.

Entregables:

- Sustituir `window.prompt` y `window.alert` por modales/formularios accesibles.
- Navegacion privada filtrada por permisos.
- Estados de carga, error, vacio y exito en flujos criticos.
- Web publica con imagenes cuando exista `imagenUrl`.
- Metadata final del negocio, no `Create Next App`.
- Revision de contraste, foco visible, labels y navegacion por teclado.
- Ajuste de textos y layout para tablet/TPV.

Validacion:

- Prueba manual en viewport TPV/tablet/movil.
- Axe/Lighthouse sin errores criticos.
- Smoke de carta publica y menu del dia.

Agentes:

- Disenador UX/UI.
- Frontend Developer.
- QA Test Executor.

## 8. Backlog transversal

### 8.1 Calidad

- Politica de cobertura minima por paquete critico.
- Contract tests para API publica y privada.
- Fixtures realistas de restaurante.
- Tests de rollback transaccional.
- Tests de permisos por rol.
- Tests de realtime con reconexion y replay.

### 8.2 Seguridad

- Gestion de secretos por entorno.
- Rate-limit persistente o restriccion operacional single-instance.
- Headers de seguridad para API publica, privada y HTML.
- Auditoria de datos sensibles en logs.
- Politica de sesiones y dispositivos.

### 8.3 Datos

- Indices para filtros publicos y consultas de sala/caja/informes.
- Migraciones revisadas con rollback operativo.
- Backups programados y restore periodico.
- Reconciliacion de caja, pedido y stock.

### 8.4 Producto

- Gestion completa de carta/menu/alergenos/imagenes.
- Configuracion visual y operativa del negocio.
- Informes historicos comparativos.
- Exportacion CSV/PDF.
- Panel de dispositivos.

### 8.5 Arquitectura

- Puertos y adaptadores entre aplicacion e infra.
- Eventos compartidos desde `packages/contratos`.
- Reglas puras en `packages/dominio`.
- Casos de uso transaccionales en `packages/aplicacion`.
- Handlers HTTP sin reglas de negocio.

## 9. Riesgos principales

| Riesgo | Impacto | Mitigacion |
| --- | --- | --- |
| Realtime no entrega eventos al cliente | Operacion de cocina/barra inconsistente | C1 antes de cualquier demo operativa |
| Cobro no atomico | Descuadres de caja/stock/pedido | C2 con transacciones y rollback probado |
| Cuenta dividida incorrecta | Importes falsos y perdida de confianza | C2 con tests DB dedicados |
| Contratos divergentes del PRD | Clientes rotos y deuda documental | C3 con matriz PRD-codigo |
| Modularidad solo nominal | Baja mantenibilidad | C4 antes de ampliar funcionalidades |
| Auditoria incompleta | Falta trazabilidad | C5 con cobertura por mutacion critica |
| Tests placeholder | Release con falsa seguridad | C6 con suites reales |
| Rate-limit/backlog en memoria | Problemas en reinicio o multiinstancia | C1/C5 con decision de despliegue |
| UX con prompts/alerts | Operacion poco profesional | C7 con componentes accesibles |
| Documentacion desfasada | Onboarding erroneo | C0 y bitacora obligatoria |

## 10. Handoff inicial

Siguiente bloque recomendado:

1. Ejecutar C1 y C2 antes de nuevas funcionalidades.
2. No cerrar Fase 14 como release hasta que C1, C2 y C3 esten verdes.
3. Usar C4 para reducir deuda antes de seguir ampliando compras/informes.
4. Usar C5-C7 para preparar despliegue controlado.

Regla de cierre:

- Una correccion no queda cerrada solo por compilar.
- Debe tener prueba automatizada o evidencia manual reproducible.
- Debe actualizar la bitacora de `AGENTS.md`.
- Debe mantener fuera de alcance SaaS, multiempresa, multiestablecimiento y tenancy preventiva.
