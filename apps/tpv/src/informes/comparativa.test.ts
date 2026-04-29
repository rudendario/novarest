import { describe, expect, it } from "vitest";

import { calcularDeltaComparativa, calcularRangoPrevio } from "./comparativa";

describe("comparativa", () => {
  it("calcula delta y porcentaje", () => {
    expect(calcularDeltaComparativa(1500, 1000)).toEqual({
      deltaCentimos: 500,
      deltaPct: 50,
    });
  });

  it("evita division por cero", () => {
    expect(calcularDeltaComparativa(500, 0)).toEqual({
      deltaCentimos: 500,
      deltaPct: 0,
    });
  });

  it("calcula rango previo por defecto con misma duracion", () => {
    const actualDesde = new Date("2026-04-20T10:00:00.000Z");
    const actualHasta = new Date("2026-04-20T12:00:00.000Z");
    const previo = calcularRangoPrevio(actualDesde, actualHasta);
    expect(previo.desde.toISOString()).toBe("2026-04-20T08:00:00.000Z");
    expect(previo.hasta.toISOString()).toBe("2026-04-20T10:00:00.000Z");
  });
});
