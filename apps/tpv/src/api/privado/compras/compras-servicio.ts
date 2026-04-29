import { z } from "zod";

import { clientePrisma } from "@el-jardin/infra";

import { responderErrorApi } from "@/src/api/publico/respuestas";

export const esquemaCrearProveedor = z.object({
  nombre: z.string().min(2),
  codigo: z.string().min(2),
  telefono: z.string().min(6).optional(),
  email: z.string().email().optional(),
  contacto: z.string().min(2).optional(),
});

export const esquemaVincularProductoProveedor = z.object({
  productoId: z.string().min(1),
  proveedorId: z.string().min(1),
  referenciaProveedor: z.string().min(1).optional(),
  unidadCompra: z.string().min(1).default("unidad"),
  unidadesPorCompra: z.number().int().positive().default(1),
  precioActualCentimos: z.number().int().positive(),
});

export const esquemaActualizarPrecioProductoProveedor = z.object({
  precioCentimos: z.number().int().positive(),
  motivo: z.string().min(2).optional(),
});

export const esquemaCrearPedidoCompra = z.object({
  proveedorId: z.string().min(1),
  fechaEsperada: z.string().datetime().optional(),
  notas: z.string().min(2).optional(),
  lineas: z
    .array(
      z.object({
        productoProveedorId: z.string().min(1),
        cantidad: z.number().int().positive(),
        precioUnitCentimos: z.number().int().positive(),
      }),
    )
    .min(1),
});

export const esquemaRecepcionarPedidoCompra = z.object({
  notas: z.string().min(2).optional(),
  lineas: z
    .array(
      z.object({
        lineaPedidoCompraId: z.string().min(1),
        cantidadRecibida: z.number().int().positive(),
      }),
    )
    .min(1),
});

export const esquemaCrearRecetaEscandallo = z.object({
  productoFinalId: z.string().min(1),
  nombre: z.string().min(2),
  porciones: z.number().int().positive().default(1),
  mermaPct: z.number().int().min(0).max(95).default(0),
});

export const esquemaAnadirLineaEscandallo = z.object({
  productoId: z.string().min(1),
  cantidadUnidades: z.number().int().positive(),
  unidadUso: z.string().min(1).default("unidad"),
});

export async function vincularProductoProveedor(
  params: z.infer<typeof esquemaVincularProductoProveedor>,
) {
  const existente = await clientePrisma.productoProveedor.findFirst({
    where: {
      productoId: params.productoId,
      proveedorId: params.proveedorId,
    },
  });
  if (existente) {
    return responderErrorApi(409, "conflicto", "Producto ya vinculado con ese proveedor");
  }

  return clientePrisma.$transaction(async (tx) => {
    const creado = await tx.productoProveedor.create({
      data: {
        productoId: params.productoId,
        proveedorId: params.proveedorId,
        referenciaProveedor: params.referenciaProveedor ?? null,
        unidadCompra: params.unidadCompra,
        unidadesPorCompra: params.unidadesPorCompra,
        precioActualCentimos: params.precioActualCentimos,
      },
    });

    await tx.historialPrecioProveedor.create({
      data: {
        productoProveedorId: creado.id,
        precioCentimos: params.precioActualCentimos,
        motivo: "alta_vinculo",
      },
    });

    return creado;
  });
}

export async function crearPedidoCompra(params: z.infer<typeof esquemaCrearPedidoCompra>) {
  return clientePrisma.$transaction(async (tx) => {
    const proveedor = await tx.proveedor.findUnique({ where: { id: params.proveedorId } });
    if (!proveedor || proveedor.eliminadoEn || !proveedor.activo) {
      return responderErrorApi(404, "no_encontrado", "Proveedor no encontrado o inactivo");
    }

    const ids = params.lineas.map((l) => l.productoProveedorId);
    const vinculaciones = await tx.productoProveedor.findMany({
      where: { id: { in: ids }, activo: true },
    });
    if (vinculaciones.length !== ids.length) {
      return responderErrorApi(409, "conflicto", "Hay vinculaciones producto-proveedor invalidas");
    }

    const total = params.lineas.reduce((acc, l) => acc + l.cantidad * l.precioUnitCentimos, 0);

    const pedido = await tx.pedidoCompra.create({
      data: {
        proveedorId: params.proveedorId,
        estado: "enviado",
        fechaEsperada: params.fechaEsperada ? new Date(params.fechaEsperada) : null,
        notas: params.notas ?? null,
        totalCentimos: total,
      },
    });

    await tx.lineaPedidoCompra.createMany({
      data: params.lineas.map((linea) => ({
        pedidoCompraId: pedido.id,
        productoProveedorId: linea.productoProveedorId,
        cantidad: linea.cantidad,
        precioUnitCentimos: linea.precioUnitCentimos,
        totalLineaCentimos: linea.cantidad * linea.precioUnitCentimos,
      })),
    });

    return pedido;
  });
}

export async function recepcionarPedidoCompra(
  pedidoCompraId: string,
  params: z.infer<typeof esquemaRecepcionarPedidoCompra>,
) {
  return clientePrisma.$transaction(async (tx) => {
    const pedido = await tx.pedidoCompra.findUnique({
      where: { id: pedidoCompraId },
      include: { lineas: { include: { productoProveedor: true } } },
    });
    if (!pedido) {
      return responderErrorApi(404, "no_encontrado", "Pedido de compra no encontrado");
    }
    if (pedido.estado === "cancelado" || pedido.estado === "recibido") {
      return responderErrorApi(409, "conflicto", "Pedido de compra no admite recepcion");
    }

    const mapaLineas = new Map(pedido.lineas.map((l) => [l.id, l]));
    for (const entrada of params.lineas) {
      const linea = mapaLineas.get(entrada.lineaPedidoCompraId);
      if (!linea) {
        return responderErrorApi(409, "conflicto", "Linea de recepcion invalida");
      }
      const pendiente = linea.cantidad - linea.cantidadRecibida;
      if (entrada.cantidadRecibida > pendiente) {
        return responderErrorApi(409, "conflicto", "Cantidad recibida supera pendiente");
      }
    }

    const recepcion = await tx.recepcionCompra.create({
      data: {
        pedidoCompraId,
        notas: params.notas ?? null,
      },
    });

    for (const entrada of params.lineas) {
      const linea = mapaLineas.get(entrada.lineaPedidoCompraId);
      if (!linea) continue;

      await tx.lineaRecepcionCompra.create({
        data: {
          recepcionCompraId: recepcion.id,
          lineaPedidoCompraId: linea.id,
          cantidadRecibida: entrada.cantidadRecibida,
        },
      });

      await tx.lineaPedidoCompra.update({
        where: { id: linea.id },
        data: {
          cantidadRecibida: { increment: entrada.cantidadRecibida },
        },
      });

      await tx.stockFisico.upsert({
        where: { productoId: linea.productoProveedor.productoId },
        update: {
          cantidadDisponible: { increment: entrada.cantidadRecibida },
        },
        create: {
          productoId: linea.productoProveedor.productoId,
          cantidadDisponible: entrada.cantidadRecibida,
        },
      });

      await tx.movimientoStock.create({
        data: {
          productoId: linea.productoProveedor.productoId,
          tipo: "recepcion_compra",
          cantidad: entrada.cantidadRecibida,
          referenciaTipo: "PedidoCompra",
          referenciaId: pedidoCompraId,
          motivo: "recepcion_compra",
        },
      });
    }

    const lineasFinales = await tx.lineaPedidoCompra.findMany({
      where: { pedidoCompraId },
      select: { cantidad: true, cantidadRecibida: true },
    });
    const totalPendiente = lineasFinales.reduce(
      (acc, l) => acc + (l.cantidad - l.cantidadRecibida),
      0,
    );

    await tx.pedidoCompra.update({
      where: { id: pedidoCompraId },
      data: {
        estado: totalPendiente === 0 ? "recibido" : "parcialmente_recibido",
      },
    });

    return recepcion;
  });
}

export async function crearRecetaEscandallo(params: z.infer<typeof esquemaCrearRecetaEscandallo>) {
  const existente = await clientePrisma.recetaEscandallo.findUnique({
    where: { productoFinalId: params.productoFinalId },
  });
  if (existente) {
    return responderErrorApi(409, "conflicto", "Ya existe receta para ese producto final");
  }

  return clientePrisma.recetaEscandallo.create({
    data: {
      productoFinalId: params.productoFinalId,
      nombre: params.nombre,
      porciones: params.porciones,
      mermaPct: params.mermaPct,
    },
  });
}

export async function anadirLineaEscandallo(
  recetaId: string,
  params: z.infer<typeof esquemaAnadirLineaEscandallo>,
) {
  const receta = await clientePrisma.recetaEscandallo.findUnique({ where: { id: recetaId } });
  if (!receta) {
    return responderErrorApi(404, "no_encontrado", "Receta no encontrada");
  }

  const existente = await clientePrisma.lineaEscandallo.findFirst({
    where: { recetaId, productoId: params.productoId },
  });
  if (existente) {
    return responderErrorApi(409, "conflicto", "Ingrediente ya existe en receta");
  }

  return clientePrisma.lineaEscandallo.create({
    data: {
      recetaId,
      productoId: params.productoId,
      cantidadUnidades: params.cantidadUnidades,
      unidadUso: params.unidadUso,
    },
  });
}

export async function calcularCosteReceta(
  recetaId: string,
  estrategia: "ultimo" | "promedio" = "ultimo",
) {
  const receta = await clientePrisma.recetaEscandallo.findUnique({
    where: { id: recetaId },
    include: {
      productoFinal: { select: { precioCentimos: true, nombre: true } },
      lineas: {
        include: {
          producto: {
            include: {
              productosProveedor: {
                where: { activo: true },
                orderBy: [{ actualizadoEn: "desc" }],
                take: 1,
                include: {
                  historialPrecios: {
                    orderBy: [{ creadoEn: "desc" }],
                    take: 20,
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!receta) {
    return responderErrorApi(404, "no_encontrado", "Receta no encontrada");
  }

  const detalle = receta.lineas.map((linea) => {
    const proveedorActivo = linea.producto.productosProveedor[0];
    const costoUltimoUnidad = proveedorActivo
      ? Math.round(
          proveedorActivo.precioActualCentimos / Math.max(1, proveedorActivo.unidadesPorCompra),
        )
      : 0;
    const historial = proveedorActivo?.historialPrecios ?? [];
    const costoPromedioUnidad =
      historial.length > 0
        ? Math.round(
            historial.reduce((acc, h) => acc + h.precioCentimos, 0) /
              historial.length /
              Math.max(1, proveedorActivo?.unidadesPorCompra ?? 1),
          )
        : costoUltimoUnidad;
    const costoUnit = estrategia === "promedio" ? costoPromedioUnidad : costoUltimoUnidad;
    const costoLinea = costoUnit * linea.cantidadUnidades;
    return {
      productoId: linea.productoId,
      nombre: linea.producto.nombre,
      cantidadUnidades: linea.cantidadUnidades,
      unidadUso: linea.unidadUso,
      costoUnitCentimos: costoUnit,
      costoLineaCentimos: costoLinea,
    };
  });

  const costoBruto = detalle.reduce((acc, d) => acc + d.costoLineaCentimos, 0);
  const costoConMerma = Math.round(costoBruto * (1 + receta.mermaPct / 100));
  const costoPorPorcion = Math.round(costoConMerma / Math.max(1, receta.porciones));
  const precioVenta = receta.productoFinal.precioCentimos;
  const margen = precioVenta - costoPorPorcion;

  return {
    recetaId: receta.id,
    nombre: receta.nombre,
    productoFinal: receta.productoFinal.nombre,
    porciones: receta.porciones,
    mermaPct: receta.mermaPct,
    estrategiaCoste: estrategia,
    detalle,
    resumen: {
      costoBrutoCentimos: costoBruto,
      costoConMermaCentimos: costoConMerma,
      costoPorPorcionCentimos: costoPorPorcion,
      precioVentaCentimos: precioVenta,
      margenCentimos: margen,
      margenPct: precioVenta > 0 ? Math.round((margen / precioVenta) * 100) : 0,
    },
  };
}
