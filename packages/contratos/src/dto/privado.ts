export type ProductoPrivadoDto = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  precioCentimos: number;
  tipo: "plato" | "bebida" | "ingrediente" | "combo";
  destinoPreparacion: "cocina" | "barra" | "ambos" | "ninguno";
  estadoInterno:
    | "disponible"
    | "stock_bajo"
    | "ultimas_unidades"
    | "agotado"
    | "pausado"
    | "demora";
  estadoPublico: "visible" | "oculto" | "agotado" | "temporalmente_no_disponible";
  visiblePublico: boolean;
  categoriaId: string;
  creadoEn: string;
  actualizadoEn: string;
};

export type RegistroAuditoriaPrivadoDto = {
  id: string;
  usuarioId: string | null;
  rolNombre: string;
  accion: string;
  entidad: string;
  entidadId: string;
  valoresPrevios?: unknown;
  valoresNuevos?: unknown;
  motivo: string | null;
  ip: string | null;
  requestId: string | null;
  creadoEn: string;
};
