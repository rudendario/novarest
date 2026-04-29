import { z } from "zod";

import { clientePrisma } from "@el-jardin/infra";

import { responderErrorApi } from "@/src/api/publico/respuestas";

export const esquemaCrearCliente = z.object({
  nombre: z.string().min(2),
  telefono: z.string().min(6).optional(),
  email: z.string().email().optional(),
  notas: z.string().min(2).optional(),
});

export const esquemaCrearReserva = z.object({
  clienteId: z.string().min(1).optional(),
  mesaId: z.string().min(1).optional(),
  nombreCliente: z.string().min(2),
  telefonoContacto: z.string().min(6).optional(),
  fechaHora: z.string().datetime(),
  comensales: z.number().int().positive().max(30),
  notas: z.string().min(2).optional(),
});

export const esquemaCambiarEstadoReserva = z.object({
  estado: z.enum(["pendiente", "confirmada", "sentada", "completada", "cancelada", "no_show"]),
  motivo: z.string().min(3).optional(),
});

export const esquemaCrearEntradaEspera = z.object({
  clienteId: z.string().min(1).optional(),
  nombreCliente: z.string().min(2),
  telefonoContacto: z.string().min(6).optional(),
  comensales: z.number().int().positive().max(30),
  notas: z.string().min(2).optional(),
});

export const esquemaCambiarEstadoEspera = z.object({
  estado: z.enum(["esperando", "avisado", "sentado", "cancelado"]),
});

const DURACION_BLOQUE_RESERVA_MIN = 120;
const ESTADOS_ACTIVOS_RESERVA = ["pendiente", "confirmada", "sentada"] as const;

async function validarMesaDisponibleEnFranja(params: {
  mesaId: string;
  fechaHora: Date;
  excluirReservaId?: string;
}) {
  const inicio = new Date(params.fechaHora.getTime() - DURACION_BLOQUE_RESERVA_MIN * 60 * 1000);
  const fin = new Date(params.fechaHora.getTime() + DURACION_BLOQUE_RESERVA_MIN * 60 * 1000);

  const solapada = await clientePrisma.reserva.findFirst({
    where: {
      id: params.excluirReservaId ? { not: params.excluirReservaId } : undefined,
      mesaId: params.mesaId,
      estado: { in: [...ESTADOS_ACTIVOS_RESERVA] },
      fechaHora: {
        gte: inicio,
        lte: fin,
      },
    },
    select: { id: true, fechaHora: true, nombreCliente: true },
  });

  if (solapada) {
    return responderErrorApi(
      409,
      "conflicto",
      `Mesa ocupada en franja por reserva de ${solapada.nombreCliente}`,
    );
  }

  return null;
}

export async function crearReserva(params: z.infer<typeof esquemaCrearReserva>) {
  const fechaHora = new Date(params.fechaHora);
  if (Number.isNaN(fechaHora.getTime())) {
    return responderErrorApi(400, "solicitud_invalida", "Fecha de reserva invalida");
  }

  if (params.mesaId) {
    const mesa = await clientePrisma.mesa.findUnique({
      where: { id: params.mesaId },
      select: { id: true, activa: true, eliminadaEn: true },
    });
    if (!mesa || !mesa.activa || mesa.eliminadaEn) {
      return responderErrorApi(404, "no_encontrado", "Mesa no encontrada o inactiva");
    }

    const conflicto = await validarMesaDisponibleEnFranja({
      mesaId: params.mesaId,
      fechaHora,
    });
    if (conflicto) return conflicto;
  }

  return clientePrisma.reserva.create({
    data: {
      clienteId: params.clienteId ?? null,
      mesaId: params.mesaId ?? null,
      nombreCliente: params.nombreCliente,
      telefonoContacto: params.telefonoContacto ?? null,
      fechaHora,
      comensales: params.comensales,
      notas: params.notas ?? null,
    },
  });
}

export const esquemaAsignarMesaReserva = z.object({
  mesaId: z.string().min(1),
});

export async function asignarMesaReserva(params: { reservaId: string; mesaId: string }) {
  const reserva = await clientePrisma.reserva.findUnique({
    where: { id: params.reservaId },
  });
  if (!reserva) {
    return responderErrorApi(404, "no_encontrado", "Reserva no encontrada");
  }
  if (["cancelada", "completada", "no_show"].includes(reserva.estado)) {
    return responderErrorApi(409, "conflicto", "Reserva no permite asignacion de mesa");
  }

  const mesa = await clientePrisma.mesa.findUnique({
    where: { id: params.mesaId },
    select: { id: true, activa: true, eliminadaEn: true, capacidad: true },
  });
  if (!mesa || !mesa.activa || mesa.eliminadaEn) {
    return responderErrorApi(404, "no_encontrado", "Mesa no encontrada o inactiva");
  }
  if (mesa.capacidad < reserva.comensales) {
    return responderErrorApi(409, "conflicto", "Capacidad de mesa insuficiente para la reserva");
  }

  const conflicto = await validarMesaDisponibleEnFranja({
    mesaId: params.mesaId,
    fechaHora: reserva.fechaHora,
    excluirReservaId: reserva.id,
  });
  if (conflicto) return conflicto;

  return clientePrisma.reserva.update({
    where: { id: reserva.id },
    data: { mesaId: params.mesaId },
  });
}
