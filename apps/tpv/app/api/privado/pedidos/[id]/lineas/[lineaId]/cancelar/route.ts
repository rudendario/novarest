import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import {
  cancelarLineaPedido,
  esquemaCancelarLinea,
  recalcularTotalPedido,
} from "@/src/api/privado/sala-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string; lineaId: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeSolicitarCancelacion");
  if (!sesion.ok) return sesion.response;

  const { id, lineaId } = await params;

  try {
    const entrada = esquemaCancelarLinea.parse(await request.json());

    if (
      entrada.modo === "directa" &&
      !sesion.contexto.permisos.includes("puedeCancelarLineaDirectamente")
    ) {
      return responderErrorApi(403, "sin_permiso", "Permiso insuficiente para cancelacion directa");
    }

    const resultado = await cancelarLineaPedido({
      pedidoId: id,
      lineaPedidoId: lineaId,
      motivo: entrada.motivo,
      modo: entrada.modo,
      usuarioId: sesion.contexto.usuarioId,
      rolNombre: sesion.contexto.rolNombre,
    });

    if (resultado instanceof Response) {
      return resultado;
    }

    if (entrada.modo === "directa") {
      await recalcularTotalPedido(id);
    }

    return NextResponse.json(resultado);
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para cancelar linea");
  }
}
