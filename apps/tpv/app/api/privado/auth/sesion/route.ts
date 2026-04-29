import { type NextRequest, NextResponse } from "next/server";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";

export async function GET(request: NextRequest) {
  const sesion = await exigirSesion(request);
  if (!sesion.ok) {
    return sesion.response;
  }

  return NextResponse.json({ ok: true, sesion: sesion.contexto });
}
