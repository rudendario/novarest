import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const exigirSesionMock = vi.fn();
const findManyPagosMock = vi.fn();
const findManyLineasMock = vi.fn();

vi.mock("@/src/api/privado/auth/servicio-auth", () => ({
  exigirSesion: (...args: unknown[]) => exigirSesionMock(...args),
}));

vi.mock("@el-jardin/infra", () => ({
  clientePrisma: {
    pagoPedido: {
      findMany: (...args: unknown[]) => findManyPagosMock(...args),
    },
    lineaPedido: {
      findMany: (...args: unknown[]) => findManyLineasMock(...args),
    },
  },
}));

describe("GET /api/privado/informes/export/csv", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 si no hay sesion valida", async () => {
    exigirSesionMock.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ mensaje: "No autorizado" }), { status: 401 }),
    });

    const res = await GET(new Request("http://localhost/api/privado/informes/export/csv"));
    expect(res.status).toBe(401);
  });

  it("devuelve csv con cabecera y contenido escapado", async () => {
    exigirSesionMock.mockResolvedValue({ ok: true, sesion: { usuarioId: "u1" } });
    findManyPagosMock.mockResolvedValue([
      {
        cobradoEn: new Date("2026-04-20T10:00:00.000Z"),
        metodo: "tarjeta",
        montoTotal: 1200,
        montoEfectivo: 0,
        montoTarjeta: 1200,
      },
    ]);
    findManyLineasMock.mockResolvedValue([
      {
        precioUnitCentimos: 500,
        cantidad: 2,
        producto: { categoria: { nombre: 'Bebidas, "Frio"' } },
      },
    ]);

    const res = await GET(new Request("http://localhost/api/privado/informes/export/csv"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    const csv = await res.text();
    expect(csv).toContain(
      "seccion,fecha,metodo,monto_total,monto_efectivo,monto_tarjeta,categoria,venta_categoria",
    );
    expect(csv).toContain("pagos,2026-04-20T10:00:00.000Z,tarjeta,1200,0,1200,,");
    expect(csv).toContain('categoria,,,,,,"Bebidas, ""Frio""",1000');
  });
});
