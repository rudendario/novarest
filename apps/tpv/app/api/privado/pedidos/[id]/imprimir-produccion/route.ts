import { NextResponse } from "next/server";
import { z } from "zod";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { registrarTrabajoImpresion } from "@/src/api/privado/impresion/servicio-impresion";
import { responderErrorApi } from "@/src/api/publico/respuestas";

const esquema = z.object({
  destino: z.enum(["cocina", "barra"]),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const sesion = await exigirSesion(request, "puedeEnviarPedido");
  if (!sesion.ok) return sesion.response;

  try {
    const entrada = esquema.parse(await request.json());
    const { id } = await params;

    const pedido = await clientePrisma.pedido.findUnique({
      where: { id },
      include: {
        mesa: true,
        lineas: {
          where: {
            estado: { in: ["confirmada", "en_preparacion", "lista"] },
          },
          include: {
            producto: {
              select: { destinoPreparacion: true },
            },
          },
        },
      },
    });
    if (!pedido || pedido.eliminadoEn) {
      return responderErrorApi(404, "no_encontrado", "Pedido no encontrado");
    }

    const lineas = pedido.lineas.filter((linea) => {
      if (entrada.destino === "cocina") {
        return (
          linea.producto.destinoPreparacion === "cocina" ||
          linea.producto.destinoPreparacion === "ambos"
        );
      }
      return (
        linea.producto.destinoPreparacion === "barra" ||
        linea.producto.destinoPreparacion === "ambos"
      );
    });

    const trabajo = await registrarTrabajoImpresion({
      tipoTicket: entrada.destino,
      zonaId: pedido.mesa.zonaId,
      referenciaTipo: "pedido",
      referenciaId: pedido.id,
      contenido: {
        pedidoId: pedido.id,
        mesa: pedido.mesa.nombre,
        destino: entrada.destino,
        lineas: lineas.map((linea) => ({
          nombre: linea.nombreSnapshot,
          cantidad: linea.cantidad,
          nota: linea.nota,
        })),
      },
    });

    return NextResponse.json({ ok: true, trabajo });
  } catch {
    return responderErrorApi(400, "solicitud_invalida", "Solicitud de impresion invalida");
  }
}
