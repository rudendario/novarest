import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { crearMenuDiaConCursos, esquemaCrearMenuDia } from "@/src/api/privado/carta-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCarta");
  if (!sesion.ok) return sesion.response;

  const menus = await clientePrisma.menuDia.findMany({
    where: { eliminadoEn: null },
    orderBy: [{ fecha: "desc" }],
    include: {
      cursos: {
        orderBy: { orden: "asc" },
        include: {
          platos: {
            orderBy: { orden: "asc" },
          },
        },
      },
    },
  });

  return NextResponse.json(menus);
}

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCarta");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaCrearMenuDia.parse(await request.json());
    const menu = await crearMenuDiaConCursos(entrada);

    return NextResponse.json(menu, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para crear menu del dia");
  }
}
