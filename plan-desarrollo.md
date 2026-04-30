# Plan de desarrollo - Correccion de diferencias

Fecha: 2026-04-30.
Estado: plan limpio para corregir diferencias entre `aplicacion-requisitos.md` y la aplicacion auditada.

## 1. Objetivo

Arreglar las diferencias encontradas en la auditoria y llevar la aplicacion al PRD vigente:

- Un solo negocio.
- Sin SaaS, multiempresa, multiestablecimiento ni tenancy preventiva.
- Monolito modular real.
- Contratos publicos y privados estables.
- Flujo critico de TPV consistente: sala, pedido, cocina/barra, cobro, caja, stock e informes.
- API publica segura y solo lectura.
- Auditoria y permisos aplicados en mutaciones criticas.
- Tests que demuestren comportamiento, no solo scripts verdes.

Este documento no describe lo ya realizado. Solo define que hay que corregir, en que orden y como se cierra cada bloque.

## 2. Reglas de trabajo

- No anadir funcionalidades nuevas mientras haya diferencias criticas abiertas.
- No reabrir decisiones de producto ya cerradas salvo cambio explicito del PRD.
- No introducir `Empresa`, `Establecimiento`, `empresaId` ni `establecimientoId`.
- No declarar el MVP listo hasta superar el gate final de este plan.
- Toda correccion debe tener prueba automatizada o evidencia manual reproducible.
- Los handlers HTTP deben quedar finos: validar entrada, llamar caso de uso y responder.
- Las reglas de negocio deben vivir en `packages/dominio` o `packages/aplicacion`.
- El acceso a Prisma debe quedar encapsulado en `packages/infra`.
- La API publica nunca debe exponer costes, stock interno, caja, auditoria, proveedores, usuarios ni datos personales.

## 3. Diferencias a cerrar

| ID | Area | Diferencia | Resultado esperado |
| --- | --- | --- | --- |
| D1 | Contratos | DTO publico, errores, estados y eventos no coinciden del todo con el PRD. | `packages/contratos`, Prisma, API y UI comparten la misma verdad. |
| D2 | Modularidad | Hay logica de negocio en rutas y servicios de `apps/tpv`. | Dominio puro, aplicacion orquestadora, infra como adaptador. |
| D3 | Cobro/caja/stock | Cobro, cierre de pedido, caja y stock no son una unidad atomica. | Cobrar pedido es transaccional, auditable y reconciliable. |
| D4 | Cuenta dividida | Las divisiones pueden normalizarse contra el total en vez del importe parcial. | Cada division conserva su importe real y la suma debe cuadrar. |
| D5 | Realtime | Servidor SSE y cliente no usan la misma convencion de entrega. | Eventos recibidos, deduplicados y recuperables tras reconexion. |
| D6 | Seguridad/admin | Faltan piezas de administracion, politica de dispositivos, secretos y rate-limit persistente. | Operacion privada administrable y segura. |
| D7 | Auditoria | No todas las mutaciones criticas registran auditoria uniforme. | Trazabilidad completa con `requestId`, usuario, accion, entidad y motivo cuando aplique. |
| D8 | QA/UX/web | Hay tests placeholder, prompts/alerts operativos, permisos visuales incompletos y web publica sin remate. | Evidencia real de calidad y experiencia operativa cerrada. |

## 4. Orden de correccion

El orden es deliberado:

1. Contratos y estados.
2. Modularidad base.
3. Flujo atomico de cobro, caja y stock.
4. Realtime.
5. Seguridad, administracion y auditoria.
6. UX, web publica y accesibilidad.
7. QA final y release.

Razon:

- Primero se fija el lenguaje compartido.
- Despues se mueven reglas a las capas correctas.
- Luego se corrige el flujo economico mas critico.
- Realtime se estabiliza sobre contratos ya cerrados.
- Seguridad, auditoria y administracion cierran la operacion privada.
- UX y web rematan la entrega visible.
- QA final valida que no se ha construido sobre una base falsa.

## 5. Fase 1 - Contratos, estados y errores

Objetivo:

- Eliminar divergencias entre PRD, Prisma, Zod, DTOs, eventos, API y UI.

Decisiones:

- El contrato publico de plato usa `precio: string`, no `precioCentimos`.
- `ErrorApi` usa esta forma:

```ts
type ErrorApi = {
  codigo: string;
  mensaje: string;
  detalles?: unknown;
  requestId: string;
};
```

- Los codigos de error validos son:
  - `validacion`
  - `sin_permiso`
  - `no_autenticado`
  - `no_encontrado`
  - `conflicto`
  - `stock_insuficiente`
  - `no_publicado`
  - `limite_peticion`
  - `error_interno`
- Estados de reserva:
  - `solicitud`
  - `confirmada`
  - `en_riesgo`
  - `no_presentado`
  - `completada`
  - `cancelada`
- Estados de lista de espera:
  - `esperando`
  - `avisado`
  - `atendido`
  - `cancelado`
  - `sin_respuesta`
- Estados de pedido de compra:
  - `borrador`
  - `enviado`
  - `parcial`
  - `recibido`
  - `cancelado`
- Eventos realtime usan el sobre:

```ts
type EventoRealtime<T> = {
  version: 1;
  nombre: string;
  ocurridoEn: string;
  requestId: string;
  datos: T;
};
```

Entregables:

- `packages/contratos` como fuente de verdad de DTOs, schemas, errores y eventos.
- Migracion o adaptador para estados persistidos divergentes.
- API publica ajustada a contratos publicos.
- Cliente API ajustado a los nuevos contratos.
- Tests contractuales para API publica, errores y eventos.

Gate de cierre:

- No quedan strings magicos de estados, permisos, errores o eventos fuera de contratos.
- `corepack pnpm --filter @el-jardin/contratos test` tiene tests reales.
- Endpoints publicos devuelven `precio: string`.
- Todos los errores API incluyen `requestId`.

## 6. Fase 2 - Modularidad real

Objetivo:

- Convertir la estructura de carpetas en limites reales de arquitectura.

Responsabilidades finales:

| Capa | Responsabilidad |
| --- | --- |
| `packages/dominio` | Reglas puras, invariantes, transiciones de estado, validacion de importes y stock. |
| `packages/aplicacion` | Casos de uso, permisos, transacciones, auditoria de aplicacion y eventos resultantes. |
| `packages/contratos` | DTOs, schemas, errores, permisos y eventos compartidos. |
| `packages/infra` | Prisma, repositorios, logger, cache, rate-limit, realtime e impresoras. |
| `apps/tpv` | UI, rutas HTTP, composicion de dependencias y adaptadores de entrada. |

Casos de uso minimos a extraer:

- `cobrarPedido`
- `abrirCaja`
- `cerrarCaja`
- `anadirLineaPedido`
- `enviarPedidoAProduccion`
- `actualizarEstadoLinea`
- `cancelarLineaPedido`
- `ajustarStock`
- `recepcionarPedidoCompra`
- `publicarCarta`
- `publicarMenuDia`
- `registrarAuditoria`

Entregables:

- Puertos de repositorio definidos en `packages/aplicacion`.
- Implementaciones Prisma en `packages/infra`.
- Handlers HTTP sin reglas de negocio.
- Tests de dominio para invariantes.
- Tests de aplicacion para casos de uso criticos.

Gate de cierre:

- `packages/dominio` no importa Next, Prisma ni infra.
- `packages/aplicacion` no importa rutas de Next.
- `apps/tpv/app/api/**/route.ts` no contiene calculos de negocio.
- Los scripts de test de paquetes criticos dejan de ser placeholders.

## 7. Fase 3 - Cobro, caja y stock atomicos

Objetivo:

- Hacer indivisible el flujo: pedido -> cobro -> caja -> stock -> auditoria -> eventos.

Reglas:

- Cobrar pedido se ejecuta en una unica transaccion DB.
- El pedido solo se cierra si pagos, caja, stock y auditoria quedan persistidos.
- Stock reservado se consolida dentro de la misma transaccion.
- Si algo falla, no debe quedar pedido cerrado con caja incompleta ni stock consolidado sin cobro.
- Cuenta dividida exige:
  - minimo 2 divisiones;
  - maximo 20 divisiones;
  - importes positivos;
  - suma exacta del total;
  - cada division conserva su importe parcial;
  - metodo de pago valido por division.

Entregables:

- Caso de uso `cobrarPedido` transaccional en `packages/aplicacion`.
- Reglas de validacion de pagos en `packages/dominio`.
- Repositorios transaccionales en `packages/infra`.
- Auditoria de cobro, cierre de pedido, movimientos de caja y stock.
- Eventos emitidos solo despues de commit correcto.
- Tarea de reconciliacion para detectar descuadres:
  - pedido cerrado sin pago completo;
  - pago registrado sin pedido cerrado;
  - stock consolidado sin cobro;
  - caja con cobros no vinculados.

Gate de cierre:

- Test DB de cobro normal.
- Test DB de cobro mixto.
- Test DB de cuenta dividida.
- Test DB de fallo intermedio con rollback.
- Test de invariantes de stock.
- No hay ruta HTTP que cierre pedido, caja o stock por separado en el flujo de cobro.

## 8. Fase 4 - Realtime fiable

Objetivo:

- Garantizar que sala, cocina, barra y caja reciben cambios en vivo y se recuperan tras reconexion.

Decision:

- SSE usa `message` como evento de transporte.
- El nombre de evento vive dentro de `EventoRealtime.nombre`.
- El payload vive dentro de `EventoRealtime.datos`.
- No se usan eventos SSE nombrados salvo que el cliente registre listeners explicitos para todos ellos.

Entregables:

- Servidor SSE alineado con el cliente.
- Cliente realtime con:
  - deduplicacion por id;
  - replay por `desdeId`;
  - reconexion controlada;
  - recuperacion de estado por API cuando sea necesario.
- Backlog realtime con politica de retencion documentada.
- Canales autorizados por usuario, rol, permisos y dispositivo.
- Eventos de pedido, linea, mesa, caja, stock, reserva, carta y menu usando contratos compartidos.

Gate de cierre:

- Test unitario de cliente realtime.
- Test de stream SSE.
- Test de replay tras reconexion.
- Smoke manual:
  1. abrir mesa;
  2. anadir linea;
  3. enviar a cocina/barra;
  4. cambiar estado;
  5. cobrar;
  6. ver actualizacion sin recargar.

## 9. Fase 5 - Seguridad, administracion y auditoria

Objetivo:

- Cerrar la operacion privada y la trazabilidad.

Entregables de seguridad:

- Validacion de secretos al arrancar.
- Politica de dispositivos:
  - un dispositivo desconocido no queda activo automaticamente en produccion;
  - alta, baja y bloqueo quedan auditados;
  - PIN solo funciona en dispositivo activo.
- Rate-limit por adaptador:
  - memoria solo para desarrollo;
  - persistente para produccion o limitacion single-instance documentada.
- Headers de seguridad en API publica, API privada y HTML.
- Redaccion de datos sensibles en logs.

Entregables de administracion:

- API/UI privada para configuracion del negocio.
- API/UI privada para usuarios.
- API/UI privada para roles/permisos si no queda fijo por codigo.
- API/UI privada para dispositivos.

Entregables de auditoria:

- Auditoria uniforme en:
  - usuarios;
  - dispositivos;
  - configuracion;
  - carta/menu;
  - pedidos;
  - cancelaciones;
  - caja;
  - cobros;
  - stock;
  - compras;
  - proveedores;
  - reservas.
- Campos minimos:
  - `usuarioId`
  - `rol`
  - `accion`
  - `entidad`
  - `entidadId`
  - `requestId`
  - `ip`
  - `motivo`
  - `antes`
  - `despues`
  - `creadoEn`

Gate de cierre:

- Tests de permisos por rol.
- Tests de dispositivo activo/inactivo.
- Tests de auditoria por mutacion critica.
- Security review sin hallazgos criticos abiertos.

## 10. Fase 6 - UX operativa, web publica y accesibilidad

Objetivo:

- Cerrar la experiencia visible sin introducir nuevas funcionalidades de negocio.

Entregables UX:

- Sustituir `window.prompt` y `window.alert` por dialogos accesibles.
- Navegacion privada filtrada por permisos.
- Estados de carga, vacio, error y exito en flujos criticos.
- Confirmaciones con motivo cuando afecten a caja, stock, cancelaciones o auditoria.
- Pantallas operativas ajustadas a tablet/TPV.

Entregables web publica:

- Renderizar `imagenUrl` cuando exista.
- Metadata real del negocio.
- Carta publica con categorias, platos, alergenos, precio y estado publico.
- Menu del dia publicado.
- Sin datos internos en HTML ni JSON publico.

Entregables accesibilidad:

- Foco visible.
- Labels asociados.
- Dialogos con roles y cierre por teclado.
- Errores anunciados.
- Contraste revisado.
- Navegacion por teclado en flujos principales.

Gate de cierre:

- Smoke de sala/caja sin prompts nativos.
- Smoke de carta publica y menu del dia.
- Auditoria axe/Lighthouse sin errores criticos.
- Navegacion privada no muestra enlaces sin permiso.

## 11. Fase 7 - QA final y release controlado

Objetivo:

- Demostrar que la aplicacion cumple el PRD y que las diferencias auditadas estan cerradas.

Matriz QA minima:

- Login email/password.
- Login PIN con dispositivo activo.
- Usuario sin permiso bloqueado en backend.
- Apertura de caja.
- Apertura de mesa.
- Pedido con linea a cocina.
- Pedido con linea a barra.
- Cambio de estado realtime.
- Cancelacion directa.
- Solicitud y aprobacion de cancelacion.
- Cobro efectivo.
- Cobro tarjeta.
- Cobro mixto.
- Cuenta dividida.
- Consolidacion de stock.
- Cierre de caja.
- Informe de turno.
- API publica de negocio.
- API publica de carta.
- API publica de plato por slug.
- API publica de menu del dia.
- Reserva y lista de espera.
- Compra y recepcion con impacto en stock.
- Auditoria consultable.
- Backup y restore en entorno controlado.

Pruebas no funcionales:

- Carga basica API publica con p95/p99 documentado.
- Reconexion realtime.
- Accesibilidad automatizada.
- Revision de logs sin datos sensibles.
- Migraciones en estado limpio.

Gate final:

```bash
corepack pnpm -r lint
corepack pnpm -r type-check
corepack pnpm -r test
corepack pnpm -r build
corepack pnpm db:migrate:status
```

Con DB real:

```powershell
$env:RUN_DB_TESTS = "1"
$env:DATABASE_URL = "postgresql://tpv:tpv@localhost:5432/tpv"
corepack pnpm test:db
```

Condiciones de release:

- 0 diferencias criticas abiertas.
- 0 tests placeholder usados como evidencia de paquetes criticos.
- 0 rutas publicas con datos internos.
- 0 mutaciones criticas sin auditoria.
- 0 flujos economicos sin transaccion o reconciliacion.
- Checklist de despliegue ejecutado en entorno controlado.

## 12. Responsables

| Fase | Responsable principal | Apoyos |
| --- | --- | --- |
| 1 - Contratos | Tech Lead | Backend, Frontend, QA |
| 2 - Modularidad | Tech Lead | Backend, Database, QA |
| 3 - Cobro/caja/stock | Backend | Database, QA, Security |
| 4 - Realtime | Backend | Frontend, QA |
| 5 - Seguridad/admin/auditoria | Security | Backend, Frontend, QA |
| 6 - UX/web/a11y | UX/UI | Frontend, QA |
| 7 - QA final | QA | Tech Lead, Security |

## 13. No hacer en este plan

- No implementar SaaS.
- No introducir multiempresa.
- No introducir multiestablecimiento.
- No redisenar el producto.
- No anadir integracion bancaria real.
- No anadir app movil nativa.
- No migrar a microservicios.
- No construir nuevas areas de negocio fuera de las diferencias auditadas.
- No maquillar la UI antes de corregir contratos, transacciones y realtime.

## 14. Handoff para el siguiente bloque

Siguiente paso recomendado:

1. Ejecutar Fase 1 completa.
2. Abrir issues o tareas por cada contrato/estado/error/evento divergente.
3. No tocar cobro ni realtime hasta cerrar los contratos compartidos.
4. Registrar cada correccion en la bitacora de `AGENTS.md`.

Primera entrega esperada:

- PR con contratos corregidos.
- Migracion o adaptador de estados.
- Tests contractuales reales.
- API publica devolviendo `precio: string`.
- `ErrorApi` con `requestId` obligatorio.
