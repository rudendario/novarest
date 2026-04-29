import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { obtenerDisponibilidadStock } from "@/src/api/privado/stock/stock-servicio";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeAjustarStock");
  if (!sesion.ok) return sesion.response;

  const data = await obtenerDisponibilidadStock();
  return NextResponse.json(data);
}
