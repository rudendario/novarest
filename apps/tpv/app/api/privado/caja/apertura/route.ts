import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { abrirCaja, esquemaAperturaCaja } from "@/src/api/privado/caja/caja-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCaja");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaAperturaCaja.parse(await request.json().catch(() => ({})));
    const resultado = await abrirCaja({
      saldoInicial: entrada.saldoInicial,
      usuarioId: sesion.contexto.usuarioId,
    });
    if (resultado instanceof Response) return resultado;
    return NextResponse.json(resultado, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para apertura de caja");
  }
}
