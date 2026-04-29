import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { calcularCosteReceta } from "@/src/api/privado/compras/compras-servicio";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeGestionarCompras");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;
  const url = new URL(request.url);
  const estrategiaRaw = url.searchParams.get("estrategia");
  const estrategia = estrategiaRaw === "promedio" ? "promedio" : "ultimo";
  const costo = await calcularCosteReceta(id, estrategia);
  if (costo instanceof Response) return costo;
  return NextResponse.json(costo);
}
