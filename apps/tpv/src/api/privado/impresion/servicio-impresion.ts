import { z } from "zod";

import { clientePrisma } from "@el-jardin/infra";

export const esquemaCrearImpresora = z.object({
  nombre: z.string().min(2),
  zonaId: z.string().min(1).optional(),
  tipoConexion: z.string().min(2).default("red"),
  endpoint: z.string().min(2).optional(),
  prioridad: z.number().int().default(0),
  activa: z.boolean().default(true),
});

export const esquemaTrabajoImpresion = z.object({
  tipoTicket: z.enum(["cocina", "barra", "precuenta", "recibo", "prueba"]),
  zonaId: z.string().min(1).optional(),
  referenciaTipo: z.string().min(2).optional(),
  referenciaId: z.string().min(1).optional(),
  contenido: z.record(z.string(), z.unknown()),
});

async function enviarAAdaptadorBasico() {
  // Adaptador reemplazable: hoy simulamos envio estable para no bloquear operacion.
  return { ok: true as const };
}

async function procesarTrabajo(trabajoId: string) {
  const trabajo = await clientePrisma.trabajoImpresion.findUnique({
    where: { id: trabajoId },
  });
  if (!trabajo) {
    return null;
  }

  try {
    const envio = await enviarAAdaptadorBasico();
    if (!envio.ok) {
      throw new Error("Adaptador devolvio error");
    }

    return clientePrisma.trabajoImpresion.update({
      where: { id: trabajo.id },
      data: {
        estado: "enviado",
        intentos: { increment: 1 },
        enviadoEn: new Date(),
        errorDetalle: null,
      },
    });
  } catch (error) {
    return clientePrisma.trabajoImpresion.update({
      where: { id: trabajo.id },
      data: {
        estado: "error",
        intentos: { increment: 1 },
        errorDetalle: error instanceof Error ? error.message : "Error de impresion desconocido",
      },
    });
  }
}

export async function registrarTrabajoImpresion(params: z.infer<typeof esquemaTrabajoImpresion>) {
  const impresora = await clientePrisma.impresora.findFirst({
    where: {
      activa: true,
      eliminadoEn: null,
      ...(params.zonaId ? { zonaId: params.zonaId } : {}),
    },
    orderBy: [{ prioridad: "desc" }, { creadoEn: "asc" }],
  });

  const trabajo = await clientePrisma.trabajoImpresion.create({
    data: {
      impresoraId: impresora?.id ?? null,
      tipoTicket: params.tipoTicket,
      referenciaTipo: params.referenciaTipo ?? null,
      referenciaId: params.referenciaId ?? null,
      contenido: params.contenido as never,
    },
  });

  // Regla de fase: fallo de impresion no bloquea flujo; solo se registra.
  return procesarTrabajo(trabajo.id);
}

export async function reprocesarTrabajoImpresion(trabajoId: string) {
  return procesarTrabajo(trabajoId);
}

export async function procesarTrabajosPendientes(limite = 20) {
  const candidatos = await clientePrisma.trabajoImpresion.findMany({
    where: {
      estado: { in: ["pendiente", "error"] },
      intentos: { lt: 5 },
    },
    orderBy: [{ creadoEn: "asc" }],
    take: limite,
  });

  const resultados = [];
  for (const trabajo of candidatos) {
    const procesado = await procesarTrabajo(trabajo.id);
    if (procesado) resultados.push(procesado);
  }

  return resultados;
}
