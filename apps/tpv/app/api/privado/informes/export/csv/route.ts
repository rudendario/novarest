import { exigirSesion } from "@/src/api/privado/auth/servicio-auth";
import { lineaCsv } from "@/src/informes/csv";
import { clientePrisma } from "@el-jardin/infra";

function inicioDiaLocal(fecha: Date) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0);
}

export async function GET(request: Request) {
  const sesion = await exigirSesion(request, "puedeVerInformes");
  if (!sesion.ok) return sesion.response;

  const url = new URL(request.url);
  const ahora = new Date();
  const desde = url.searchParams.get("desde")
    ? new Date(url.searchParams.get("desde") as string)
    : inicioDiaLocal(ahora);
  const hasta = url.searchParams.get("hasta")
    ? new Date(url.searchParams.get("hasta") as string)
    : ahora;

  const [pagos, categorias] = await Promise.all([
    clientePrisma.pagoPedido.findMany({
      where: { cobradoEn: { gte: desde, lte: hasta } },
      select: {
        cobradoEn: true,
        metodo: true,
        montoTotal: true,
        montoEfectivo: true,
        montoTarjeta: true,
      },
      orderBy: [{ cobradoEn: "asc" }],
    }),
    clientePrisma.lineaPedido.findMany({
      where: {
        creadoEn: { gte: desde, lte: hasta },
        estado: { not: "cancelada" },
        pedido: { estado: "cobrado" },
      },
      include: { producto: { select: { categoria: { select: { nombre: true } } } } },
    }),
  ]);

  const categoriaMap = new Map<string, number>();
  for (const linea of categorias) {
    const nombre = linea.producto.categoria.nombre;
    const venta = linea.precioUnitCentimos * linea.cantidad;
    categoriaMap.set(nombre, (categoriaMap.get(nombre) ?? 0) + venta);
  }

  const lines: string[] = [];
  lines.push(
    lineaCsv([
      "seccion",
      "fecha",
      "metodo",
      "monto_total",
      "monto_efectivo",
      "monto_tarjeta",
      "categoria",
      "venta_categoria",
    ]),
  );
  for (const p of pagos) {
    lines.push(
      lineaCsv([
        "pagos",
        p.cobradoEn.toISOString(),
        p.metodo,
        p.montoTotal,
        p.montoEfectivo,
        p.montoTarjeta,
        "",
        "",
      ]),
    );
  }
  for (const [cat, venta] of categoriaMap.entries()) {
    lines.push(lineaCsv(["categoria", "", "", "", "", "", cat, venta]));
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="informe_${desde.toISOString().slice(0, 10)}_${hasta.toISOString().slice(0, 10)}.csv"`,
    },
  });
}
