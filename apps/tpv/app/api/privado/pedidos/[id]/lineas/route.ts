import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import {
  anadirLineaAPedido,
  esquemaAnadirLineaPedido,
  recalcularTotalPedido,
} from "@/src/api/privado/sala-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeAnadirLineasPedido");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;

  try {
    const entrada = esquemaAnadirLineaPedido.parse(await request.json());
    const resultado = await anadirLineaAPedido({
      pedidoId: id,
      productoId: entrada.productoId,
      cantidad: entrada.cantidad,
      nota: entrada.nota,
    });

    if (resultado instanceof Response) {
      return resultado;
    }

    await recalcularTotalPedido(id);

    return NextResponse.json(resultado, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para linea de pedido");
  }
}
