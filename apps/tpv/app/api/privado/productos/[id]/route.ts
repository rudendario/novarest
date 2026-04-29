import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { auditarPublicacion, esquemaActualizarProducto } from "@/src/api/privado/carta-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeGestionarCarta");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;

  try {
    const entrada = esquemaActualizarProducto.parse(await request.json());
    const actual = await clientePrisma.producto.findUnique({ where: { id } });

    if (!actual || actual.eliminadoEn) {
      return responderErrorApi(404, "no_encontrado", "Producto no encontrado");
    }

    const actualizado = await clientePrisma.producto.update({
      where: { id },
      data: {
        nombre: entrada.nombre,
        slug: entrada.slug,
        descripcion: entrada.descripcion,
        precioCentimos: entrada.precioCentimos,
        tipo: entrada.tipo,
        destinoPreparacion: entrada.destinoPreparacion,
        categoriaId: entrada.categoriaId,
        visiblePublico: entrada.visiblePublico,
        estadoPublico: entrada.estadoPublico,
      },
    });

    if (
      (typeof entrada.visiblePublico === "boolean" &&
        entrada.visiblePublico !== actual.visiblePublico) ||
      (typeof entrada.estadoPublico === "string" && entrada.estadoPublico !== actual.estadoPublico)
    ) {
      await auditarPublicacion({
        entidad: "Producto",
        entidadId: id,
        publicado: actualizado.visiblePublico,
      });
    }

    return NextResponse.json(actualizado);
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para producto");
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeGestionarCarta");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;

  const actual = await clientePrisma.producto.findUnique({ where: { id } });
  if (!actual || actual.eliminadoEn) {
    return responderErrorApi(404, "no_encontrado", "Producto no encontrado");
  }

  const eliminado = await clientePrisma.producto.update({
    where: { id },
    data: { eliminadoEn: new Date(), visiblePublico: false, estadoPublico: "oculto" },
  });

  return NextResponse.json(eliminado);
}
