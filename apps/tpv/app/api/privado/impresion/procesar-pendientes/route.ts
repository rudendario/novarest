import { NextResponse } from "next/server";
import { z } from "zod";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { procesarTrabajosPendientes } from "@/src/api/privado/impresion/servicio-impresion";
import { responderErrorApi } from "@/src/api/publico/respuestas";

const esquema = z.object({
  limite: z.number().int().positive().max(100).default(20),
});

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarImpresoras");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquema.parse(await request.json().catch(() => ({})));
    const procesados = await procesarTrabajosPendientes(entrada.limite);
    return NextResponse.json({ ok: true, total: procesados.length, procesados });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Parametros invalidos para procesar cola");
  }
}
