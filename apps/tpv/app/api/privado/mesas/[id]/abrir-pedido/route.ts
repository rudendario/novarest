import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { abrirPedidoEnMesa, esquemaAbrirPedidoMesa } from "@/src/api/privado/sala-servicio";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeAbrirMesa");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;

  let nota: string | undefined;
  try {
    const entrada = esquemaAbrirPedidoMesa.parse(await request.json().catch(() => ({})));
    nota = entrada.nota;
  } catch {
    nota = undefined;
  }

  const resultado = await abrirPedidoEnMesa({
    mesaId: id,
    nota,
    usuarioId: sesion.contexto.usuarioId,
    rolNombre: sesion.contexto.rolNombre,
  });

  if (resultado instanceof Response) {
    return resultado;
  }

  return NextResponse.json(resultado, { status: 201 });
}
