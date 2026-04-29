import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import {
  anadirLineaEscandallo,
  esquemaAnadirLineaEscandallo,
} from "@/src/api/privado/compras/compras-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeGestionarCompras");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaAnadirLineaEscandallo.parse(await request.json());
    const { id } = await params;
    const linea = await anadirLineaEscandallo(id, entrada);
    if (linea instanceof Response) return linea;
    return NextResponse.json(linea, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para linea de escandallo");
  }
}
