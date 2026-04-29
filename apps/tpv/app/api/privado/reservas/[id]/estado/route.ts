import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { esquemaCambiarEstadoReserva } from "@/src/api/privado/reservas/reservas-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeGestionarReservas");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaCambiarEstadoReserva.parse(await request.json());
    const { id } = await params;

    const reserva = await clientePrisma.reserva.findUnique({ where: { id } });
    if (!reserva) {
      return responderErrorApi(404, "no_encontrado", "Reserva no encontrada");
    }

    const actualizada = await clientePrisma.reserva.update({
      where: { id },
      data: {
        estado: entrada.estado,
        canceladaEn: entrada.estado === "cancelada" ? new Date() : null,
      },
    });

    return NextResponse.json(actualizada);
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Cambio de estado de reserva invalido");
  }
}
