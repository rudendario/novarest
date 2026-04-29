import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { cerrarCaja, esquemaCierreCaja } from "@/src/api/privado/caja/caja-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCaja");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaCierreCaja.parse(await request.json());
    const resultado = await cerrarCaja({
      saldoFinal: entrada.saldoFinal,
      motivo: entrada.motivo,
      usuarioId: sesion.contexto.usuarioId,
    });
    if (resultado instanceof Response) return resultado;
    return NextResponse.json(resultado);
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para cierre de caja");
  }
}
