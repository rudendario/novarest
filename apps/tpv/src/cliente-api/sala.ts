export type MesaSala = {
  id: string;
  zonaId: string;
  nombre: string;
  codigo: string;
  capacidad: number;
  activa: boolean;
  zona: {
    id: string;
    nombre: string;
    orden: number;
  };
  pedidoActivo: null | {
    id: string;
    estado: string;
    totalCentimos: number;
    lineas: Array<{
      id: string;
      nombreSnapshot: string;
      cantidad: number;
      estado: string;
      producto: {
        destinoPreparacion: "cocina" | "barra" | "ambos" | "ninguno";
      };
    }>;
  };
};

export type ProductoSala = {
  id: string;
  nombre: string;
  precioCentimos: number;
  eliminadoEn: string | null;
};

export type SolicitudCancelacion = {
  id: string;
  pedidoId: string;
  lineaPedidoId: string | null;
  motivo: string;
  solicitadaPorUsuarioId: string | null;
  creadaEn: string;
};

export type DisponibilidadStock = {
  productoId: string;
  nombre: string;
  cantidadFisica: number;
  cantidadReservada: number;
  cantidadLibre: number;
};

export type ResultadoInvariantesStock = {
  ok: boolean;
  revisados: number;
  incidencias: Array<{
    productoId: string;
    cantidadFisica: number;
    cantidadReservada: number;
    mensaje: string;
  }>;
};

export type CajaActiva = {
  id: string;
  estado: "abierta" | "cerrada" | "cuadrada" | "descuadrada";
  abiertaEn: string;
  saldoInicial: number;
  totalEfectivo: number;
  totalTarjeta: number;
};

export type InformeCaja = {
  caja: CajaActiva;
  resumen: {
    saldoEsperado: number;
    totalPagos: number;
    totalMovimientos: number;
  };
  movimientos: Array<{
    id: string;
    tipo: string;
    metodo: "efectivo" | "tarjeta" | "mixto" | null;
    cantidad: number;
    motivo: string | null;
    creadoEn: string;
  }>;
  pagos: Array<{
    id: string;
    metodo: "efectivo" | "tarjeta" | "mixto";
    montoTotal: number;
    montoEfectivo: number;
    montoTarjeta: number;
    cobradoEn: string;
  }>;
};

export type ClienteReserva = {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  notas: string | null;
};

export type ReservaTurno = {
  id: string;
  clienteId: string | null;
  mesaId: string | null;
  nombreCliente: string;
  telefonoContacto: string | null;
  fechaHora: string;
  comensales: number;
  estado: "pendiente" | "confirmada" | "sentada" | "completada" | "cancelada" | "no_show";
  notas: string | null;
};

export type EntradaListaEspera = {
  id: string;
  clienteId: string | null;
  nombreCliente: string;
  telefonoContacto: string | null;
  comensales: number;
  estado: "esperando" | "avisado" | "sentado" | "cancelado";
  notas: string | null;
};

export type ImpresoraTpv = {
  id: string;
  nombre: string;
  zonaId: string | null;
  activa: boolean;
  tipoConexion: string;
  endpoint: string | null;
  prioridad: number;
};

export type TrabajoImpresion = {
  id: string;
  tipoTicket: "cocina" | "barra" | "precuenta" | "recibo" | "prueba";
  estado: "pendiente" | "enviado" | "error";
  errorDetalle: string | null;
  creadoEn: string;
};

export type ProveedorCompra = {
  id: string;
  nombre: string;
  codigo: string;
  telefono: string | null;
  email: string | null;
  contacto: string | null;
  activo: boolean;
};

export type ProductoProveedorCompra = {
  id: string;
  productoId: string;
  proveedorId: string;
  referenciaProveedor: string | null;
  unidadCompra: string;
  unidadesPorCompra: number;
  precioActualCentimos: number;
  activo: boolean;
  producto: {
    id: string;
    nombre: string;
  };
  proveedor: {
    id: string;
    nombre: string;
  };
  historialPrecios: Array<{
    id: string;
    precioCentimos: number;
    motivo: string | null;
    creadoEn: string;
  }>;
};

export type PedidoCompra = {
  id: string;
  proveedorId: string;
  estado: "borrador" | "enviado" | "parcialmente_recibido" | "recibido" | "cancelado";
  fechaPedido: string;
  fechaEsperada: string | null;
  totalCentimos: number;
  notas: string | null;
  proveedor: {
    id: string;
    nombre: string;
  };
  lineas: Array<{
    id: string;
    productoProveedorId: string;
    cantidad: number;
    cantidadRecibida: number;
    precioUnitCentimos: number;
    totalLineaCentimos: number;
    productoProveedor: {
      producto: {
        id: string;
        nombre: string;
      };
    };
  }>;
};

export type RecetaEscandallo = {
  id: string;
  productoFinalId: string;
  nombre: string;
  porciones: number;
  mermaPct: number;
  activa: boolean;
  productoFinal: {
    id: string;
    nombre: string;
  };
  lineas: Array<{
    id: string;
    productoId: string;
    cantidadUnidades: number;
    producto: {
      id: string;
      nombre: string;
    };
  }>;
};

export type RegistroAuditoria = {
  id: string;
  usuarioId: string | null;
  rolNombre: string;
  accion: string;
  entidad: string;
  entidadId: string;
  motivo: string | null;
  creadoEn: string;
};

export type InformeResumen = {
  rango: { desde: string; hasta: string };
  ventas: {
    totalCentimos: number;
    efectivoCentimos: number;
    tarjetaCentimos: number;
    pagos: number;
    pedidos: number;
  };
  caja: {
    entradasManualCentimos: number;
    salidasManualCentimos: number;
    movimientos: number;
  };
  stock: {
    consumoUnidades: number;
    recepcionUnidades: number;
    movimientos: number;
  };
};

export type InformeDesgloseProducto = {
  rango: { desde: string; hasta: string };
  items: Array<{
    productoId: string;
    nombre: string;
    unidades: number;
    ventaCentimos: number;
  }>;
};

export type InformeDesgloseCategoria = {
  rango: { desde: string; hasta: string };
  items: Array<{
    categoriaId: string;
    nombre: string;
    unidades: number;
    ventaCentimos: number;
  }>;
};

export type InformeDesgloseTurno = {
  rango: { desde: string; hasta: string };
  items: Array<{
    turno: "manana" | "tarde" | "noche";
    pagos: number;
    ventaCentimos: number;
  }>;
};

export type InformeComparativa = {
  actual: { desde: string; hasta: string; totalCentimos: number; pagos: number; pedidos: number };
  previo: { desde: string; hasta: string; totalCentimos: number; pagos: number; pedidos: number };
  comparativa: { deltaCentimos: number; deltaPct: number };
};

async function leerJson<T>(path: string): Promise<T> {
  const respuesta = await fetch(path, { cache: "no-store" });
  if (!respuesta.ok) {
    throw new Error(`Error en ${path}`);
  }

  return (await respuesta.json()) as T;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const respuesta = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!respuesta.ok) {
    const err = await respuesta.json().catch(() => ({}));
    throw new Error((err as { mensaje?: string }).mensaje ?? `Error en ${path}`);
  }

  return (await respuesta.json()) as T;
}

export function obtenerMesasSala() {
  return leerJson<MesaSala[]>("/api/privado/mesas");
}

export function obtenerProductosSala() {
  return leerJson<ProductoSala[]>("/api/privado/productos");
}

export function obtenerSolicitudesCancelacion() {
  return leerJson<SolicitudCancelacion[]>("/api/privado/solicitudes-cancelacion");
}

export function resolverSolicitudCancelacion(
  solicitudId: string,
  params: { aprobada: boolean; motivoResolucion?: string },
) {
  return postJson(`/api/privado/solicitudes-cancelacion/${solicitudId}/resolver`, params);
}

export function abrirPedidoMesa(mesaId: string, nota?: string) {
  return postJson(`/api/privado/mesas/${mesaId}/abrir-pedido`, { nota });
}

export function anadirLineaPedido(
  pedidoId: string,
  params: {
    productoId: string;
    cantidad: number;
    nota?: string;
  },
) {
  return postJson(`/api/privado/pedidos/${pedidoId}/lineas`, params);
}

export function enviarPedido(pedidoId: string) {
  return postJson(`/api/privado/pedidos/${pedidoId}/enviar`, {});
}

export function solicitarCancelacionLinea(
  pedidoId: string,
  lineaId: string,
  motivo: string,
  modo: "directa" | "solicitud" = "solicitud",
) {
  return postJson(`/api/privado/pedidos/${pedidoId}/lineas/${lineaId}/cancelar`, {
    motivo,
    modo,
  });
}

export function transferirMesa(mesaOrigenId: string, mesaDestinoId: string) {
  return postJson(`/api/privado/mesas/${mesaOrigenId}/transferir`, { mesaDestinoId });
}

export function fusionarMesa(mesaOrigenId: string, mesaDestinoId: string, motivo?: string) {
  return postJson(`/api/privado/mesas/${mesaOrigenId}/fusionar`, { mesaDestinoId, motivo });
}

export function actualizarEstadoLinea(
  pedidoId: string,
  lineaId: string,
  estado: "confirmada" | "en_preparacion" | "lista" | "servida" | "cancelada",
  motivo?: string,
) {
  return postJson(`/api/privado/pedidos/${pedidoId}/lineas/${lineaId}/estado`, { estado, motivo });
}

export function cobrarPedido(
  pedidoId: string,
  params: {
    metodo: "efectivo" | "tarjeta" | "mixto";
    montoEfectivo?: number;
    montoTarjeta?: number;
    divisiones?: Array<{
      metodo: "efectivo" | "tarjeta" | "mixto";
      montoEfectivo?: number;
      montoTarjeta?: number;
    }>;
  },
) {
  return postJson(`/api/privado/pedidos/${pedidoId}/cobrar`, params);
}

export function obtenerPrecuentaPedido(pedidoId: string) {
  return leerJson<{
    ok: boolean;
    precuenta: {
      pedidoId: string;
      mesa: string;
      estado: string;
      lineas: Array<{
        id: string;
        nombre: string;
        cantidad: number;
        precioUnitCentimos: number;
        totalLineaCentimos: number;
      }>;
      resumen: {
        subtotalCentimos: number;
        totalCentimos: number;
      };
    };
  }>(`/api/privado/pedidos/${pedidoId}/precuenta`);
}

export function obtenerTicketPedido(pedidoId: string) {
  return leerJson<{
    ok: boolean;
    ticket: {
      negocio: string;
      pedidoId: string;
      mesa: string;
      emitidoEn: string;
      lineas: Array<{
        id: string;
        nombre: string;
        cantidad: number;
        precioUnitCentimos: number;
        totalLineaCentimos: number;
      }>;
      pagos: Array<{
        id: string;
        metodo: "efectivo" | "tarjeta" | "mixto";
        montoTotal: number;
        montoEfectivo: number;
        montoTarjeta: number;
        divisiones: Array<{
          indice: number;
          metodo: "efectivo" | "tarjeta" | "mixto";
          montoTotal: number;
          montoEfectivo: number;
          montoTarjeta: number;
        }>;
      }>;
      resumen: {
        totalLineasCentimos: number;
        totalPagadoCentimos: number;
        pendienteCentimos: number;
      };
    };
  }>(`/api/privado/pedidos/${pedidoId}/ticket`);
}

export function obtenerDisponibilidadStock() {
  return leerJson<DisponibilidadStock[]>("/api/privado/stock/disponibilidad");
}

export function ajustarStock(params: {
  productoId: string;
  cantidadDelta: number;
  motivo: string;
}) {
  return postJson("/api/privado/stock/ajustes", params);
}

export function validarInvariantesStock() {
  return leerJson<ResultadoInvariantesStock>("/api/privado/stock/invariantes");
}

export function obtenerEstadoCaja() {
  return leerJson<{ ok: boolean; caja: CajaActiva | null }>("/api/privado/caja/estado");
}

export function abrirCaja(params: { saldoInicial: number }) {
  return postJson("/api/privado/caja/apertura", params);
}

export function cerrarCaja(params: { saldoFinal: number; motivo?: string }) {
  return postJson("/api/privado/caja/cierre", params);
}

export function registrarMovimientoManualCaja(params: {
  tipo: "entrada_manual" | "salida_manual";
  metodo: "efectivo" | "tarjeta";
  cantidad: number;
  motivo: string;
}) {
  return postJson("/api/privado/caja/movimiento-manual", params);
}

export function obtenerInformeCaja() {
  return leerJson<{ ok: boolean; informe: InformeCaja }>("/api/privado/caja/informe");
}

export function obtenerClientesReserva(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  return leerJson<ClienteReserva[]>(`/api/privado/clientes${qs}`);
}

export function crearClienteReserva(params: {
  nombre: string;
  telefono?: string;
  email?: string;
  notas?: string;
}) {
  return postJson("/api/privado/clientes", params);
}

export function obtenerReservas() {
  return leerJson<ReservaTurno[]>("/api/privado/reservas");
}

export function crearReserva(params: {
  clienteId?: string;
  mesaId?: string;
  nombreCliente: string;
  telefonoContacto?: string;
  fechaHora: string;
  comensales: number;
  notas?: string;
}) {
  return postJson("/api/privado/reservas", params);
}

export function actualizarEstadoReserva(
  reservaId: string,
  params: {
    estado: "pendiente" | "confirmada" | "sentada" | "completada" | "cancelada" | "no_show";
    motivo?: string;
  },
) {
  return postJson(`/api/privado/reservas/${reservaId}/estado`, params);
}

export function asignarMesaAReserva(reservaId: string, mesaId: string) {
  return postJson(`/api/privado/reservas/${reservaId}/asignar-mesa`, { mesaId });
}

export function sentarReservaConApertura(reservaId: string) {
  return postJson<{ ok: boolean; reserva: ReservaTurno; pedidoId: string | null }>(
    `/api/privado/reservas/${reservaId}/sentar`,
    {},
  );
}

export function obtenerImpresoras() {
  return leerJson<ImpresoraTpv[]>("/api/privado/impresoras");
}

export function crearImpresora(params: {
  nombre: string;
  zonaId?: string;
  tipoConexion?: string;
  endpoint?: string;
  prioridad?: number;
  activa?: boolean;
}) {
  return postJson("/api/privado/impresoras", params);
}

export function obtenerTrabajosImpresion() {
  return leerJson<TrabajoImpresion[]>("/api/privado/impresion/trabajos");
}

export function enviarTrabajoImpresion(params: {
  tipoTicket: "cocina" | "barra" | "precuenta" | "recibo" | "prueba";
  zonaId?: string;
  referenciaTipo?: string;
  referenciaId?: string;
  contenido: Record<string, unknown>;
}) {
  return postJson("/api/privado/impresion/trabajos", params);
}

export function reintentarTrabajoImpresion(trabajoId: string) {
  return postJson(`/api/privado/impresion/trabajos/${trabajoId}/reintentar`, {});
}

export function procesarPendientesImpresion(limite = 20) {
  return postJson("/api/privado/impresion/procesar-pendientes", { limite });
}

export function imprimirPrecuentaPedido(pedidoId: string) {
  return postJson(`/api/privado/pedidos/${pedidoId}/imprimir-precuenta`, {});
}

export function imprimirReciboPedido(pedidoId: string) {
  return postJson(`/api/privado/pedidos/${pedidoId}/imprimir-recibo`, {});
}

export function imprimirProduccionPedido(pedidoId: string, destino: "cocina" | "barra") {
  return postJson(`/api/privado/pedidos/${pedidoId}/imprimir-produccion`, { destino });
}

export function obtenerProveedoresCompra() {
  return leerJson<ProveedorCompra[]>("/api/privado/proveedores");
}

export function crearProveedorCompra(params: {
  nombre: string;
  codigo: string;
  telefono?: string;
  email?: string;
  contacto?: string;
}) {
  return postJson("/api/privado/proveedores", params);
}

export function obtenerProductosProveedorCompra() {
  return leerJson<ProductoProveedorCompra[]>("/api/privado/productos-proveedor");
}

export function vincularProductoProveedorCompra(params: {
  productoId: string;
  proveedorId: string;
  referenciaProveedor?: string;
  unidadCompra?: string;
  unidadesPorCompra?: number;
  precioActualCentimos: number;
}) {
  return postJson("/api/privado/productos-proveedor", params);
}

export function actualizarPrecioProductoProveedorCompra(
  vinculacionId: string,
  params: { precioCentimos: number; motivo?: string },
) {
  return postJson(`/api/privado/productos-proveedor/${vinculacionId}/precio`, params);
}

export function obtenerPedidosCompra() {
  return leerJson<PedidoCompra[]>("/api/privado/pedidos-compra");
}

export function crearPedidoCompra(params: {
  proveedorId: string;
  fechaEsperada?: string;
  notas?: string;
  lineas: Array<{
    productoProveedorId: string;
    cantidad: number;
    precioUnitCentimos: number;
  }>;
}) {
  return postJson("/api/privado/pedidos-compra", params);
}

export function recepcionarPedidoCompra(
  pedidoCompraId: string,
  params: {
    notas?: string;
    lineas: Array<{
      lineaPedidoCompraId: string;
      cantidadRecibida: number;
    }>;
  },
) {
  return postJson(`/api/privado/pedidos-compra/${pedidoCompraId}/recepcionar`, params);
}

export function obtenerEscandallos() {
  return leerJson<RecetaEscandallo[]>("/api/privado/escandallos");
}

export function crearRecetaEscandallo(params: {
  productoFinalId: string;
  nombre: string;
  porciones?: number;
  mermaPct?: number;
}) {
  return postJson("/api/privado/escandallos", params);
}

export function anadirLineaEscandallo(
  recetaId: string,
  params: { productoId: string; cantidadUnidades: number; unidadUso?: string },
) {
  return postJson(`/api/privado/escandallos/${recetaId}/lineas`, params);
}

export function obtenerCosteEscandallo(
  recetaId: string,
  estrategia: "ultimo" | "promedio" = "ultimo",
) {
  return leerJson<{
    recetaId: string;
    nombre: string;
    productoFinal: string;
    porciones: number;
    mermaPct: number;
    estrategiaCoste: "ultimo" | "promedio";
    detalle: Array<{
      productoId: string;
      nombre: string;
      cantidadUnidades: number;
      unidadUso: string;
      costoUnitCentimos: number;
      costoLineaCentimos: number;
    }>;
    resumen: {
      costoBrutoCentimos: number;
      costoConMermaCentimos: number;
      costoPorPorcionCentimos: number;
      precioVentaCentimos: number;
      margenCentimos: number;
      margenPct: number;
    };
  }>(`/api/privado/escandallos/${recetaId}/coste?estrategia=${estrategia}`);
}

export function obtenerListaEspera() {
  return leerJson<EntradaListaEspera[]>("/api/privado/lista-espera");
}

export function crearEntradaListaEspera(params: {
  clienteId?: string;
  nombreCliente: string;
  telefonoContacto?: string;
  comensales: number;
  notas?: string;
}) {
  return postJson("/api/privado/lista-espera", params);
}

export function actualizarEstadoListaEspera(
  entradaId: string,
  estado: "esperando" | "avisado" | "sentado" | "cancelado",
) {
  return postJson(`/api/privado/lista-espera/${entradaId}/estado`, { estado });
}

export function obtenerAuditoria(params?: { entidad?: string; accion?: string; limite?: number }) {
  const query = new URLSearchParams();
  if (params?.entidad) query.set("entidad", params.entidad);
  if (params?.accion) query.set("accion", params.accion);
  if (params?.limite) query.set("limite", String(params.limite));
  const sufijo = query.toString() ? `?${query.toString()}` : "";
  return leerJson<RegistroAuditoria[]>(`/api/privado/auditoria${sufijo}`);
}

export function obtenerInformeResumen(params?: { desde?: string; hasta?: string }) {
  const query = new URLSearchParams();
  if (params?.desde) query.set("desde", params.desde);
  if (params?.hasta) query.set("hasta", params.hasta);
  const sufijo = query.toString() ? `?${query.toString()}` : "";
  return leerJson<InformeResumen>(`/api/privado/informes/resumen${sufijo}`);
}

export function obtenerInformeDesgloseProducto(params?: { desde?: string; hasta?: string }) {
  const query = new URLSearchParams();
  if (params?.desde) query.set("desde", params.desde);
  if (params?.hasta) query.set("hasta", params.hasta);
  const sufijo = query.toString() ? `?${query.toString()}` : "";
  return leerJson<InformeDesgloseProducto>(`/api/privado/informes/desglose-producto${sufijo}`);
}

export function obtenerInformeDesgloseCategoria(params?: { desde?: string; hasta?: string }) {
  const query = new URLSearchParams();
  if (params?.desde) query.set("desde", params.desde);
  if (params?.hasta) query.set("hasta", params.hasta);
  const sufijo = query.toString() ? `?${query.toString()}` : "";
  return leerJson<InformeDesgloseCategoria>(`/api/privado/informes/desglose-categoria${sufijo}`);
}

export function obtenerInformeDesgloseTurno(params?: { desde?: string; hasta?: string }) {
  const query = new URLSearchParams();
  if (params?.desde) query.set("desde", params.desde);
  if (params?.hasta) query.set("hasta", params.hasta);
  const sufijo = query.toString() ? `?${query.toString()}` : "";
  return leerJson<InformeDesgloseTurno>(`/api/privado/informes/desglose-turno${sufijo}`);
}

export function obtenerInformeComparativa(params?: {
  actualDesde?: string;
  actualHasta?: string;
  previoDesde?: string;
  previoHasta?: string;
}) {
  const query = new URLSearchParams();
  if (params?.actualDesde) query.set("actualDesde", params.actualDesde);
  if (params?.actualHasta) query.set("actualHasta", params.actualHasta);
  if (params?.previoDesde) query.set("previoDesde", params.previoDesde);
  if (params?.previoHasta) query.set("previoHasta", params.previoHasta);
  const sufijo = query.toString() ? `?${query.toString()}` : "";
  return leerJson<InformeComparativa>(`/api/privado/informes/comparativa${sufijo}`);
}

export async function descargarInformeCsv(params?: { desde?: string; hasta?: string }) {
  const query = new URLSearchParams();
  if (params?.desde) query.set("desde", params.desde);
  if (params?.hasta) query.set("hasta", params.hasta);
  const sufijo = query.toString() ? `?${query.toString()}` : "";
  const resp = await fetch(`/api/privado/informes/export/csv${sufijo}`, { cache: "no-store" });
  if (!resp.ok) throw new Error("Error al exportar CSV");
  return resp.text();
}
