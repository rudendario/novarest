import { z } from "zod";

import { clientePrisma } from "@el-jardin/infra";

import { responderErrorApi } from "@/src/api/publico/respuestas";

export const esquemaAjusteStock = z.object({
  productoId: z.string().min(1),
  cantidadDelta: z
    .number()
    .int()
    .refine((v) => v !== 0),
  motivo: z.string().min(3),
});

async function obtenerReservaActivaProducto(productoId: string) {
  const agregados = await clientePrisma.reservaStock.aggregate({
    where: { productoId, activa: true },
    _sum: { cantidad: true },
  });

  return agregados._sum.cantidad ?? 0;
}

export async function reservarStockLinea(params: {
  productoId: string;
  lineaPedidoId: string;
  cantidad: number;
}) {
  return clientePrisma.$transaction(async (tx) => {
    const stock = await tx.stockFisico.upsert({
      where: { productoId: params.productoId },
      update: {},
      create: { productoId: params.productoId, cantidadDisponible: 0 },
    });

    const reservaActual = await tx.reservaStock.findUnique({
      where: {
        productoId_lineaPedidoId: {
          productoId: params.productoId,
          lineaPedidoId: params.lineaPedidoId,
        },
      },
    });

    if (reservaActual?.activa) {
      return reservaActual;
    }

    const totalReservado = await tx.reservaStock.aggregate({
      where: { productoId: params.productoId, activa: true },
      _sum: { cantidad: true },
    });
    const reservadoActivo = totalReservado._sum.cantidad ?? 0;
    const libre = stock.cantidadDisponible - reservadoActivo;

    if (libre < params.cantidad) {
      return responderErrorApi(409, "conflicto", "No hay stock disponible suficiente");
    }

    const reserva = await tx.reservaStock.upsert({
      where: {
        productoId_lineaPedidoId: {
          productoId: params.productoId,
          lineaPedidoId: params.lineaPedidoId,
        },
      },
      update: {
        cantidad: params.cantidad,
        activa: true,
        liberadaEn: null,
      },
      create: {
        productoId: params.productoId,
        lineaPedidoId: params.lineaPedidoId,
        cantidad: params.cantidad,
        activa: true,
      },
    });

    await tx.movimientoStock.create({
      data: {
        productoId: params.productoId,
        tipo: "reserva_creada",
        cantidad: params.cantidad,
        referenciaTipo: "LineaPedido",
        referenciaId: params.lineaPedidoId,
      },
    });

    return reserva;
  });
}

export async function liberarReservaLinea(lineaPedidoId: string, motivo = "liberacion_linea") {
  return clientePrisma.$transaction(async (tx) => {
    const reservas = await tx.reservaStock.findMany({ where: { lineaPedidoId, activa: true } });
    if (reservas.length === 0) return { liberadas: 0 };

    await tx.reservaStock.updateMany({
      where: { lineaPedidoId, activa: true },
      data: { activa: false, liberadaEn: new Date() },
    });

    for (const reserva of reservas) {
      await tx.movimientoStock.create({
        data: {
          productoId: reserva.productoId,
          tipo: "reserva_liberada",
          cantidad: reserva.cantidad,
          motivo,
          referenciaTipo: "LineaPedido",
          referenciaId: lineaPedidoId,
        },
      });
    }

    return { liberadas: reservas.length };
  });
}

export async function consolidarReservasPedido(pedidoId: string) {
  return clientePrisma.$transaction(async (tx) => {
    const lineas = await tx.lineaPedido.findMany({
      where: { pedidoId, estado: { not: "cancelada" } },
      select: { id: true },
    });

    const idsLineas = lineas.map((l) => l.id);
    if (idsLineas.length === 0) return { consolidadas: 0 };

    const reservas = await tx.reservaStock.findMany({
      where: {
        lineaPedidoId: { in: idsLineas },
        activa: true,
      },
    });

    for (const reserva of reservas) {
      const actualizado = await tx.stockFisico.updateMany({
        where: {
          productoId: reserva.productoId,
          cantidadDisponible: { gte: reserva.cantidad },
        },
        data: { cantidadDisponible: { decrement: reserva.cantidad } },
      });

      if (actualizado.count === 0) {
        return responderErrorApi(
          409,
          "conflicto",
          "No se pudo consolidar stock por falta de cantidad disponible",
        );
      }

      await tx.movimientoStock.create({
        data: {
          productoId: reserva.productoId,
          tipo: "consumo_cobro",
          cantidad: reserva.cantidad,
          referenciaTipo: "Pedido",
          referenciaId: pedidoId,
        },
      });
    }

    await tx.reservaStock.updateMany({
      where: {
        lineaPedidoId: { in: idsLineas },
        activa: true,
      },
      data: {
        activa: false,
        liberadaEn: new Date(),
      },
    });

    return { consolidadas: reservas.length };
  });
}

export async function validarInvariantesStock() {
  const stocks = await clientePrisma.stockFisico.findMany({
    select: { productoId: true, cantidadDisponible: true },
  });

  const incidencias: Array<{
    productoId: string;
    cantidadFisica: number;
    cantidadReservada: number;
    mensaje: string;
  }> = [];

  for (const stock of stocks) {
    const agregados = await clientePrisma.reservaStock.aggregate({
      where: { productoId: stock.productoId, activa: true },
      _sum: { cantidad: true },
    });
    const reservada = agregados._sum.cantidad ?? 0;

    if (stock.cantidadDisponible < reservada) {
      incidencias.push({
        productoId: stock.productoId,
        cantidadFisica: stock.cantidadDisponible,
        cantidadReservada: reservada,
        mensaje: "Stock fisico por debajo de reservas activas",
      });
    }
  }

  return {
    ok: incidencias.length === 0,
    incidencias,
    revisados: stocks.length,
  };
}

export async function obtenerDisponibilidadStock() {
  const productos = await clientePrisma.producto.findMany({
    where: { eliminadoEn: null },
    select: {
      id: true,
      nombre: true,
      stockFisico: { select: { cantidadDisponible: true } },
    },
    orderBy: [{ nombre: "asc" }],
  });

  const resultados = [] as Array<{
    productoId: string;
    nombre: string;
    cantidadFisica: number;
    cantidadReservada: number;
    cantidadLibre: number;
  }>;

  for (const producto of productos) {
    const reservada = await obtenerReservaActivaProducto(producto.id);
    const fisica = producto.stockFisico?.cantidadDisponible ?? 0;

    resultados.push({
      productoId: producto.id,
      nombre: producto.nombre,
      cantidadFisica: fisica,
      cantidadReservada: reservada,
      cantidadLibre: fisica - reservada,
    });
  }

  return resultados;
}

export async function ajustarStock(params: z.infer<typeof esquemaAjusteStock>) {
  return clientePrisma.$transaction(async (tx) => {
    const stock = await tx.stockFisico.upsert({
      where: { productoId: params.productoId },
      update: {},
      create: { productoId: params.productoId, cantidadDisponible: 0 },
    });

    const reservada = await tx.reservaStock.aggregate({
      where: { productoId: params.productoId, activa: true },
      _sum: { cantidad: true },
    });
    const totalReservado = reservada._sum.cantidad ?? 0;

    const nuevaCantidad = stock.cantidadDisponible + params.cantidadDelta;
    if (nuevaCantidad < totalReservado) {
      return responderErrorApi(
        409,
        "conflicto",
        "El ajuste deja stock fisico por debajo del reservado",
      );
    }

    const actualizado = await tx.stockFisico.update({
      where: { productoId: params.productoId },
      data: { cantidadDisponible: nuevaCantidad },
    });

    await tx.movimientoStock.create({
      data: {
        productoId: params.productoId,
        tipo: "ajuste_manual",
        cantidad: params.cantidadDelta,
        motivo: params.motivo,
      },
    });

    return actualizado;
  });
}
