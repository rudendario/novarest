import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { validarInvariantesStock } from "@/src/api/privado/stock/stock-servicio";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeAjustarStock");
  if (!sesion.ok) return sesion.response;

  const resultado = await validarInvariantesStock();
  return NextResponse.json(resultado);
}
