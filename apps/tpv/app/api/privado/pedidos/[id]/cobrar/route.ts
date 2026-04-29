import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { esquemaCobroCaja, registrarCobroEnCaja } from "@/src/api/privado/caja/caja-servicio";
import { consolidarReservasPedido } from "@/src/api/privado/stock/stock-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeCobrarPedido");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;
  let entrada: {
    metodo: "efectivo" | "tarjeta" | "mixto";
    montoEfectivo?: number;
    montoTarjeta?: number;
    divisiones?: Array<{
      metodo: "efectivo" | "tarjeta" | "mixto";
      montoEfectivo?: number;
      montoTarjeta?: number;
    }>;
  };
  try {
    entrada = esquemaCobroCaja.parse(await request.json().catch(() => ({})));
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para cobro");
  }

  const pedido = await clientePrisma.pedido.findUnique({ where: { id } });
  if (!pedido || pedido.eliminadoEn) {
    return responderErrorApi(404, "no_encontrado", "Pedido no encontrado");
  }

  if (pedido.estado === "cobrado" || pedido.estado === "cancelado") {
    return responderErrorApi(409, "conflicto", "Pedido ya cerrado");
  }

  const pendiente = await clientePrisma.lineaPedido.count({
    where: {
      pedidoId: id,
      estado: { in: ["pendiente", "confirmada", "en_preparacion"] },
    },
  });
  if (pendiente > 0) {
    return responderErrorApi(
      409,
      "conflicto",
      "No se puede cobrar con lineas pendientes/preparacion",
    );
  }

  const consolidacion = await consolidarReservasPedido(id);
  if (consolidacion instanceof Response) return consolidacion;

  const cobroCaja = await registrarCobroEnCaja({
    pedidoId: id,
    totalPedido: pedido.totalCentimos,
    metodo: entrada.metodo,
    montoEfectivo: entrada.montoEfectivo,
    montoTarjeta: entrada.montoTarjeta,
    divisiones: entrada.divisiones,
    usuarioId: sesion.contexto.usuarioId,
  });
  if (cobroCaja instanceof Response) return cobroCaja;

  const cobrado = await clientePrisma.pedido.update({
    where: { id },
    data: { estado: "cobrado", cerradoEn: new Date() },
  });

  return NextResponse.json({ ok: true, pedido: cobrado, consolidacion, cobroCaja });
}
