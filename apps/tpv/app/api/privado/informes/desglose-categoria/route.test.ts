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

describe("GET /api/privado/informes/desglose-categoria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 sin sesion", async () => {
    exigirSesionMock.mockResolvedValue({
      ok: false,
      response: new Response(null, { status: 401 }),
    });
    const res = await GET(new Request("http://localhost/api/privado/informes/desglose-categoria"));
    expect(res.status).toBe(401);
  });

  it("agrupa ventas por categoria", async () => {
    exigirSesionMock.mockResolvedValue({ ok: true, sesion: { usuarioId: "u1" } });
    findManyLineasMock.mockResolvedValue([
      {
        cantidad: 2,
        precioUnitCentimos: 300,
        producto: { categoria: { id: "c1", nombre: "Bebidas" } },
      },
      {
        cantidad: 1,
        precioUnitCentimos: 500,
        producto: { categoria: { id: "c2", nombre: "Comidas" } },
      },
      {
        cantidad: 1,
        precioUnitCentimos: 200,
        producto: { categoria: { id: "c1", nombre: "Bebidas" } },
      },
    ]);

    const res = await GET(new Request("http://localhost/api/privado/informes/desglose-categoria"));
    const body = (await res.json()) as {
      items: Array<{ categoriaId: string; unidades: number; ventaCentimos: number }>;
    };
    expect(body.items[0]).toMatchObject({ categoriaId: "c1", unidades: 3, ventaCentimos: 800 });
    expect(body.items[1]).toMatchObject({ categoriaId: "c2", unidades: 1, ventaCentimos: 500 });
  });
});
