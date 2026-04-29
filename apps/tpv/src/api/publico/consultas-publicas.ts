import type {
  CategoriaPublicaDto,
  MenuDiaPublicoDto,
  NegocioPublicoDto,
  PlatoPublicoDto,
} from "@el-jardin/contratos";

import { clientePrisma } from "@el-jardin/infra";

async function construirPlatosPublicosDesdeIds(idsProducto: string[]): Promise<PlatoPublicoDto[]> {
  if (idsProducto.length === 0) {
    return [];
  }

  const productos = await clientePrisma.producto.findMany({
    where: {
      id: { in: idsProducto },
      visiblePublico: true,
      eliminadoEn: null,
    },
    orderBy: [{ nombre: "asc" }],
    select: {
      id: true,
      categoriaId: true,
      slug: true,
      nombre: true,
      descripcion: true,
      precioCentimos: true,
      estadoPublico: true,
    },
  });

  const categorias = await clientePrisma.categoriaProducto.findMany({
    where: { id: { in: productos.map((producto) => producto.categoriaId) } },
  });

  const categoriasPorId = new Map(
    categorias.map((categoria) => [categoria.id, categoria] as const),
  );

  const imagenes = await clientePrisma.imagenProducto.findMany({
    where: { productoId: { in: productos.map((producto) => producto.id) } },
    orderBy: [{ orden: "asc" }],
  });

  const imagenPrincipalPorProducto = new Map<string, string>();
  for (const imagen of imagenes) {
    if (!imagenPrincipalPorProducto.has(imagen.productoId)) {
      imagenPrincipalPorProducto.set(imagen.productoId, imagen.url);
    }
  }

  const vinculosAlergeno = await clientePrisma.productoAlergeno.findMany({
    where: { productoId: { in: productos.map((producto) => producto.id) } },
  });

  const alergenos = await clientePrisma.alergeno.findMany({
    where: { id: { in: vinculosAlergeno.map((vinculo) => vinculo.alergenoId) } },
  });

  const nombreAlergenoPorId = new Map(alergenos.map((alergeno) => [alergeno.id, alergeno.nombre]));
  const alergenosPorProducto = new Map<string, string[]>();

  for (const vinculo of vinculosAlergeno) {
    const nombre = nombreAlergenoPorId.get(vinculo.alergenoId);
    if (!nombre) {
      continue;
    }

    const actuales = alergenosPorProducto.get(vinculo.productoId) ?? [];
    actuales.push(nombre);
    alergenosPorProducto.set(vinculo.productoId, actuales);
  }

  return productos
    .map((producto) => {
      if (producto.estadoPublico === "oculto") {
        return null;
      }
      const categoria = categoriasPorId.get(producto.categoriaId);
      if (!categoria || !categoria.visiblePublico || categoria.eliminadoEn) {
        return null;
      }

      return {
        id: producto.id,
        slug: producto.slug,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precioCentimos: producto.precioCentimos,
        imagenUrl: imagenPrincipalPorProducto.get(producto.id) ?? null,
        alergenos: alergenosPorProducto.get(producto.id) ?? [],
        categoria: {
          id: categoria.id,
          nombre: categoria.nombre,
          slug: categoria.slug,
        },
        estadoPublico: producto.estadoPublico,
      } satisfies PlatoPublicoDto;
    })
    .filter((plato): plato is PlatoPublicoDto => plato !== null);
}

export async function obtenerNegocioPublico(): Promise<NegocioPublicoDto | null> {
  const negocio = await clientePrisma.configuracionNegocio.findFirst({
    where: { publicadoWeb: true },
    orderBy: { creadoEn: "asc" },
  });

  if (!negocio) {
    return null;
  }

  return {
    nombreComercial: negocio.nombreComercial,
    telefono: negocio.telefono,
    email: negocio.email,
    direccion: negocio.direccion,
    moneda: negocio.moneda,
  };
}

export async function obtenerCategoriasPublicas(): Promise<CategoriaPublicaDto[]> {
  const categorias = await clientePrisma.categoriaProducto.findMany({
    where: {
      visiblePublico: true,
      eliminadoEn: null,
    },
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
  });

  return categorias.map((categoria) => ({
    id: categoria.id,
    nombre: categoria.nombre,
    slug: categoria.slug,
  }));
}

export async function obtenerPlatosPublicos(): Promise<PlatoPublicoDto[]> {
  const productos = await clientePrisma.producto.findMany({
    where: {
      visiblePublico: true,
      eliminadoEn: null,
    },
    orderBy: [{ nombre: "asc" }],
    select: {
      id: true,
      categoriaId: true,
      slug: true,
      nombre: true,
      descripcion: true,
      precioCentimos: true,
      estadoPublico: true,
    },
  });

  if (productos.length === 0) {
    return [];
  }

  const categorias = await clientePrisma.categoriaProducto.findMany({
    where: { id: { in: productos.map((producto) => producto.categoriaId) } },
  });
  const categoriasPorId = new Map(
    categorias.map((categoria) => [categoria.id, categoria] as const),
  );

  const imagenes = await clientePrisma.imagenProducto.findMany({
    where: { productoId: { in: productos.map((producto) => producto.id) } },
    orderBy: [{ orden: "asc" }],
  });
  const imagenPrincipalPorProducto = new Map<string, string>();
  for (const imagen of imagenes) {
    if (!imagenPrincipalPorProducto.has(imagen.productoId)) {
      imagenPrincipalPorProducto.set(imagen.productoId, imagen.url);
    }
  }

  const vinculosAlergeno = await clientePrisma.productoAlergeno.findMany({
    where: { productoId: { in: productos.map((producto) => producto.id) } },
  });
  const alergenos = await clientePrisma.alergeno.findMany({
    where: { id: { in: vinculosAlergeno.map((vinculo) => vinculo.alergenoId) } },
  });

  const nombreAlergenoPorId = new Map(alergenos.map((alergeno) => [alergeno.id, alergeno.nombre]));
  const alergenosPorProducto = new Map<string, string[]>();
  for (const vinculo of vinculosAlergeno) {
    const nombre = nombreAlergenoPorId.get(vinculo.alergenoId);
    if (!nombre) continue;
    const actuales = alergenosPorProducto.get(vinculo.productoId) ?? [];
    actuales.push(nombre);
    alergenosPorProducto.set(vinculo.productoId, actuales);
  }

  return productos
    .map((producto) => {
      if (producto.estadoPublico === "oculto") {
        return null;
      }
      const categoria = categoriasPorId.get(producto.categoriaId);
      if (!categoria || !categoria.visiblePublico || categoria.eliminadoEn) {
        return null;
      }

      return {
        id: producto.id,
        slug: producto.slug,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precioCentimos: producto.precioCentimos,
        imagenUrl: imagenPrincipalPorProducto.get(producto.id) ?? null,
        alergenos: alergenosPorProducto.get(producto.id) ?? [],
        categoria: {
          id: categoria.id,
          nombre: categoria.nombre,
          slug: categoria.slug,
        },
        estadoPublico: producto.estadoPublico,
      } satisfies PlatoPublicoDto;
    })
    .filter((plato): plato is PlatoPublicoDto => plato !== null);
}

export async function obtenerPlatoPublicoPorSlug(slug: string): Promise<PlatoPublicoDto | null> {
  const producto = await clientePrisma.producto.findFirst({
    where: {
      slug,
      visiblePublico: true,
      eliminadoEn: null,
    },
  });

  if (!producto) {
    return null;
  }

  const platos = await construirPlatosPublicosDesdeIds([producto.id]);
  return platos[0] ?? null;
}

export async function obtenerMenuDiaPublico(fecha: Date): Promise<MenuDiaPublicoDto | null> {
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);

  const menuDia = await clientePrisma.menuDia.findFirst({
    where: {
      publicado: true,
      eliminadoEn: null,
      fecha: {
        gte: inicio,
        lt: fin,
      },
    },
    include: {
      cursos: {
        orderBy: { orden: "asc" },
        include: {
          platos: {
            orderBy: { orden: "asc" },
          },
        },
      },
    },
  });

  if (!menuDia) {
    return null;
  }

  const idsProducto = Array.from(
    new Set(menuDia.cursos.flatMap((curso) => curso.platos.map((plato) => plato.productoId))),
  );
  const platosPorId = new Map(
    (await construirPlatosPublicosDesdeIds(idsProducto)).map((plato) => [plato.id, plato]),
  );

  return {
    fecha: menuDia.fecha.toISOString().slice(0, 10),
    titulo: menuDia.titulo,
    descripcion: menuDia.descripcion,
    precioCentimos: menuDia.precioCentimos,
    cursos: menuDia.cursos.map((curso) => ({
      nombre: curso.nombre,
      orden: curso.orden,
      platos: curso.platos
        .map((platoMenuDia) => platosPorId.get(platoMenuDia.productoId) ?? null)
        .filter((plato): plato is PlatoPublicoDto => plato !== null),
    })),
  };
}
