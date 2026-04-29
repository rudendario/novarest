import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { esquemaCambiarEstadoEspera } from "@/src/api/privado/reservas/reservas-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeGestionarReservas");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaCambiarEstadoEspera.parse(await request.json());
    const { id } = await params;

    const espera = await clientePrisma.entradaEspera.findUnique({ where: { id } });
    if (!espera) {
      return responderErrorApi(404, "no_encontrado", "Entrada de espera no encontrada");
    }

    const actualizada = await clientePrisma.entradaEspera.update({
      where: { id },
      data: {
        estado: entrada.estado,
        atendidaEn: entrada.estado === "sentado" ? new Date() : null,
      },
    });

    return NextResponse.json(actualizada);
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Cambio de estado de espera invalido");
  }
}
