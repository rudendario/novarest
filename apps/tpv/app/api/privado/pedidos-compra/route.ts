import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import {
  crearPedidoCompra,
  esquemaCrearPedidoCompra,
} from "@/src/api/privado/compras/compras-servicio";
import { responderErrorApi } from "@/src/api/publico/respuestas";

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCompras");
  if (!sesion.ok) return sesion.response;

  const pedidos = await clientePrisma.pedidoCompra.findMany({
    include: {
      proveedor: true,
      lineas: {
        include: {
          productoProveedor: {
            include: {
              producto: true,
            },
          },
        },
      },
      recepciones: true,
    },
    orderBy: [{ fechaPedido: "desc" }],
    take: 200,
  });

  return NextResponse.json(pedidos);
}

export async function POST(request: Request) {
  const sesion = await exigirSesion(request, "puedeGestionarCompras");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquemaCrearPedidoCompra.parse(await request.json());
    const pedido = await crearPedidoCompra(entrada);
    if (pedido instanceof Response) return pedido;
    return NextResponse.json(pedido, { status: 201 });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Datos invalidos para pedido de compra");
  }
}
