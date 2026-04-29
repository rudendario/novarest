import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { obtenerPrecuentaPedido } from "@/src/api/privado/caja/caja-servicio";
import { registrarTrabajoImpresion } from "@/src/api/privado/impresion/servicio-impresion";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeCobrarPedido");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;
  const precuenta = await obtenerPrecuentaPedido(id);
  if (precuenta instanceof Response) return precuenta;

  const trabajo = await registrarTrabajoImpresion({
    tipoTicket: "precuenta",
    referenciaTipo: "pedido",
    referenciaId: id,
    contenido: { precuenta },
  });

  return NextResponse.json({ ok: true, trabajo });
}
