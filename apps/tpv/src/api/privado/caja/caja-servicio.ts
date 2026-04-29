import { z } from "zod";

import { clientePrisma } from "@el-jardin/infra";

import { responderErrorApi } from "@/src/api/publico/respuestas";

export const esquemaAperturaCaja = z.object({
  saldoInicial: z.number().int().nonnegative().default(0),
});

export const esquemaCierreCaja = z.object({
  saldoFinal: z.number().int().nonnegative(),
  motivo: z.string().min(3).optional(),
});

export const esquemaCobroCaja = z.object({
  metodo: z.enum(["efectivo", "tarjeta", "mixto"]),
  montoEfectivo: z.number().int().nonnegative().optional(),
  montoTarjeta: z.number().int().nonnegative().optional(),
  divisiones: z
    .array(
      z.object({
        metodo: z.enum(["efectivo", "tarjeta", "mixto"]),
        montoEfectivo: z.number().int().nonnegative().optional(),
        montoTarjeta: z.number().int().nonnegative().optional(),
      }),
    )
    .optional(),
});

export const esquemaMovimientoManualCaja = z.object({
  tipo: z.enum(["entrada_manual", "salida_manual"]),
  metodo: z.enum(["efectivo", "tarjeta"]).default("efectivo"),
  cantidad: z.number().int().positive(),
  motivo: z.string().min(3),
});

export async function obtenerCajaActiva() {
  return clientePrisma.caja.findFirst({
    where: { estado: "abierta" },
    orderBy: [{ abiertaEn: "desc" }],
  });
}

export async function abrirCaja(params: { saldoInicial: number; usuarioId?: string }) {
  const abierta = await obtenerCajaActiva();
  if (abierta) {
    return responderErrorApi(409, "conflicto", "Ya hay una caja abierta");
  }

  return clientePrisma.$transaction(async (tx) => {
    const caja = await tx.caja.create({
      data: {
        estado: "abierta",
        saldoInicial: params.saldoInicial,
        abiertaPorId: params.usuarioId ?? null,
      },
    });

    await tx.movimientoCaja.create({
      data: {
        cajaId: caja.id,
        tipo: "apertura",
        cantidad: params.saldoInicial,
        metodo: "efectivo",
        motivo: "apertura_caja",
        creadoPorId: params.usuarioId ?? null,
      },
    });

    return caja;
  });
}

export async function cerrarCaja(params: {
  saldoFinal: number;
  motivo?: string;
  usuarioId?: string;
}) {
  const abierta = await obtenerCajaActiva();
  if (!abierta) {
    return responderErrorApi(409, "conflicto", "No hay caja abierta");
  }

  const esperado = abierta.saldoInicial + abierta.totalEfectivo;
  const estadoFinal = esperado === params.saldoFinal ? "cuadrada" : "descuadrada";

  return clientePrisma.$transaction(async (tx) => {
    const cerrada = await tx.caja.update({
      where: { id: abierta.id },
      data: {
        estado: estadoFinal,
        saldoFinal: params.saldoFinal,
        cerradaEn: new Date(),
        cerradaPorId: params.usuarioId ?? null,
      },
    });

    await tx.movimientoCaja.create({
      data: {
        cajaId: abierta.id,
        tipo: "cierre",
        cantidad: params.saldoFinal,
        metodo: "efectivo",
        motivo: params.motivo ?? "cierre_caja",
        creadoPorId: params.usuarioId ?? null,
      },
    });

    return { caja: cerrada, esperado };
  });
}

export async function registrarCobroEnCaja(params: {
  pedidoId: string;
  totalPedido: number;
  metodo: "efectivo" | "tarjeta" | "mixto";
  montoEfectivo?: number;
  montoTarjeta?: number;
  divisiones?: Array<{
    metodo: "efectivo" | "tarjeta" | "mixto";
    montoEfectivo?: number;
    montoTarjeta?: number;
  }>;
  usuarioId?: string;
}) {
  const caja = await obtenerCajaActiva();
  if (!caja) {
    return responderErrorApi(409, "conflicto", "Debe existir una caja abierta para cobrar");
  }

  const normalizar = (entrada: {
    metodo: "efectivo" | "tarjeta" | "mixto";
    montoEfectivo?: number;
    montoTarjeta?: number;
  }) => {
    const efectivo =
      entrada.metodo === "efectivo" ? params.totalPedido : (entrada.montoEfectivo ?? 0);
    const tarjeta = entrada.metodo === "tarjeta" ? params.totalPedido : (entrada.montoTarjeta ?? 0);
    const total = efectivo + tarjeta;
    return { efectivo, tarjeta, total };
  };

  if (params.divisiones && params.divisiones.length > 0) {
    let suma = 0;
    const partes = params.divisiones.map((division) => {
      const base = normalizar(division);
      if (
        division.metodo === "mixto" &&
        base.total !== (division.montoEfectivo ?? 0) + (division.montoTarjeta ?? 0)
      ) {
        return null;
      }
      suma += base.total;
      return { ...division, ...base };
    });
    if (partes.some((p) => !p)) {
      return responderErrorApi(400, "solicitud_invalida", "Division de pago invalida");
    }
    if (suma !== params.totalPedido) {
      return responderErrorApi(409, "conflicto", "Cuenta dividida requiere suma exacta del total");
    }

    return clientePrisma.$transaction(async (tx) => {
      const sesionPago = await tx.sesionPago.create({
        data: {
          pedidoId: params.pedidoId,
          cajaId: caja.id,
          totalObjetivo: params.totalPedido,
          totalAcumulado: params.totalPedido,
          completada: true,
          cerradaEn: new Date(),
        },
      });

      let totalEfectivo = 0;
      let totalTarjeta = 0;

      for (const [indice, parte] of partes.entries()) {
        if (!parte) continue;
        totalEfectivo += parte.efectivo;
        totalTarjeta += parte.tarjeta;

        await tx.pagoDividido.create({
          data: {
            sesionPagoId: sesionPago.id,
            indice,
            metodo: parte.metodo,
            montoTotal: parte.total,
            montoEfectivo: parte.efectivo,
            montoTarjeta: parte.tarjeta,
          },
        });
      }

      const pago = await tx.pagoPedido.create({
        data: {
          pedidoId: params.pedidoId,
          cajaId: caja.id,
          sesionPagoId: sesionPago.id,
          metodo: "mixto",
          montoTotal: params.totalPedido,
          montoEfectivo: totalEfectivo,
          montoTarjeta: totalTarjeta,
        },
      });

      if (totalEfectivo > 0) {
        await tx.movimientoCaja.create({
          data: {
            cajaId: caja.id,
            tipo: "cobro_pedido",
            metodo: "efectivo",
            cantidad: totalEfectivo,
            pedidoId: params.pedidoId,
            creadoPorId: params.usuarioId ?? null,
          },
        });
      }
      if (totalTarjeta > 0) {
        await tx.movimientoCaja.create({
          data: {
            cajaId: caja.id,
            tipo: "cobro_pedido",
            metodo: "tarjeta",
            cantidad: totalTarjeta,
            pedidoId: params.pedidoId,
            creadoPorId: params.usuarioId ?? null,
          },
        });
      }

      const actualizada = await tx.caja.update({
        where: { id: caja.id },
        data: {
          totalEfectivo: { increment: totalEfectivo },
          totalTarjeta: { increment: totalTarjeta },
        },
      });

      return { pago, caja: actualizada, sesionPagoId: sesionPago.id };
    });
  }

  const efectivo = params.metodo === "efectivo" ? params.totalPedido : (params.montoEfectivo ?? 0);
  const tarjeta = params.metodo === "tarjeta" ? params.totalPedido : (params.montoTarjeta ?? 0);
  if (params.metodo === "mixto" && efectivo + tarjeta !== params.totalPedido) {
    return responderErrorApi(409, "conflicto", "Cobro mixto requiere suma exacta del total");
  }

  return clientePrisma.$transaction(async (tx) => {
    const pago = await tx.pagoPedido.create({
      data: {
        pedidoId: params.pedidoId,
        cajaId: caja.id,
        metodo: params.metodo,
        montoTotal: params.totalPedido,
        montoEfectivo: efectivo,
        montoTarjeta: tarjeta,
      },
    });

    if (efectivo > 0) {
      await tx.movimientoCaja.create({
        data: {
          cajaId: caja.id,
          tipo: "cobro_pedido",
          metodo: "efectivo",
          cantidad: efectivo,
          pedidoId: params.pedidoId,
          creadoPorId: params.usuarioId ?? null,
        },
      });
    }

    if (tarjeta > 0) {
      await tx.movimientoCaja.create({
        data: {
          cajaId: caja.id,
          tipo: "cobro_pedido",
          metodo: "tarjeta",
          cantidad: tarjeta,
          pedidoId: params.pedidoId,
          creadoPorId: params.usuarioId ?? null,
        },
      });
    }

    const actualizada = await tx.caja.update({
      where: { id: caja.id },
      data: {
        totalEfectivo: { increment: efectivo },
        totalTarjeta: { increment: tarjeta },
      },
    });

    return { pago, caja: actualizada };
  });
}

export async function obtenerPrecuentaPedido(pedidoId: string) {
  const pedido = await clientePrisma.pedido.findUnique({
    where: { id: pedidoId },
    include: {
      mesa: true,
      lineas: {
        where: { estado: { not: "cancelada" } },
        orderBy: [{ creadoEn: "asc" }],
      },
    },
  });

  if (!pedido || pedido.eliminadoEn) {
    return responderErrorApi(404, "no_encontrado", "Pedido no encontrado");
  }

  const subtotal = pedido.lineas.reduce((acc, linea) => {
    return acc + linea.precioUnitCentimos * linea.cantidad;
  }, 0);

  return {
    pedidoId: pedido.id,
    mesa: pedido.mesa.nombre,
    estado: pedido.estado,
    lineas: pedido.lineas.map((linea) => ({
      id: linea.id,
      nombre: linea.nombreSnapshot,
      cantidad: linea.cantidad,
      precioUnitCentimos: linea.precioUnitCentimos,
      totalLineaCentimos: linea.precioUnitCentimos * linea.cantidad,
    })),
    resumen: {
      subtotalCentimos: subtotal,
      totalCentimos: subtotal,
    },
  };
}

export async function obtenerTicketPedidoBasico(pedidoId: string) {
  const [negocio, pedido, pagos] = await Promise.all([
    clientePrisma.configuracionNegocio.findFirst({
      orderBy: [{ creadoEn: "asc" }],
    }),
    clientePrisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        mesa: true,
        lineas: {
          where: { estado: { not: "cancelada" } },
          orderBy: [{ creadoEn: "asc" }],
        },
      },
    }),
    clientePrisma.pagoPedido.findMany({
      where: { pedidoId },
      orderBy: [{ cobradoEn: "asc" }],
      include: {
        sesionPago: {
          include: {
            pagosDivididos: {
              orderBy: [{ indice: "asc" }],
            },
          },
        },
      },
    }),
  ]);

  if (!pedido || pedido.eliminadoEn) {
    return responderErrorApi(404, "no_encontrado", "Pedido no encontrado");
  }

  const totalLineas = pedido.lineas.reduce((acc, linea) => {
    return acc + linea.precioUnitCentimos * linea.cantidad;
  }, 0);

  const totalPagado = pagos.reduce((acc, pago) => acc + pago.montoTotal, 0);

  return {
    negocio: negocio?.nombreComercial ?? "TPV El Jardin",
    pedidoId: pedido.id,
    mesa: pedido.mesa.nombre,
    emitidoEn: new Date().toISOString(),
    lineas: pedido.lineas.map((linea) => ({
      id: linea.id,
      nombre: linea.nombreSnapshot,
      cantidad: linea.cantidad,
      precioUnitCentimos: linea.precioUnitCentimos,
      totalLineaCentimos: linea.precioUnitCentimos * linea.cantidad,
    })),
    pagos: pagos.map((pago) => ({
      id: pago.id,
      metodo: pago.metodo,
      montoTotal: pago.montoTotal,
      montoEfectivo: pago.montoEfectivo,
      montoTarjeta: pago.montoTarjeta,
      divisiones:
        pago.sesionPago?.pagosDivididos.map((parte) => ({
          indice: parte.indice,
          metodo: parte.metodo,
          montoTotal: parte.montoTotal,
          montoEfectivo: parte.montoEfectivo,
          montoTarjeta: parte.montoTarjeta,
        })) ?? [],
    })),
    resumen: {
      totalLineasCentimos: totalLineas,
      totalPagadoCentimos: totalPagado,
      pendienteCentimos: totalLineas - totalPagado,
    },
  };
}

export async function registrarMovimientoManualCaja(params: {
  tipo: "entrada_manual" | "salida_manual";
  metodo: "efectivo" | "tarjeta";
  cantidad: number;
  motivo: string;
  usuarioId?: string;
}) {
  const caja = await obtenerCajaActiva();
  if (!caja) {
    return responderErrorApi(409, "conflicto", "No hay caja abierta");
  }

  const factor = params.tipo === "entrada_manual" ? 1 : -1;

  return clientePrisma.$transaction(async (tx) => {
    if (params.metodo === "efectivo") {
      const nuevoTotal = caja.totalEfectivo + factor * params.cantidad;
      if (nuevoTotal < 0) {
        return responderErrorApi(409, "conflicto", "Salida manual supera efectivo disponible");
      }
    }

    if (params.metodo === "tarjeta") {
      const nuevoTotal = caja.totalTarjeta + factor * params.cantidad;
      if (nuevoTotal < 0) {
        return responderErrorApi(409, "conflicto", "Salida manual supera total de tarjeta");
      }
    }

    const movimiento = await tx.movimientoCaja.create({
      data: {
        cajaId: caja.id,
        tipo: params.tipo,
        metodo: params.metodo,
        cantidad: params.cantidad,
        motivo: params.motivo,
        creadoPorId: params.usuarioId ?? null,
      },
    });

    const actualizada = await tx.caja.update({
      where: { id: caja.id },
      data:
        params.metodo === "efectivo"
          ? { totalEfectivo: { increment: factor * params.cantidad } }
          : { totalTarjeta: { increment: factor * params.cantidad } },
    });

    return { movimiento, caja: actualizada };
  });
}

export async function obtenerInformeCajaActiva() {
  const caja = await obtenerCajaActiva();
  if (!caja) {
    return responderErrorApi(409, "conflicto", "No hay caja abierta");
  }

  const movimientos = await clientePrisma.movimientoCaja.findMany({
    where: { cajaId: caja.id },
    orderBy: [{ creadoEn: "desc" }],
    take: 200,
  });

  const pagos = await clientePrisma.pagoPedido.findMany({
    where: { cajaId: caja.id },
    orderBy: [{ cobradoEn: "desc" }],
    take: 200,
  });

  return {
    caja,
    resumen: {
      saldoEsperado: caja.saldoInicial + caja.totalEfectivo,
      totalPagos: pagos.length,
      totalMovimientos: movimientos.length,
    },
    movimientos,
    pagos,
  };
}
