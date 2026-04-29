import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { auditarPublicacion, esquemaActualizarCategoria } from "@/src/api/privado/carta-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeGestionarCarta");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;

  try {
    const entrada = esquemaActualizarCategoria.parse(await request.json());
    const actual = await clientePrisma.categoriaProducto.findUnique({ where: { id } });

    if (!actual || actual.eliminadoEn) {
      return responderErrorApi(404, "no_encontrado", "Categoria no encontrada");
    }

    const actualizada = await clientePrisma.categoriaProducto.update({
      where: { id },
      data: {
        nombre: entrada.nombre,
        slug: entrada.slug,
        orden: entrada.orden,
        visiblePublico: entrada.visiblePublico,
      },
    });

    if (
      typeof entrada.visiblePublico === "boolean" &&
      entrada.visiblePublico !== actual.visiblePublico
    ) {
      await auditarPublicacion({
        entidad: "CategoriaProducto",
        entidadId: id,
        publicado: entrada.visiblePublico,
      });
    }

    return NextResponse.json(actualizada);
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para categoria");
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeGestionarCarta");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;

  const actual = await clientePrisma.categoriaProducto.findUnique({ where: { id } });
  if (!actual || actual.eliminadoEn) {
    return responderErrorApi(404, "no_encontrado", "Categoria no encontrada");
  }

  const eliminada = await clientePrisma.categoriaProducto.update({
    where: { id },
    data: { eliminadoEn: new Date(), visiblePublico: false },
  });

  return NextResponse.json(eliminada);
}
