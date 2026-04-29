export const EVENTOS_REALTIME_V1 = [
  "pedido.creado.v1",
  "pedido.actualizado.v1",
  "pedido.cancelado.v1",
  "linea.confirmada.v1",
  "linea.en_preparacion.v1",
  "linea.lista.v1",
  "linea.servida.v1",
  "linea.cancelada.v1",
  "carta.publicada.v1",
  "menu.publicado.v1",
] as const;

export type EventoRealtimeV1 = (typeof EVENTOS_REALTIME_V1)[number];

export type EventoDominio<TNombre extends string, TPayload> = {
  nombre: TNombre;
  version: 1;
  ocurridoEn: string;
  requestId?: string;
  payload: TPayload;
};
