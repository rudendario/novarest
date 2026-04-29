import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { auditarPublicacion, esquemaPublicacion } from "@/src/api/privado/carta-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedePublicarCarta");
  if (!sesion.ok) return sesion.response;

  const { id } = await params;

  try {
    const entrada = esquemaPublicacion.parse(await request.json());
    const actual = await clientePrisma.menuDia.findUnique({ where: { id } });

    if (!actual || actual.eliminadoEn) {
      return responderErrorApi(404, "no_encontrado", "Menu no encontrado");
    }

    const actualizado = await clientePrisma.menuDia.update({
      where: { id },
      data: { publicado: entrada.publicado },
    });

    await auditarPublicacion({
      entidad: "MenuDia",
      entidadId: id,
      publicado: entrada.publicado,
      motivo: entrada.motivo,
      usuarioId: entrada.usuarioId,
      rolNombre: entrada.rolNombre,
    });

    return NextResponse.json(actualizado);
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para publicacion de menu");
  }
}
