import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { esquemaCrearEntradaEspera } from "@/src/api/privado/reservas/reservas-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarReservas");
  if (!sesion.ok) return sesion.response;

  const entradas = await clientePrisma.entradaEspera.findMany({
    orderBy: [{ creadaEn: "asc" }],
    take: 200,
  });

  return NextResponse.json(entradas);
}

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarReservas");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaCrearEntradaEspera.parse(await request.json());
    const creada = await clientePrisma.entradaEspera.create({
      data: {
        clienteId: entrada.clienteId ?? null,
        nombreCliente: entrada.nombreCliente,
        telefonoContacto: entrada.telefonoContacto ?? null,
        comensales: entrada.comensales,
        notas: entrada.notas ?? null,
      },
    });
    return NextResponse.json(creada, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para lista de espera");
  }
}
