import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { obtenerContextoSesionPorToken } from "@/src/api/privado/auth/servicio-auth";
import { filtrarCanalesPermitidos, obtenerBacklog } from "@/src/realtime/servidor-realtime";

export async function GET(request: Request) {
  const token = (await cookies()).get("tpv_sesion")?.value;
  if (!token) {
    return NextResponse.json({ ok: false, error: "Sesion requerida" }, { status: 401 });
  }

  const sesion = await obtenerContextoSesionPorToken(token);
  if (!sesion) {
    return NextResponse.json({ ok: false, error: "Sesion invalida" }, { status: 401 });
  }

  const url = new URL(request.url);
  const canalesRaw = (url.searchParams.get("canales") ?? "sala").split(",");
  const canales = filtrarCanalesPermitidos(canalesRaw, sesion.permisos);
  const desdeId = Number(url.searchParams.get("desdeId") ?? "0");
  const limite = Math.min(200, Math.max(1, Number(url.searchParams.get("limite") ?? "100")));

  if (canales.length === 0) {
    return NextResponse.json({ ok: false, error: "Sin canales autorizados" }, { status: 403 });
  }

  const eventos = obtenerBacklog({
    canales,
    desdeId: Number.isFinite(desdeId) ? desdeId : 0,
    limite,
  });

  return NextResponse.json({ ok: true, eventos });
}
