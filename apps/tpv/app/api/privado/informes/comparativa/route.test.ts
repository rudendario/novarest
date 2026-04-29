import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const exigirSesionMock = vi.fn();
const findManyPagosMock = vi.fn();
const countPedidosMock = vi.fn();

vi.mock("@/src/api/privado/auth/servicio-auth", () => ({
  exigirSesion: (...args: unknown[]) => exigirSesionMock(...args),
}));

vi.mock("@el-jardin/infra", () => ({
  clientePrisma: {
    pagoPedido: {
      findMany: (...args: unknown[]) => findManyPagosMock(...args),
    },
    pedido: {
      count: (...args: unknown[]) => countPedidosMock(...args),
    },
  },
}));

describe("GET /api/privado/informes/comparativa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 si no hay sesion valida", async () => {
    exigirSesionMock.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ mensaje: "No autorizado" }), { status: 401 }),
    });

    const res = await GET(new Request("http://localhost/api/privado/informes/comparativa"));
    expect(res.status).toBe(401);
  });

  it("devuelve comparativa con delta calculado", async () => {
    exigirSesionMock.mockResolvedValue({ ok: true, sesion: { usuarioId: "u1" } });
    findManyPagosMock
      .mockResolvedValueOnce([{ montoTotal: 1000 }, { montoTotal: 500 }])
      .mockResolvedValueOnce([{ montoTotal: 800 }]);
    countPedidosMock.mockResolvedValueOnce(3).mockResolvedValueOnce(2);

    const res = await GET(
      new Request(
        "http://localhost/api/privado/informes/comparativa?actualDesde=2026-04-20T10:00:00.000Z&actualHasta=2026-04-20T12:00:00.000Z",
      ),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      comparativa: { deltaCentimos: number; deltaPct: number };
      actual: { totalCentimos: number; pagos: number; pedidos: number };
      previo: { totalCentimos: number; pagos: number; pedidos: number };
    };

    expect(body.actual).toMatchObject({ totalCentimos: 1500, pagos: 2, pedidos: 3 });
    expect(body.previo).toMatchObject({ totalCentimos: 800, pagos: 1, pedidos: 2 });
    expect(body.comparativa).toEqual({ deltaCentimos: 700, deltaPct: 88 });
  });
});
