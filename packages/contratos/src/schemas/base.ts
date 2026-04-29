import { z } from "zod";

import {
  ESTADOS_CAJA,
  ESTADOS_LINEA_PEDIDO,
  ESTADOS_LISTA_ESPERA,
  ESTADOS_MENU_DIA,
  ESTADOS_PEDIDO,
  ESTADOS_PRODUCTO_INTERNO,
  ESTADOS_PRODUCTO_PUBLICO,
  ESTADOS_RESERVA,
} from "../constantes/estados";
import { PERMISOS_BASE } from "../constantes/permisos";

export const esquemaPermisoBase = z.enum(PERMISOS_BASE);

export const esquemaEstadoProductoInterno = z.enum(ESTADOS_PRODUCTO_INTERNO);
export const esquemaEstadoProductoPublico = z.enum(ESTADOS_PRODUCTO_PUBLICO);
export const esquemaEstadoMenuDia = z.enum(ESTADOS_MENU_DIA);
export const esquemaEstadoPedido = z.enum(ESTADOS_PEDIDO);
export const esquemaEstadoLineaPedido = z.enum(ESTADOS_LINEA_PEDIDO);
export const esquemaEstadoCaja = z.enum(ESTADOS_CAJA);
export const esquemaEstadoReserva = z.enum(ESTADOS_RESERVA);
export const esquemaEstadoListaEspera = z.enum(ESTADOS_LISTA_ESPERA);

export const esquemaNegocioPublico = z.object({
  nombreComercial: z.string().min(1),
  telefono: z.string().nullable(),
  email: z.string().email().nullable(),
  direccion: z.string().nullable(),
  moneda: z.string().length(3),
});

export const esquemaCategoriaPublica = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  slug: z.string().min(1),
});

export const esquemaPlatoPublico = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().nullable(),
  precioCentimos: z.number().int().nonnegative(),
  imagenUrl: z.string().url().nullable(),
  alergenos: z.array(z.string()),
  categoria: esquemaCategoriaPublica,
  estadoPublico: z.enum(["visible", "agotado", "temporalmente_no_disponible"]),
});

export const esquemaCartaPublica = z.object({
  negocio: esquemaNegocioPublico,
  categorias: z.array(esquemaCategoriaPublica),
  platos: z.array(esquemaPlatoPublico),
});

export const esquemaMenuDiaPublico = z.object({
  fecha: z.string().min(1),
  titulo: z.string().min(1),
  descripcion: z.string().nullable(),
  precioCentimos: z.number().int().nonnegative(),
  cursos: z.array(
    z.object({
      nombre: z.string().min(1),
      orden: z.number().int().nonnegative(),
      platos: z.array(esquemaPlatoPublico),
    }),
  ),
});
