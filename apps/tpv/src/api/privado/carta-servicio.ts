import { z } from "zod";

import { clientePrisma } from "@el-jardin/infra";

export const esquemaCrearCategoria = z.object({
  nombre: z.string().min(1),
  slug: z.string().min(1),
  orden: z.number().int().nonnegative().default(0),
  visiblePublico: z.boolean().default(false),
});

export const esquemaActualizarCategoria = esquemaCrearCategoria.partial();

export const esquemaCrearProducto = z.object({
  nombre: z.string().min(1),
  slug: z.string().min(1),
  descripcion: z.string().nullable().optional(),
  precioCentimos: z.number().int().nonnegative(),
  tipo: z.enum(["plato", "bebida", "ingrediente", "combo"]),
  destinoPreparacion: z.enum(["cocina", "barra", "ambos", "ninguno"]),
  categoriaId: z.string().min(1),
  visiblePublico: z.boolean().default(false),
  estadoPublico: z
    .enum(["visible", "oculto", "agotado", "temporalmente_no_disponible"])
    .default("oculto"),
});

export const esquemaActualizarProducto = esquemaCrearProducto.partial();

export const esquemaCrearMenuDia = z.object({
  fecha: z.string().min(1),
  titulo: z.string().min(1),
  descripcion: z.string().nullable().optional(),
  precioCentimos: z.number().int().nonnegative(),
  publicado: z.boolean().default(false),
  cursos: z.array(
    z.object({
      nombre: z.string().min(1),
      orden: z.number().int().nonnegative(),
      platos: z.array(
        z.object({
          productoId: z.string().min(1),
          orden: z.number().int().nonnegative(),
        }),
      ),
    }),
  ),
});

export const esquemaPublicacion = z.object({
  publicado: z.boolean(),
  motivo: z.string().min(3).optional(),
  usuarioId: z.string().optional(),
  rolNombre: z.string().default("administrador"),
});

function inicioDiaISO(fecha: string) {
  const f = new Date(fecha);
  f.setHours(0, 0, 0, 0);
  return f;
}

export async function crearMenuDiaConCursos(entrada: z.infer<typeof esquemaCrearMenuDia>) {
  const fecha = inicioDiaISO(entrada.fecha);

  return clientePrisma.$transaction(async (tx) => {
    const menuDia = await tx.menuDia.create({
      data: {
        fecha,
        titulo: entrada.titulo,
        descripcion: entrada.descripcion ?? null,
        precioCentimos: entrada.precioCentimos,
        publicado: entrada.publicado,
      },
    });

    for (const curso of entrada.cursos) {
      const cursoCreado = await tx.cursoMenuDia.create({
        data: {
          menuDiaId: menuDia.id,
          nombre: curso.nombre,
          orden: curso.orden,
        },
      });

      if (curso.platos.length > 0) {
        await tx.platoMenuDia.createMany({
          data: curso.platos.map((plato) => ({
            cursoMenuDiaId: cursoCreado.id,
            productoId: plato.productoId,
            orden: plato.orden,
          })),
        });
      }
    }

    return menuDia;
  });
}

export async function auditarPublicacion(params: {
  entidad: "CategoriaProducto" | "Producto" | "MenuDia";
  entidadId: string;
  publicado: boolean;
  motivo?: string;
  usuarioId?: string;
  rolNombre?: string;
}) {
  await clientePrisma.registroAuditoria.create({
    data: {
      usuarioId: params.usuarioId ?? null,
      rolNombre: params.rolNombre ?? "administrador",
      accion: params.publicado ? "publicar" : "despublicar",
      entidad: params.entidad,
      entidadId: params.entidadId,
      valoresNuevos: { publicado: params.publicado },
      motivo: params.motivo ?? null,
    },
  });
}
