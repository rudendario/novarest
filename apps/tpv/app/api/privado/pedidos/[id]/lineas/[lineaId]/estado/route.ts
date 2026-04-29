import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import {
  actualizarEstadoLineaPedido,
  esquemaActualizarEstadoLinea,
  recalcularTotalPedido,
} from "@/src/api/privado/sala-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string; lineaId: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeEnviarPedido");
  if (!sesion.ok) return sesion.response;

  const { id, lineaId } = await params;

  try {
    const entrada = esquemaActualizarEstadoLinea.parse(await request.json());
    const resultado = await actualizarEstadoLineaPedido({
      pedidoId: id,
      lineaId,
      estadoDestino: entrada.estado,
      motivo: entrada.motivo,
      usuarioId: sesion.contexto.usuarioId,
      rolNombre: sesion.contexto.rolNombre,
    });

    if (resultado instanceof Response) return resultado;

    if (entrada.estado === "cancelada") {
      await recalcularTotalPedido(id);
    }

    return NextResponse.json(resultado);
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para estado de linea");
  }
}
