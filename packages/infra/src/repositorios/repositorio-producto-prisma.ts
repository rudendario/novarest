import type { Producto } from "@prisma/client";

import { clientePrisma } from "../prisma/cliente-prisma";

type CrearProductoEntrada = Pick<
  Producto,
  | "nombre"
  | "slug"
  | "descripcion"
  | "precioCentimos"
  | "tipo"
  | "destinoPreparacion"
  | "estadoInterno"
  | "estadoPublico"
  | "visiblePublico"
  | "categoriaId"
>;

export class RepositorioProductoPrisma {
  async crear(entrada: CrearProductoEntrada): Promise<Producto> {
    return clientePrisma.producto.create({ data: entrada });
  }

  async listarPublicados(): Promise<Producto[]> {
    return clientePrisma.producto.findMany({
      where: {
        visiblePublico: true,
        estadoPublico: {
          in: ["visible", "agotado", "temporalmente_no_disponible"],
        },
        eliminadoEn: null,
      },
      orderBy: [{ categoria: { orden: "asc" } }, { nombre: "asc" }],
    });
  }
}
