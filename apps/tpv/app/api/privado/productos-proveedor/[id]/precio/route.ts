import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { esquemaActualizarPrecioProductoProveedor } from "@/src/api/privado/compras/compras-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeGestionarCompras");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaActualizarPrecioProductoProveedor.parse(await request.json());
    const { id } = await params;

    const actual = await clientePrisma.productoProveedor.findUnique({ where: { id } });
    if (!actual || !actual.activo) {
      return responderErrorApi(
        404,
        "no_encontrado",
        "Vinculacion producto-proveedor no encontrada",
      );
    }

    const actualizado = await clientePrisma.$transaction(async (tx) => {
      const vinculo = await tx.productoProveedor.update({
        where: { id },
        data: { precioActualCentimos: entrada.precioCentimos },
      });

      await tx.historialPrecioProveedor.create({
        data: {
          productoProveedorId: id,
          precioCentimos: entrada.precioCentimos,
          motivo: entrada.motivo ?? "actualizacion_precio",
        },
      });

      return vinculo;
    });

    return NextResponse.json(actualizado);
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Actualizacion de precio invalida");
  }
}
