import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeVerAuditoria");
  if (!sesion.ok) return sesion.response;

  const url = new URL(request.url);
  const entidad = url.searchParams.get("entidad")?.trim() ?? "";
  const accion = url.searchParams.get("accion")?.trim() ?? "";
  const limite = Math.min(500, Math.max(1, Number(url.searchParams.get("limite") ?? "150")));

  const registros = await clientePrisma.registroAuditoria.findMany({
    where: {
      ...(entidad ? { entidad } : {}),
      ...(accion ? { accion } : {}),
    },
    orderBy: [{ creadoEn: "desc" }],
    take: limite,
  });

  return NextResponse.json(registros);
}
