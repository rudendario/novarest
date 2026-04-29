import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import {
  calcularDeltaComparativa,
  calcularRangoPrevio,
  inicioDiaLocal,
} from "@/src/informes/comparativa";

async function calcularResumen(desde: Date, hasta: Date) {
  const [pagos, pedidos] = await Promise.all([
    clientePrisma.pagoPedido.findMany({
      where: { cobradoEn: { gte: desde, lte: hasta } },
      select: { montoTotal: true },
    }),
    clientePrisma.pedido.count({
      where: { abiertoEn: { gte: desde, lte: hasta }, eliminadoEn: null },
    }),
  ]);

  const totalCentimos = pagos.reduce((acc, p) => acc + p.montoTotal, 0);
  return { totalCentimos, pagos: pagos.length, pedidos };
}

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeVerInformes");
  if (!sesion.ok) return sesion.response;

  const url = new URL(request.url);
  const ahora = new Date();
  const actualDesde = url.searchParams.get("actualDesde")
    ? new Date(url.searchParams.get("actualDesde") as string)
    : inicioDiaLocal(ahora);
  const actualHasta = url.searchParams.get("actualHasta")
    ? new Date(url.searchParams.get("actualHasta") as string)
    : ahora;
  const rangoPrevio = calcularRangoPrevio(
    actualDesde,
    actualHasta,
    url.searchParams.get("previoDesde")
      ? new Date(url.searchParams.get("previoDesde") as string)
      : undefined,
    url.searchParams.get("previoHasta")
      ? new Date(url.searchParams.get("previoHasta") as string)
      : undefined,
  );
  const previoDesde = rangoPrevio.desde;
  const previoHasta = rangoPrevio.hasta;

  const [actual, previo] = await Promise.all([
    calcularResumen(actualDesde, actualHasta),
    calcularResumen(previoDesde, previoHasta),
  ]);

  const { deltaCentimos, deltaPct } = calcularDeltaComparativa(
    actual.totalCentimos,
    previo.totalCentimos,
  );

  return NextResponse.json({
    actual: { desde: actualDesde.toISOString(), hasta: actualHasta.toISOString(), ...actual },
    previo: { desde: previoDesde.toISOString(), hasta: previoHasta.toISOString(), ...previo },
    comparativa: { deltaCentimos, deltaPct },
  });
}
