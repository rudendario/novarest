import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { obtenerTicketPedidoBasico } from "@/src/api/privado/caja/caja-servicio";
import { registrarTrabajoImpresion } from "@/src/api/privado/impresion/servicio-impresion";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeCobrarPedido");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;
  const ticket = await obtenerTicketPedidoBasico(id);
  if (ticket instanceof Response) return ticket;

  const trabajo = await registrarTrabajoImpresion({
    tipoTicket: "recibo",
    referenciaTipo: "pedido",
    referenciaId: id,
    contenido: { ticket },
  });

  return NextResponse.json({ ok: true, trabajo });
}
