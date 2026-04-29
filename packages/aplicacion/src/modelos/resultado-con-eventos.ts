export type EventoAplicacion<TPayload = unknown> = {
  nombre: string;
  version: number;
  ocurridoEn: string;
  payload: TPayload;
};

export type ResultadoConEventos<TResultado, TEvento = EventoAplicacion> = {
  resultado: TResultado;
  eventos: TEvento[];
};

export function crearResultadoConEventos<TResultado, TEvento = EventoAplicacion>(
  resultado: TResultado,
  eventos: TEvento[] = [],
): ResultadoConEventos<TResultado, TEvento> {
  return { resultado, eventos };
}
