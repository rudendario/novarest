import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const exigirSesionMock = vi.fn();
const findManyPagosMock = vi.fn();

vi.mock("@/src/api/privado/auth/servicio-auth", () => ({
  exigirSesion: (...args: unknown[]) => exigirSesionMock(...args),
}));

vi.mock("@el-jardin/infra", () => ({
  clientePrisma: {
    pagoPedido: { findMany: (...args: unknown[]) => findManyPagosMock(...args) },
  },
}));

describe("GET /api/privado/informes/desglose-turno", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 sin sesion", async () => {
    exigirSesionMock.mockResolvedValue({
      ok: false,
      response: new Response(null, { status: 401 }),
    });
    const res = await GET(new Request("http://localhost/api/privado/informes/desglose-turno"));
    expect(res.status).toBe(401);
  });

  it("agrupa pagos por tramo horario", async () => {
    exigirSesionMock.mockResolvedValue({ ok: true, sesion: { usuarioId: "u1" } });
    findManyPagosMock.mockResolvedValue([
      { cobradoEn: new Date("2026-04-20T08:00:00.000Z"), montoTotal: 500 },
      { cobradoEn: new Date("2026-04-20T15:00:00.000Z"), montoTotal: 800 },
      { cobradoEn: new Date("2026-04-20T22:00:00.000Z"), montoTotal: 1200 },
    ]);

    const res = await GET(new Request("http://localhost/api/privado/informes/desglose-turno"));
    const body = (await res.json()) as {
      items: Array<{ turno: string; pagos: number; ventaCentimos: number }>;
    };
    expect(body.items).toEqual([
      { turno: "manana", pagos: 1, ventaCentimos: 500 },
      { turno: "tarde", pagos: 1, ventaCentimos: 800 },
      { turno: "noche", pagos: 1, ventaCentimos: 1200 },
    ]);
  });
});
