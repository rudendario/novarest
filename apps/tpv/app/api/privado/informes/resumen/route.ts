import { NextResponse } from "next/server";

import { clientePrisma } from "@el-jardin/infra";

import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";

function inicioDiaLocal(fecha: Date) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0);
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

  const [pagos, movimientosCaja, movimientosStock, pedidos] = await Promise.all([
    clientePrisma.pagoPedido.findMany({
      where: { cobradoEn: { gte: desde, lte: hasta } },
      select: { montoTotal: true, montoEfectivo: true, montoTarjeta: true },
    }),
    clientePrisma.movimientoCaja.findMany({
      where: { creadoEn: { gte: desde, lte: hasta } },
      select: { tipo: true, cantidad: true },
    }),
    clientePrisma.movimientoStock.findMany({
      where: { creadoEn: { gte: desde, lte: hasta } },
      select: { tipo: true, cantidad: true },
    }),
    clientePrisma.pedido.count({
      where: { abiertoEn: { gte: desde, lte: hasta }, eliminadoEn: null },
    }),
  ]);

  const ventasTotal = pagos.reduce((acc, p) => acc + p.montoTotal, 0);
  const ventasEfectivo = pagos.reduce((acc, p) => acc + p.montoEfectivo, 0);
  const ventasTarjeta = pagos.reduce((acc, p) => acc + p.montoTarjeta, 0);

  const entradasCaja = movimientosCaja
    .filter((m) => m.tipo === "entrada_manual")
    .reduce((acc, m) => acc + m.cantidad, 0);
  const salidasCaja = movimientosCaja
    .filter((m) => m.tipo === "salida_manual")
    .reduce((acc, m) => acc + m.cantidad, 0);

  const consumoStock = movimientosStock
    .filter((m) => m.tipo === "consumo_cobro")
    .reduce((acc, m) => acc + m.cantidad, 0);
  const recepcionStock = movimientosStock
    .filter((m) => m.tipo === "recepcion_compra")
    .reduce((acc, m) => acc + m.cantidad, 0);

  return NextResponse.json({
    rango: { desde: desde.toISOString(), hasta: hasta.toISOString() },
    ventas: {
      totalCentimos: ventasTotal,
      efectivoCentimos: ventasEfectivo,
      tarjetaCentimos: ventasTarjeta,
      pagos: pagos.length,
      pedidos,
    },
    caja: {
      entradasManualCentimos: entradasCaja,
      salidasManualCentimos: salidasCaja,
      movimientos: movimientosCaja.length,
    },
    stock: {
      consumoUnidades: consumoStock,
      recepcionUnidades: recepcionStock,
      movimientos: movimientosStock.length,
    },
  });
}
