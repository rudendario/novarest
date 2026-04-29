import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { esquemaCrearImpresora } from "@/src/api/privado/impresion/servicio-impresion";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarImpresoras");
  if (!sesion.ok) return sesion.response;

  const impresoras = await clientePrisma.impresora.findMany({
    where: { eliminadoEn: null },
    include: { zona: true },
    orderBy: [{ prioridad: "desc" }, { nombre: "asc" }],
  });

  return NextResponse.json(impresoras);
}

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarImpresoras");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaCrearImpresora.parse(await request.json());
    const creada = await clientePrisma.impresora.create({
      data: {
        nombre: entrada.nombre,
        zonaId: entrada.zonaId ?? null,
        tipoConexion: entrada.tipoConexion,
        endpoint: entrada.endpoint ?? null,
        prioridad: entrada.prioridad,
        activa: entrada.activa,
      },
    });
    return NextResponse.json(creada, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para impresora");
  }
}
