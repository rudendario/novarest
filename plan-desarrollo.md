# Plan de desarrollo - TPV El Jardin

Fecha: 2026-04-28 16:46.
Estado: plan operativo inicial para convertir `aplicacion-requisitos.md` en proyecto real.

## 1. Objetivo

Convertir el PRD en una aplicacion real, construida desde cero, para un solo negocio de restauracion.

Principios obligatorios:

- Monolito modular.
- Un solo negocio en v1.
- Sin SaaS, multiempresa, multiestablecimiento, tenancy preventiva ni microservicios.
- Codigo propio en espanol.
- Dominio puro, aplicacion orquestadora, infraestructura como adaptador.
- UI reutilizable.
- API publica segura para carta, platos, categorias, menu y datos visibles del negocio.
- Tests y gates desde la primera fase.

## 2. Orden de trabajo recomendado

1. Fundacion tecnica.
2. Modelo de datos base.
3. Contratos compartidos.
4. Carta, menu y API publica.
5. UI publica y sistema UI base.
6. Auth, usuarios, roles, permisos y dispositivos.
7. Sala, mesas, pedidos, cocina, barra y realtime.
8. Stock operativo.
9. Caja, cobros y cierre.
10. Reservas, clientes e impresoras.
11. Compras, proveedores, escandallos, auditoria e informes.
12. Hardening, QA, seguridad y preparacion de entrega.

Razon:

- Carta/API publica da valor temprano y prueba contratos, DB, UI y seguridad sin bloquear TPV completo.
- Auth y permisos entran antes de operacion privada real.
- Sala/pedidos/realtime se implementan antes de caja porque caja depende del pedido cerrado.
- Stock se conecta antes de cobro definitivo para validar reserva/consolidacion.

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

## 4. Fase 0 - Preparacion del repositorio

Objetivo:

- Preparar el repo para empezar implementacion real sin arrastrar deuda documental.

Entregables:

- `README.md` actualizado con objetivo del proyecto y comandos esperados.
- `plan-desarrollo.md` como guia operativa.
- `.codex/settings.json` y hooks documentales alineados.
- Decisiones pendientes visibles: auth, ORM final, almacenamiento de imagenes, cache publica.

Tareas:

- Revisar estado git y separar cambios documentales antes de scaffold.
- Confirmar stack base: Next.js, TypeScript, PostgreSQL, Prisma u ORM equivalente, Socket.IO o alternativa.
- Definir convencion de scripts: `lint`, `type-check`, `test`, `build`, `dev`.
- Definir version minima de Node y gestor de paquetes.

Agentes:

- Responsable: `tech-lead`.
- Apoyo: `security-auditor` para secretos/config inicial.

Gate:

- Documentacion no contradice PRD.
- No quedan hooks obsoletos activos.

## 5. Fase 1 - Scaffold monolitico modular

Objetivo:

- Crear estructura inicial de app y paquetes compartidos.

Entregables:

- `apps/tpv`.
- `packages/dominio`.
- `packages/aplicacion`.
- `packages/contratos`.
- `packages/infra`.
- `packages/ui`.
- Configuracion TypeScript, lint, tests y build.

Tareas:

- Crear workspace monorepo.
- Crear app Next.js en `apps/tpv`.
- Crear paquetes internos con exports controlados.
- Configurar alias/imports.
- Crear estructura de rutas:
  - `app/(privado)`;
  - `app/(publico)`;
  - `app/api/privado`;
  - `app/api/publico`.
- Crear cliente API tipado inicial.
- Crear logger base.
- Crear formato normalizado de `ErrorApi`.

Agentes:

- Responsable: `tech-lead`.
- Implementacion: `backend-developer`, `frontend-developer`.

Gate:

- Build inicial verde.
- Lint y type-check verdes.
- Tests base ejecutan.
- `packages/dominio` no importa frameworks.

## 6. Fase 2 - Modelo de datos base

Objetivo:

- Definir persistencia minima para negocio, usuarios, carta/menu y auditoria.

Entregables:

- Schema inicial.
- Migracion inicial.
- Seed de desarrollo.
- Repositorios base.
- Indices y constraints iniciales.

Entidades iniciales:

- `ConfiguracionNegocio`.
- `Usuario`.
- `RolUsuario`.
- `PermisoUsuario`.
- `Dispositivo`.
- `Sesion`.
- `CategoriaProducto`.
- `Producto`.
- `Alergeno`.
- `ImagenProducto`.
- `MenuDia`.
- `CursoMenuDia`.
- `PlatoMenuDia`.
- `RegistroAuditoria`.

Tareas:

- Definir slugs unicos para categorias y productos.
- Separar estado interno y estado publico de productos.
- Modelar alergenos N:M.
- Modelar menu del dia por fecha, cursos y platos.
- Definir auditoria minima.
- Definir baja logica donde aplique.
- Definir `onDelete` explicito.

Agentes:

- Responsable: `database-designer`.
- Apoyo: `backend-developer`, `security-auditor`.

Gate:

- Migracion aplica en limpio.
- Seed crea carta/menu de ejemplo.
- No hay `empresaId` ni `establecimientoId`.
- API publica puede proyectar datos sin campos internos.

## 7. Fase 3 - Contratos y dominio base

Objetivo:

- Crear lenguaje compartido de la aplicacion antes de multiplicar pantallas y endpoints.

Entregables:

- Constantes tipadas de estados, permisos, eventos y errores.
- Schemas de entrada/salida.
- DTOs publicos y privados separados.
- `ResultadoConEventos<T>`.
- Value objects iniciales.

Tareas:

- Definir `ErrorApi`.
- Definir permisos base del PRD.
- Definir estados de producto, menu, pedido, linea, caja, reserva y lista de espera.
- Definir eventos realtime iniciales.
- Definir contratos publicos:
  - negocio publico;
  - categoria publica;
  - plato publico;
  - carta publica;
  - menu del dia publico.

Agentes:

- Responsable: `backend-developer`.
- Revision: `tech-lead`, `security-auditor`.

Gate:

- API publica no reutiliza DTOs internos.
- Estados/permisos/eventos no son strings dispersos.
- Tests de schemas principales.

## 8. Fase 4 - Carta, menu y API publica

Objetivo:

- Entregar primer valor real: carta y menu administrables y consumibles por la web.

Entregables:

- CRUD privado de categorias.
- CRUD privado de productos/platos.
- Gestion de alergenos e imagenes.
- Gestion de menu del dia.
- Publicar/despublicar carta y menu.
- Endpoints:
  - `GET /api/publico/negocio`;
  - `GET /api/publico/carta`;
  - `GET /api/publico/categorias`;
  - `GET /api/publico/platos`;
  - `GET /api/publico/platos/:slug`;
  - `GET /api/publico/menu-dia`.

Tareas:

- Crear casos de uso privados de carta/menu.
- Crear proyecciones publicas explicitas.
- Aplicar cache publica basica si ya esta decidido.
- Aplicar rate-limit publico.
- Auditar cambios de publicacion.
- Testear ocultar producto y que no aparezca en publico.

Agentes:

- Responsable: `backend-developer`.
- DB: `database-designer`.
- Seguridad: `security-auditor`.
- QA: `qa-test-executor`.

Gate:

- No se expone coste, margen, stock interno, proveedor, auditoria, ventas, caja ni datos personales.
- Tests API publica verdes.
- Errores publicos no revelan detalles internos.

## 9. Fase 5 - Sistema UI y web publica

Objetivo:

- Crear base visual reusable y primera superficie publica.

Entregables:

- `packages/ui` con componentes base.
- Layout publico.
- Pagina publica de carta.
- Pagina publica de menu del dia.
- Estados de carga, vacio y error.

Componentes base:

- Boton.
- Campo.
- Input.
- Modal.
- Dialogo confirmacion.
- Banner alerta.
- Estado vacio.
- Skeleton.
- Tabla.
- Filtro.
- Paginacion.
- Tarjeta metrica.
- Badge estado.
- Selector fecha.
- Selector categoria.

Tareas:

- Definir tokens visuales base.
- Implementar componentes reutilizables.
- Implementar cliente API publico.
- Implementar filtros por categoria y alergenos.
- Validar responsive movil y desktop.

Agentes:

- Diseno: `diseñador-ux-ui`.
- Implementacion: `frontend-developer`.
- QA: `qa-test-executor`.

Gate:

- Sin `fetch` directo en componentes.
- Componentes publicos no consumen DTOs internos.
- A11y basica correcta.
- Sin duplicacion de patrones comunes.

## 10. Fase 6 - Auth, usuarios, roles, permisos y dispositivos

Objetivo:

- Habilitar operacion privada segura.

Entregables:

- Login email/password.
- Login rapido por PIN.
- Gestion de usuarios.
- Roles y permisos.
- Dispositivos autorizados.
- Sesiones con expiracion de turno.
- Middleware/API privada protegida.

Tareas:

- Hash fuerte de password y PIN.
- Modelo de sesion.
- `ContextoOperacion`.
- Guard de permisos en backend.
- UI de login y seleccion de modo.
- Auditoria de login sensible y cambios de permisos.

Agentes:

- Responsable backend: `backend-developer`.
- UI: `diseñador-ux-ui`, `frontend-developer`.
- Seguridad: `security-auditor`.
- QA: `qa-test-executor`.

Gate:

- Backend valida permisos siempre.
- PIN solo funciona con dispositivo activo.
- Rate-limit login/PIN.
- Tests de permisos por rol.

## 11. Fase 7 - Sala, mesas y pedidos

Objetivo:

- Crear nucleo operativo del TPV.

Entregables:

- Zonas y mesas.
- Mapa/lista de mesas.
- Crear pedido.
- Anadir lineas.
- Enviar lineas a cocina/barra.
- Cancelaciones directas y solicitadas.
- Auditoria de pedido.

Tareas:

- Modelar `Zona`, `Mesa`, `Pedido`, `LineaPedido`, `SolicitudCancelacion`.
- Casos de uso:
  - abrir mesa;
  - transferir mesa;
  - fusionar mesas;
  - crear pedido;
  - anadir linea;
  - enviar pedido;
  - cancelar linea.
- UI tablet para sala.
- Tests de invariantes.

Agentes:

- DB: `database-designer`.
- Backend: `backend-developer`.
- UX/UI: `diseñador-ux-ui`, `frontend-developer`.
- QA: `qa-test-executor`.

Gate:

- Mesa no tiene mas de un pedido activo.
- Pedido cerrado no acepta lineas.
- No se cobra con lineas pendientes/preparacion.

## 12. Fase 8 - Cocina, barra y realtime

Objetivo:

- Coordinar servicio en tiempo real.

Entregables:

- Pantalla cocina.
- Pantalla barra.
- Canales realtime:
  - `sala`;
  - `cocina`;
  - `barra`;
  - `admin`;
  - `mesa:{mesaId}`;
  - `pedido:{pedidoId}`.
- Eventos versionados.
- Reconexion con recuperacion via API.

Tareas:

- Adaptar eventos de dominio a realtime.
- Validar union a canales por rol/permisos/dispositivo.
- Implementar estados de linea.
- UI para avance rapido de preparacion.
- Tests de eventos duplicados/idempotencia.

Agentes:

- Responsable: `backend-developer`.
- UI: `frontend-developer`.
- Seguridad: `security-auditor`.
- QA: `qa-test-executor`.

Gate:

- Socket autentica usuario, rol, permisos y dispositivo.
- Reconexion recupera estado.
- Eventos duplicados no rompen UI.

## 13. Fase 9 - Stock operativo

Objetivo:

- Mantener coherencia entre pedidos, reservas y stock fisico.

Entregables:

- `StockFisico`.
- `ReservaStock`.
- `MovimientoStock`.
- Ajustes manuales con motivo.
- Recalculo de disponibilidad.

Tareas:

- Reservar stock al anadir/enviar linea segun decision final.
- Liberar reserva al cancelar.
- Consolidar reserva al cobrar.
- Impedir ajuste por debajo de reservado.
- Mostrar estados de disponibilidad.

Agentes:

- DB: `database-designer`.
- Backend: `backend-developer`.
- QA: `qa-test-executor`.

Gate:

- `stockFisico.cantidad >= suma(reservasActivas)`.
- Reservar no descuenta fisico.
- Cobrar descuenta fisico.
- Cancelar libera reserva.

## 14. Fase 10 - Caja, cobros y cierre

Objetivo:

- Completar flujo economico basico.

Entregables:

- Apertura de caja.
- Cobro efectivo, tarjeta y mixto.
- Cuenta dividida.
- Movimientos manuales.
- Cierre de caja.
- Tickets/precuenta basicos.
- Informe de caja.

Tareas:

- Modelar `Caja`, `MovimientoCaja`, `SesionPago`, `PagoDividido`.
- Implementar cobro normal, mixto y dividido.
- Auditar movimientos.
- Consolidar stock tras cobro.
- UI de caja tactil.

Agentes:

- DB: `database-designer`.
- Backend: `backend-developer`.
- UX/UI: `diseñador-ux-ui`, `frontend-developer`.
- Seguridad: `security-auditor`.
- QA: `qa-test-executor`.

Gate:

- Cobro mixto exige suma exacta.
- Caja no cierra con inconsistencias sin permiso.
- Pago consolidado no se revierte por fallo de registro; crea auditoria de reconciliacion.

## 15. Fase 11 - Reservas, clientes e impresoras

Objetivo:

- Cubrir gestion diaria alrededor del servicio.

Entregables:

- Clientes.
- Reservas.
- Lista de espera.
- Impresoras por zona.
- Tickets cocina/barra/precuenta/recibo.

Tareas:

- Modelar cliente/reserva/lista.
- UI calendario/listado.
- Estados de reserva y lista.
- Adaptador de impresion reemplazable.
- Registro de fallos de impresion.

Agentes:

- DB: `database-designer`.
- Backend: `backend-developer`.
- UI: `diseñador-ux-ui`, `frontend-developer`.
- QA: `qa-test-executor`.

Gate:

- Datos personales no aparecen en API publica.
- Fallo de impresion no bloquea pedido/cobro.
- Fallo queda registrado.

## 16. Fase 12 - Compras, proveedores y escandallos

Objetivo:

- Gestionar coste, recepciones y margen.

Entregables:

- Proveedores.
- Productos de proveedor.
- Historial de precios.
- Pedidos de compra.
- Recepciones con impacto en stock.
- Recetas/escandallos.

Tareas:

- Modelar entidades de compra.
- Recepcionar mercancia y crear movimiento de stock.
- Calcular costes y margenes internos.
- UI backoffice.

Agentes:

- DB: `database-designer`.
- Backend: `backend-developer`.
- UI: `frontend-developer`.
- QA: `qa-test-executor`.

Gate:

- Costes/margenes nunca salen por API publica.
- Recepcion crea movimiento de stock.
- Pedido compra respeta estados.

## 17. Fase 13 - Auditoria, informes y analitica

Objetivo:

- Dar trazabilidad y vision operativa al negocio.

Entregables:

- Auditoria consultable.
- Dashboard operativo.
- Informes de ventas, caja, productos, stock, reservas, compras, tiempos, cancelaciones y margenes.

Tareas:

- Consolidar registro de auditoria.
- Crear consultas agregadas.
- Definir permisos por informe.
- UI de dashboard.
- Exportaciones basicas si aplica.

Agentes:

- Backend: `backend-developer`.
- DB: `database-designer`.
- UI: `diseñador-ux-ui`, `frontend-developer`.
- Seguridad: `security-auditor`.
- QA: `qa-test-executor`.

Gate:

- Usuarios sin permiso no ven caja, margenes ni auditoria.
- Informes no mezclan datos publicos e internos.
- Auditoria no se edita desde UI.

## 18. Fase 14 - Hardening y entrega MVP

Objetivo:

- Preparar el MVP para uso real controlado.

Entregables:

- Suite de tests critica.
- Auditoria de seguridad.
- Revision de modularidad.
- Configuracion de despliegue.
- Documentacion de operacion.
- Backlog post-MVP.

Tareas:

- Ejecutar matriz QA completa.
- Ejecutar security review.
- Revisar performance de API publica.
- Revisar errores y logging.
- Revisar backups/migraciones.
- Revisar a11y basica.
- Crear checklist de despliegue.

Agentes:

- Coordinacion: `tech-lead`.
- QA: `qa-test-executor`.
- Seguridad: `security-auditor`.
- Apoyo: `backend-developer`, `frontend-developer`, `database-designer`.

Gate:

- Flujo completo operativo:
  1. Login.
  2. Apertura de mesa.
  3. Pedido de carta o menu.
  4. Envio a cocina/barra.
  5. Preparacion y servido.
  6. Cobro.
  7. Consolidacion stock.
  8. Cierre caja.
  9. Informe del turno o dia.
- API publica pasa revision de seguridad.
- Build y tests verdes.

## 19. Backlog transversal

Estos trabajos no son fase aislada; acompanian todo el desarrollo.

### 19.1 Calidad

- Tests de dominio por invariantes.
- Tests de casos de uso criticos.
- Tests API publica y privada.
- Tests realtime.
- Tests UI para flujos principales.

### 19.2 Seguridad

- Hash fuerte password/PIN.
- Rate-limit login/API publica.
- Redaccion de logs.
- Headers de seguridad.
- Secretos validados al arranque.
- Permisos backend obligatorios.

### 19.3 Modularidad

- Revisar imports por capa.
- Evitar reglas en UI/API.
- Mantener DTOs publicos separados.
- Mantener componentes reutilizables.
- Evitar strings magicos.

### 19.4 Documentacion

- Mantener `aplicacion-requisitos.md` como PRD.
- Mantener `plan-desarrollo.md` como plan operativo.
- Registrar cambios en bitacora de `AGENTS.md`.
- Documentar contratos relevantes cuando se cierren.

## 20. Riesgos principales

| Riesgo | Impacto | Mitigacion |
| --- | --- | --- |
| Scope creep hacia SaaS | Rompe simplicidad del MVP | Hooks + PRD + gates sin tenancy v1. |
| Reglas en UI/API | Deuda y bugs dificiles | Dominio/aplicacion obligatorios, check modularidad. |
| API publica filtrando datos internos | Riesgo de seguridad | DTOs publicos separados, security audit y tests. |
| Caja/stock inconsistentes | Perdida operativa | Invariantes de dominio y tests antes de UI final. |
| Realtime fragil | Cocina/barra pierden confianza | Reconexion por API, eventos idempotentes. |
| UI poco usable en servicio | Lentitud en operacion | UX tablet-first, estados claros, pruebas manuales. |

## 21. Handoff inicial

Que entendi:

- Se quiere pasar de PRD a proyecto real con fases claras.

Que decidi:

- Planificar por valor incremental: fundacion, carta/API publica, UI, auth, TPV, stock, caja, gestion, backoffice y hardening.

Que entrego:

- Plan operativo accionable por fases, con entregables, tareas, agentes y gates.

Que asumo:

- Aun no existe codigo de app.
- Se empezara desde scaffold limpio.
- El alcance sigue siendo un solo negocio.

Que no puedo decidir:

- Proveedor final de auth.
- ORM final si no se usa Prisma.
- Proveedor de imagenes.
- Politica exacta de cache publica.
- Si la pagina publica vive en `apps/tpv` o en frontend externo.

Riesgos:

- Activar demasiadas fases a la vez generaria deuda.
- La fase de carta/API publica debe cerrarse bien porque define contratos y seguridad temprana.

Siguiente agente:

- `tech-lead`: convertir este plan en issues/epicas y cerrar decisiones tecnicas de Fase 0.
