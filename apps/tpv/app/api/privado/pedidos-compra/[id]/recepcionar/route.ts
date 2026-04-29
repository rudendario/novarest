import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import {
  esquemaRecepcionarPedidoCompra,
  recepcionarPedidoCompra,
} from "@/src/api/privado/compras/compras-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeGestionarCompras");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaRecepcionarPedidoCompra.parse(await request.json());
    const { id } = await params;
    const recepcion = await recepcionarPedidoCompra(id, entrada);
    if (recepcion instanceof Response) return recepcion;
    return NextResponse.json(recepcion, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para recepcion");
  }
}
