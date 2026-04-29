import { type NextRequest, NextResponse } from "next/server";

import { cerrarSesion } from "@/src/api/privado/auth/servicio-auth";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const tokenBearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const tokenCookie = request.cookies.get("tpv_sesion")?.value ?? null;
  const token = tokenBearer ?? tokenCookie;

  if (token) {
    await cerrarSesion(token);
  }

  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set("tpv_sesion", "", { path: "/", expires: new Date(0) });
  return respuesta;
}
