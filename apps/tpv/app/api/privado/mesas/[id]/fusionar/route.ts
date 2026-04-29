import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import {
  esquemaFusionarMesas,
  fusionarMesas,
  recalcularTotalPedido,
} from "@/src/api/privado/sala-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeAbrirMesa");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;

  try {
    const entrada = esquemaFusionarMesas.parse(await request.json());
    const resultado = await fusionarMesas({
      mesaOrigenId: id,
      mesaDestinoId: entrada.mesaDestinoId,
      motivo: entrada.motivo,
      usuarioId: sesion.contexto.usuarioId,
      rolNombre: sesion.contexto.rolNombre,
    });

    if (resultado instanceof Response) return resultado;

    await recalcularTotalPedido(resultado.pedidoDestinoId);

    return NextResponse.json(resultado);
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para fusionar mesas");
  }
}
