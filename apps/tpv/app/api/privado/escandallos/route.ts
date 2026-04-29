import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import {
  crearRecetaEscandallo,
  esquemaCrearRecetaEscandallo,
} from "@/src/api/privado/compras/compras-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCompras");
  if (!sesion.ok) return sesion.response;

  const recetas = await clientePrisma.recetaEscandallo.findMany({
    include: {
      productoFinal: true,
      lineas: {
        include: { producto: true },
      },
    },
    orderBy: [{ actualizadoEn: "desc" }],
    take: 200,
  });

  return NextResponse.json(recetas);
}

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCompras");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaCrearRecetaEscandallo.parse(await request.json());
    const receta = await crearRecetaEscandallo(entrada);
    if (receta instanceof Response) return receta;
    return NextResponse.json(receta, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para receta");
  }
}
