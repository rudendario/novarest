import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";

function inicioDiaLocal(fecha: Date) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0);
}

type Tramo = "manana" | "tarde" | "noche";

function tramoHora(fecha: Date): Tramo {
  const h = fecha.getHours();
  if (h >= 6 && h < 14) return "manana";
  if (h >= 14 && h < 20) return "tarde";
  return "noche";
}

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeVerInformes");
  if (!sesion.ok) return sesion.response;

  const url = new URL(request.url);
  const desdeRaw = url.searchParams.get("desde");
  const hastaRaw = url.searchParams.get("hasta");
  const ahora = new Date();
  const desde = desdeRaw ? new Date(desdeRaw) : inicioDiaLocal(ahora);
  const hasta = hastaRaw ? new Date(hastaRaw) : ahora;

  const pagos = await clientePrisma.pagoPedido.findMany({
    where: { cobradoEn: { gte: desde, lte: hasta } },
    select: { cobradoEn: true, montoTotal: true },
  });

  const base: Record<Tramo, { turno: Tramo; pagos: number; ventaCentimos: number }> = {
    manana: { turno: "manana", pagos: 0, ventaCentimos: 0 },
    tarde: { turno: "tarde", pagos: 0, ventaCentimos: 0 },
    noche: { turno: "noche", pagos: 0, ventaCentimos: 0 },
  };

  for (const pago of pagos) {
    const t = tramoHora(pago.cobradoEn);
    base[t].pagos += 1;
    base[t].ventaCentimos += pago.montoTotal;
  }

  return NextResponse.json({
    rango: { desde: desde.toISOString(), hasta: hasta.toISOString() },
    items: [base.manana, base.tarde, base.noche],
  });
}
