import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const exigirSesionMock = vi.fn();
const findManyAuditoriaMock = vi.fn();

vi.mock("@/src/api/privado/auth/servicio-auth", () => ({
  exigirSesion: (...args: unknown[]) => exigirSesionMock(...args),
}));

vi.mock("@el-jardin/infra", () => ({
  clientePrisma: {
    registroAuditoria: {
      findMany: (...args: unknown[]) => findManyAuditoriaMock(...args),
    },
  },
}));

describe("GET /api/privado/auditoria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 sin sesion", async () => {
    exigirSesionMock.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ mensaje: "No autorizado" }), { status: 401 }),
    });

    const res = await GET(new Request("http://localhost/api/privado/auditoria"));
    expect(res.status).toBe(401);
  });

  it("filtra por entidad/accion y limita resultados", async () => {
    exigirSesionMock.mockResolvedValue({ ok: true, sesion: { usuarioId: "u1" } });
    findManyAuditoriaMock.mockResolvedValue([{ id: "a1", entidad: "pedido", accion: "crear" }]);

    const res = await GET(
      new Request("http://localhost/api/privado/auditoria?entidad=pedido&accion=crear&limite=700"),
    );

    expect(res.status).toBe(200);
    expect(findManyAuditoriaMock).toHaveBeenCalledTimes(1);
    const arg = findManyAuditoriaMock.mock.calls[0][0] as {
      where: { entidad: string; accion: string };
      take: number;
    };
    expect(arg.where).toEqual({ entidad: "pedido", accion: "crear" });
    expect(arg.take).toBe(500);
    const body = (await res.json()) as Array<{ id: string }>;
    expect(body[0].id).toBe("a1");
  });
});
