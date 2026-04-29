import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const exigirSesionMock = vi.fn();
const findManyLineasMock = vi.fn();

vi.mock("@/src/api/privado/auth/servicio-auth", () => ({
  exigirSesion: (...args: unknown[]) => exigirSesionMock(...args),
}));

vi.mock("@el-jardin/infra", () => ({
  clientePrisma: {
    lineaPedido: { findMany: (...args: unknown[]) => findManyLineasMock(...args) },
  },
}));

describe("GET /api/privado/informes/desglose-producto", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 sin sesion", async () => {
    exigirSesionMock.mockResolvedValue({
      ok: false,
      response: new Response(null, { status: 401 }),
    });
    const res = await GET(new Request("http://localhost/api/privado/informes/desglose-producto"));
    expect(res.status).toBe(401);
  });

  it("agrupa ventas por producto", async () => {
    exigirSesionMock.mockResolvedValue({ ok: true, sesion: { usuarioId: "u1" } });
    findManyLineasMock.mockResolvedValue([
      { productoId: "p1", cantidad: 2, precioUnitCentimos: 300, producto: { nombre: "Cafe" } },
      { productoId: "p1", cantidad: 1, precioUnitCentimos: 300, producto: { nombre: "Cafe" } },
      { productoId: "p2", cantidad: 1, precioUnitCentimos: 500, producto: { nombre: "Tosta" } },
    ]);

    const res = await GET(new Request("http://localhost/api/privado/informes/desglose-producto"));
    const body = (await res.json()) as {
      items: Array<{ productoId: string; unidades: number; ventaCentimos: number }>;
    };
    expect(body.items[0]).toMatchObject({ productoId: "p1", unidades: 3, ventaCentimos: 900 });
    expect(body.items[1]).toMatchObject({ productoId: "p2", unidades: 1, ventaCentimos: 500 });
  });
});
