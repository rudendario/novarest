import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { obtenerCajaActiva } from "@/src/api/privado/caja/caja-servicio";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeVerCaja");
  if (!sesion.ok) return sesion.response;

  const caja = await obtenerCajaActiva();
  return NextResponse.json({ ok: true, caja });
}
