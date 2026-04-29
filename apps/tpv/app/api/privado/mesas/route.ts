import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { esquemaCrearMesa } from "@/src/api/privado/sala-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeVerSala");
  if (!sesion.ok) return sesion.response;

  const mesas = await clientePrisma.mesa.findMany({
    where: { eliminadaEn: null },
    include: {
      zona: true,
      pedidoActivo: {
        include: {
          lineas: {
            include: {
              producto: {
                select: {
                  destinoPreparacion: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ zona: { orden: "asc" } }, { nombre: "asc" }],
  });

  return NextResponse.json(mesas);
}

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarNegocio");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaCrearMesa.parse(await request.json());
    const creada = await clientePrisma.mesa.create({ data: entrada });
    return NextResponse.json(creada, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para mesa");
  }
}
