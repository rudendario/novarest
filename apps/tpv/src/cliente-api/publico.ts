import type {
  CartaPublicaDto,
  CategoriaPublicaDto,
  MenuDiaPublicoDto,
  NegocioPublicoDto,
  PlatoPublicoDto,
} from "@el-jardin/contratos";

const basePublica =
  process.env.NEXT_PUBLIC_API_PUBLICA_BASE_URL ?? "http://localhost:3000/api/publico";

async function obtenerJson<T>(path: string): Promise<T> {
  const respuesta = await fetch(`${basePublica}${path}`, {
    cache: "no-store",
  });

  if (!respuesta.ok) {
    throw new Error(`Fallo API publica ${path}: ${respuesta.status}`);
  }

  return (await respuesta.json()) as T;
}

export function obtenerNegocioPublicoApi() {
  return obtenerJson<NegocioPublicoDto>("/negocio");
}

export function obtenerCategoriasPublicasApi() {
  return obtenerJson<CategoriaPublicaDto[]>("/categorias");
}

export function obtenerPlatosPublicosApi() {
  return obtenerJson<PlatoPublicoDto[]>("/platos");
}

export function obtenerCartaPublicaApi() {
  return obtenerJson<CartaPublicaDto>("/carta");
}

export function obtenerMenuDiaPublicoApi() {
  return obtenerJson<MenuDiaPublicoDto>("/menu-dia");
}
