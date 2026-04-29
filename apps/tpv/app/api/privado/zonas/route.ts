import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { esquemaCrearZona } from "@/src/api/privado/sala-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeVerSala");
  if (!sesion.ok) return sesion.response;

  const zonas = await clientePrisma.zona.findMany({
    where: { eliminadoEn: null },
    orderBy: [{ orden: "asc" }, { creadoEn: "asc" }],
  });

  return NextResponse.json(zonas);
}

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarNegocio");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaCrearZona.parse(await request.json());
    const creada = await clientePrisma.zona.create({ data: entrada });
    return NextResponse.json(creada, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para zona");
  }
}
