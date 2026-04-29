import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeVerSala");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;
  const pedido = await clientePrisma.pedido.findUnique({
    where: { id },
    include: {
      mesa: { include: { zona: true } },
      lineas: { orderBy: [{ creadoEn: "asc" }] },
    },
  });

  if (!pedido || pedido.eliminadoEn) {
    return responderErrorApi(404, "no_encontrado", "Pedido no encontrado");
  }

  return NextResponse.json(pedido);
}
