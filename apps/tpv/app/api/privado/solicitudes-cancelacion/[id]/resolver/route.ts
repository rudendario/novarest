import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import {
  esquemaResolverSolicitudCancelacion,
  recalcularTotalPedido,
  resolverSolicitudCancelacion,
} from "@/src/api/privado/sala-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeAprobarCancelacion");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;

  try {
    const entrada = esquemaResolverSolicitudCancelacion.parse(await request.json());
    const resultado = await resolverSolicitudCancelacion({
      solicitudId: id,
      aprobada: entrada.aprobada,
      motivoResolucion: entrada.motivoResolucion,
      usuarioId: sesion.contexto.usuarioId,
      rolNombre: sesion.contexto.rolNombre,
    });

    if (resultado instanceof Response) return resultado;

    if (entrada.aprobada) {
      await recalcularTotalPedido(resultado.pedidoId);
    }

    return NextResponse.json(resultado);
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para resolver solicitud");
  }
}
