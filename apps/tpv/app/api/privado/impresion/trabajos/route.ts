import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import {
  esquemaTrabajoImpresion,
  registrarTrabajoImpresion,
} from "@/src/api/privado/impresion/servicio-impresion";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarImpresoras");
  if (!sesion.ok) return sesion.response;

  const trabajos = await clientePrisma.trabajoImpresion.findMany({
    include: { impresora: true },
    orderBy: [{ creadoEn: "desc" }],
    take: 200,
  });

  return NextResponse.json(trabajos);
}

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarImpresoras");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaTrabajoImpresion.parse(await request.json());
    const trabajo = await registrarTrabajoImpresion(entrada);
    return NextResponse.json(trabajo, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Trabajo de impresion invalido");
  }
}
