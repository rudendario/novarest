import { describe, expect, it } from "vitest";

import { escaparCampoCsv, lineaCsv } from "./csv";

describe("csv", () => {
  it("escapa comillas", () => {
    expect(escaparCampoCsv('He said "ok"')).toBe('"He said ""ok"""');
  });

  it("encierra en comillas si hay coma", () => {
    expect(escaparCampoCsv("cocina,barra")).toBe('"cocina,barra"');
  });

  it("serializa linea combinada", () => {
    expect(lineaCsv(["categoria", "platos, frios", 1200])).toBe('categoria,"platos, frios",1200');
  });
});
