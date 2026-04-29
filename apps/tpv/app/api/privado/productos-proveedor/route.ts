import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import {
  esquemaVincularProductoProveedor,
  vincularProductoProveedor,
} from "@/src/api/privado/compras/compras-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCompras");
  if (!sesion.ok) return sesion.response;

  const vinculaciones = await clientePrisma.productoProveedor.findMany({
    where: { activo: true },
    include: {
      producto: true,
      proveedor: true,
      historialPrecios: {
        orderBy: [{ creadoEn: "desc" }],
        take: 5,
      },
    },
    orderBy: [{ actualizadoEn: "desc" }],
    take: 500,
  });

  return NextResponse.json(vinculaciones);
}

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCompras");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaVincularProductoProveedor.parse(await request.json());
    const vinculacion = await vincularProductoProveedor(entrada);
    if (vinculacion instanceof Response) return vinculacion;
    return NextResponse.json(vinculacion, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Vinculacion producto-proveedor invalida");
  }
}
