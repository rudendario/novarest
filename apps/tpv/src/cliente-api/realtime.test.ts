import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { conectarRealtime } from "./realtime";

type Evento = {
  id: number;
  nombre: string;
  version: 1;
  ocurridoEn: string;
  canales: string[];
  payload: Record<string, unknown>;
};

class MockEventSource {
  static instances: MockEventSource[] = [];

  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;
  url: string;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }
}

function crearEvento(id: number): Evento {
  return {
    id,
    nombre: "pedido.actualizado.v1",
    version: 1,
    ocurridoEn: new Date().toISOString(),
    canales: ["sala"],
    payload: { id },
  };
}

describe("conectarRealtime", () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    vi.stubGlobal("EventSource", MockEventSource as unknown as typeof EventSource);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("reproduce backlog y evita duplicados por id", async () => {
    const onEvento = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, eventos: [crearEvento(1), crearEvento(2)] }),
      }),
    );

    const cerrar = conectarRealtime({ canales: ["sala"], onEvento });
    await vi.waitFor(() => {
      expect(onEvento).toHaveBeenCalledTimes(2);
      expect(MockEventSource.instances).toHaveLength(1);
    });

    const source = MockEventSource.instances[0];
    source.onmessage?.({ data: JSON.stringify(crearEvento(2)) });
    source.onmessage?.({ data: JSON.stringify(crearEvento(3)) });

    expect(onEvento).toHaveBeenCalledTimes(3);
    expect(onEvento.mock.calls[2][0].id).toBe(3);

    cerrar();
    expect(source.closed).toBe(true);
  });

  it("reintenta tras error y pide backlog desde ultimo id", async () => {
    vi.useFakeTimers();
    const onEvento = vi.fn();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, eventos: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, eventos: [crearEvento(2)] }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const cerrar = conectarRealtime({ canales: ["sala"], onEvento });
    await vi.waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    const source1 = MockEventSource.instances[0];
    source1.onmessage?.({ data: JSON.stringify(crearEvento(1)) });
    expect(onEvento).toHaveBeenCalledTimes(1);

    source1.onerror?.();
    await vi.advanceTimersByTimeAsync(1600);
    await vi.waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(2);
    });
    const segundaUrl = (fetchMock.mock.calls[1]?.[0] as string) ?? "";
    expect(segundaUrl).toContain("desdeId=1");
    expect(onEvento).toHaveBeenCalledTimes(2);
    expect(onEvento.mock.calls[1][0].id).toBe(2);

    cerrar();
  });
});
