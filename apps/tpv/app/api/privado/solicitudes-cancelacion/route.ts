import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeAprobarCancelacion");
  if (!sesion.ok) return sesion.response;

  const solicitudes = await clientePrisma.solicitudCancelacion.findMany({
    where: { resueltaEn: null },
    orderBy: [{ creadaEn: "desc" }],
    take: 100,
  });

  return NextResponse.json(solicitudes);
}
