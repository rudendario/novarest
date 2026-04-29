import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import {
  esquemaActualizarCategoria,
  esquemaCrearCategoria,
} from "@/src/api/privado/carta-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCarta");
  if (!sesion.ok) return sesion.response;

  const categorias = await clientePrisma.categoriaProducto.findMany({
    where: { eliminadoEn: null },
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
  });

  return NextResponse.json(categorias);
}

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCarta");
  if (!sesion.ok) return sesion.response;

  try {
    const json = await request.json();
    const entrada = esquemaCrearCategoria.parse(json);

    const creada = await clientePrisma.categoriaProducto.create({
      data: {
        nombre: entrada.nombre,
        slug: entrada.slug,
        orden: entrada.orden,
        visiblePublico: entrada.visiblePublico,
        visibleInterno: true,
      },
    });

    return NextResponse.json(creada, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para crear categoria");
  }
}

export async function PATCH(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCarta");
  if (!sesion.ok) return sesion.response;

  try {
    const json = await request.json();
    const entrada = esquemaActualizarCategoria.parse(json);

    if (!("id" in json) || typeof json.id !== "string") {
      return responderErrorApi(400, "solicitud_invalida", "id de categoria requerido");
    }

    const actualizada = await clientePrisma.categoriaProducto.update({
      where: { id: json.id },
      data: {
        nombre: entrada.nombre,
        slug: entrada.slug,
        orden: entrada.orden,
        visiblePublico: entrada.visiblePublico,
      },
    });

    return NextResponse.json(actualizada);
  } catch {
    return responderErrorApi(
      400,
      "solicitud_invalida",
      "Datos invalidos para actualizar categoria",
    );
  }
}
