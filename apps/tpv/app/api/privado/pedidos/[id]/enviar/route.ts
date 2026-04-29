import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { enviarPedido } from "@/src/api/privado/sala-servicio";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeEnviarPedido");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;
  const resultado = await enviarPedido(id, sesion.contexto.usuarioId, sesion.contexto.rolNombre);

  if (resultado instanceof Response) {
    return resultado;
  }

  return NextResponse.json(resultado);
}
