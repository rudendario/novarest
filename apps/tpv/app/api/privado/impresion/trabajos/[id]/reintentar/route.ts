import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { reprocesarTrabajoImpresion } from "@/src/api/privado/impresion/servicio-impresion";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeGestionarImpresoras");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;
  const trabajo = await reprocesarTrabajoImpresion(id);
  if (!trabajo) {
    return responderErrorApi(404, "no_encontrado", "Trabajo de impresion no encontrado");
  }

  return NextResponse.json({ ok: true, trabajo });
}
