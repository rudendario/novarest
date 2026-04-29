import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { crearReserva, esquemaCrearReserva } from "@/src/api/privado/reservas/reservas-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarReservas");
  if (!sesion.ok) return sesion.response;

  const url = new URL(request.url);
  const desdeRaw = url.searchParams.get("desde");
  const hastaRaw = url.searchParams.get("hasta");
  const desde = desdeRaw ? new Date(desdeRaw) : new Date(Date.now() - 1000 * 60 * 60 * 24);
  const hasta = hastaRaw ? new Date(hastaRaw) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

  const reservas = await clientePrisma.reserva.findMany({
    where: {
      fechaHora: {
        gte: desde,
        lte: hasta,
      },
    },
    include: {
      mesa: true,
      cliente: true,
    },
    orderBy: [{ fechaHora: "asc" }],
    take: 300,
  });

  return NextResponse.json(reservas);
}

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarReservas");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaCrearReserva.parse(await request.json());
    const reserva = await crearReserva(entrada);
    if (reserva instanceof Response) return reserva;
    return NextResponse.json(reserva, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para reserva");
  }
}
