import type { EventoRealtimeV1 } from "@el-jardin/contratos";

import type { PermisoBase } from "@el-jardin/contratos";

export type EventoRealtimeEmitido = {
  id: number;
  nombre: EventoRealtimeV1;
  version: 1;
  ocurridoEn: string;
  canales: string[];
  payload: Record<string, unknown>;
};

type Suscriptor = {
  id: string;
  canales: Set<string>;
  enviar: (evento: EventoRealtimeEmitido) => void;
};

const suscriptores = new Map<string, Suscriptor>();
const historial: EventoRealtimeEmitido[] = [];
let secuencia = 0;

const LIMITE_HISTORIAL = 500;

function puedeUnirseCanal(canal: string, permisos: PermisoBase[]) {
  if (canal === "sala") return permisos.includes("puedeVerSala");
  if (canal === "cocina" || canal === "barra") return permisos.includes("puedeEnviarPedido");
  if (canal === "admin") return permisos.includes("puedeGestionarNegocio");
  if (canal.startsWith("mesa:")) return permisos.includes("puedeVerSala");
  if (canal.startsWith("pedido:")) return permisos.includes("puedeVerSala");
  return false;
}

export function filtrarCanalesPermitidos(canales: string[], permisos: PermisoBase[]) {
  const unicos = Array.from(new Set(canales.map((c) => c.trim()).filter(Boolean)));
  return unicos.filter((canal) => puedeUnirseCanal(canal, permisos));
}

export function crearCanalesPedido(params: { mesaId?: string | null; pedidoId: string }) {
  const base = ["sala", "cocina", "barra", "admin", `pedido:${params.pedidoId}`];
  if (params.mesaId) {
    base.push(`mesa:${params.mesaId}`);
  }

  return Array.from(new Set(base));
}

export function emitirEventoRealtime(params: {
  nombre: EventoRealtimeV1;
  canales: string[];
  payload: Record<string, unknown>;
}) {
  secuencia += 1;
  const evento: EventoRealtimeEmitido = {
    id: secuencia,
    nombre: params.nombre,
    version: 1,
    ocurridoEn: new Date().toISOString(),
    canales: Array.from(new Set(params.canales)),
    payload: params.payload,
  };

  historial.push(evento);
  if (historial.length > LIMITE_HISTORIAL) {
    historial.splice(0, historial.length - LIMITE_HISTORIAL);
  }

  for (const suscriptor of suscriptores.values()) {
    if (evento.canales.some((canal) => suscriptor.canales.has(canal))) {
      suscriptor.enviar(evento);
    }
  }

  return evento;
}

export function suscribirRealtime(params: {
  canales: string[];
  enviar: (evento: EventoRealtimeEmitido) => void;
}) {
  const id = crypto.randomUUID();
  suscriptores.set(id, {
    id,
    canales: new Set(params.canales),
    enviar: params.enviar,
  });

  return () => {
    suscriptores.delete(id);
  };
}

export function obtenerBacklog(params: { canales: string[]; desdeId?: number; limite?: number }) {
  const desdeId = params.desdeId ?? 0;
  const limite = params.limite ?? 100;
  const canales = new Set(params.canales);

  return historial
    .filter((evento) => evento.id > desdeId && evento.canales.some((canal) => canales.has(canal)))
    .slice(-limite);
}
