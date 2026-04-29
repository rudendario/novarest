import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { abrirPedidoEnMesa } from "@/src/api/privado/sala-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeGestionarReservas");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;
  const reserva = await clientePrisma.reserva.findUnique({ where: { id } });
  if (!reserva) {
    return responderErrorApi(404, "no_encontrado", "Reserva no encontrada");
  }
  if (!reserva.mesaId) {
    return responderErrorApi(409, "conflicto", "La reserva no tiene mesa asignada");
  }
  if (["cancelada", "completada", "no_show"].includes(reserva.estado)) {
    return responderErrorApi(409, "conflicto", "La reserva no puede sentarse en su estado actual");
  }

  const mesa = await clientePrisma.mesa.findUnique({
    where: { id: reserva.mesaId },
    include: { pedidoActivo: true },
  });
  if (!mesa || mesa.eliminadaEn || !mesa.activa) {
    return responderErrorApi(404, "no_encontrado", "Mesa no encontrada o inactiva");
  }

  let pedidoId: string | null = null;

  if (
    mesa.pedidoActivo &&
    mesa.pedidoActivo.estado !== "cobrado" &&
    mesa.pedidoActivo.estado !== "cancelado"
  ) {
    pedidoId = mesa.pedidoActivo.id;
  } else {
    const apertura = await abrirPedidoEnMesa({
      mesaId: mesa.id,
      nota: `reserva:${reserva.id}`,
      usuarioId: sesion.contexto.usuarioId,
      rolNombre: sesion.contexto.rolNombre,
    });
    if (apertura instanceof Response) return apertura;
    pedidoId = apertura.id;
  }

  const actualizada = await clientePrisma.reserva.update({
    where: { id: reserva.id },
    data: { estado: "sentada" },
  });

  return NextResponse.json({ ok: true, reserva: actualizada, pedidoId });
}
