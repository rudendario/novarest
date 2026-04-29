import { NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { obtenerInformeCajaActiva } from "@/src/api/privado/caja/caja-servicio";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeVerCaja");
  if (!sesion.ok) return sesion.response;

  const informe = await obtenerInformeCajaActiva();
  if (informe instanceof Response) return informe;

  return NextResponse.json({ ok: true, informe });
}
