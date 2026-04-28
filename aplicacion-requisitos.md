# PRD y arquitectura - TPV El Jardin

Fecha: 2026-04-28 09:55.
Estado: especificacion base para construir una nueva aplicacion desde cero para un solo negocio.

Documento operativo asociado: `plan-desarrollo.md`.

## 1. Resumen ejecutivo

TPV El Jardin sera una aplicacion de gestion integral para un unico negocio de restauracion. La prioridad inicial es construir un TPV operativo, limpio y mantenible que permita gestionar sala, mesas, pedidos, cocina, barra, caja, carta, menu del dia, stock, reservas, compras, impresoras, auditoria e informes.

Por decision de producto, la primera version no debe asumir complejidad SaaS, multiempresa ni multiestablecimiento. La arquitectura debe seguir siendo modular y escalable, pero el modelo funcional se centra en un solo negocio, con una unica configuracion operativa y sin selectores de empresa o establecimiento.

Objetivo principal:

- Construir una aplicacion nueva, modular y mantenible.
- Evitar deuda heredada y dependencias cruzadas innecesarias.
- Usar espanol total en codigo propio, base de datos, API propia, eventos, permisos, errores y dominio.
- Mantener excepciones solo para librerias, frameworks, APIs externas, keywords y funciones nativas.
- Mantener arquitectura monolitica modular, preparada para crecer sin partir de microservicios.
- Ofrecer una API publica de solo lectura para mostrar carta, platos y menu en la pagina web.

## 2. Producto

### 2.1 Usuarios objetivo

- Propietario o gerente: configura el negocio, revisa caja, informes, usuarios y decisiones operativas.
- Responsable de sala: gestiona mesas, pedidos, reservas, cancelaciones y coordinacion de servicio.
- Jefe de cocina: gestiona cocina, disponibilidad, stock, compras y escandallos.
- Camarero: opera sala, pedidos, notas y cobros permitidos.
- Cocinero: opera pantalla de cocina y estados de preparacion.
- Bartender: opera pantalla de barra.
- Cajero: cobra, abre/cierra caja y registra movimientos.
- Responsable de web/carta: mantiene productos, imagenes, alergenos, precios y visibilidad publica.

### 2.2 Propuesta de valor

- Operacion completa del restaurante en tiempo real.
- Carta y menu gestionados desde el TPV y reutilizados por la pagina web.
- Control de caja, pedidos y stock con trazabilidad.
- UI reutilizable para crecer en pantallas nuevas sin duplicar componentes.
- Arquitectura monolitica modular, testeable y preparada para evolucion futura.

### 2.3 Exito de producto

La aplicacion cumple el MVP cuando permite:

1. Configurar el negocio una vez y operar sin modelo multiempresa.
2. Crear usuarios con roles y permisos internos.
3. Operar un servicio completo de sala, cocina, barra, cobro y caja.
4. Gestionar carta, productos, categorias, alergenos, imagenes y menu del dia.
5. Exponer carta y menu por API publica para la pagina web.
6. Mantener stock coherente con reservas, ventas, compras y ajustes.
7. Auditar operaciones sensibles.
8. Ver informes operativos del negocio.
9. Mantener codigo modular, probado y sin reglas de negocio en UI o handlers HTTP.

## 3. Alcance

### 3.1 Dentro de alcance inicial

- Aplicacion para un unico negocio de restauracion.
- Autenticacion, usuarios, roles, permisos y dispositivos internos.
- Sala, zonas, mesas, pedidos, cocina, barra y realtime.
- Carta, categorias, productos, alergenos, imagenes, estados publicos y menu del dia.
- API publica de carta/menu/platos para pagina web.
- Cobros, cuenta dividida, caja y cierre.
- Stock fisico, reservas de stock, movimientos y disponibilidad.
- Reservas, clientes y lista de espera.
- Compras, proveedores, recepciones y escandallos.
- Impresoras para cocina, barra, sala, precuenta y recibo.
- Auditoria, dashboard, informes y analitica operativa.
- Cliente API tipado y contratos compartidos.
- Tests de dominio, casos de uso, API, realtime y UI critica.

### 3.2 Fuera de alcance inicial

- SaaS, multiempresa, multiestablecimiento y billing por planes.
- Selectores de empresa o establecimiento.
- Tenancy obligatoria en cada query.
- Microservicios.
- Marketplace o sistema de plugins.
- App movil nativa.
- Integracion bancaria real de TPV en v1, salvo registro manual de referencia.
- Contabilidad avanzada.
- Fiscalidad multi-pais o franquicias.

## 4. Modelo de negocio y alcance de datos

### 4.1 Decision base

La aplicacion v1 trabaja para un unico negocio. No existe `Empresa` como tenant ni `Establecimiento` como filtro operativo. En su lugar existe una configuracion global del negocio.

Entidades base:

- `ConfiguracionNegocio`: datos comerciales, contacto, horarios, moneda, impuestos basicos y preferencias.
- `Usuario`: persona autenticada.
- `RolUsuario`: rol funcional del usuario.
- `Dispositivo`: terminal autorizado para sala, cocina, barra, caja o administracion.
- `Sesion`: sesion autenticada.

### 4.2 Reglas de simplicidad

- No se anaden `empresaId` ni `establecimientoId` preventivos en todas las entidades.
- Los repositorios no reciben contexto tenant.
- Los permisos se evaluan con usuario, rol, accion, dispositivo y contexto operativo.
- Si en el futuro se decide crecer a multi-negocio, se hara mediante migracion explicita y no contaminando el MVP.
- La configuracion del negocio es unica y se carga al arrancar vistas que dependan de ella.

### 4.3 Datos internos y publicos

Datos internos:

- Usuarios, roles, caja, stock, compras, proveedores, costes, auditoria e informes.

Datos publicos:

- Categorias visibles.
- Productos visibles.
- Descripcion, precio, imagen, alergenos y estado publico.
- Menu del dia publicado.
- Horarios, contacto y datos basicos del negocio.

Regla clave:

- La API publica nunca expone costes, stock interno, auditoria, proveedores, ventas, caja ni datos personales.

## 5. Roles y permisos

### 5.1 Roles base

- `propietario`: administra toda la aplicacion.
- `administrador`: gestiona configuracion, usuarios, carta, informes y operacion.
- `responsable_sala`: sala, reservas, pedidos, cancelaciones e informes operativos.
- `jefe_cocina`: cocina, stock, compras, proveedores y escandallos.
- `camarero`: mesas, pedidos y cobros permitidos.
- `cocinero`: cola de cocina y estados de preparacion.
- `bartender`: cola de barra.
- `cajero`: caja, cobros y movimientos.
- `editor_carta`: carta, menu, imagenes, alergenos y publicacion web.

### 5.2 Permisos

Los permisos deben declararse como constantes tipadas en espanol:

- `puedeGestionarNegocio`
- `puedeGestionarUsuarios`
- `puedeGestionarDispositivos`
- `puedeVerSala`
- `puedeAbrirMesa`
- `puedeAnadirLineasPedido`
- `puedeEnviarPedido`
- `puedeCancelarLineaDirectamente`
- `puedeSolicitarCancelacion`
- `puedeAprobarCancelacion`
- `puedeCobrarPedido`
- `puedeGestionarCaja`
- `puedeVerCaja`
- `puedeGestionarCarta`
- `puedePublicarCarta`
- `puedeAjustarStock`
- `puedeGestionarReservas`
- `puedeGestionarCompras`
- `puedeGestionarImpresoras`
- `puedeVerAuditoria`
- `puedeVerInformes`
- `puedeVerAnalitica`

### 5.3 Reglas

- El backend valida siempre permisos; el frontend solo oculta o deshabilita acciones.
- Cada permiso se evalua con `usuarioId`, `rol`, `permisos`, `accion`, `dispositivoId`, `ip` y `requestId`.
- Casos de uso reciben `ContextoOperacion`.
- `ContextoOperacion` incluye usuario, rol efectivo, permisos, dispositivo, ip, requestId y fecha de trabajo.
- Las acciones criticas exigen motivo cuando alteran caja, stock, cancelaciones o auditoria.

## 6. Modulos funcionales

Cada modulo debe tener responsabilidad clara, contratos explicitos y pruebas proporcionadas al riesgo.

| Modulo | Responsabilidad | Ambito |
| --- | --- | --- |
| Configuracion del negocio | Datos generales, horarios, moneda, impuestos basicos y preferencias. | Interno |
| Usuarios y permisos | Autenticacion, roles, permisos, sesiones y dispositivos. | Interno |
| UI reutilizable | Componentes base, layout, estados, formularios y patrones de interaccion. | Compartido |
| Carta y productos | Categorias, productos, imagenes, alergenos, precios y estados. | Interno + publico |
| Menu del dia | Menus por fecha, cursos, platos y publicacion. | Interno + publico |
| API publica web | Lectura de carta, platos, menu y datos visibles del negocio. | Publico |
| Sala y mesas | Mapa de mesas, zonas, estados y ocupacion. | Operativo |
| Pedidos | Lineas, envio, estados, notas, cancelaciones y auditoria. | Operativo |
| Cocina | Cola de preparacion de productos de cocina. | Operativo |
| Barra | Cola de bebidas y productos de barra. | Operativo |
| Caja y cobros | Apertura, cobros, movimientos, cierre y tickets. | Operativo |
| Stock | Stock fisico, reservas, movimientos y disponibilidad. | Operativo |
| Reservas y clientes | Clientes, reservas y lista de espera. | Operativo |
| Compras y proveedores | Pedidos de compra, recepciones, proveedores y escandallos. | Backoffice |
| Impresoras | Configuracion, pruebas, tickets y adaptadores reemplazables. | Infraestructura |
| Auditoria | Trazabilidad de mutaciones criticas. | Transversal |
| Informes y analitica | Ventas, caja, productos, stock, reservas, compras y tiempos. | Backoffice |

### 6.1 Configuracion del negocio

Requisitos:

- Configurar nombre comercial, datos fiscales basicos, contacto, direccion, horarios, moneda e impuestos basicos.
- Configurar preferencias de servicio: comensales por defecto, propinas, moneda, redondeo y mensajes de ticket.
- Configurar visibilidad publica de horarios, telefono, direccion y enlaces.

Criterios:

- La aplicacion puede funcionar con una unica configuracion activa.
- Cambios de configuracion critica quedan auditados.

### 6.2 Usuarios, dispositivos y sesiones

Requisitos:

- Login con email/password.
- Login rapido por PIN asociado a dispositivo activo.
- Dispositivos: tablet sala, pantalla cocina, pantalla barra, terminal admin y terminal caja.
- Baja logica de usuarios y dispositivos.
- Sesiones con expiracion de turno.

Criterios:

- PIN solo funciona si el dispositivo esta activo.
- Socket valida usuario, rol, permisos y tipo de dispositivo.

### 6.3 UI reutilizable

Requisitos:

- Crear componentes base compartidos para botones, campos, modales, tablas, filtros, estados y badges.
- Separar componentes de dominio de componentes genericos.
- Evitar duplicar formularios, estados de carga, errores y confirmaciones.
- Mantener textos visibles en espanol.
- Optimizar para tablet en sala/caja y pantallas grandes en administracion.

Criterios:

- Las pantallas componen componentes pequenos, no contienen reglas de negocio.
- No hay `fetch` directo en componentes; se usa cliente API o hooks de caso de uso UI.
- Componentes reutilizables no importan infraestructura ni dominio pesado.

### 6.4 Carta, productos y menu del dia

Requisitos:

- Categorias ordenables y con visibilidad interna/publica.
- Productos con nombre, slug, descripcion, categoria, tipo, destino, precio, imagen, alergenos, estado interno y estado publico.
- Tipos: `plato`, `bebida`, `ingrediente`, `combo`.
- Destinos: `cocina`, `barra`, `ambos`, `ninguno`.
- Estados operativos: `disponible`, `stock_bajo`, `ultimas_unidades`, `agotado`, `pausado`, `demora`.
- Estados publicos: `visible`, `oculto`, `agotado`, `temporalmente_no_disponible`.
- Menu del dia por fecha, precio por comensal, cursos y platos.
- Publicar o despublicar carta y menu sin borrar datos.

Criterios:

- El precio usado en pedidos se copia al crear la linea.
- La API publica solo muestra productos y menus publicados.
- Un producto oculto no aparece en web aunque este disponible internamente.
- Menu del dia solo tiene un menu publicado por fecha.

### 6.5 API publica para pagina web

Requisitos:

- Exponer endpoints publicos de solo lectura para la web.
- Permitir consultar carta completa publicada.
- Permitir consultar categorias publicadas.
- Permitir consultar productos/platos por slug.
- Permitir consultar menu del dia publicado.
- Permitir consultar datos publicos del negocio.
- Aplicar cache, rate-limit y validacion de salida.

Endpoints minimos:

- `GET /api/publico/negocio`
- `GET /api/publico/carta`
- `GET /api/publico/categorias`
- `GET /api/publico/platos`
- `GET /api/publico/platos/:slug`
- `GET /api/publico/menu-dia`

Contrato publico minimo:

```ts
type PlatoCartaPublica = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  imagenUrl: string | null;
  alergenos: string[];
  categoria: {
    id: string;
    nombre: string;
    slug: string;
  };
  estadoPublico: "visible" | "agotado" | "temporalmente_no_disponible";
};
```

Criterios:

- No requiere autenticacion.
- No expone coste, margen, stock interno, proveedor, auditoria ni ventas.
- Devuelve solo datos publicados y activos.
- La web puede consumir la API aunque en el futuro se separe en otro frontend.
- Errores publicos no revelan detalles internos.

### 6.6 Sala y mesas

Requisitos:

- Gestionar zonas y mesas.
- Ver mapa/lista de mesas activas.
- Estados: `libre`, `ocupada`, `reservada`, `en_cobro`.
- Abrir mesa con comensales y notas.
- Transferir mesa a otra libre.
- Fusionar mesas con pedidos activos.
- Liberar mesa solo sin lineas activas.

Criterios:

- Mesa no puede tener mas de un pedido activo.
- Numero de mesa unico por zona.

### 6.7 Pedidos

Requisitos:

- Crear pedido de carta o menu.
- Anadir lineas con precio copiado en el momento.
- Reservar stock para productos controlados.
- Enviar lineas pendientes a cocina/barra.
- Actualizar estados de linea.
- Cancelar total o parcial segun permisos.
- Crear solicitud de cancelacion si usuario no puede cancelar directamente.
- Auditar creacion, envio, cambios, cancelaciones y cobro.

Criterios:

- No se cobra si quedan lineas pendientes, confirmadas o en preparacion.
- Pedido cerrado no acepta lineas nuevas.
- Cancelacion libera stock reservado si aplica.

### 6.8 Cocina y barra

Requisitos:

- Cocina ve lineas con destino cocina o ambos.
- Barra ve lineas con destino barra o ambos.
- Estados de linea: `pendiente`, `confirmada`, `en_preparacion`, `lista`, `servida`, `cancelada`.
- Cambios llegan en realtime.
- Sala recibe cambios visibles de linea.

Criterios:

- Eventos duplicados no rompen UI.
- Reconexion recupera estado desde API.

### 6.9 Caja y cobros

Requisitos:

- Una caja abierta por turno.
- Abrir caja con fondo inicial.
- Cobrar por efectivo, tarjeta o mixto.
- Crear cuenta dividida entre 2 y 20 partes.
- Registrar ingresos y salidas manuales.
- Cerrar caja con efectivo final.
- Exportar movimientos.

Criterios:

- Cobro mixto exige suma exacta.
- Pago consolidado no se revierte si falla registro en caja; se crea auditoria de reconciliacion.
- Caja no puede cerrarse con cobros pendientes de reconciliar sin confirmacion autorizada.

### 6.10 Stock

Requisitos:

- Stock fisico por producto controlado.
- Reserva de stock por linea de pedido.
- Movimiento de stock por toda variacion.
- Recalculo automatico de disponibilidad.
- Ajustes manuales con motivo.

Invariantes:

- `stockFisico.cantidad >= suma(reservasActivas)`.
- Reservar stock no descuenta fisico.
- Cobrar consolida reserva y descuenta fisico.
- Cancelar libera reserva.
- Ajustar no puede dejar fisico por debajo de reservado.

### 6.11 Reservas, clientes y lista de espera

Requisitos:

- Clientes con nombre, telefono, email opcional, notas y consentimiento basico si aplica.
- Reservas por fecha, hora, comensales, mesa sugerida y estado.
- Estados reserva: `solicitud`, `confirmada`, `en_riesgo`, `no_presentado`, `completada`, `cancelada`.
- Lista de espera.
- Estados lista: `esperando`, `avisado`, `atendido`, `cancelado`, `sin_respuesta`.

Criterios:

- Reservas se filtran por fecha y estado.
- Datos personales no aparecen en API publica.

### 6.12 Compras, proveedores y escandallos

Requisitos:

- Proveedores.
- Productos de proveedor.
- Historial de precios.
- Pedidos de compra.
- Recepciones con impacto en stock.
- Recetas para costes y escandallos.

Criterios:

- Recepcion crea movimiento de stock.
- Pedido de compra tiene estados: `borrador`, `enviado`, `parcial`, `recibido`, `cancelado`.
- Costes y margenes nunca se exponen en API publica.

### 6.13 Impresoras

Requisitos:

- Impresoras por zona: cocina, barra y sala.
- Prueba de impresion.
- Tickets de cocina, barra, precuenta y recibo.
- Adaptador reemplazable.

Criterios:

- Fallo de impresion no bloquea pedido o cobro.
- Fallo queda registrado y visible para usuario autorizado.

### 6.14 Auditoria

Requisitos:

- Registro inmutable.
- Campos minimos: usuario, rol, accion, entidad, entidadId, valores previos/nuevos, motivo, ip, requestId y fecha.
- Filtros por usuario, accion, entidad y fecha.

Criterios:

- Toda mutacion critica crea auditoria.
- Auditoria no se edita desde UI.

### 6.15 Informes y analitica

Requisitos:

- Ventas por rango.
- Ventas por metodo de pago.
- Top productos.
- Caja y movimientos.
- Stock.
- Reservas.
- Compras.
- Tiempos de servicio.
- Cancelaciones.
- Margenes.
- Dashboard operativo.

Criterios:

- Informes no mezclan datos publicos con datos internos.
- Usuarios sin permiso no acceden a caja, margenes ni auditoria.

## 7. Arquitectura objetivo

### 7.1 Decision base

Usar monolito modular. El despliegue inicial debe poder ser una sola aplicacion, con limites internos claros por dominio.

Razon:

- Un solo negocio no necesita complejidad SaaS ni microservicios.
- El monolito reduce coste operativo y acelera el MVP.
- La modularidad permite mantener reglas limpias y extraer piezas en el futuro si hay necesidad real.

### 7.2 Estructura recomendada

```txt
apps/
  tpv/
    app/
      (privado)/
      (publico)/
      api/
        publico/
        privado/
    src/
      entrada-http/
      entrada-realtime/
      cliente-api/
      hooks/
      pantallas/
packages/
  dominio/
    negocio/
    usuarios/
    sala/
    pedidos/
    caja/
    carta/
    stock/
    reservas/
    compras/
    informes/
  aplicacion/
    casos-uso/
    permisos/
    transacciones/
  contratos/
    dto/
    eventos/
    schemas/
    errores/
  infra/
    prisma/
    realtime/
    impresoras/
    logger/
    cache/
  ui/
    componentes/
    formularios/
    estilos/
```

### 7.3 Capas

- Dominio: reglas puras, entidades, value objects, errores y eventos.
- Aplicacion: casos de uso, permisos, transacciones y orquestacion.
- Contratos: DTOs, schemas, tipos de eventos, codigos de error y API.
- Infraestructura: Prisma u ORM, realtime, impresoras, logger, cache y adaptadores externos.
- Presentacion: UI, hooks, formularios y cliente API.
- Entrada HTTP/realtime: adaptadores finos.

### 7.4 Reglas de dependencia

- UI no importa infraestructura.
- API no contiene reglas de negocio.
- Dominio no importa Prisma, Socket.IO, Next.js ni cache.
- Casos de uso devuelven `ResultadoConEventos<T>` cuando hay eventos.
- Adaptadores convierten eventos de dominio a eventos realtime.
- Contratos compartidos se versionan.
- La API publica usa contratos propios, no reutiliza DTOs internos con campos ocultos.

### 7.5 Modularidad no negociable

- Un modulo no accede directamente a tablas de otro modulo salvo a traves de repositorios o casos de uso declarados.
- Estados, permisos y eventos se declaran como constantes tipadas.
- Formularios complejos se separan de pantallas.
- Las pantallas orquestan, pero no calculan reglas de negocio.
- La logica de stock, caja y permisos vive fuera de UI y handlers.

## 8. Modelo de datos objetivo

### 8.1 Entidades principales

Base:

- `ConfiguracionNegocio`
- `Usuario`
- `RolUsuario`
- `PermisoUsuario`
- `Dispositivo`
- `Sesion`

Operacion:

- `Zona`
- `Mesa`
- `CategoriaProducto`
- `Producto`
- `Alergeno`
- `ImagenProducto`
- `MenuDia`
- `CursoMenuDia`
- `PlatoMenuDia`
- `Pedido`
- `LineaPedido`
- `SolicitudCancelacion`
- `Caja`
- `MovimientoCaja`
- `SesionPago`
- `PagoDividido`
- `StockFisico`
- `ReservaStock`
- `MovimientoStock`
- `Cliente`
- `Reserva`
- `EntradaListaEspera`
- `Proveedor`
- `ProductoProveedor`
- `PedidoCompra`
- `RecepcionMercancia`
- `Receta`
- `Impresora`
- `RegistroAuditoria`
- `EventoOperativo`

### 8.2 Reglas de persistencia

- No usar entidades tenant en v1.
- Relaciones con historial usan baja logica por defecto.
- `onDelete` explicito en todas las relaciones.
- Importes con decimal.
- Estados persistidos en espanol.
- Fechas separan fecha de negocio, hora local y timestamp.
- Indices por:
  - `estado`
  - `fecha`
  - `mesaId`
  - `categoriaId`
  - `usuarioId`
  - `slug`
  - combinaciones operativas de busqueda.

### 8.3 Seguridad de datos

- Repositorios internos nunca devuelven campos publicos por accidente; cada lectura publica usa proyeccion explicita.
- Datos personales solo se devuelven a usuarios autenticados con permiso.
- Auditoria incluye usuario, rol, accion, entidad, entidadId y requestId.

## 9. API y contratos

### 9.1 Principios

- API propia en espanol.
- Endpoints agrupados por dominio.
- Entrada/salida validada con schemas compartidos.
- Cliente API tipado.
- Errores normalizados.
- Separacion clara entre API privada autenticada y API publica de la web.

### 9.2 Endpoints privados base

- `/api/privado/autenticacion`
- `/api/privado/negocio`
- `/api/privado/usuarios`
- `/api/privado/dispositivos`
- `/api/privado/sala`
- `/api/privado/mesas`
- `/api/privado/pedidos`
- `/api/privado/lineas-pedido`
- `/api/privado/cobros`
- `/api/privado/caja`
- `/api/privado/carta`
- `/api/privado/productos`
- `/api/privado/categorias`
- `/api/privado/menu-dia`
- `/api/privado/stock`
- `/api/privado/clientes`
- `/api/privado/reservas`
- `/api/privado/lista-espera`
- `/api/privado/proveedores`
- `/api/privado/compras`
- `/api/privado/recepciones`
- `/api/privado/recetas`
- `/api/privado/impresoras`
- `/api/privado/auditoria`
- `/api/privado/informes`
- `/api/privado/analitica`
- `/api/privado/configuracion`

### 9.3 Endpoints publicos web

- `/api/publico/negocio`
- `/api/publico/carta`
- `/api/publico/categorias`
- `/api/publico/platos`
- `/api/publico/platos/:slug`
- `/api/publico/menu-dia`

### 9.4 Errores

Codigos:

- `validacion`
- `sin_permiso`
- `no_autenticado`
- `no_encontrado`
- `conflicto`
- `stock_insuficiente`
- `no_publicado`
- `limite_peticion`
- `error_interno`

Forma:

```ts
type ErrorApi = {
  codigo: string;
  mensaje: string;
  detalles?: unknown;
  requestId: string;
};
```

## 10. Realtime

### 10.1 Canales

- `sala`
- `cocina`
- `barra`
- `caja`
- `admin`
- `mesa:{mesaId}`
- `pedido:{pedidoId}`

### 10.2 Eventos

Eventos propios en espanol y versionados:

- `pedido.creado`
- `pedido.actualizado`
- `lineaPedido.anadida`
- `lineaPedido.actualizada`
- `mesa.estadoCambiado`
- `producto.estadoCambiado`
- `stock.actualizado`
- `cancelacion.solicitada`
- `cancelacion.resuelta`
- `cobro.completado`
- `caja.actualizada`
- `reserva.creada`
- `reserva.actualizada`
- `listaEspera.actualizada`
- `carta.publicada`
- `menuDia.publicado`

Payload minimo:

```ts
type EventoRealtime<T> = {
  version: 1;
  nombre: string;
  ocurridoEn: string;
  requestId: string;
  datos: T;
};
```

### 10.3 Reglas

- Socket autentica usuario, rol, permisos y dispositivo.
- Usuario solo se une a canales permitidos por rol.
- Cliente recupera estado por API tras reconexion.
- Eventos son idempotentes desde el punto de vista UI.
- Eventos de publicacion de carta/menu no exponen datos internos.

## 11. Frontend

### 11.1 Principios

- Next.js para `apps/tpv`.
- Aplicacion privada y pagina publica pueden vivir en el mismo monolito.
- Componentes de pantalla como compositores.
- Componentes de dominio pequenos.
- Hooks por caso de uso UI.
- Sin `fetch` directo en componentes.
- Sin `any` sin justificacion.
- Textos visibles en espanol.
- UI preparada para tablet en sala/caja y pantallas grandes en admin/analitica.

### 11.2 Navegacion privada

- Acceso rapido a sala, cocina, barra, caja y administracion segun permisos.
- Sin selector de empresa.
- Sin selector de establecimiento.
- Contexto visible de turno, usuario, caja abierta y estado de conexion.

### 11.3 Pagina publica

- Vista publica de carta.
- Vista publica de menu del dia.
- Filtros por categoria y alergenos.
- Estados visibles: disponible, agotado o temporalmente no disponible.
- La pagina consume contratos publicos, no DTOs internos.

### 11.4 Componentes base

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

## 12. Seguridad e infraestructura

### 12.1 Seguridad

- Secretos validados al arranque.
- Password y PIN con hash fuerte.
- Sesion con expiracion de turno.
- Rate-limit por usuario, IP y endpoint.
- Rate-limit reforzado en API publica.
- Logger con redaccion de datos sensibles.
- Headers de seguridad.
- Auditoria inmutable.
- API publica con CORS deliberado, cache y proyecciones explicitas.

### 12.2 Infraestructura

- PostgreSQL como base principal.
- Prisma u ORM equivalente en `packages/infra`.
- Cache opcional para carta publica y rate-limit.
- Socket.IO o alternativa WebSocket compatible.
- Docker para desarrollo y despliegue.
- Migraciones versionadas desde dia 1.
- Almacenamiento de imagenes desacoplado mediante adaptador.

### 12.3 Escalabilidad

- Monolito modular primero.
- Una sola aplicacion desplegable en v1.
- Separacion por paquetes y contratos para evitar acoplamiento.
- Colas/event bus interno para tareas no criticas si crece impresion, email, imagenes o integraciones.
- No microservicios hasta necesidad medible.
- No SaaS hasta decision explicita de producto.

## 13. Calidad y testing

### 13.1 Tests minimos

- Dominio: reglas puras.
- Aplicacion: casos de uso criticos.
- API privada: handlers y permisos.
- API publica: contratos, cache, datos publicados y ausencia de campos internos.
- Realtime: contratos y autorizacion de canales.
- Infra: queries, transacciones e indices criticos.
- UI: flujos principales y componentes complejos.

### 13.2 Casos criticos

- Login y permisos por rol.
- Abrir mesa y crear pedido.
- Reservar stock.
- Enviar pedido.
- Avanzar linea en cocina/barra.
- Cancelar linea y liberar stock.
- Cobrar pedido normal, mixto y dividido.
- Abrir/cerrar caja.
- Crear reserva y lista de espera.
- Crear recepcion y actualizar stock.
- Publicar carta y verla por API publica.
- Ocultar producto y confirmar que no aparece en web.
- Ver menu del dia publicado.
- Confirmar que costes, stock interno, ventas y auditoria no aparecen en API publica.

### 13.3 Gate

- Lint sin warnings.
- Type-check limpio.
- Tests verdes.
- Build verde.
- 0 `fetch` directo fuera de cliente API.
- 0 `any` sin justificacion.
- 0 reglas de negocio en API/UI.
- 0 DTOs internos usados como respuesta publica sin proyeccion.
- 0 strings magicos de estados, permisos o eventos.
- 0 componentes duplicados para patrones comunes.

## 14. Agentes de trabajo

Los agentes locales se mantienen como apoyo operativo para transformar este PRD en implementacion. Ninguno se descarta por ahora: todos aportan una responsabilidad distinta dentro del monolito modular.

| Agente | Estado | Responsabilidad en este proyecto |
| --- | --- | --- |
| `tech-lead` | Activo | Coordina arquitectura, limites de modulo, contratos, eventos, decisiones y handoff. |
| `backend-developer` | Activo | Implementa casos de uso, API privada, API publica, permisos, auditoria y realtime. |
| `database-designer` | Activo | Disena esquema DB, relaciones, constraints, indices, auditoria e historial sin tenancy v1. |
| `diseñador-ux-ui` | Activo | Define flujos, pantallas, componentes reutilizables, estados y accesibilidad. |
| `frontend-developer` | Activo | Implementa UI privada, web publica, hooks, cliente API y componentes reutilizables. |
| `qa-test-executor` | Activo | Valida flujos criticos, regresion, API publica, permisos, caja, stock y realtime. |
| `security-auditor` | Activo | Audita auth, permisos, API publica, datos sensibles, secretos, DB e infraestructura. |

Reglas de uso:

- Todos deben leer `AGENTS.md` y `aplicacion-requisitos.md` antes de trabajar.
- `CLAUDE.md`, si reaparece, queda como contexto adicional y no desplaza el PRD actual.
- Ningun agente debe introducir SaaS, multiempresa, multiestablecimiento, tenancy preventiva ni microservicios sin decision explicita.
- `tech-lead` resuelve conflictos entre agentes.
- `qa-test-executor` y `security-auditor` validan entregas con riesgo funcional, datos sensibles o API publica.
- Si en el futuro un agente duplica trabajo sin aportar salida distinta, se marcara como pausado antes de eliminarlo.

Flujo recomendado:

1. `tech-lead` delimita modulo, contratos y dependencias.
2. `database-designer` define persistencia si hay entidades nuevas o cambios de integridad.
3. `backend-developer` implementa casos de uso, API y eventos.
4. `diseñador-ux-ui` define flujo y componentes cuando haya superficie visual nueva.
5. `frontend-developer` implementa pantallas, hooks y consumo API.
6. `security-auditor` revisa auth, permisos y exposicion de datos.
7. `qa-test-executor` valida criterios de aceptacion y regresion.

## 15. Roadmap

El roadmap de producto se detalla operativamente en `plan-desarrollo.md`. Esta seccion mantiene la vision resumida dentro del PRD.

### Fase 0 - Fundacion monolitica modular

- Estructura `apps/tpv` y paquetes compartidos.
- Configuracion del negocio, usuarios, roles, permisos, auth, DB, migraciones, logger, errores, contratos y cliente API.

### Fase 1 - Carta, menu y web publica

- Categorias, productos, imagenes, alergenos, estados publicos, menu del dia y API publica.
- Paginas publicas basicas para carta y menu si se mantienen dentro del mismo monolito.

### Fase 2 - TPV operativo

- Sala, mesas, pedidos, cocina, barra, stock inicial y eventos realtime.

### Fase 3 - Cobros y caja

- Cobro normal, mixto, dividido, caja, movimientos, tickets e informes basicos.

### Fase 4 - Gestion diaria

- Reservas, lista de espera, clientes, impresoras y configuracion operativa avanzada.

### Fase 5 - Backoffice

- Compras, proveedores, recepciones, escandallos, auditoria, informes, analitica y dashboard.

### Fase futura - Expansion de producto

- Multi-negocio, multiestablecimiento, billing SaaS, franquicias o microservicios solo si el producto lo exige explicitamente.
- Esta fase queda fuera de alcance inicial.

## 16. Criterios de aceptacion globales

- La aplicacion no requiere crear empresa ni establecimiento para operar.
- Un usuario autorizado puede operar el flujo completo:
  1. Login.
  2. Apertura de mesa.
  3. Pedido de carta o menu.
  4. Envio a cocina/barra.
  5. Preparacion y servido.
  6. Cobro.
  7. Consolidacion stock.
  8. Cierre caja.
  9. Informe del turno o dia.
- La carta y el menu publicados se pueden consumir desde la pagina web via API publica.
- La API publica solo devuelve datos publicados y seguros.
- La UI reutiliza componentes base y no duplica patrones comunes.
- La arquitectura es monolitica modular, sin microservicios ni tenancy prematura.
- La documentacion no deja decisiones criticas abiertas sobre el enfoque de un solo negocio.

## 17. Decisiones cerradas

- Un solo negocio en v1.
- Sin SaaS, multiempresa ni multiestablecimiento en el alcance inicial.
- Sin `Empresa` como tenant ni `Establecimiento` como unidad obligatoria.
- Monolito modular como arquitectura base.
- Una sola aplicacion desplegable para TPV, API privada, API publica y pagina publica si aplica.
- API publica de solo lectura para carta, platos, categorias, menu y datos visibles del negocio.
- Microservicios fuera de v1.
- Billing SaaS fuera de v1.
- Espanol total en codigo propio.
- Socket/realtime con contratos versionados para operacion privada.
- UI reutilizable como requisito arquitectonico, no como mejora futura.
- Agentes locales activos: `tech-lead`, `backend-developer`, `database-designer`, `diseñador-ux-ui`, `frontend-developer`, `qa-test-executor` y `security-auditor`.

## 18. Pendientes no bloqueantes

- Elegir proveedor final de autenticacion si no se usa auth propia.
- Elegir ORM final si no se usa Prisma.
- Definir fiscalidad local detallada.
- Definir integracion externa de pagos cuando el TPV real entre en alcance.
- Definir proveedor de almacenamiento de imagenes.
- Definir politica exacta de cache para API publica.
- Confirmar si la pagina publica vive dentro de `apps/tpv` o si sera un frontend externo consumidor de la API.
