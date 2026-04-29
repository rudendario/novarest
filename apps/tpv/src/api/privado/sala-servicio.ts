import { z } from "zod";

import type { EventoRealtimeV1 } from "@el-jardin/contratos";
import { clientePrisma } from "@el-jardin/infra";

import { liberarReservaLinea, reservarStockLinea } from "@/src/api/privado/stock/stock-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";
import { crearCanalesPedido, emitirEventoRealtime } from "@/src/realtime/servidor-realtime";

export const esquemaCrearZona = z.object({
  nombre: z.string().min(1),
  orden: z.number().int().nonnegative().default(0),
  activa: z.boolean().default(true),
});

export const esquemaCrearMesa = z.object({
  zonaId: z.string().min(1),
  nombre: z.string().min(1),
  codigo: z.string().min(1),
  capacidad: z.number().int().positive().default(4),
  activa: z.boolean().default(true),
});

export const esquemaAbrirPedidoMesa = z.object({
  nota: z.string().min(1).optional(),
});

export const esquemaAnadirLineaPedido = z.object({
  productoId: z.string().min(1),
  cantidad: z.number().int().positive().max(50).default(1),
  nota: z.string().min(1).optional(),
});

export const esquemaCancelarLinea = z.object({
  motivo: z.string().min(3),
  modo: z.enum(["directa", "solicitud"]).default("solicitud"),
});

export const esquemaTransferirMesa = z.object({
  mesaDestinoId: z.string().min(1),
});

export const esquemaFusionarMesas = z.object({
  mesaDestinoId: z.string().min(1),
  motivo: z.string().min(3).optional(),
});

export const esquemaActualizarEstadoLinea = z.object({
  estado: z.enum(["confirmada", "en_preparacion", "lista", "servida", "cancelada"]),
  motivo: z.string().min(3).optional(),
});

export const esquemaResolverSolicitudCancelacion = z.object({
  aprobada: z.boolean(),
  motivoResolucion: z.string().min(3).optional(),
});

export async function recalcularTotalPedido(pedidoId: string) {
  const lineas = await clientePrisma.lineaPedido.findMany({
    where: {
      pedidoId,
      estado: { not: "cancelada" },
    },
    select: {
      precioUnitCentimos: true,
      cantidad: true,
    },
  });

  const totalCentimos = lineas.reduce((acc, linea) => {
    return acc + linea.precioUnitCentimos * linea.cantidad;
  }, 0);

  return clientePrisma.pedido.update({
    where: { id: pedidoId },
    data: { totalCentimos },
  });
}

export async function abrirPedidoEnMesa(params: {
  mesaId: string;
  nota?: string;
  usuarioId?: string;
  rolNombre?: string;
}) {
  const resultado = await clientePrisma.$transaction(async (tx) => {
    const mesa = await tx.mesa.findUnique({
      where: { id: params.mesaId },
      include: { pedidoActivo: true },
    });

    if (!mesa || mesa.eliminadaEn || !mesa.activa) {
      return responderErrorApi(404, "no_encontrado", "Mesa no encontrada o inactiva");
    }

    if (
      mesa.pedidoActivo &&
      mesa.pedidoActivo.estado !== "cobrado" &&
      mesa.pedidoActivo.estado !== "cancelado"
    ) {
      return responderErrorApi(409, "conflicto", "La mesa ya tiene un pedido activo");
    }

    const pedido = await tx.pedido.create({
      data: {
        mesaId: mesa.id,
        nota: params.nota ?? null,
        creadoPorUsuarioId: params.usuarioId ?? null,
      },
    });

    await tx.mesa.update({
      where: { id: mesa.id },
      data: { pedidoActivoId: pedido.id },
    });

    await tx.registroAuditoria.create({
      data: {
        usuarioId: params.usuarioId ?? null,
        rolNombre: params.rolNombre ?? "operador",
        accion: "abrir_pedido_mesa",
        entidad: "Pedido",
        entidadId: pedido.id,
        valoresNuevos: { mesaId: mesa.id },
      },
    });

    return pedido;
  });

  if (!(resultado instanceof Response)) {
    emitirEventoPedido({
      nombre: "pedido.creado.v1",
      pedidoId: resultado.id,
      mesaId: resultado.mesaId,
      payload: { pedidoId: resultado.id, mesaId: resultado.mesaId, estado: resultado.estado },
    });
  }

  return resultado;
}

export async function obtenerPedidoActivoPorMesa(mesaId: string) {
  return clientePrisma.mesa.findUnique({
    where: { id: mesaId },
    include: {
      pedidoActivo: {
        include: {
          lineas: true,
        },
      },
    },
  });
}

export async function anadirLineaAPedido(params: {
  pedidoId: string;
  productoId: string;
  cantidad: number;
  nota?: string;
}) {
  const resultado = await clientePrisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({ where: { id: params.pedidoId } });
    if (!pedido || pedido.eliminadoEn) {
      return responderErrorApi(404, "no_encontrado", "Pedido no encontrado");
    }

    if (pedido.estado !== "abierto") {
      return responderErrorApi(409, "conflicto", "Solo se pueden anadir lineas a pedidos abiertos");
    }

    const producto = await tx.producto.findUnique({ where: { id: params.productoId } });
    if (!producto || producto.eliminadoEn) {
      return responderErrorApi(404, "no_encontrado", "Producto no encontrado");
    }

    const linea = await tx.lineaPedido.create({
      data: {
        pedidoId: pedido.id,
        productoId: producto.id,
        nombreSnapshot: producto.nombre,
        precioUnitCentimos: producto.precioCentimos,
        cantidad: params.cantidad,
        nota: params.nota ?? null,
      },
    });

    return linea;
  });

  if (!(resultado instanceof Response)) {
    const reserva = await reservarStockLinea({
      productoId: resultado.productoId,
      lineaPedidoId: resultado.id,
      cantidad: resultado.cantidad,
    });
    if (reserva instanceof Response) {
      await clientePrisma.lineaPedido.delete({ where: { id: resultado.id } });
      return reserva;
    }

    const pedido = await clientePrisma.pedido.findUnique({
      where: { id: params.pedidoId },
      select: { mesaId: true },
    });
    emitirEventoPedido({
      nombre: "pedido.actualizado.v1",
      pedidoId: params.pedidoId,
      mesaId: pedido?.mesaId ?? null,
      payload: { pedidoId: params.pedidoId, lineaId: resultado.id, tipo: "linea_anadida" },
    });
  }

  return resultado;
}

export async function enviarPedido(pedidoId: string, usuarioId?: string, rolNombre?: string) {
  const resultado = await clientePrisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({
      where: { id: pedidoId },
      include: { lineas: true },
    });

    if (!pedido || pedido.eliminadoEn) {
      return responderErrorApi(404, "no_encontrado", "Pedido no encontrado");
    }

    if (pedido.estado !== "abierto") {
      return responderErrorApi(409, "conflicto", "El pedido ya fue enviado o cerrado");
    }

    const lineasVivas = pedido.lineas.filter((linea) => linea.estado !== "cancelada");
    if (lineasVivas.length === 0) {
      return responderErrorApi(409, "conflicto", "No se puede enviar un pedido sin lineas activas");
    }

    await tx.lineaPedido.updateMany({
      where: {
        pedidoId,
        estado: "pendiente",
      },
      data: {
        estado: "confirmada",
      },
    });

    const actualizado = await tx.pedido.update({
      where: { id: pedidoId },
      data: {
        estado: "enviado",
        enviadoEn: new Date(),
      },
    });

    await tx.registroAuditoria.create({
      data: {
        usuarioId: usuarioId ?? null,
        rolNombre: rolNombre ?? "operador",
        accion: "enviar_pedido",
        entidad: "Pedido",
        entidadId: pedidoId,
      },
    });

    return actualizado;
  });

  if (!(resultado instanceof Response)) {
    emitirEventoPedido({
      nombre: "pedido.actualizado.v1",
      pedidoId,
      mesaId: resultado.mesaId,
      payload: { pedidoId, estado: resultado.estado },
    });
  }

  return resultado;
}

export async function cancelarLineaPedido(params: {
  pedidoId: string;
  lineaPedidoId: string;
  motivo: string;
  modo: "directa" | "solicitud";
  usuarioId?: string;
  rolNombre?: string;
}) {
  const resultado = await clientePrisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({ where: { id: params.pedidoId } });
    if (!pedido || pedido.eliminadoEn) {
      return responderErrorApi(404, "no_encontrado", "Pedido no encontrado");
    }

    if (pedido.estado === "cobrado" || pedido.estado === "cancelado") {
      return responderErrorApi(409, "conflicto", "No se puede cancelar lineas en pedido cerrado");
    }

    const linea = await tx.lineaPedido.findUnique({ where: { id: params.lineaPedidoId } });
    if (!linea || linea.pedidoId !== params.pedidoId) {
      return responderErrorApi(404, "no_encontrado", "Linea no encontrada");
    }

    if (linea.estado === "cancelada") {
      return responderErrorApi(409, "conflicto", "La linea ya esta cancelada");
    }

    if (params.modo === "solicitud") {
      const solicitud = await tx.solicitudCancelacion.create({
        data: {
          pedidoId: params.pedidoId,
          lineaPedidoId: params.lineaPedidoId,
          motivo: params.motivo,
          solicitadaPorUsuarioId: params.usuarioId ?? null,
        },
      });

      return solicitud;
    }

    const actualizada = await tx.lineaPedido.update({
      where: { id: params.lineaPedidoId },
      data: {
        estado: "cancelada",
        canceladoEn: new Date(),
      },
    });

    await tx.registroAuditoria.create({
      data: {
        usuarioId: params.usuarioId ?? null,
        rolNombre: params.rolNombre ?? "operador",
        accion: "cancelar_linea_directa",
        entidad: "LineaPedido",
        entidadId: actualizada.id,
        motivo: params.motivo,
      },
    });

    return actualizada;
  });

  if (!(resultado instanceof Response) && "pedidoId" in resultado) {
    if (params.modo === "directa") {
      await liberarReservaLinea(params.lineaPedidoId, "cancelacion_directa");
    }

    const pedido = await clientePrisma.pedido.findUnique({
      where: { id: params.pedidoId },
      select: { mesaId: true },
    });
    emitirEventoPedido({
      nombre: params.modo === "directa" ? "linea.cancelada.v1" : "pedido.actualizado.v1",
      pedidoId: params.pedidoId,
      mesaId: pedido?.mesaId ?? null,
      payload: { pedidoId: params.pedidoId, lineaId: params.lineaPedidoId, modo: params.modo },
    });
  }

  return resultado;
}

export async function transferirPedidoMesa(params: {
  mesaOrigenId: string;
  mesaDestinoId: string;
  usuarioId?: string;
  rolNombre?: string;
}) {
  if (params.mesaOrigenId === params.mesaDestinoId) {
    return responderErrorApi(409, "conflicto", "La mesa destino debe ser distinta");
  }

  const resultado = await clientePrisma.$transaction(async (tx) => {
    const mesaOrigen = await tx.mesa.findUnique({
      where: { id: params.mesaOrigenId },
      include: { pedidoActivo: true },
    });
    const mesaDestino = await tx.mesa.findUnique({
      where: { id: params.mesaDestinoId },
      include: { pedidoActivo: true },
    });

    if (!mesaOrigen || mesaOrigen.eliminadaEn || !mesaOrigen.activa) {
      return responderErrorApi(404, "no_encontrado", "Mesa origen no encontrada o inactiva");
    }
    if (!mesaDestino || mesaDestino.eliminadaEn || !mesaDestino.activa) {
      return responderErrorApi(404, "no_encontrado", "Mesa destino no encontrada o inactiva");
    }
    if (!mesaOrigen.pedidoActivo || mesaOrigen.pedidoActivo.estado !== "abierto") {
      return responderErrorApi(
        409,
        "conflicto",
        "La mesa origen no tiene pedido abierto transferible",
      );
    }
    if (
      mesaDestino.pedidoActivo &&
      mesaDestino.pedidoActivo.estado !== "cobrado" &&
      mesaDestino.pedidoActivo.estado !== "cancelado"
    ) {
      return responderErrorApi(409, "conflicto", "La mesa destino ya tiene pedido activo");
    }

    const pedido = await tx.pedido.update({
      where: { id: mesaOrigen.pedidoActivo.id },
      data: { mesaId: mesaDestino.id },
    });

    await tx.mesa.update({
      where: { id: mesaOrigen.id },
      data: { pedidoActivoId: null },
    });
    await tx.mesa.update({
      where: { id: mesaDestino.id },
      data: { pedidoActivoId: pedido.id },
    });

    await tx.registroAuditoria.create({
      data: {
        usuarioId: params.usuarioId ?? null,
        rolNombre: params.rolNombre ?? "operador",
        accion: "transferir_mesa",
        entidad: "Pedido",
        entidadId: pedido.id,
        valoresNuevos: { mesaOrigenId: mesaOrigen.id, mesaDestinoId: mesaDestino.id },
      },
    });

    return pedido;
  });

  if (!(resultado instanceof Response)) {
    emitirEventoPedido({
      nombre: "pedido.actualizado.v1",
      pedidoId: resultado.id,
      mesaId: resultado.mesaId,
      payload: { pedidoId: resultado.id, accion: "transferir_mesa", mesaId: resultado.mesaId },
    });
  }

  return resultado;
}

export async function fusionarMesas(params: {
  mesaOrigenId: string;
  mesaDestinoId: string;
  motivo?: string;
  usuarioId?: string;
  rolNombre?: string;
}) {
  if (params.mesaOrigenId === params.mesaDestinoId) {
    return responderErrorApi(409, "conflicto", "La mesa destino debe ser distinta");
  }

  const resultado = await clientePrisma.$transaction(async (tx) => {
    const mesaOrigen = await tx.mesa.findUnique({
      where: { id: params.mesaOrigenId },
      include: { pedidoActivo: true },
    });
    const mesaDestino = await tx.mesa.findUnique({
      where: { id: params.mesaDestinoId },
      include: { pedidoActivo: true },
    });

    if (!mesaOrigen || !mesaDestino) {
      return responderErrorApi(404, "no_encontrado", "Mesa origen o destino no encontrada");
    }
    if (!mesaOrigen.pedidoActivo || !mesaDestino.pedidoActivo) {
      return responderErrorApi(
        409,
        "conflicto",
        "Ambas mesas deben tener pedido activo para fusion",
      );
    }
    if (
      mesaOrigen.pedidoActivo.estado !== "abierto" ||
      mesaDestino.pedidoActivo.estado !== "abierto"
    ) {
      return responderErrorApi(409, "conflicto", "Solo se pueden fusionar pedidos abiertos");
    }

    await tx.lineaPedido.updateMany({
      where: { pedidoId: mesaOrigen.pedidoActivo.id },
      data: { pedidoId: mesaDestino.pedidoActivo.id },
    });

    await tx.pedido.update({
      where: { id: mesaOrigen.pedidoActivo.id },
      data: {
        estado: "cancelado",
        cerradoEn: new Date(),
        nota: `Fusionado en pedido ${mesaDestino.pedidoActivo.id}`,
      },
    });

    await tx.mesa.update({
      where: { id: mesaOrigen.id },
      data: { pedidoActivoId: null },
    });

    await tx.registroAuditoria.create({
      data: {
        usuarioId: params.usuarioId ?? null,
        rolNombre: params.rolNombre ?? "operador",
        accion: "fusionar_mesas",
        entidad: "Pedido",
        entidadId: mesaDestino.pedidoActivo.id,
        motivo: params.motivo ?? null,
        valoresNuevos: { mesaOrigenId: mesaOrigen.id, mesaDestinoId: mesaDestino.id },
      },
    });

    return {
      pedidoDestinoId: mesaDestino.pedidoActivo.id,
      pedidoOrigenId: mesaOrigen.pedidoActivo.id,
    };
  });

  if (!(resultado instanceof Response)) {
    const pedidoDestino = await clientePrisma.pedido.findUnique({
      where: { id: resultado.pedidoDestinoId },
      select: { mesaId: true },
    });
    emitirEventoPedido({
      nombre: "pedido.actualizado.v1",
      pedidoId: resultado.pedidoDestinoId,
      mesaId: pedidoDestino?.mesaId ?? null,
      payload: { ...resultado, accion: "fusionar_mesas" },
    });
  }

  return resultado;
}

function transicionLineaValida(estadoActual: string, estadoDestino: string) {
  const mapa: Record<string, string[]> = {
    pendiente: ["confirmada", "cancelada"],
    confirmada: ["en_preparacion", "cancelada"],
    en_preparacion: ["lista", "cancelada"],
    lista: ["servida", "cancelada"],
    servida: [],
    cancelada: [],
  };

  return (mapa[estadoActual] ?? []).includes(estadoDestino);
}

export async function actualizarEstadoLineaPedido(params: {
  pedidoId: string;
  lineaId: string;
  estadoDestino: "confirmada" | "en_preparacion" | "lista" | "servida" | "cancelada";
  motivo?: string;
  usuarioId?: string;
  rolNombre?: string;
}) {
  const resultado = await clientePrisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({ where: { id: params.pedidoId } });
    if (!pedido || pedido.eliminadoEn) {
      return responderErrorApi(404, "no_encontrado", "Pedido no encontrado");
    }

    const linea = await tx.lineaPedido.findUnique({ where: { id: params.lineaId } });
    if (!linea || linea.pedidoId !== params.pedidoId) {
      return responderErrorApi(404, "no_encontrado", "Linea no encontrada");
    }

    if (!transicionLineaValida(linea.estado, params.estadoDestino)) {
      return responderErrorApi(409, "conflicto", "Transicion de estado de linea no valida");
    }

    const actualizada = await tx.lineaPedido.update({
      where: { id: params.lineaId },
      data: {
        estado: params.estadoDestino,
        canceladoEn: params.estadoDestino === "cancelada" ? new Date() : null,
      },
    });

    const lineasVivas = await tx.lineaPedido.findMany({
      where: {
        pedidoId: params.pedidoId,
        estado: { not: "cancelada" },
      },
      select: { estado: true },
    });

    const todosServidos =
      lineasVivas.length > 0 && lineasVivas.every((item) => item.estado === "servida");
    const algunoServido = lineasVivas.some((item) => item.estado === "servida");
    const nuevoEstadoPedido = todosServidos
      ? "servido"
      : algunoServido
        ? "parcialmente_servido"
        : pedido.estado;

    if (nuevoEstadoPedido !== pedido.estado) {
      await tx.pedido.update({
        where: { id: pedido.id },
        data: { estado: nuevoEstadoPedido },
      });
    }

    await tx.registroAuditoria.create({
      data: {
        usuarioId: params.usuarioId ?? null,
        rolNombre: params.rolNombre ?? "operador",
        accion: "actualizar_estado_linea",
        entidad: "LineaPedido",
        entidadId: actualizada.id,
        motivo: params.motivo ?? null,
        valoresNuevos: { estado: params.estadoDestino },
      },
    });

    return actualizada;
  });

  if (!(resultado instanceof Response)) {
    if (params.estadoDestino === "cancelada") {
      await liberarReservaLinea(params.lineaId, "cancelacion_estado_linea");
    }

    const pedido = await clientePrisma.pedido.findUnique({
      where: { id: params.pedidoId },
      select: { mesaId: true },
    });
    const eventoPorEstado: Partial<Record<typeof params.estadoDestino, EventoRealtimeV1>> = {
      confirmada: "linea.confirmada.v1",
      en_preparacion: "linea.en_preparacion.v1",
      lista: "linea.lista.v1",
      servida: "linea.servida.v1",
      cancelada: "linea.cancelada.v1",
    };
    emitirEventoPedido({
      nombre: eventoPorEstado[params.estadoDestino] ?? "pedido.actualizado.v1",
      pedidoId: params.pedidoId,
      mesaId: pedido?.mesaId ?? null,
      payload: { pedidoId: params.pedidoId, lineaId: params.lineaId, estado: params.estadoDestino },
    });
  }

  return resultado;
}

export async function resolverSolicitudCancelacion(params: {
  solicitudId: string;
  aprobada: boolean;
  motivoResolucion?: string;
  usuarioId?: string;
  rolNombre?: string;
}) {
  const resultado = await clientePrisma.$transaction(async (tx) => {
    const solicitud = await tx.solicitudCancelacion.findUnique({
      where: { id: params.solicitudId },
    });
    if (!solicitud) {
      return responderErrorApi(404, "no_encontrado", "Solicitud no encontrada");
    }
    if (solicitud.resueltaEn) {
      return responderErrorApi(409, "conflicto", "La solicitud ya fue resuelta");
    }

    if (params.aprobada && solicitud.lineaPedidoId) {
      await tx.lineaPedido.update({
        where: { id: solicitud.lineaPedidoId },
        data: { estado: "cancelada", canceladoEn: new Date() },
      });
    }

    const resuelta = await tx.solicitudCancelacion.update({
      where: { id: solicitud.id },
      data: {
        aprobada: params.aprobada,
        aprobadaPorUsuarioId: params.usuarioId ?? null,
        resueltaEn: new Date(),
        motivo: params.motivoResolucion ?? solicitud.motivo,
      },
    });

    await tx.registroAuditoria.create({
      data: {
        usuarioId: params.usuarioId ?? null,
        rolNombre: params.rolNombre ?? "operador",
        accion: params.aprobada ? "aprobar_cancelacion" : "rechazar_cancelacion",
        entidad: "SolicitudCancelacion",
        entidadId: solicitud.id,
        motivo: params.motivoResolucion ?? null,
      },
    });

    return resuelta;
  });

  if (!(resultado instanceof Response)) {
    if (resultado.aprobada && resultado.lineaPedidoId) {
      await liberarReservaLinea(resultado.lineaPedidoId, "cancelacion_aprobada");
    }

    const pedido = await clientePrisma.pedido.findUnique({
      where: { id: resultado.pedidoId },
      select: { mesaId: true },
    });
    emitirEventoPedido({
      nombre: resultado.aprobada ? "linea.cancelada.v1" : "pedido.actualizado.v1",
      pedidoId: resultado.pedidoId,
      mesaId: pedido?.mesaId ?? null,
      payload: {
        solicitudId: resultado.id,
        pedidoId: resultado.pedidoId,
        aprobada: resultado.aprobada,
      },
    });
  }

  return resultado;
}

function emitirEventoPedido(params: {
  nombre: EventoRealtimeV1;
  pedidoId: string;
  mesaId?: string | null;
  payload: Record<string, unknown>;
}) {
  emitirEventoRealtime({
    nombre: params.nombre,
    canales: crearCanalesPedido({ pedidoId: params.pedidoId, mesaId: params.mesaId ?? null }),
    payload: params.payload,
  });
}
