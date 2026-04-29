import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const exigirSesionMock = vi.fn();
const findManyPagosMock = vi.fn();
const findManyCajaMock = vi.fn();
const findManyStockMock = vi.fn();
const countPedidosMock = vi.fn();

vi.mock("@/src/api/privado/auth/servicio-auth", () => ({
  exigirSesion: (...args: unknown[]) => exigirSesionMock(...args),
}));

vi.mock("@el-jardin/infra", () => ({
  clientePrisma: {
    pagoPedido: { findMany: (...args: unknown[]) => findManyPagosMock(...args) },
    movimientoCaja: { findMany: (...args: unknown[]) => findManyCajaMock(...args) },
    movimientoStock: { findMany: (...args: unknown[]) => findManyStockMock(...args) },
    pedido: { count: (...args: unknown[]) => countPedidosMock(...args) },
  },
}));

describe("GET /api/privado/informes/resumen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 sin sesion", async () => {
    exigirSesionMock.mockResolvedValue({
      ok: false,
      response: new Response(null, { status: 401 }),
    });
    const res = await GET(new Request("http://localhost/api/privado/informes/resumen"));
    expect(res.status).toBe(401);
  });

  it("agrega ventas, caja y stock", async () => {
    exigirSesionMock.mockResolvedValue({ ok: true, sesion: { usuarioId: "u1" } });
    findManyPagosMock.mockResolvedValue([
      { montoTotal: 1200, montoEfectivo: 200, montoTarjeta: 1000 },
      { montoTotal: 800, montoEfectivo: 800, montoTarjeta: 0 },
    ]);
    findManyCajaMock.mockResolvedValue([
      { tipo: "entrada_manual", cantidad: 150 },
      { tipo: "salida_manual", cantidad: 50 },
    ]);
    findManyStockMock.mockResolvedValue([
      { tipo: "consumo_cobro", cantidad: 4 },
      { tipo: "recepcion_compra", cantidad: 10 },
    ]);
    countPedidosMock.mockResolvedValue(3);

    const res = await GET(new Request("http://localhost/api/privado/informes/resumen"));
    const body = (await res.json()) as {
      ventas: {
        totalCentimos: number;
        efectivoCentimos: number;
        tarjetaCentimos: number;
        pagos: number;
        pedidos: number;
      };
      caja: { entradasManualCentimos: number; salidasManualCentimos: number; movimientos: number };
      stock: { consumoUnidades: number; recepcionUnidades: number; movimientos: number };
    };

    expect(body.ventas).toMatchObject({
      totalCentimos: 2000,
      efectivoCentimos: 1000,
      tarjetaCentimos: 1000,
      pagos: 2,
      pedidos: 3,
    });
    expect(body.caja).toMatchObject({
      entradasManualCentimos: 150,
      salidasManualCentimos: 50,
      movimientos: 2,
    });
    expect(body.stock).toMatchObject({ consumoUnidades: 4, recepcionUnidades: 10, movimientos: 2 });
  });
});
