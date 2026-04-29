import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { obtenerTicketPedidoBasico } from "@/src/api/privado/caja/caja-servicio";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeCobrarPedido");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;
  const ticket = await obtenerTicketPedidoBasico(id);
  if (ticket instanceof Response) return ticket;

  return NextResponse.json({ ok: true, ticket });
}
