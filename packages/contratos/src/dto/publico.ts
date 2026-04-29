export type NegocioPublicoDto = {
  nombreComercial: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  moneda: string;
};

export type CategoriaPublicaDto = {
  id: string;
  nombre: string;
  slug: string;
};

export type PlatoPublicoDto = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  precioCentimos: number;
  imagenUrl: string | null;
  alergenos: string[];
  categoria: CategoriaPublicaDto;
  estadoPublico: "visible" | "agotado" | "temporalmente_no_disponible";
};

export type CartaPublicaDto = {
  negocio: NegocioPublicoDto;
  categorias: CategoriaPublicaDto[];
  platos: PlatoPublicoDto[];
};

export type MenuDiaPublicoDto = {
  fecha: string;
  titulo: string;
  descripcion: string | null;
  precioCentimos: number;
  cursos: Array<{
    nombre: string;
    orden: number;
    platos: PlatoPublicoDto[];
  }>;
};
