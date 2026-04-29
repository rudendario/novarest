import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import {
  asignarMesaReserva,
  esquemaAsignarMesaReserva,
} from "@/src/api/privado/reservas/reservas-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeGestionarReservas");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaAsignarMesaReserva.parse(await request.json());
    const { id } = await params;
    const reserva = await asignarMesaReserva({ reservaId: id, mesaId: entrada.mesaId });
    if (reserva instanceof Response) return reserva;
    return NextResponse.json(reserva);
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Asignacion de mesa invalida");
  }
}
