import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";

function inicioDiaLocal(fecha: Date) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0);
}

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeVerAnalitica");
  if (!sesion.ok) return sesion.response;

  const url = new URL(request.url);
  const desdeRaw = url.searchParams.get("desde");
  const hastaRaw = url.searchParams.get("hasta");
  const ahora = new Date();
  const desde = desdeRaw ? new Date(desdeRaw) : inicioDiaLocal(ahora);
  const hasta = hastaRaw ? new Date(hastaRaw) : ahora;

  const lineas = await clientePrisma.lineaPedido.findMany({
    where: {
      creadoEn: { gte: desde, lte: hasta },
      estado: { not: "cancelada" },
      pedido: { estado: "cobrado" },
    },
    include: {
      producto: { select: { id: true, nombre: true, categoriaId: true } },
    },
  });

  const mapa = new Map<
    string,
    { productoId: string; nombre: string; unidades: number; ventaCentimos: number }
  >();

  for (const linea of lineas) {
    const key = linea.productoId;
    const actual = mapa.get(key) ?? {
      productoId: linea.productoId,
      nombre: linea.producto.nombre,
      unidades: 0,
      ventaCentimos: 0,
    };
    actual.unidades += linea.cantidad;
    actual.ventaCentimos += linea.cantidad * linea.precioUnitCentimos;
    mapa.set(key, actual);
  }

  const items = Array.from(mapa.values()).sort((a, b) => b.ventaCentimos - a.ventaCentimos);
  return NextResponse.json({
    rango: { desde: desde.toISOString(), hasta: hasta.toISOString() },
    items,
  });
}
